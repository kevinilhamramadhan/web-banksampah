/*
  Warnings:

  - You are about to drop the column `firebaseHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firebaseSalt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "firebaseHash",
DROP COLUMN "firebaseSalt";
