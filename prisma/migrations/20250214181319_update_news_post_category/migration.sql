/*
  Warnings:

  - You are about to drop the `_CategoryToNews` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToNews" DROP CONSTRAINT "_CategoryToNews_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToNews" DROP CONSTRAINT "_CategoryToNews_B_fkey";

-- DropTable
DROP TABLE "_CategoryToNews";

-- CreateTable
CREATE TABLE "NewsPostCategory" (
    "newsPostId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "NewsPostCategory_pkey" PRIMARY KEY ("newsPostId","categoryId")
);

-- AddForeignKey
ALTER TABLE "NewsPostCategory" ADD CONSTRAINT "NewsPostCategory_newsPostId_fkey" FOREIGN KEY ("newsPostId") REFERENCES "NewsPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsPostCategory" ADD CONSTRAINT "NewsPostCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
