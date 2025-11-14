-- Add VocabularyAudio table (run in Supabase SQL Editor)
-- This is safe and does not reset or modify existing data

CREATE TABLE IF NOT EXISTS "VocabularyAudio" (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  word text NOT NULL UNIQUE,
  "audioUrl" text NOT NULL,
  "storageKey" text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "VocabularyAudio_word_idx" ON "VocabularyAudio"(word);
