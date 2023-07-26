/*
  Warnings:

  - Made the column `url` on table `Certificate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Certificate" ALTER COLUMN "url" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" INTEGER;
