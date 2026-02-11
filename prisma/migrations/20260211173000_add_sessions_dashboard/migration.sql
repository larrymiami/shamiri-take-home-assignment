-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PROCESSED', 'FLAGGED_FOR_REVIEW', 'SAFE', 'RISK');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "fellowId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "transcriptText" TEXT NOT NULL,
    "finalStatus" "SessionStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_supervisorId_idx" ON "Session"("supervisorId");

-- CreateIndex
CREATE INDEX "Session_fellowId_idx" ON "Session"("fellowId");

-- CreateIndex
CREATE INDEX "Session_occurredAt_idx" ON "Session"("occurredAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Supervisor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_fellowId_fkey" FOREIGN KEY ("fellowId") REFERENCES "Fellow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
