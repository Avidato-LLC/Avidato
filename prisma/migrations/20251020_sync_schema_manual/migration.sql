-- Add isPublic column to Lesson table
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN DEFAULT false;

-- Add bio column to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT;

-- Create Career table
CREATE TABLE IF NOT EXISTS "Career" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "location" TEXT,
    "typeformUrl" TEXT DEFAULT 'https://form.typeform.com/to/almI6bRO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
