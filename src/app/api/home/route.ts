import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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



