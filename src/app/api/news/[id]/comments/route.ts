import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust to your auth config

export async function POST(req: Request, { params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions);
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		const { content } = await req.json();
		if (!content.trim()) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });

		const newComment = await prisma.comment.create({
			data: {
				content,
				postId: params.id,
				authorId: session.user.id,
			},
		});

		return NextResponse.json(newComment, { status: 201 });
	} catch (error) {
		console.error("Error adding comment:", error);
		return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
	}
}

export async function GET(req, { params }) {
	const { id: postId } = params;

	if (!postId) {
		return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
	}

	try {
		// Fetch comments and include author's username
		const comments = await prisma.comment.findMany({
			where: { postId },
			include: {
				author: {
					select: { id: true, username: true, email: true },
				},
			},
			orderBy: { createdAt: "desc" },
		});

		// 🔍 Debug: Log raw Prisma output
		console.log("Fetched comments from Prisma:", comments);

		// Ensure frontend gets `authorId` and `username`
		const formattedComments = comments.map((comment) => ({
			id: comment.id,
			content: comment.content,
			postId: comment.postId,
			authorId: comment.authorId,
			username: comment.author?.username || "Anonymous", // Attach username
			email: comment.author?.email, // Include email for debugging
			createdAt: comment.createdAt,
		}));

		// 🔍 Debug: Log the formatted comments
		console.log("Formatted comments being returned:", formattedComments);

		return NextResponse.json(formattedComments, { status: 200 });
	} catch (error) {
		console.error("Error fetching comments:", error);
		return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
	}
}

