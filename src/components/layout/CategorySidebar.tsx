"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface CategorySidebarProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    _count: {
      newsPosts?: number;
      galleryPosts?: number;
    };
  }[];
  selectedCategory?: string;
}

export default function CategorySidebar({
  categories,
  selectedCategory,
}: CategorySidebarProps) {
  const pathname = usePathname();
  const isGalleryPage = pathname.includes("/gallery");
  const basePath = isGalleryPage ? "gallery" : "news";

  // Calculate the total count of posts for "All" category based on page type
  const totalPostsCount = categories.reduce(
    (sum, cat) =>
      sum + (isGalleryPage ? cat._count?.galleryPosts || 0 : cat._count?.newsPosts || 0),
    0
  );

  return (
    <div className="w-64 pr-4 border-r border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Categories</h3>
      <ul className="space-y-2">
        {/* "All" category link */}
        <li>
          <Link
            href={`/${basePath}`}
            className={`block px-4 py-2 rounded ${!selectedCategory ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
              }`}
          >
            All Posts ({totalPostsCount})
          </Link>
        </li>

        {/* Mapping through categories */}
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/${basePath}/category/${category.slug}`}
              className={`block px-4 py-2 rounded ${selectedCategory === category.slug
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100"
                }`}
            >
              {category.name} (
              {isGalleryPage ? category._count?.galleryPosts ?? 0 : category._count?.newsPosts ?? 0})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

