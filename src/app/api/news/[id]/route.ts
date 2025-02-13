import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
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


export async function DELETE(req, { params }) {
	const { id } = params; // Get the post ID from the URL
	if (!id) {
		return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
	}

	try {
		// Attempt to delete the post from the database
		await prisma.newsPost.delete({
			where: { id },
		});

		return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Failed to delete post:", error);
		return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
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


