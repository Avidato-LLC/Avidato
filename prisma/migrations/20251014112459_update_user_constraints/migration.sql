/*
  Warnings:

  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."User_username_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
