import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// CREATE a new Home Post
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

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } | Promise<{ id: string }> }
) {
	const { id } = await params;
	if (!id) {
		return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
	}

	try {
		const deletedPost = await prisma.homePost.delete({ where: { id } });
		return NextResponse.json({ success: true, deletedPost }, { status: 200 });
	} catch (error: any) {
		console.error("Error deleting post:", error);
		// Optionally check for specific error codes (e.g., Prisma's P2025)
		return NextResponse.json(
			{ error: "Failed to delete post", details: error.message || "Unknown error" },
			{ status: 500 }
		);
	}
}



export async function PUT(req: Request) {
	try {
		const { heroImage, content } = await req.json();

		const updatedHome = await prisma.pageContent.update({
			where: { pageSlug: "home" },
			data: { heroImage, content },
		});

		return NextResponse.json(updatedHome);
	} catch (error) {
		return NextResponse.json({ error: "Failed to update home content" }, { status: 500 });
	}
}
