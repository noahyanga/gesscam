import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// UPDATE a post
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const { title, content } = await request.json();

		if (!title || !content) {
			return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
		}

		const existingPost = await prisma.aboutPost.findUnique({ where: { id } });
		if (!existingPost) {
			return NextResponse.json({ error: "Post not found" }, { status: 404 });
		}

		const updatedPost = await prisma.aboutPost.update({
			where: { id },
			data: { title, content },
		});

		return NextResponse.json(updatedPost);
	} catch (error) {
		console.error("Error updating post:", error);
		return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
	}
}

// DELETE a post
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;


		const existingPost = await prisma.aboutPost.findUnique({ where: { id } });
		if (!existingPost) {
			return NextResponse.json({ error: "Post not found" }, { status: 404 });
		}

		await prisma.aboutPost.delete({ where: { id } });

		return NextResponse.json({ message: "Post deleted successfully" });
	} catch (error) {
		console.error("Error deleting post:", error);
		return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
	}
}

