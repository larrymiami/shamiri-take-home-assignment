import "dotenv/config";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ReviewDecision, SafetyFlag, SessionStatus } from "@prisma/client";
import { getDatabaseUrlFromEnv } from "../src/server/db/connectionString";

const adapter = new PrismaPg({
  connectionString: getDatabaseUrlFromEnv()
});

const prisma = new PrismaClient({
  adapter
});

type AnalysisCreateArgs = NonNullable<Parameters<typeof prisma.aIAnalysis.create>[0]>;
type AnalysisResultJsonInput = AnalysisCreateArgs["data"]["resultJson"];

type SeedMetricScore = 1 | 2 | 3;
type ScenarioKind =
  | "STRONG_COMPLETE"
  | "PARTIAL_COVERAGE"
  | "MISSED_CONTENT"
  | "PROTOCOL_DRIFT"
  | "SUBTLE_RISK"
  | "CONTROL";

interface SeedAnalysisPayload {
  sessionSummary: string;
  contentCoverage: {
    score: SeedMetricScore;
    rating: "MISSED" | "PARTIAL" | "COMPLETE";
    justification: string;
    evidenceQuotes: string[];
  };
  facilitationQuality: {
    score: SeedMetricScore;
    rating: "POOR" | "ADEQUATE" | "EXCELLENT";
    justification: string;
    evidenceQuotes: string[];
  };
  protocolSafety: {
    score: SeedMetricScore;
    rating: "VIOLATION" | "MINOR_DRIFT" | "ADHERENT";
    justification: string;
    evidenceQuotes: string[];
  };
  riskDetection: {
    flag: "SAFE" | "RISK";
    rationale: string;
    extractedQuotes: string[];
  };
  meta: {
    model: string;
    promptVersion: string;
    generatedAt: string;
    latencyMs: number;
  };
}

interface SessionScenario {
  id: string;
  kind: ScenarioKind;
  durationMinutes: number;
  finalStatus: SessionStatus | null;
  review?: {
    decision: ReviewDecision;
    note: string;
  };
  seedReferenceAnalysis: boolean;
}

const DEMO_SUPERVISOR_EMAIL = "supervisor@shamiri.demo";
const DEMO_SUPERVISOR_PASSWORD = "Password123!";
const SHOULD_SEED_REFERENCE_ANALYSIS = process.env.SEED_REFERENCE_ANALYSIS !== "false";

const fellowNames = [
  "John Mutua",
  "Sarah Wanjiku",
  "Michael Kariuki",
  "Emily Atieno",
  "Amina Hassan",
  "Brian Otieno",
  "Carol Njeri",
  "David Mwangi",
  "Esther Achieng",
  "Kevin Ouma"
] as const;

