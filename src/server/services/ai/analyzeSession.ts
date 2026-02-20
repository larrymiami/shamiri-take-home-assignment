import OpenAI from "openai";
import { env } from "@/lib/env";
import {
  PROMPT_VERSION,
  SESSION_ANALYSIS_MODEL,
  buildSessionAnalysisPrompt
} from "@/server/services/ai/prompts";
import {
  SessionAnalysisLLMOutputJSONSchema,
  type SessionAnalysisLLMOutput,
  SessionAnalysisLLMOutputSchema,
  SessionAnalysisSchema,
  type SessionAnalysisDTO
} from "@/server/services/ai/schemas";

const MAX_VALIDATION_ATTEMPTS = 2;
const HIGH_CONCERN_PATTERN =
  /\b(not\s+to\s+wake\s+up(?:\s+tomorrow)?|not\s+wake\s+up(?:\s+tomorrow)?|want\s+to\s+disappear|wish\s+i\s+was\s+not\s+around|better\s+off\s+without\s+me|nothing\s+feels\s+worth\s+it|hurt(?:ing)?\s+myself|kill(?:ing)?\s+myself|want\s+to\s+die|end(?:ing)?\s+my\s+life)\b/i;

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY
});

export class AIOutputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIOutputValidationError";
  }
}

function parseLLMOutput(jsonText: string) {
  const parsed = JSON.parse(jsonText) as unknown;
  return SessionAnalysisLLMOutputSchema.parse(parsed);
}

function extractHighConcernQuotes(transcriptText: string): string[] {
  const segments = transcriptText
    .split(/\n\s*\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const matches: string[] = [];

  for (const segment of segments) {
    if (!HIGH_CONCERN_PATTERN.test(segment)) {
      continue;
    }

    const normalized = segment.toLowerCase().replace(/\s+/g, " ").trim();

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    matches.push(segment);

    if (matches.length >= 3) {
      break;
    }
  }

  return matches;
}

function shouldRequireSupervisorReviewFromRubric(llmOutput: SessionAnalysisLLMOutput): boolean {
  const scores = [
    llmOutput.contentCoverage.score,
    llmOutput.facilitationQuality.score,
    llmOutput.protocolSafety.score
  ];
  const hasCriticalRubricFailure = scores.some((score) => score === 1);
  const hasProtocolDriftOrViolation = llmOutput.protocolSafety.score <= 2;
  const hasBroadPartialPerformance = scores.filter((score) => score <= 2).length >= 2;

  return hasCriticalRubricFailure || hasProtocolDriftOrViolation || hasBroadPartialPerformance;
}

export async function analyzeSession(transcriptText: string): Promise<SessionAnalysisDTO> {
  const startedAt = Date.now();
  const {
    systemPrompt,
    userPrompt,
    transcriptCharsSent,
    transcriptWasTruncated,
    transcriptWindowCount,
    transcriptRiskLinesIncluded
  } = buildSessionAnalysisPrompt(transcriptText);
  let lastValidationMessage = "invalid AI output";

  // Retry once with stricter reminder when model returns malformed/invalid JSON.
  for (let attempt = 1; attempt <= MAX_VALIDATION_ATTEMPTS; attempt += 1) {
    const completion = await openai.chat.completions.create({
      model: SESSION_ANALYSIS_MODEL,
      temperature: 0.1,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "session_analysis",
          strict: true,
          schema: SessionAnalysisLLMOutputJSONSchema
        }
      },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            attempt === 1
              ? userPrompt
              : `${userPrompt}\n\nIMPORTANT: Return strictly valid JSON with no trailing commas and no additional keys.`
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      lastValidationMessage = "OpenAI returned empty content";
      continue;
    }

    try {
      const llmOutput = parseLLMOutput(content);
      const highConcernQuotes = extractHighConcernQuotes(transcriptText);
      const shouldForceRisk =
        llmOutput.riskDetection.flag === "SAFE" && highConcernQuotes.length > 0;
      const rubricRequiresSupervisorReview = shouldRequireSupervisorReviewFromRubric(llmOutput);
      const normalizedRiskDetection = shouldForceRisk
        ? {
            flag: "RISK" as const,
            rationale:
              "Server safety backstop escalated this session to RISK due to explicit first-person high-concern language in the transcript.",
            extractedQuotes: highConcernQuotes,
            requiresSupervisorReview: true
          }
        : {
            ...llmOutput.riskDetection,
            requiresSupervisorReview:
              llmOutput.riskDetection.flag === "RISK"
                ? true
                : llmOutput.riskDetection.requiresSupervisorReview || rubricRequiresSupervisorReview
          };
      // Final DTO validation adds server-owned metadata before persistence.
      const response = SessionAnalysisSchema.parse({
        ...llmOutput,
        riskDetection: normalizedRiskDetection,
        meta: {
          model: SESSION_ANALYSIS_MODEL,
          promptVersion: PROMPT_VERSION,
          generatedAt: new Date().toISOString(),
          latencyMs: Date.now() - startedAt,
          transcriptCharsSent,
          transcriptWasTruncated,
          transcriptWindowCount,
          transcriptRiskLinesIncluded
        }
      });

      return response;
    } catch (error) {
      if (error instanceof Error) {
        lastValidationMessage = error.message;
      }
    }
  }

  throw new AIOutputValidationError(
    `AI output failed schema validation after ${MAX_VALIDATION_ATTEMPTS} attempts: ${lastValidationMessage}`
  );
}
