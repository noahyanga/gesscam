import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const posts = await prisma.newsPost.findMany({
			orderBy: { date: 'desc' },
			select: {
				id: true,
				title: true,
				content: true,
				image: true,
				categories: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				date: true
			}
		});

		const categories = await prisma.category.findMany({
			select: {
				id: true,
				name: true,
				slug: true,
				_count: {
					select: {
						newsPosts: true, // Ensure this is being fetched
					},
				},
			},
		});

		console.log("Fetched categories bb:", JSON.stringify(categories, null, 2)); // Debugging



		return NextResponse.json({ posts, categories }); // Ensure categories are included
	} catch (error) {
		console.error("News API Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch news posts" },
			{ status: 500 }
		);
	}
}




export async function POST(req: Request) {
	try {
		const { title, content, image, categoryIds } = await req.json();

		if (!title || !content || !categoryIds?.length) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		// Ensure all categories exist
		const validCategories = await prisma.category.findMany({
			where: { id: { in: categoryIds } },
			select: { id: true },
		});

		if (validCategories.length !== categoryIds.length) {
			return NextResponse.json({ error: "One or more category IDs are invalid" }, { status: 400 });
		}

		// Create news post
		const newPost = await prisma.newsPost.create({
			data: {
				title,
				content,
				image,
				categories: {
					create: categoryIds.map((categoryId) => ({
						category: { connect: { id: categoryId } },
					})),
				},
			},
			include: { categories: true },
		});

		return NextResponse.json(newPost, { status: 201 });

	} catch (error) {
		console.error("Error creating post:", error);
		return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
	}
}