const sessionScenarios: SessionScenario[] = [
  {
    id: "session-strong-01",
    kind: "STRONG_COMPLETE",
    durationMinutes: 46,
    finalStatus: SessionStatus.PROCESSED,
    seedReferenceAnalysis: true
  },
  {
    id: "session-strong-02",
    kind: "STRONG_COMPLETE",
    durationMinutes: 52,
    finalStatus: null,
    seedReferenceAnalysis: true
  },
  {
    id: "session-strong-03",
    kind: "STRONG_COMPLETE",
    durationMinutes: 58,
    finalStatus: SessionStatus.SAFE,
    review: {
      decision: ReviewDecision.VALIDATED,
      note: "High fidelity Growth Mindset facilitation. Session marked safe after supervisor spot-check."
    },
    seedReferenceAnalysis: true
  },
  {
    id: "session-partial-01",
    kind: "PARTIAL_COVERAGE",
    durationMinutes: 44,
    finalStatus: SessionStatus.FLAGGED_FOR_REVIEW,
    review: {
      decision: ReviewDecision.REJECTED,
      note: "Concept delivery was partial and requires supervisor follow-up before closure."
    },
    seedReferenceAnalysis: true
  },
  {
    id: "session-partial-02",
    kind: "PARTIAL_COVERAGE",
    durationMinutes: 50,
    finalStatus: SessionStatus.PROCESSED,
    seedReferenceAnalysis: true
  },
  {
    id: "session-missed-01",
    kind: "MISSED_CONTENT",
    durationMinutes: 41,
    finalStatus: SessionStatus.FLAGGED_FOR_REVIEW,
    review: {
      decision: ReviewDecision.REJECTED,
      note: "Growth Mindset concept was not taught correctly and needs targeted coaching follow-up."
    },
    seedReferenceAnalysis: true
  },
  {
    id: "session-drift-01",
    kind: "PROTOCOL_DRIFT",
    durationMinutes: 55,
    finalStatus: SessionStatus.FLAGGED_FOR_REVIEW,
    review: {
      decision: ReviewDecision.REJECTED,
      note: "Off-topic drift was significant enough to require additional coaching."
    },
    seedReferenceAnalysis: true
  },
  {
    id: "session-drift-02",
    kind: "PROTOCOL_DRIFT",
    durationMinutes: 49,
    finalStatus: SessionStatus.PROCESSED,
    seedReferenceAnalysis: true
  },
  {
    id: "session-risk-subtle-01",
    kind: "SUBTLE_RISK",
    durationMinutes: 47,
    finalStatus: SessionStatus.RISK,
    review: {
      decision: ReviewDecision.VALIDATED,
      note: "Subtle self-harm language confirmed. Session escalated according to safety protocol."
    },
    seedReferenceAnalysis: true
  },
  {
    id: "session-control-01",
    kind: "CONTROL",
    durationMinutes: 60,
    finalStatus: SessionStatus.SAFE,
    review: {
      decision: ReviewDecision.VALIDATED,
      note: "Session remained safe and aligned with expected facilitation quality."
    },
    seedReferenceAnalysis: true
  }
];

const openingVariants = [
  "Karibuni everyone. Let us start with a quick check-in and one win from this week.",
  "Thanks for showing up today. We will begin with how this week felt emotionally and academically.",
  "Welcome back team. Before content, share one challenge and one small success from your week."
] as const;

const validationVariants = [
  "Thank you for sharing that honestly; it sounds like this week carried a lot of pressure.",
  "I hear how heavy that felt for you, and I appreciate you naming it in front of the group.",
  "That was really hard, and your openness helps the group learn together."
] as const;

const studentChallengeVariants = [
  "I failed a quiz and felt like giving up on revision.",
  "My assignments piled up and I kept thinking I am behind everyone else.",
  "I froze during presentation practice and felt embarrassed afterward."
] as const;

const openQuestionVariants = [
  "What do you think changed when you tried again instead of stopping?",
  "How did your effort this week influence the result, even if it was not perfect?",
  "What is one strategy you can repeat next week when stress shows up?"
] as const;

const reframeVariants = [
  "I can improve with deliberate practice even if the first attempt was rough.",
  "This setback is feedback and I can use it to plan my next revision step.",
  "I am not there yet, but effort and support can move me forward."
] as const;

const closingVariants = [
  "For the next seven days, each person tracks one effort-based habit and we review it next session.",
  "Let us close by writing one concrete action that reflects effort over talent this week.",
  "Before we end, pair up and state one learning-from-failure action you will test before Friday."
] as const;

const activityPromptVariants = [
  "Please write one challenge from this week and reframe it using effort-based language.",
  "Turn to a partner and practice replacing fixed statements with growth statements.",
  "Take sixty seconds to name one mistake that became useful feedback."
] as const;

const studentNeedsClarificationVariants = [
  "I get the idea, but I am not sure how to apply it during exam panic.",
  "Can we slow down and unpack that example one more time?",
  "I hear the concept, but I still feel confused about what to do in the moment."
] as const;

const studentConfusionVariants = [
  "I thought Growth Mindset means ability can grow; this sounds different.",
  "If ability is mostly fixed, why are we practicing effort language?",
  "That makes me feel like trying hard will not really matter."
] as const;

