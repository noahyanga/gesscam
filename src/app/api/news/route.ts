import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NewsPost } from '@/types/news';

export async function GET() {
	try {
		const posts = await prisma.newsPost.findMany({
			orderBy: { date: 'desc' },
			select: {
				id: true,
				title: true,
				content: true,
				image: true,
				date: true
			}
		});

		const categories = await prisma.category.findMany({
			include: {
				_count: {
					select: { newsPosts: true }
				}
			}
		});

		return NextResponse.json<NewsPost[]>(posts);
	} catch (error) {
		console.error('News API Error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch news posts' },
			{ status: 500 }
		);
	}
}

export async function POST(req) {
	try {
		const { title, content, image } = await req.json();
		const newPost = await prisma.newsPost.create({
			data: {
				title,
				content,
				image,
			},
		});

		return NextResponse.json(newPost, { status: 201 });
	} catch (error) {
		return NextResponse.json({ error: "Failed to create news post" }, { status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const { heroImage } = await req.json();

		if (!heroImage) {
			return NextResponse.json({ message: "heroImage is required" }, { status: 400 });
		}

		console.log("Updating hero image:", heroImage);

		return NextResponse.json({ message: "News content updated successfully" }, { status: 200 });
	} catch (error) {
		console.error("API Error:", error);
		return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
	}
}

