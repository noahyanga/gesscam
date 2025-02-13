// src/app/news/[id]/page.tsx

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewsPostClient from "./NewsPostClient";
import { getServerSession } from "next-auth"; // Get session using next-auth
import { authOptions } from "@/lib/auth"; // Your auth options
import SessionProviderWrapper from "@/components/Admin/SessionProviderWrapper";

interface PostPageProps {
  params: { id: string };
}

export default async function PostPage({ params }: PostPageProps) {
  // Ensure params are correctly handled and passed into Prisma
  const { id } = params;  // Destructure the ID from params

  // Log to check the post ID and ensure params are resolved
  console.log("Post ID from params:", id); // Check the ID here

  const session = await getServerSession(authOptions);

  // Fetch the post 
  const post = await prisma.newsPost.findUnique({
    where: { id },
    include: {
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { username: true } }, // Directly include the username in the comment
        },
      },
    },
  });



  // Handle case where the post is not found
  if (!post) return notFound();

  return (
    <SessionProviderWrapper session={session}>
      <NewsPostClient post={post} />
    </SessionProviderWrapper>
  );
}

