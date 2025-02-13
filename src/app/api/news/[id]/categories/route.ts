// app/api/news/[postId]/categories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
	req: Request,
	{ params }: { params: { postId: string } }
) {
	try {
		const { categoryId } = await req.json();

		const updatedPost = await prisma.newsPost.update({
			where: { id: params.postId },
			data: {
				categories: { connect: { id: categoryId } }
			},
			include: { categories: true }
		});

		return NextResponse.json(updatedPost);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to add category" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { postId: string } }
) {
	try {
		const { searchParams } = new URL(req.url);
		const categoryId = searchParams.get('categoryId');

		const updatedPost = await prisma.newsPost.update({
			where: { id: params.postId },
			data: {
				categories: { disconnect: { id: categoryId } }
			},
			include: { categories: true }
		});

		return NextResponse.json(updatedPost);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to remove category" },
			{ status: 500 }
		);
	}
}
