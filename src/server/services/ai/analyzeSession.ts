import OpenAI from "openai";
import { env } from "@/lib/env";
import {
  PROMPT_VERSION,
  SESSION_ANALYSIS_MODEL,
  buildSessionAnalysisPrompt
} from "@/server/services/ai/prompts";
import {
  SessionAnalysisLLMOutputJSONSchema,
  SessionAnalysisLLMOutputSchema,
  SessionAnalysisSchema,
  type SessionAnalysisDTO
} from "@/server/services/ai/schemas";

const MAX_VALIDATION_ATTEMPTS = 2;

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
      const response = SessionAnalysisSchema.parse({
        ...llmOutput,
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
