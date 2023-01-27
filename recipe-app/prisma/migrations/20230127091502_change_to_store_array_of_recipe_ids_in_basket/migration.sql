/*
  Warnings:

  - You are about to drop the `_BasketToRecipe` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BasketToRecipe" DROP CONSTRAINT "_BasketToRecipe_A_fkey";

-- DropForeignKey
ALTER TABLE "_BasketToRecipe" DROP CONSTRAINT "_BasketToRecipe_B_fkey";

-- AlterTable
ALTER TABLE "Basket" ADD COLUMN     "recipes" TEXT[];

-- DropTable
DROP TABLE "_BasketToRecipe";
