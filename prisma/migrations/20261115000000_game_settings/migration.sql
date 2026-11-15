-- CreateTable
CREATE TABLE "GameSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "world" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "selected" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "roundLength" INTEGER NOT NULL DEFAULT 6,
    "limit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameSetting_userId_idx" ON "GameSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSetting_userId_world_gameId_key" ON "GameSetting"("userId", "world", "gameId");

-- AddForeignKey
ALTER TABLE "GameSetting" ADD CONSTRAINT "GameSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
