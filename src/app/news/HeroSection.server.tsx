import HeroSection from "@/components/layout/HeroSection";
import { prisma } from "@/lib/prisma";

export default async function NewsHero() {
  const newsContent = await prisma.pageContent.findUnique({
    where: { pageSlug: 'news' }
  });

  return (
    <HeroSection
      title={newsContent?.title || 'Latest News'}
      subtitle={newsContent?.content}
      heroImage={newsContent?.heroImage || '/default-news.jpg'}
    />
  );
}
