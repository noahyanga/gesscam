// app/gallery/GalleryPageWrapper.server.tsx
import { prisma } from "@/lib/prisma";
import GalleryCategoryPageClient from "./GalleryCategoryPageClient";
import SessionProviderWrapper from "@/components/Admin/SessionProviderWrapper";
import { getServerSession } from "next-auth"; // Get session using next-auth
import { authOptions } from "@/lib/auth"; // Your auth options

export default async function GalleryPageWrapper() {

	const session = await getServerSession(authOptions);

	const [galleryContent, galleryImages, categories] = await Promise.all([
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
				date: true,
				categories: {
					select: {
						category: {
							select: {
								id: true,
								slug: true,
								name: true
							}
						}
					}
				}
			}

		}),

		prisma.category.findMany({
			select: {
				id: true,
				name: true,
				slug: true,
				_count: { select: { galleryPosts: true } } // Fetch gallery post count
			}
		})
	]);

	return (
		<SessionProviderWrapper session={session}>
			<GalleryCategoryPageClient
				galleryContent={galleryContent}
				initialImages={galleryImages}
				categories={categories}
			/>
		</SessionProviderWrapper>
	);
}

