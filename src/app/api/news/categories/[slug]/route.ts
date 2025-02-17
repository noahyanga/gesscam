import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params?: { slug?: string } }) {
	const slug = params?.slug;

	try {
		if (slug) {
			// Fetch news posts for a specific category
			const category = await prisma.category.findUnique({
				where: { slug },
				include: {
					newsPosts: {
						orderBy: { date: 'desc' },
						select: {
							id: true,
							title: true,
							content: true,
							image: true,
							date: true,
						},
					},
				},
			});

			if (!category) {
				// Category not found, return 404 response
				return NextResponse.json({ error: 'Category not found' }, { status: 404 });
			}

			// Return the category and its posts
			return NextResponse.json({ category, posts: category.newsPosts });
		} else {
			// Fetch all news posts and categories
			const posts = await prisma.newsPost.findMany({
				orderBy: { date: 'desc' },
				select: {
					id: true,
					title: true,
					content: true,
					image: true,
					date: true,
					categories: {
						select: {
							id: true,
							name: true,
							slug: true,  // Ensure slug is included
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
							newsPosts: true,
						},
					},
				},
			});

			// Return all posts and categories
			return NextResponse.json({ posts, categories });
		}
	} catch (error) {
		console.error("News API Error:", error);

		// If there's an error, return a 500 response
		return NextResponse.json(
			{ error: 'Failed to fetch news posts' },
			{ status: 500 }
		);
	}
}


