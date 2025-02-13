// app/gallery/GalleryPageWrapper.server.tsx
import { prisma } from "@/lib/prisma";
import GalleryPageClient from "./GalleryPageClient";
import SessionProviderWrapper from "@/components/Admin/SessionProviderWrapper";
import { getServerSession } from "next-auth"; // Get session using next-auth
import { authOptions } from "@/lib/auth"; // Your auth options

export default async function GalleryPageWrapper() {

  const session = await getServerSession(authOptions);

  const [galleryContent, galleryImages] = await Promise.all([
    prisma.pageContent.findUnique({
      where: { pageSlug: 'gallery' }
    }),
    prisma.galleryImage.findMany({
      orderBy: { date: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        date: true
      }
    })
  ]);

  return (
    <SessionProviderWrapper session={session}>
      <GalleryPageClient
        galleryContent={galleryContent}
        initialImages={galleryImages}
      />
    </SessionProviderWrapper>
  );
}
