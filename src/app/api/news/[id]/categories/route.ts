// app/api/news/[postId]/categories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, props: { params: Promise<{ postId: string }> }) {
	const params = await props.params;
	try {
		const { categoryId } = await req.json();

		const updatedPost = await prisma.newsPost.update({
			where: { id: params.postId },
			data: {
				categories: {
					create: {
						categoryId: categoryId,
					},
				},
			},
			include: { categories: true },
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
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	if (!id) {
		return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
	}

	try {
		const deletedPost = await prisma.newsPost.delete({ where: { id } });
		return NextResponse.json({ success: true, deletedPost }, { status: 200 });
	} catch (error: any) {
		console.error("Error deleting post:", error);
		// Optionally check for specific error codes (e.g., Prisma's P2025)
		return NextResponse.json(
			{ error: "Failed to delete post", details: error || "Unknown error" },
			{ status: 500 }
		);
	}
}


