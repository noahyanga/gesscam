import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {

	const { id } = params;
	try {

		const post = await prisma.newsPost.findUnique({
			where: { id },
			include: {
				comments: {
					orderBy: { createdAt: "desc" },
					select: {
						id: true,
						content: true,
						postId: true,
						authorId: true,
						createdAt: true,
					},
				},
			},
		});




		if (!post) {
			return NextResponse.json(
				{ error: 'Post not found' },
				{ status: 404 }
			)
		}

		return NextResponse.json(post)
	} catch (error) {
		console.error('API Error:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch post' },
			{ status: 500 }
		)
	}
}



export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	// Await params as required by Next.js App Router
	const { id } = await params;
	if (!id) {
		return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
	}

	try {
		// First, delete dependent join table records:
		await prisma.newsPostCategory.deleteMany({
			where: { newsPostId: id },
		});

		const deletedPost = await prisma.newsPost.delete({
			where: { id },
			include: {
				comments: {
					orderBy: { createdAt: "desc" },
					select: {
						id: true,
						content: true,
						postId: true,
						authorId: true,
						createdAt: true,
					},
				},
			},
		});

		return NextResponse.json({ success: true, deletedPost }, { status: 200 });
	} catch (error: unknown) {
		console.error("Error deleting post:", error);
		// Safely extract error message
		const errorMessage =
			error && typeof error === "object" && "message" in error
				? (error as any).message
				: "Unknown error";
		return NextResponse.json(
			{ error: "Failed to delete post", details: errorMessage },
			{ status: 500 }
		);
	}
}

export async function PUT(req, { params }) {
	const { id } = params;
	const { title, content, image } = await req.json(); // Get updated values from the request body

	if (!id || !title || !content || !image) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
	}

	try {
		const updatedPost = await prisma.newsPost.update({
			where: { id },
			data: { title, content, image },
		});

		return NextResponse.json(updatedPost, { status: 200 });
	} catch (error) {
		console.error("Error updating post:", error);
		return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
	}
}


