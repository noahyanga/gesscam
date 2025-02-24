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
