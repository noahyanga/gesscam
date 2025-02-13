/*
  Warnings:

  - You are about to drop the `_CategoryToNewsPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToNewsPost" DROP CONSTRAINT "_CategoryToNewsPost_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToNewsPost" DROP CONSTRAINT "_CategoryToNewsPost_B_fkey";

-- DropTable
DROP TABLE "_CategoryToNewsPost";

-- CreateTable
CREATE TABLE "_CategoryToNews" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToNews_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoryToNews_B_index" ON "_CategoryToNews"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToNews" ADD CONSTRAINT "_CategoryToNews_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToNews" ADD CONSTRAINT "_CategoryToNews_B_fkey" FOREIGN KEY ("B") REFERENCES "NewsPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
