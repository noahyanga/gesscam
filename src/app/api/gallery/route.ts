import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
	try {
		const images = await prisma.galleryImage.findMany({
			orderBy: { date: "desc" },
			select: {
				id: true,
				title: true,
				description: true,
				imageUrl: true,
				date: true,
				categories: {
					select: {
						category: {
							select: {
								id: true,
								name: true,
								slug: true,
							},
						},
					},
				},
			},
		});

		const categories = await prisma.category.findMany({
			select: {
				id: true,
				name: true,
				slug: true,
				_count: {
					select: {
						galleryPosts: true, // Ensure this is being fetched
					},
				},
			},
		});


		return NextResponse.json({ images, categories }); // Ensure categories are included
	} catch (error) {
		console.error("News API Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch news posts" },
			{ status: 500 }
		);
	}
}




export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const { id } = params;
	const { title, description, imageUrl } = await req.json(); // Get updated values from the request body

	if (!id || !title || !description || !imageUrl) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
	}

	try {
		const updatedImage = await prisma.galleryImage.update({
			where: { id },
			data: { title, description, imageUrl }, // Update the gallery image with new values
		});

		return NextResponse.json(updatedImage, { status: 200 });
	} catch (error) {
		console.error("Error updating image:", error);
		return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
	}
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const { id } = params;

	if (!id) {
		return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
	}

	try {
		// Attempt to delete the image from the database
		await prisma.galleryImage.delete({
			where: { id },
		});

		return NextResponse.json({ message: "Image deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Failed to delete image:", error);
		return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
	}
}


export async function POST(req: Request) {
	try {
		const { title, description, imageUrl, categoryIds } = await req.json();

		if (!title || !description || !imageUrl) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		// Create news post
		const newPost = await prisma.galleryImage.create({
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

		return NextResponse.json(newPost, { status: 201 });

	} catch (error) {
		console.error("Error creating post:", error);
		return NextResponse.json({ error: "Server error", details: error }, { status: 500 });
	}
}


