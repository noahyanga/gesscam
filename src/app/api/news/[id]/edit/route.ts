import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {

		const post = await prisma.newsPost.findUnique({
			orderBy: { date: 'desc' },
			select: {
				id: true,
				title: true,
				content: true,
				image: true,
				categories: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				date: true
			}
		});

		const category = await prisma.category.findMany({
			select: {
				id: true,
				name: true,
				slug: true,
				_count: {
					select: {
						newsPosts: true, // Ensure this is being fetched
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

		return NextResponse.json(post, category)
	} catch (error) {
		console.error('API Error:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch post' },
			{ status: 500 }
		)
	}
}


export async function GET(req: Request, { params }: { params: { id: string } }) {
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
			return NextResponse.json({ error: "Image not found" }, { status: 404 });
		}

		return NextResponse.json(post, { status: 200 });
	} catch (error) {
		console.error("API Error:", error);
		return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
	}
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
	const { id } = params;
	const { title, content, image, categoryIds } = await req.json();

	try {
		if (!id || !title.trim() || !content.trim() || !image.trim() || !categoryIds.length) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		// Step 1: Remove existing category associations
		await prisma.newsPostCategory.deleteMany({
			where: { newsPostId: id },
		});

		// Step 2: Update the image and reassign categories
		const updatedPost = await prisma.newsPost.update({
			where: { id },
			data: {
				title,
				content,
				image,
				categories: {
					create: categoryIds.map((categoryId) => ({
						category: { connect: { id: categoryId } },
					})),
				},
			},
			include: { categories: true },
		});

		return NextResponse.json(updatedPost, { status: 200 });
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
		await prisma.newsPostCategory.deleteMany({
			where: { newsPostId: id },
		});

		const deletedPost = await prisma.newsPost.delete({
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
	const { title, content, image } = await req.json();

	if (!title || !content || !image) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
	}

	try {
		const newImage = await prisma.newsPost.create({
			data: {
				title,
				content,
				image,
				date: new Date(),
			},
		});

		return NextResponse.json(newImage, { status: 201 });
	} catch (error) {
		console.error("Error adding image:", error);
		return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
	}
}