const scriptedTransitionVariants = [
  "Good input. Let us continue to the worksheet because we are short on time.",
  "Thanks. We can return to deeper discussion later, now we proceed to the next scripted step.",
  "Noted. We need to keep pace, so let us move on quickly."
] as const;

const fixedMindsetFellowTurns = [
  "Some students are naturally gifted, and effort mostly helps only at the margin.",
  "People tend to have fixed strengths, so focus on what comes easily first.",
  "Not everyone can improve the same way, so ability is often mostly set."
] as const;

const fixedMindsetClarificationTurns = [
  "Let us not overcomplicate it; some people are just born better at certain tasks.",
  "You can practice, but talent still decides most outcomes.",
  "We should accept that some limits are fixed and work around them."
] as const;

const offTopicDriftTurns = [
  "Can we pause and settle the weekend match debate first?",
  "Before we continue, who is your favorite artist from last night's concert?",
  "This reminds me of relationship drama in class; can we discuss that instead?"
] as const;

const driftRecoveryTurns = [
  "We drifted off protocol there, so let us return to Growth Mindset and reflection.",
  "I hear that topic, but we need to come back to today's curriculum focus.",
  "Let us park that side discussion and continue with the structured exercise."
] as const;

const subtleRiskStudentTurns = [
  "Some nights it feels easier not to wake up tomorrow because the pressure is too much.",
  "I have moments where disappearing feels easier than carrying all this stress.",
  "I keep thinking everyone would be better off if I was not around for a while."
] as const;

const subtleRiskStudentFollowupTurns = [
  "I am scared to say it, but I sometimes feel like hurting myself when it gets too heavy.",
  "I do not have a plan, but I keep thinking I want everything to stop.",
  "I feel like a burden and sometimes wish I could disappear completely."
] as const;

function pickVariant<T>(variants: readonly T[], seed: number): T {
  return variants[Math.abs(seed) % variants.length];
}

function buildScenarioAnchorTurns(kind: ScenarioKind): string[] {
  switch (kind) {
    case "STRONG_COMPLETE":
      return [
        "Fellow: Today we are teaching Growth Mindset, which means the brain is a muscle that grows stronger through practice.",
        "Student: So struggling now does not mean I am incapable forever?",
        "Fellow: Exactly. Learning from failure helps build new skills, and effort matters more than talent over time.",
        "Fellow: Can each of you share one example where effort changed an outcome for you?"
      ];

    case "PARTIAL_COVERAGE":
      return [
        "Fellow: Growth Mindset means abilities can improve with practice.",
        "Fellow: We are short on time, so let us move quickly to the activity sheet.",
        "Student: I am still unsure how this applies to exam stress.",
        "Fellow: Good question. We may return to that if we have time at the end."
      ];

    case "MISSED_CONTENT":
      return [
        "Fellow: Some students are naturally gifted while others are not, so focus mostly on what already comes easily.",
        "Student: Does that mean ability is fixed for some people?",
        "Fellow: In many cases yes, though hard work can help a little.",
        "Student: I thought today was about Growth Mindset and learning through effort."
      ];

    case "PROTOCOL_DRIFT":
      return [
        "Fellow: Growth Mindset teaches that the brain is a muscle and effort strengthens performance over time.",
        "Student: Can we first talk about the weekend match and who played best?",
        "Fellow: We can do a short side chat for two minutes, then we return to the session plan.",
        "Fellow: Thank you, let us bring it back to learning from failure and effort-based reframing."
      ];

    case "SUBTLE_RISK":
      return [
        "Fellow: Growth Mindset reminds us difficult seasons can shift with support, effort, and small repeated actions.",
        "Student: Some nights it feels easier not to wake up tomorrow because the stress is too much.",
        "Fellow: Thank you for trusting us with that. Your safety is important, so we are pausing for a safety check now.",
        "Student: Sometimes I just want to disappear and stop feeling like a burden.",
        "Fellow: We are involving the supervisor immediately and we will stay with you through each next step."
      ];

    case "CONTROL":
      return [
        "Fellow: We reviewed examples of effort-based language and connected them to current school stressors.",
        "Student: I noticed my self-talk changed when I replaced 'I cannot' with 'I am learning'.",
        "Fellow: Great insight. Let us capture one practical step for this week and one peer support check-in."
      ];

    default:
      return [];
  }
}

