// components/PageTemplate.tsx
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()



export default async function PageTemplate({ slug }: { slug: string }) {
  const pageContent = await prisma.pageContent.findUnique({
    where: { pageSlug: slug }
  });

  if (!pageContent) return <div>Page not found</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-96 flex items-center justify-center">
          <Image
            src={pageContent.heroImage}
            alt={`${pageContent.title} Hero`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ss-black/70 to-ss-black/30"></div>
          <div className="relative z-10 text-center text-ss-white max-w-4xl px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {pageContent.title}
            </h1>
          </div>
        </section>

        {/* Page Content */}
        <section className="py-20 bg-ss-white">
          <div className="container mx-auto px-4">
            <div className="prose lg:prose-xl max-w-4xl mx-auto">
              {pageContent.content}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
