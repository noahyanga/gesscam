/*
  Warnings:

  - You are about to drop the `_CategoryToGalleryImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToGalleryImage" DROP CONSTRAINT "_CategoryToGalleryImage_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToGalleryImage" DROP CONSTRAINT "_CategoryToGalleryImage_B_fkey";

-- DropTable
DROP TABLE "_CategoryToGalleryImage";

-- CreateTable
CREATE TABLE "GalleryImageCategory" (
    "galleryImageId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "GalleryImageCategory_pkey" PRIMARY KEY ("galleryImageId","categoryId")
);

-- AddForeignKey
ALTER TABLE "GalleryImageCategory" ADD CONSTRAINT "GalleryImageCategory_galleryImageId_fkey" FOREIGN KEY ("galleryImageId") REFERENCES "GalleryImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImageCategory" ADD CONSTRAINT "GalleryImageCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