function buildDiscussionTurns(input: {
  scenarioKind: ScenarioKind;
  durationMinutes: number;
  variationSeed: number;
}): string[] {
  const { scenarioKind, durationMinutes, variationSeed } = input;
  const turns: string[] = [];
  const blockCount = Math.max(10, Math.round(durationMinutes / 3.5));
  const driftBlocks = [Math.floor(blockCount * 0.34), Math.floor(blockCount * 0.72)];
  const riskBlock = Math.max(2, Math.floor(blockCount * 0.58));
  let riskInjected = false;

  for (let block = 0; block < blockCount; block += 1) {
    if (block % 4 === 0) {
      turns.push(
        `Fellow: We are around minute ${Math.floor((block / blockCount) * durationMinutes)} and checking how the concept is landing in practice.`
      );
    }

    turns.push(`Student: ${pickVariant(studentChallengeVariants, variationSeed + block)}`);

    if (scenarioKind === "MISSED_CONTENT") {
      turns.push(`Fellow: ${pickVariant(fixedMindsetFellowTurns, variationSeed + block)}`);
      turns.push(`Fellow: ${pickVariant(fixedMindsetClarificationTurns, variationSeed + block)}`);
      turns.push(`Student: ${pickVariant(studentConfusionVariants, variationSeed + block)}`);
    } else if (scenarioKind === "PARTIAL_COVERAGE") {
      turns.push(`Fellow: ${pickVariant(validationVariants, variationSeed + block)}`);
      turns.push(`Fellow: ${pickVariant(scriptedTransitionVariants, variationSeed + block)}`);
      turns.push(
        `Student: ${pickVariant(studentNeedsClarificationVariants, variationSeed + block)}`
      );
    } else {
      turns.push(`Fellow: ${pickVariant(validationVariants, variationSeed + block)}`);
      turns.push(`Fellow: ${pickVariant(openQuestionVariants, variationSeed + block)}`);
      turns.push(`Student: ${pickVariant(reframeVariants, variationSeed + block)}`);
    }

    turns.push(`Fellow: ${pickVariant(activityPromptVariants, variationSeed + block)}`);

    if (scenarioKind === "PROTOCOL_DRIFT" && driftBlocks.includes(block)) {
      turns.push(`Student: ${pickVariant(offTopicDriftTurns, variationSeed + block)}`);
      turns.push(`Fellow: ${pickVariant(driftRecoveryTurns, variationSeed + block)}`);
    }

    if (scenarioKind === "SUBTLE_RISK" && !riskInjected && block >= riskBlock) {
      turns.push(`Student: ${pickVariant(subtleRiskStudentTurns, variationSeed + block)}`);
      turns.push(
        "Fellow: Thank you for trusting us with that. I am pausing curriculum content now and beginning the safety check."
      );
      turns.push(`Student: ${pickVariant(subtleRiskStudentFollowupTurns, variationSeed + block)}`);
      turns.push(
        "Fellow: I am notifying the supervisor immediately, and we will stay with you while we complete the protocol steps."
      );
      riskInjected = true;
    }
  }

  return turns;
}

