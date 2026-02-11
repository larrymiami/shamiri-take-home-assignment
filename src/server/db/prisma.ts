import { PrismaClient } from "../../../_app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL;

  if (!value) {
    throw new Error("DATABASE_URL is required");
  }

  const sslMode = new URL(value).searchParams.get("sslmode");
  if (sslMode !== "verify-full") {
    throw new Error("DATABASE_URL must include sslmode=verify-full");
  }

  return value;
}

const adapter = new PrismaPg({
  connectionString: getDatabaseUrl()
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
