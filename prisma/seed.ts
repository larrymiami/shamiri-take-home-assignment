import "dotenv/config";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { PrismaClient, SessionStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseUrlFromEnv } from "../src/server/db/connectionString";

const adapter = new PrismaPg({
  connectionString: getDatabaseUrlFromEnv()
});

const prisma = new PrismaClient({
  adapter
});

const DEMO_SUPERVISOR_EMAIL = "supervisor@shamiri.demo";
const DEMO_SUPERVISOR_PASSWORD = "Password123!";

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
  "Kevin Ouma",
  "Lilian Chebet",
  "Nadia Abdi"
];

const seededStatuses: Array<SessionStatus | null> = [
  SessionStatus.RISK,
  SessionStatus.FLAGGED_FOR_REVIEW,
  SessionStatus.SAFE,
  null,
  SessionStatus.FLAGGED_FOR_REVIEW,
  SessionStatus.SAFE,
  SessionStatus.RISK,
  null,
  SessionStatus.SAFE,
  SessionStatus.FLAGGED_FOR_REVIEW,
  null,
  SessionStatus.SAFE
];

function sessionTranscript(fellowName: string, groupId: string): string {
  return [
    `Session facilitator: ${fellowName} | Group: ${groupId}`,
    "Opening check-in: Fellows welcomed participants and asked each student to share one challenge from the week.",
    "Growth mindset content: The facilitator explained that the brain strengthens with practice and mistakes can be used as feedback for improvement.",
    "Group activity: Students paired up and discussed one setback they experienced, then reframed it using an effort-based statement.",
    "Reflection and close: The facilitator summarized key takeaways, invited remaining questions, and encouraged students to track one habit this week."
  ].join("\n\n");
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

  await prisma.session.deleteMany({
    where: { supervisorId: supervisor.id }
  });
  await prisma.fellow.deleteMany({
    where: { supervisorId: supervisor.id }
  });

  const fellows = await Promise.all(
    fellowNames.map((name) =>
      prisma.fellow.create({
        data: {
          name,
          supervisorId: supervisor.id
        }
      })
    )
  );

  await prisma.session.createMany({
    data: fellows.map((fellow, index) => {
      const groupId = `GRP-${9410 + index}`;
      return {
        supervisorId: supervisor.id,
        fellowId: fellow.id,
        groupId,
        occurredAt: dayjs()
          .subtract(index * 3, "hour")
          .toDate(),
        transcriptText: sessionTranscript(fellow.name, groupId),
        finalStatus: seededStatuses[index] ?? undefined
      };
    })
  });

  console.log("Seed complete ✅");
  console.log("Supervisor:", {
    email: DEMO_SUPERVISOR_EMAIL,
    password: DEMO_SUPERVISOR_PASSWORD
  });
  console.log("Fellows created:", fellows.length);
  console.log("Sessions created:", fellows.length);
}

main()
  .catch((e) => {
    console.error("Seed failed ❌", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
