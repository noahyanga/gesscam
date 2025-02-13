// components/CategorySidebar.tsx
"use client";

import Link from "next/link";

interface CategorySidebarProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    postCount: number;
  }[];
  selectedCategory?: string;
  basePath?: 'news' | 'gallery';
}

export default function CategorySidebar({
  categories,
  selectedCategory,
  basePath = 'news'
}: CategorySidebarProps) {
  return (
    <div className="w-64 pr-4 border-r border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Categories</h3>
      <ul className="space-y-2">
        <li>
          <Link
            href={`/${basePath}`}
            className={`block px-4 py-2 rounded ${!selectedCategory
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
              }`}
          >
            All ({categories.reduce((sum, cat) => sum + cat.postCount, 0)})
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/${basePath}/${category.slug}`}
              className={`block px-4 py-2 rounded ${selectedCategory === category.slug
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
                }`}
            >
              {category.name} ({category.postCount})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
