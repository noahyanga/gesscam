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
						category: { // Access the related Category model
							select: {
								id: true,
								name: true,
								slug: true,
							},
						},
					},
				},
				date: true,
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

		console.log("Fetched categories bb:", JSON.stringify(categories, null, 2));

		return NextResponse.json({
			posts,
			categories: posts.map((post) => ({
				...post,
				categories: post.categories.map((item) => item.category),
			})),
			allCategories: categories,
		});
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

		if (!title || !content || !image) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
		return NextResponse.json({ error: "Server error", details: error }, { status: 500 });
	}
}


