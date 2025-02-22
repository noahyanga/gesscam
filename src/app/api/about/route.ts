import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// UPDATE a post
export async function PUT(req: Request, { params }: { params: { id: string } }) {
	try {
		const { id } = params;
		const { title, content } = await req.json();

		// Validate input
		if (!title || !content) {
			return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
		}

		// Ensure post exists before updating
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

		// Ensure post exists before deleting
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

export async function POST(req: Request) {
	try {
		const { title, content } = await req.json();

		if (!title || !content) {
			return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
		}

		const newPost = await prisma.homePost.create({
			data: { title, content },
		});

		return NextResponse.json(newPost, { status: 201 });
	} catch (error) {
		console.error("Error adding post:", error);
		return NextResponse.json({ error: "Failed to add post" }, { status: 500 });
	}
}


