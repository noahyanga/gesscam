import { prisma } from "@/lib/prisma";
import AboutPageClient from "./AboutPageClient";
import SessionProviderWrapper from "@/components/Admin/SessionProviderWrapper";
import { getServerSession } from "next-auth"; // Get session using next-auth
import { authOptions } from "@/lib/auth"; // Your auth options

export default async function AboutPageWrapper() {

  const session = await getServerSession(authOptions);

  const [aboutContent, aboutPosts] = await Promise.all([
    prisma.pageContent.findUnique({
      where: { pageSlug: "about" }
    }),
    prisma.aboutPost.findMany({
      orderBy: { date: "asc" }, // Sort by date
      select: {
        id: true,
        title: true,
        content: true,
        date: true
      }
    })
  ]);

  return (
    <SessionProviderWrapper session={session}>
      <AboutPageClient aboutContent={aboutContent} aboutPosts={aboutPosts} />
    </SessionProviderWrapper>
  );
}

