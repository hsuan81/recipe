/*
  Warnings:

  - You are about to drop the column `url` on the `RecipeStep` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `RecipeStep` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecipeStep" DROP COLUMN "url",
ADD COLUMN     "imageUrl" TEXT NOT NULL;
