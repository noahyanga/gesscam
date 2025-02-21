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
}

export default function CategorySidebar({ categories }: CategorySidebarProps) {
  const pathname = usePathname();
  const isGalleryPage = pathname.includes("/gallery");
  const basePath = isGalleryPage ? "gallery" : "news";

  // Extract selected category from pathname
  const selectedCategory = pathname.includes("/categories/")
    ? pathname.split("/categories/")[1]
    : null;

  // Calculate total post count for "All" category
  const totalPostsCount = categories.reduce(
    (sum, cat) =>
      sum + (isGalleryPage ? cat._count?.galleryPosts || 0 : cat._count?.newsPosts || 0),
    0
  );

  return (
    <aside className="w-full md:w-1/4 bg-white shadow-md rounded-lg p-4 border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Categories</h3>
      <ul className="space-y-2">
        {/* "All" category link */}
        <li>
          <Link
            href={`/${basePath}`}
            className={`block px-4 py-2 rounded-lg transition-all ${!selectedCategory
              ? "bg-blue-500 text-white font-semibold shadow-md"
              : "hover:bg-gray-100 text-gray-700"
              }`}
          >
            All Posts ({totalPostsCount})
          </Link>
        </li>

        {/* Category Links */}
        {categories.map((category) => {
          const isSelected = selectedCategory === category.slug;
          return (
            <li key={category.id}>
              <Link
                href={`/${basePath}/categories/${category.slug}`}
                className={`block px-4 py-2 rounded-lg transition-all ${isSelected
                  ? "bg-blue-500 text-white font-semibold shadow-md"
                  : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                {category.name} ({isGalleryPage ? category._count?.galleryPosts ?? 0 : category._count?.newsPosts ?? 0})
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

