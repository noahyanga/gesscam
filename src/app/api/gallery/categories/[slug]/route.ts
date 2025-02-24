import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, props: { params: Promise<{ slug: string }> }) {
	const params = await props.params;
	const slug = params.slug;

	try {
		if (slug) {
			const category = await prisma.category.findUnique({
				where: { slug },
				include: {
					galleryPosts: {
						select: {
							galleryImage: {
								select: {
									id: true,
									title: true,
									description: true,
									imageUrl: true,
									date: true,
								},
							},
						},
					},
				},
			});

			if (!category) {
				return NextResponse.json({ error: "Category not found" }, { status: 404 });
			}
			const posts = category.galleryPosts.map((gp) => gp.galleryImage);

			return NextResponse.json({ category, posts });
		} else {
			// Fetch all gallery posts and categories
			const posts = await prisma.galleryImage.findMany({
				orderBy: { date: "desc" },
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
			});

			const categories = await prisma.category.findMany({
				select: {
					id: true,
					name: true,
					slug: true,
					_count: {
						select: {
							galleryPosts: true,
						},
					},
				},
			});

			return NextResponse.json({ posts, categories });
		}
	} catch (error) {
		console.error("Gallery API Error:", error);
		return NextResponse.json({ error: "Failed to fetch gallery posts" }, { status: 500 });
	}
}


export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const { id } = params;
	const { title, description, imageUrl, categoryId } = await req.json();

	try {
		// Disconnect all existing categories.
		await prisma.galleryImage.update({
			where: { id },
			data: {
				categories: {
					deleteMany: {},
				},
			},
		});

		// Connect the new category.
		const updatedPost = await prisma.galleryImage.update({
			where: { id },
			data: {
				title,
				description,
				imageUrl,
				categories: {
					create: {
						categoryId: categoryId,
					},
				},
			},
		});

		return NextResponse.json(updatedPost);
	} catch (error) {
		console.error("Error updating post:", error);
		return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
	}
}

