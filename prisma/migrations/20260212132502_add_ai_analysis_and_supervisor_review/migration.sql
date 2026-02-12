-- CreateEnum
CREATE TYPE "SafetyFlag" AS ENUM ('SAFE', 'RISK');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('VALIDATED', 'REJECTED', 'OVERRIDDEN');

-- CreateTable
CREATE TABLE "AIAnalysis" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "resultJson" JSONB NOT NULL,
    "safetyFlag" "SafetyFlag" NOT NULL,
    "riskQuotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupervisorReview" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "finalStatus" "SessionStatus" NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupervisorReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIAnalysis_sessionId_key" ON "AIAnalysis"("sessionId");

-- CreateIndex
CREATE INDEX "AIAnalysis_safetyFlag_idx" ON "AIAnalysis"("safetyFlag");

-- CreateIndex
CREATE UNIQUE INDEX "SupervisorReview_sessionId_key" ON "SupervisorReview"("sessionId");

-- CreateIndex
CREATE INDEX "SupervisorReview_supervisorId_idx" ON "SupervisorReview"("supervisorId");

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisorReview" ADD CONSTRAINT "SupervisorReview_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisorReview" ADD CONSTRAINT "SupervisorReview_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Supervisor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
