-- CreateTable
CREATE TABLE IF NOT EXISTS "VocabularyAudio" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VocabularyAudio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "VocabularyAudio_word_key" ON "VocabularyAudio"("word");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VocabularyAudio_word_idx" ON "VocabularyAudio"("word");
