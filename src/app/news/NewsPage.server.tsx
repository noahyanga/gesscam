import { prisma } from "@/lib/prisma"; // Import prisma to fetch content
import NewsPageClient from "./NewsPageClient";
import { getServerSession } from "next-auth"; // Get session using next-auth
import { authOptions } from "@/lib/auth"; // Your auth options
import SessionProviderWrapper from "@/components/Admin/SessionProviderWrapper";

export default async function NewsPageWrapper() {
  // Fetch session on the server-side
  const session = await getServerSession(authOptions);

  // Fetch news content and posts from the database
  const [newsContent, initialPosts] = await Promise.all([
    prisma.pageContent.findUnique({
      where: { pageSlug: "news" }
    }),
    prisma.newsPost.findMany({
      orderBy: { date: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        date: true
      }
    })
  ]);

  // Return the NewsPageClient component with the fetched content and session
  return (
    <SessionProviderWrapper session={session}>
      <NewsPageClient
        newsContent={newsContent}
        initialPosts={initialPosts}
      />
    </SessionProviderWrapper>
  );
}