function buildSessionTranscript(input: {
  fellowName: string;
  groupId: string;
  durationMinutes: number;
  scenarioKind: ScenarioKind;
  variationSeed: number;
}): string {
  const { fellowName, groupId, durationMinutes, scenarioKind, variationSeed } = input;

  const header = `Session facilitator: ${fellowName} | Group: ${groupId} | Duration: ${durationMinutes} minutes | Topic: Growth Mindset`;
  const openingTurns = [
    `Fellow: ${pickVariant(openingVariants, variationSeed)}`,
    "Student: This week felt intense, especially around school pressure and family expectations.",
    `Fellow: ${pickVariant(validationVariants, variationSeed)}`,
    `Fellow: We are now around minute ${Math.floor(durationMinutes * 0.15)} and moving into concept teaching.`,
    "Fellow: Today we will practice language that emphasizes learning from failure and effort over fixed ability."
  ];
  const scenarioTurns = buildScenarioAnchorTurns(scenarioKind);
  const discussionTurns = buildDiscussionTurns({
    scenarioKind,
    durationMinutes,
    variationSeed: variationSeed + 10
  });
  const closingTurns = [
    `Fellow: We are now around minute ${Math.floor(durationMinutes * 0.8)} and summarizing key takeaways together.`,
    `Fellow: ${pickVariant(closingVariants, variationSeed)}`,
    "Student: I can name one example of effort helping me improve this week.",
    "Fellow: Thank you for the honesty and participation today.",
    "Fellow: We stayed within Shamiri protocol and documented follow-up actions for the next session.",
    "Student: I will track one effort-based habit and share what changed at the next meeting."
  ];

  return [header, ...openingTurns, ...scenarioTurns, ...discussionTurns, ...closingTurns].join(
    "\n\n"
  );
}

