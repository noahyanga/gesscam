// app/gallery/GalleryPageWrapper.server.tsx
import { prisma } from "@/lib/prisma";
import SessionProviderWrapper from "@/components/Admin/SessionProviderWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import GalleryCategoryPageClient from "./GalleryCategoryPageClient";

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
								name: true,
								slug: true,
							},
						},
					},
				},
			},
		}),

		prisma.category.findMany({
			select: {
				id: true,
				name: true,
				slug: true,
				_count: { select: { galleryPosts: true } }
			}
		})
	]);

	// Transform galleryImages to match the expected format
	const transformedGalleryImages = galleryImages.map(image => ({
		...image,
		categories: image.categories.map(item => item.category)
	}));

	return (
		<SessionProviderWrapper session={session}>
			<GalleryCategoryPageClient
				galleryContent={galleryContent}
				initialImages={transformedGalleryImages} // Use transformed data
				categories={categories}
			/>
		</SessionProviderWrapper>
	);
}
