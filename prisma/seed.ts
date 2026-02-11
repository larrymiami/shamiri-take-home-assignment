import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../_app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
  adapter
});

async function main() {
  // ---- create 1 Supervisor ----
  const demoEmail = "supervisor@shamiri.demo";
  const demoPassword = "Password123!";
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  const supervisor = await prisma.supervisor.create({
    data: {
      name: "Demo Supervisor",
      email: demoEmail,
      passwordHash
    }
  });

  // ---- create 5 Fellows assigned to the Supervisor ----
  const fellows = await prisma.fellow.createMany({
    data: [
      { name: "Amina Wanjiku", supervisorId: supervisor.id },
      { name: "Brian Otieno", supervisorId: supervisor.id },
      { name: "Carol Njeri", supervisorId: supervisor.id },
      { name: "David Mwangi", supervisorId: supervisor.id },
      { name: "Esther Achieng", supervisorId: supervisor.id }
    ]
  });

  console.log("Seed complete ✅");
  console.log("Supervisor:", { email: demoEmail, password: demoPassword });
  console.log("Fellows created:", fellows.count);
}

main()
  .catch((e) => {
    console.error("Seed failed ❌", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
