import { prisma } from "@/lib/prisma";
import NewsPostClient from "./NewsPostClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProviderWrapper from "@/components/Admin/SessionProviderWrapper";
import { redirect } from "next/navigation";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewsPageWrapper({ params }: EditPostPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const post = await prisma.newsPost.findUnique({
    where: { id },
    include: {
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { username: true } },
        },
      },
    },
  });

  if (!post) {
    redirect("/404"); // Redirect to 404 if post is null
  }

  // Add userId to comments
  const updatedPost = {
    ...post,
    comments: post.comments.map(comment => ({
      ...comment,
      userId: comment.authorId,
    }))
  };

  return (
    <SessionProviderWrapper session={session}>
      <NewsPostClient post={updatedPost} />
    </SessionProviderWrapper>
  );
}

