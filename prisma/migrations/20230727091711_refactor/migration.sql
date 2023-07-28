/*
  Warnings:

  - You are about to drop the column `userId` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `firstname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userAttributeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organisationAttributeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ORGANISATION';

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_userId_fkey";

-- DropIndex
DROP INDEX "Certificate_userId_key";

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userAttributeId" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstname",
DROP COLUMN "lastname",
DROP COLUMN "phone",
DROP COLUMN "type",
ADD COLUMN     "certificateId" INTEGER,
ADD COLUMN     "organisationAttributeId" INTEGER,
ADD COLUMN     "userAttributeId" INTEGER;

-- CreateTable
CREATE TABLE "UserAttribute" (
    "id" SERIAL NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" INTEGER,
    "type" "UserType",

    CONSTRAINT "UserAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganisationAttribute" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "oib" INTEGER NOT NULL,

    CONSTRAINT "OrganisationAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userAttributeId_key" ON "User"("userAttributeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_organisationAttributeId_key" ON "User"("organisationAttributeId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userAttributeId_fkey" FOREIGN KEY ("userAttributeId") REFERENCES "UserAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organisationAttributeId_fkey" FOREIGN KEY ("organisationAttributeId") REFERENCES "OrganisationAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userAttributeId_fkey" FOREIGN KEY ("userAttributeId") REFERENCES "UserAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