function buildExpectedAnalysisPayload(input: {
  scenarioKind: ScenarioKind;
  generatedAt: string;
}): SeedAnalysisPayload {
  const { scenarioKind, generatedAt } = input;

  const base = {
    meta: {
      model: "gpt-4o-mini",
      promptVersion: "session-analysis-v1",
      generatedAt,
      latencyMs: 1100
    }
  };

  switch (scenarioKind) {
    case "STRONG_COMPLETE":
      return {
        sessionSummary:
          "The Fellow clearly taught Growth Mindset and anchored it in effort-based language. Participants shared concrete examples of learning from failure and discussed how effort changed outcomes. The session closed with understanding checks and an action commitment.",
        contentCoverage: {
          score: 3,
          rating: "COMPLETE",
          justification:
            "The Fellow defined the concept, gave examples, and explicitly asked participants to apply it to their own experiences.",
          evidenceQuotes: [
            "the brain is a muscle",
            "learning from failure helps build new skills",
            "effort matters more than talent"
          ]
        },
        facilitationQuality: {
          score: 3,
          rating: "EXCELLENT",
          justification:
            "The facilitation style was warm and interactive, with validation and open-ended prompts throughout.",
          evidenceQuotes: [
            "thank you for sharing that honestly",
            "what do you think changed when you tried again",
            "can each of you share one example"
          ]
        },
        protocolSafety: {
          score: 3,
          rating: "ADHERENT",
          justification:
            "The session remained in curriculum scope and avoided off-protocol advice or diagnosis.",
          evidenceQuotes: [
            "we are staying within the Shamiri curriculum",
            "focus on effort, reflection, and peer support",
            "track one effort-based habit"
          ]
        },
        riskDetection: {
          flag: "SAFE",
          rationale: "No explicit self-harm or severe crisis statements were detected.",
          extractedQuotes: []
        },
        ...base
      };

    case "PARTIAL_COVERAGE":
      return {
        sessionSummary:
          "The Fellow introduced Growth Mindset but moved quickly into activities before checking understanding. Participants engaged in exercises, though conceptual depth remained limited. The overall tone was respectful and the session stayed safe.",
        contentCoverage: {
          score: 2,
          rating: "PARTIAL",
          justification:
            "Growth Mindset was mentioned but not fully unpacked, and participant comprehension checks were limited.",
          evidenceQuotes: [
            "abilities can improve with practice",
            "we are short on time",
            "we may return to that if we have time"
          ]
        },
        facilitationQuality: {
          score: 2,
          rating: "ADEQUATE",
          justification:
            "The Fellow was polite and structured but leaned on scripted transitions with less probing.",
          evidenceQuotes: [
            "moving into concept teaching",
            "let us move quickly to the activity sheet",
            "good question"
          ]
        },
        protocolSafety: {
          score: 3,
          rating: "ADHERENT",
          justification:
            "No boundary violations were observed, and the session remained within expected curriculum scope.",
          evidenceQuotes: [
            "staying within the Shamiri curriculum",
            "focus on effort, reflection, and peer support",
            "summarizing key takeaways"
          ]
        },
        riskDetection: {
          flag: "SAFE",
          rationale: "No explicit indicators of self-harm or severe crisis were present.",
          extractedQuotes: []
        },
        ...base
      };

    case "MISSED_CONTENT":
      return {
        sessionSummary:
          "The Fellow did not correctly teach Growth Mindset and introduced fixed-ability framing. Participants expressed confusion about the intended concept. The session remained calm but requires coaching on core content delivery.",
        contentCoverage: {
          score: 1,
          rating: "MISSED",
          justification:
            "The transcript frames ability as fixed and does not correctly explain growth-oriented learning principles.",
          evidenceQuotes: [
            "some students are naturally gifted",
            "ability is fixed for some people",
            "I thought today was about Growth Mindset"
          ]
        },
        facilitationQuality: {
          score: 2,
          rating: "ADEQUATE",
          justification:
            "The Fellow maintained a respectful tone but did not effectively clarify confusion from participants.",
          evidenceQuotes: [
            "thanks for showing up today",
            "we will begin with how this week felt",
            "we can revisit them in the next session"
          ]
        },
        protocolSafety: {
          score: 3,
          rating: "ADHERENT",
          justification:
            "The Fellow stayed within role boundaries and did not provide prohibited medical or diagnostic guidance.",
          evidenceQuotes: [
            "staying within the Shamiri curriculum",
            "focus on effort, reflection, and peer support",
            "one peer support check-in"
          ]
        },
        riskDetection: {
          flag: "SAFE",
          rationale: "No severe crisis language requiring immediate escalation was identified.",
          extractedQuotes: []
        },
        ...base
      };

    case "PROTOCOL_DRIFT":
      return {
        sessionSummary:
          "The Fellow taught core Growth Mindset elements and maintained group engagement. A brief off-topic detour occurred before the facilitator redirected to the lesson. The session ended with curriculum-aligned reflection and action planning.",
        contentCoverage: {
          score: 2,
          rating: "PARTIAL",
          justification:
            "Core Growth Mindset language appears, but instructional focus was diluted by a side conversation.",
          evidenceQuotes: [
            "brain is a muscle",
            "effort strengthens performance over time",
            "bring it back to learning from failure"
          ]
        },
        facilitationQuality: {
          score: 2,
          rating: "ADEQUATE",
          justification:
            "The Fellow re-engaged the group after drift, but momentum and depth were reduced.",
          evidenceQuotes: [
            "short side chat for two minutes",
            "thank you, let us bring it back",
            "write one setback and reframe it"
          ]
        },
        protocolSafety: {
          score: 2,
          rating: "MINOR_DRIFT",
          justification:
            "The conversation temporarily moved off-protocol, then returned to the planned curriculum.",
          evidenceQuotes: [
            "talk about the weekend match",
            "that was a drift from topic",
            "we will refocus now"
          ]
        },
        riskDetection: {
          flag: "SAFE",
          rationale: "No direct self-harm or severe crisis phrases were detected.",
          extractedQuotes: []
        },
        ...base
      };

    case "SUBTLE_RISK":
      return {
        sessionSummary:
          "The session included Growth Mindset framing and supportive facilitation. A participant made subtle but clear self-harm and hopelessness statements. The Fellow initiated a safety check and escalated to supervisor support.",
        contentCoverage: {
          score: 2,
          rating: "PARTIAL",
          justification:
            "Growth Mindset was present, but safety escalation appropriately became the main focus after risk language.",
          evidenceQuotes: [
            "difficult seasons can shift with support",
            "small repeated actions",
            "pausing for a safety check now"
          ]
        },
        facilitationQuality: {
          score: 3,
          rating: "EXCELLENT",
          justification:
            "The Fellow responded with empathy and clarity, validating the student and taking immediate action.",
          evidenceQuotes: [
            "thank you for trusting us with that",
            "your safety is important",
            "we will stay with you through each next step"
          ]
        },
        protocolSafety: {
          score: 3,
          rating: "ADHERENT",
          justification:
            "The Fellow followed safety protocol and supervisor escalation instead of giving out-of-scope advice.",
          evidenceQuotes: [
            "pausing for a safety check now",
            "involving the supervisor immediately",
            "documenting the exact statement"
          ]
        },
        riskDetection: {
          flag: "RISK",
          rationale:
            "The transcript contains subtle but explicit self-harm and disappearance language requiring urgent review.",
          extractedQuotes: ["it feels easier not to wake up tomorrow", "I just want to disappear"]
        },
        ...base
      };

    case "CONTROL":
      return {
        sessionSummary:
          "The Fellow guided a structured reflection session linked to effort-based coping. Participants gave practical examples and committed to weekly follow-up actions. No acute safety concerns appeared in the transcript.",
        contentCoverage: {
          score: 2,
          rating: "PARTIAL",
          justification:
            "Concept language is present but less explicit than in high-fidelity teaching sessions.",
          evidenceQuotes: [
            "reviewed examples of effort-based language",
            "connected them to current school stressors",
            "one practical step for this week"
          ]
        },
        facilitationQuality: {
          score: 2,
          rating: "ADEQUATE",
          justification:
            "The group remained engaged with clear structure, though probing depth was moderate.",
          evidenceQuotes: [
            "quick check-in",
            "moving into concept teaching",
            "summarizing key takeaways"
          ]
        },
        protocolSafety: {
          score: 3,
          rating: "ADHERENT",
          justification:
            "The Fellow maintained role boundaries and stayed within curriculum-safe language.",
          evidenceQuotes: [
            "staying within the Shamiri curriculum",
            "focus on effort, reflection, and peer support",
            "share what changed at the next meeting"
          ]
        },
        riskDetection: {
          flag: "SAFE",
          rationale: "No crisis indicators were identified.",
          extractedQuotes: []
        },
        ...base
      };

    default:
      return {
        sessionSummary:
          "Session completed with structured facilitation and participant engagement. Growth Mindset language was present with variable depth across turns. No severe safety concerns were identified.",
        contentCoverage: {
          score: 2,
          rating: "PARTIAL",
          justification:
            "The concept appears but requires stronger understanding checks and examples.",
          evidenceQuotes: ["growth mindset", "effort-based", "reflection"]
        },
        facilitationQuality: {
          score: 2,
          rating: "ADEQUATE",
          justification:
            "The Fellow remained polite and structured with moderate engagement depth.",
          evidenceQuotes: ["quick check-in", "activity sheet", "close by writing"]
        },
        protocolSafety: {
          score: 3,
          rating: "ADHERENT",
          justification: "No boundary violations or unsafe recommendations were observed.",
          evidenceQuotes: ["within the Shamiri curriculum", "peer support", "next session"]
        },
        riskDetection: {
          flag: "SAFE",
          rationale: "No crisis language was detected.",
          extractedQuotes: []
        },
        ...base
      };
  }
}

