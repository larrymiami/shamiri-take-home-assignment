import prisma from "@/server/db/prisma";

export async function countForSupervisor(supervisorId: string): Promise<number> {
  return prisma.fellow.count({
    where: { supervisorId }
  });
}
