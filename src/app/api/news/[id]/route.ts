import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { connect } from 'http2';
import { promises } from 'dns';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;

	const { id } = params;
	try {

		const post = await prisma.newsPost.findUnique({
			where: { id: params.id },
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



		const user = await prisma.user.findUnique({
			where: { id: params.id },
			select: {
				username: true,
			},
		});

		console.log("Fetched Username:", user);





		if (!post) {
			return NextResponse.json(
				{ error: 'Post not found' },
				{ status: 404 }
			)
		}

		return NextResponse.json({ post, user })
	} catch (error) {
		console.error('API Error:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch post' },
			{ status: 500 }
		)
	}
}



export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
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

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const { id } = params;
	const { title, content, image, categoryId } = await req.json(); // Get updated values from the request body

	try {
		if (!id || !title.trim() || !content.trim() || !image.trim() || !categoryId) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		await prisma.newsPostCategory.deleteMany({
			where: { newsPostId: id },
		});


		const updatedPost = await prisma.newsPost.update({
			where: { id },
			data: {
				title,
				content,
				image,
				categories: {
					create: categoryId.map((cat) => ({
						category: { connect: { id: cat } },
					})),
				},
			},
			include: { categories: true },
		});


		console.log("Updated image with new categories:", { id, title, content, image, categoryId });


		return NextResponse.json(updatedPost, { status: 200 });
	} catch (error) {
		console.error("Error updating post:", error);
		return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
	}
}

//export async function PUT(req: Request, { params }: { params: { id: string } }) {
//	const { id } = params;
//	const { title, description, imageUrl, categoryIds } = await req.json();
//
//	try {
//		if (!id || !title.trim() || !description.trim() || !imageUrl.trim() || !categoryIds.length) {
//			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//		}
//
//		// Step 1: Remove existing category associations
//		await prisma.galleryImageCategory.deleteMany({
//			where: { galleryImageId: id },
//		});
//
//		// Step 2: Update the image and reassign categories
//		const updatedImage = await prisma.galleryImage.update({
//			where: { id },
//			data: {
//				title,
//				description,
//				imageUrl,
//				categories: {
//					create: categoryIds.map((categoryId) => ({
//						category: { connect: { id: categoryId } },
//					})),
//				},
//			},
//			include: { categories: true },
//		});
//
//		console.log("Updated image with new categories:", { id, title, description, imageUrl, categoryIds });
//
//		return NextResponse.json(updatedImage, { status: 200 });
//	} catch (error) {
//		console.error("Error updating image:", error);
//		return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
//	}
//}
//
//
//
