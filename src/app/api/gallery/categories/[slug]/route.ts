import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params?: { slug?: string } }) {
	const slug = params?.slug;

	try {
		if (slug) {
			const category = await prisma.category.findUnique({
				where: { slug },
				include: {
					galleryPosts: {
						orderBy: { date: "desc" },
						select: {
							id: true,
							title: true,
							description: true,
							imageUrl: true,
							date: true,
						},
					},
				},
			});




			if (!category) {
				return NextResponse.json({ error: "Category not found" }, { status: 404 });
			}

			return NextResponse.json({ category, posts: category.galleryPosts });
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
							id: true,
							name: true,
							slug: true,
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


export async function PUT(req: Request, { params }: { params: { id: string } }) {
	const { id } = params;
	const { title, description, imageUrl, categoryId } = await req.json();

	try {
		const updatedPost = await prisma.galleryImage.update({
			where: { id },
			data: {
				title,
				description,
				imageUrl,
				categories: {
					connect: { id: categoryId },  // Connect the selected category
				},
			},
		});

		return NextResponse.json(updatedPost);
	} catch (error) {
		console.error("Error updating post:", error);
		return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
	}
}

