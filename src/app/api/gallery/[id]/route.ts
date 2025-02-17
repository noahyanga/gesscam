import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(req: Request, { params }: { params: { id: string } }) {
	try {
		const image = await prisma.galleryImage.findUnique({
			where: { id: params.id },
		});

		if (!image) {
			return NextResponse.json({ error: "Image not found" }, { status: 404 });
		}

		return NextResponse.json(image, { status: 200 });
	} catch (error) {
		console.error("API Error:", error);
		return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
	}
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
	const { id } = params;
	const { title, description, imageUrl, categoryIds } = await req.json();

	try {
		if (!id || !title.trim() || !description.trim() || !imageUrl.trim() || !categoryIds.length) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		// Step 1: Remove existing category associations
		await prisma.galleryImageCategory.deleteMany({
			where: { galleryImageId: id },
		});

		// Step 2: Update the image and reassign categories
		const updatedImage = await prisma.galleryImage.update({
			where: { id },
			data: {
				title,
				description,
				imageUrl,
				categories: {
					create: categoryIds.map((categoryId) => ({
						category: { connect: { id: categoryId } },
					})),
				},
			},
			include: { categories: true },
		});

		console.log("Updated image with new categories:", { id, title, description, imageUrl, categoryIds });

		return NextResponse.json(updatedImage, { status: 200 });
	} catch (error) {
		console.error("Error updating image:", error);
		return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
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
		await prisma.galleryImageCategory.deleteMany({
			where: { galleryImageId: id },
		});

		const deletedPost = await prisma.galleryImage.delete({
			where: { id },
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



export async function POST(req: Request) {
	const { title, description, imageUrl } = await req.json();

	if (!title || !description || !imageUrl) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
	}

	try {
		const newImage = await prisma.galleryImage.create({
			data: {
				title,
				description,
				imageUrl,
				date: new Date(),
			},
		});

		return NextResponse.json(newImage, { status: 201 });
	} catch (error) {
		console.error("Error adding image:", error);
		return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
	}
}

