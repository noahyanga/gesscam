import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// UPDATE a post
export async function PUT(req: Request, { params }: { params: { id: string } }) {
	try {
		const { id } = params; // Now correctly extracted from route /api/about/{id}
		const { title, content } = await req.json();

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
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
	try {
		const { id } = params;

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

