/*
  Warnings:

  - The `linkedSchemas` column on the `Mode` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Mode" DROP COLUMN "linkedSchemas",
ADD COLUMN     "linkedSchemas" TEXT[] DEFAULT ARRAY[]::TEXT[];
