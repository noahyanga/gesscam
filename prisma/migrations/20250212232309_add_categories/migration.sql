-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToNewsPost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToNewsPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CategoryToGalleryImage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToGalleryImage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "_CategoryToNewsPost_B_index" ON "_CategoryToNewsPost"("B");

-- CreateIndex
CREATE INDEX "_CategoryToGalleryImage_B_index" ON "_CategoryToGalleryImage"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToNewsPost" ADD CONSTRAINT "_CategoryToNewsPost_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToNewsPost" ADD CONSTRAINT "_CategoryToNewsPost_B_fkey" FOREIGN KEY ("B") REFERENCES "NewsPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToGalleryImage" ADD CONSTRAINT "_CategoryToGalleryImage_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToGalleryImage" ADD CONSTRAINT "_CategoryToGalleryImage_B_fkey" FOREIGN KEY ("B") REFERENCES "GalleryImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