async function ensureFellowsForSupervisor(
  supervisorId: string
): Promise<Array<{ id: string; name: string }>> {
  const existingFellows = await prisma.fellow.findMany({
    where: { supervisorId },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" }
  });

  const byName = new Map(existingFellows.map((fellow) => [fellow.name, fellow]));
  const requiredNames = fellowNames.slice(0, sessionScenarios.length);

  const fellows: Array<{ id: string; name: string }> = [];

  for (const name of requiredNames) {
    const existing = byName.get(name);

    if (existing) {
      fellows.push(existing);
      continue;
    }

    const created = await prisma.fellow.create({
      data: {
        supervisorId,
        name
      },
      select: {
        id: true,
        name: true
      }
    });

    fellows.push(created);
  }

  return fellows;
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_SUPERVISOR_PASSWORD, 10);

  const supervisor = await prisma.supervisor.upsert({
    where: { email: DEMO_SUPERVISOR_EMAIL },
    create: {
      name: "Dr. Sarah Jenkins",
      email: DEMO_SUPERVISOR_EMAIL,
      passwordHash
    },
    update: {
      name: "Dr. Sarah Jenkins",
      passwordHash
    }
  });

  const fellows = await ensureFellowsForSupervisor(supervisor.id);

  await prisma.session.deleteMany({
    where: { supervisorId: supervisor.id }
  });

  const createdSessions = await Promise.all(
    sessionScenarios.map((scenario, index) => {
      const fellow = fellows[index % fellows.length];
      const groupId = `GRP-${9410 + index}`;
      const transcriptText = buildSessionTranscript({
        fellowName: fellow.name,
        groupId,
        durationMinutes: scenario.durationMinutes,
        scenarioKind: scenario.kind,
        variationSeed: index + 1
      });

      return prisma.session.create({
        data: {
          supervisorId: supervisor.id,
          fellowId: fellow.id,
          groupId,
          occurredAt: dayjs()
            .subtract(index, "day")
            .hour(10 + (index % 4) * 2)
            .minute(15)
            .second(0)
            .millisecond(0)
            .toDate(),
          transcriptText,
          finalStatus: scenario.finalStatus ?? undefined
        }
      });
    })
  );

  if (SHOULD_SEED_REFERENCE_ANALYSIS) {
    await Promise.all(
      createdSessions.map(async (session, index) => {
        const scenario = sessionScenarios[index];

        if (!scenario.seedReferenceAnalysis) {
          return;
        }

        const payload = buildExpectedAnalysisPayload({
          scenarioKind: scenario.kind,
          generatedAt: new Date().toISOString()
        });

        await prisma.aIAnalysis.create({
          data: {
            sessionId: session.id,
            resultJson: payload as unknown as AnalysisResultJsonInput,
            safetyFlag: payload.riskDetection.flag as SafetyFlag,
            riskQuotes: payload.riskDetection.extractedQuotes,
            model: payload.meta.model,
            promptVersion: payload.meta.promptVersion,
            latencyMs: payload.meta.latencyMs
          }
        });
      })
    );
  }

  const reviewSeedInput = sessionScenarios
    .map((scenario, index) => ({
      scenario,
      sessionId: createdSessions[index]?.id
    }))
    .filter(
      (
        row
      ): row is {
        scenario: SessionScenario & { review: NonNullable<SessionScenario["review"]> };
        sessionId: string;
      } => Boolean(row.sessionId && row.scenario.review)
    );

  await Promise.all(
    reviewSeedInput.map((row) =>
      prisma.supervisorReview.create({
        data: {
          sessionId: row.sessionId,
          supervisorId: supervisor.id,
          decision: row.scenario.review.decision,
          finalStatus: row.scenario.finalStatus ?? SessionStatus.PROCESSED,
          note: row.scenario.review.note
        }
      })
    )
  );

  console.log("Seed complete ✅");
  console.log("Supervisor:", {
    email: DEMO_SUPERVISOR_EMAIL,
    password: DEMO_SUPERVISOR_PASSWORD
  });
  console.log("Fellows assigned:", fellows.length);
  console.log("Sessions created:", createdSessions.length);
  console.log(
    "Reference analyses created:",
    SHOULD_SEED_REFERENCE_ANALYSIS ? "enabled" : "disabled"
  );
  console.log("Reviews created:", reviewSeedInput.length);
}

main()
  .catch((error) => {
    console.error("Seed failed ❌", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
