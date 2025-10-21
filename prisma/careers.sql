-- Migration for careers table
CREATE TABLE "Career" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "location" VARCHAR(100),
  "typeformUrl" VARCHAR(255) NOT NULL DEFAULT 'https://form.typeform.com/to/almI6bRO',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
