import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req) {
	const { heroImage, title } = await req.json();

	if (!heroImage) {
		return NextResponse.json({ error: "No image provided" }, { status: 400 });
	}

	try {
		await prisma.pageContent.update({
			where: { pageSlug: "exec-body" },
			data: { heroImage, title },
		});

		return NextResponse.json({ message: "Image updated successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error updating hero image:", error);
		return NextResponse.json({ error: "Failed to update hero image" }, { status: 500 });
	}
}

