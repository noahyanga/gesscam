// src/app/api/news/[postId]/comments/[commentId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust to your auth config

// Edit a specific comment
export async function PATCH(req, props) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content } = await req.json();
    const { postId, commentId } = params;

    if (!content.trim()) {
		return NextResponse.json({ error: "Comment content cannot be empty" }, { status: 400 });
	}

    try {
		const updatedComment = await prisma.comment.update({
			where: { id: commentId },
			data: { content },
		});

		return NextResponse.json(updatedComment, { status: 200 });
	} catch (error) {
		console.error("Error updating comment:", error);
		return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
	}
}

// Delete a specific comment
export async function DELETE(req, props) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId, commentId } = params;

    try {
		const deletedComment = await prisma.comment.delete({
			where: { id: commentId },
		});

		return NextResponse.json(deletedComment, { status: 200 });
	} catch (error) {
		console.error("Error deleting comment:", error);
		return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
	}
}

