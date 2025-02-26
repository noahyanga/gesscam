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
  basePath?: string; // Add basePath prop
  className?: string; //Add className prop
}

export default function CategorySidebar({ categories, basePath = "", className = "" }: CategorySidebarProps) {
  const pathname = usePathname();
  const isGalleryPage = pathname.includes("/gallery");
  const actualBasePath = basePath || (isGalleryPage ? "gallery" : "news"); // Use basePath prop or determine dynamically

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
    <aside className={`${className} bg-white shadow-md rounded-lg p-4 border border-gray-200 w-full md:w-1/4`}>
      <h3 className="text-2xl font-bold mb-4 text-gray-800">Categories</h3>
      <ul className="space-y-2">
        {/* "All" category link */}
        <li>
          <Link
            href={`/${actualBasePath}`}
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
                href={`/${actualBasePath}/categories/${category.slug}`}
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
