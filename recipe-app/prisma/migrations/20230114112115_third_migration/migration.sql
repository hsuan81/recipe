/*
  Warnings:

  - The values [NOSCALE] on the enum `Difficulty` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `instructions` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `viewrs` on the `Recipe` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Difficulty_new" AS ENUM ('DIFFICULT5', 'DIFFICULT4', 'MODERATE3', 'EASY2', 'EASY1');
ALTER TABLE "Recipe" ALTER COLUMN "difficulty" DROP DEFAULT;
ALTER TABLE "Recipe" ALTER COLUMN "difficulty" TYPE "Difficulty_new" USING ("difficulty"::text::"Difficulty_new");
ALTER TYPE "Difficulty" RENAME TO "Difficulty_old";
ALTER TYPE "Difficulty_new" RENAME TO "Difficulty";
DROP TYPE "Difficulty_old";
ALTER TABLE "Recipe" ALTER COLUMN "difficulty" SET DEFAULT 'EASY1';
COMMIT;

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "instructions",
DROP COLUMN "viewrs",
ADD COLUMN     "basketsNum" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "difficulty" SET DEFAULT 'EASY1';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "RecipeStep" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "stepNum" INTEGER NOT NULL,
    "instruction" TEXT NOT NULL,
    "imageName" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "RecipeStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- AddForeignKey
ALTER TABLE "RecipeStep" ADD CONSTRAINT "RecipeStep_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
