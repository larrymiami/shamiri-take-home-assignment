import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseUrlFromEnv } from "../../src/server/db/connectionString";

const SEEDED_DEMO_EMAIL = "supervisor@shamiri.demo";
const SEEDED_DEMO_PASSWORD = "Password123!";

export default async function globalSetup() {
  // For externally hosted targets, avoid mutating remote data stores.
  if (process.env.PLAYWRIGHT_BASE_URL) {
    return;
  }

  const email = process.env.E2E_SUPERVISOR_EMAIL?.trim() || SEEDED_DEMO_EMAIL;
  const password = process.env.E2E_SUPERVISOR_PASSWORD || SEEDED_DEMO_PASSWORD;
  const passwordHash = await bcrypt.hash(password, 10);

  const adapter = new PrismaPg({
    connectionString: getDatabaseUrlFromEnv()
  });
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.supervisor.upsert({
      where: { email },
      create: {
        name: "E2E Supervisor",
        email,
        passwordHash
      },
      update: {
        passwordHash
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}
