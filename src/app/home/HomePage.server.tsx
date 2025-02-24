import { prisma } from "@/lib/prisma";
import HomePageClient from "./HomePageClient";
import SessionProviderWrapper from "@/components/Admin/SessionProviderWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePageWrapper() {
  const session = await getServerSession(authOptions);

  // Fetch both home and news content in parallel
  const [homeContent, homePosts, newsPosts] = await Promise.all([
    prisma.pageContent.findUnique({
      where: { pageSlug: "home" }
    }),
    prisma.homePost.findMany({
      select: {
        id: true,
        title: true,
        content: true,
      }
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

  return (
    <SessionProviderWrapper session={session}>
      <HomePageClient
        homeContent={homeContent}
        homePosts={homePosts}
        newsPosts={newsPosts} // Pass news posts directly to HomePageClient
      />
    </SessionProviderWrapper>
  );
}
