// app/components/NewsHero.server.tsx
import { prisma } from "@/lib/prisma";
import HeroSection from "./HeroSection";

export default async function NewsHero() {
  try {
    const newsContent = await prisma.pageContent.findUnique({
      where: { pageSlug: 'news' }
    });

    return (
      <HeroSection
        title={newsContent?.title || "Latest News"}
        subtitle={newsContent?.content || "Stay updated with our community news"}
        heroImage={newsContent?.heroImage || "/default-news.jpg"}
      />
    );
  } catch (error) {
    console.error("Failed to load news hero content:", error);
    return (
      <HeroSection
        title="Latest News"
        subtitle="Stay updated with our community news"
        heroImage="/images/jug.svg"
      />
    );
  }
}
