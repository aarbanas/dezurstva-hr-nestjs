/*
  Warnings:

  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "CertificateType" ADD VALUE 'ID';

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "validTill" DROP NOT NULL;
