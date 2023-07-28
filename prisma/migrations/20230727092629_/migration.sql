/*
  Warnings:

  - You are about to drop the column `organisationAttributeId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userAttributeId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `OrganisationAttribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAttribute` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userAttributesId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organisationAttributesId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_userAttributeId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organisationAttributeId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userAttributeId_fkey";

-- DropIndex
DROP INDEX "User_organisationAttributeId_key";

-- DropIndex
DROP INDEX "User_userAttributeId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "organisationAttributeId",
DROP COLUMN "userAttributeId",
ADD COLUMN     "organisationAttributesId" INTEGER,
ADD COLUMN     "userAttributesId" INTEGER;

-- DropTable
DROP TABLE "OrganisationAttribute";

-- DropTable
DROP TABLE "UserAttribute";

-- CreateTable
CREATE TABLE "UserAttributes" (
    "id" SERIAL NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" INTEGER,
    "type" "UserType",

    CONSTRAINT "UserAttributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganisationAttributes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "oib" INTEGER NOT NULL,

    CONSTRAINT "OrganisationAttributes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userAttributesId_key" ON "User"("userAttributesId");

-- CreateIndex
CREATE UNIQUE INDEX "User_organisationAttributesId_key" ON "User"("organisationAttributesId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userAttributesId_fkey" FOREIGN KEY ("userAttributesId") REFERENCES "UserAttributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organisationAttributesId_fkey" FOREIGN KEY ("organisationAttributesId") REFERENCES "OrganisationAttributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userAttributeId_fkey" FOREIGN KEY ("userAttributeId") REFERENCES "UserAttributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
