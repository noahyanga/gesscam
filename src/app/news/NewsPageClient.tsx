"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/layout/HeroSection";
import Button from "@/components/ui/button";
import ImageUpload from "@/components/Admin/ImageUpload";
import CategorySidebar from "@/components/layout/CategorySidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';


interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    newsPosts: number;
  };
}
interface NewPost {
  title: string;
  content: string;
  image: string | null; // Allow string or null
  categories: string[];
}


interface NewsPageProps {
  newsContent: {
    title: string;
    heroImage: string;
    content: string;
  } | null;
  initialPosts: {
    id: string;
    title: string;
    content: string;
    image: string;
    date: Date;
    categories: { id: string; name: string; slug: string }[]; // Categories associated with the post
  }[];
  categories: Category[]; // Categories passed as prop
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b p-2 mb-4 flex flex-wrap gap-2">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
      >
        Bold
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
      >
        Italic
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
      >
        Heading 1
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
      >
        Heading 2
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
      >
        Bullet List
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
      >
        Ordered List
      </Button>
      <Button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
      >
        Left Align
      </Button>
      <Button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
      >
        Center Align
      </Button>
      <Button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
      >
        Right Align
      </Button>
    </div>
  );
};




export default function NewsPageClient({ newsContent, initialPosts, categories }: NewsPageProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const user = session?.user?.role === "admin";

  // States for posts and hero section
  const [posts, setPosts] = useState(initialPosts);
  const [heroImage, setHeroImage] = useState(newsContent?.heroImage || "/default-news.jpg");
  const [editHero, setEditHero] = useState(false);
  const [draftTitle, setDraftTitle] = useState(newsContent?.title || "");
  const [draftHeroImage, setDraftHeroImage] = useState(heroImage);
  const [title, setTitle] = useState(newsContent?.title);

  const [showAddPost, setShowAddPost] = useState(false);
  const [newPost, setNewPost] = useState<NewPost>({
    title: "",
    content: "",
    image: null, // Initial value is null
    categories: [],
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryList, setCategoryList] = useState<Category[]>(categories);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("newest"); // "newest" or "oldest"

  // *** Pagination State ***
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Save Hero Section
  const handleSaveHero = async () => {
    try {
      const response = await fetch("/api/news/update-hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroImage: draftHeroImage,
          title: draftTitle
        }),
      });

      // Check if the response has content before parsing JSON
      const data = response.headers.get("content-length") !== "0" ? await response.json() : null;

      if (!response.ok) {
        throw new Error(`Failed to update news content: ${data?.message || "Unknown error"}`);
      }

      alert("News page updated successfully!");
      setTitle(draftTitle);
      setHeroImage(draftHeroImage);
      setEditHero(false);
    } catch (err: any) {
      console.error("Error updating news content:", err);
      alert(`Failed to update news content: ${err.message}`);
    }
  };

  // Handle Search and Filter Logic
  const filteredPosts = posts
    .filter((post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.categories.some(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (filter === "newest") {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }


    });

  // *** Calculate the posts for the current page ***
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Optionally, reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter]);


  const handleAddPost = async () => {
    if (!selectedCategory && !newCategoryName) {
      alert("Please select or create one category.");
      return;
    }

    try {
      const categoryIds: string[] = [];

      // If a category is selected, add its ID
      if (selectedCategory) {
        categoryIds.push(selectedCategory);
      }

      const postData = {
        title: newPost.title,
        content: newPost.content,
        image: newPost.image,
        categoryIds, // Single category ID
      };

      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error("Failed to add news post");

      const createdPost = await response.json();
      setPosts([createdPost, ...posts]); // Add new post to state
      setShowAddPost(false);
      setNewPost({ title: "", content: "", image: null, categories: [] });
      setNewCategoryName(""); // Reset category input
      setSelectedCategory(null); // Reset selected category to null

    } catch (err) {
      console.error("Error adding post:", err);
    }
  };



  // Add a new post
  const createCategory = async (categoryName: string) => {
    const response = await fetch("/api/news/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: categoryName }),
    });

    const data = await response.json();
    return data;
  };

  // Delete a post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/news/${postId}`, { method: "DELETE" });

      // Get the raw text response
      const responseText = await response.text();
      // Only parse if there is text
      const data = responseText ? JSON.parse(responseText) : {};

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete post");
      }

      // Update state after successful deletion
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error: any) {
      console.error("Error deleting post:", error);
    }
  };



  function stripHtml(html: string) {
    if (typeof window === 'undefined') {
      // Simple server-side compatible stripping
      return html.replace(/<[^>]*>?/gm, '').substring(0, 150);
    }

    const doc = new DOMParser().parseFromString(html, "text/html");
    const text = doc.body.textContent || "";
    return text.length > 150 ? `${text.substring(0, 150)}...` : text;
  }

  // Update your useEditor configuration
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: 'Type your news content here...',
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-node-empty',
      }),
    ],
    content: newPost.content,
    onUpdate: ({ editor }) => {
      setNewPost({ ...newPost, content: editor.getHTML() });
    },
  });

  // Add this useEffect to handle content synchronization
  useEffect(() => {
    if (editor && newPost.content !== editor.getHTML()) {
      editor.commands.setContent(newPost.content);
    }
  }, [newPost.content, editor]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <HeroSection
        title={newsContent?.title || 'News'}
        heroImage={heroImage}
        isAdmin={isAdmin}
        onEditClick={() => setEditHero(true)}
      />

      {/* Admin Editing Hero Section */}
      {isAdmin && editHero && (
        <div className="container mx-auto px-4 mt-6">
          <h2 className="text-2xl font-bold mb-4">Edit News Page</h2>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />

          <label className="block text-sm font-medium mb-2">Hero Image</label>
          <ImageUpload value={draftHeroImage} onChange={setDraftHeroImage} />

          <div className="flex space-x-4 mt-4">
            <Button onClick={handleSaveHero} className="bg-blue-500">Save Changes</Button>
            <Button onClick={() => setEditHero(false)} className="bg-gray-500">Cancel</Button>
          </div>
        </div>
      )}

      {/* Admin: Add Post & Add Category Buttons */}
      {isAdmin && (
        <div className="container mx-auto px-4 mt-6 flex justify-end space-x-4">
          <Button onClick={() => setShowAddPost(true)} className="bg-green-500">+ Add Post</Button>
          <Button onClick={() => setShowAddCategory(true)} className="bg-blue-500">+ Add Category</Button>
        </div>
      )}

      {isAdmin && showAddCategory && (
        <div className="container mx-auto px-4 mt-6 bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Create New Category</h2>
          <input
            type="text"
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <div className="flex space-x-4">
            <Button onClick={() => createCategory(newCategoryName)} className="bg-green-500 text-white">
              Save Category
            </Button>
            <Button onClick={() => setShowAddCategory(false)} className="bg-gray-500">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Admin: Add News Post Form */}
      {isAdmin && showAddPost && (
        <div className="container mx-auto px-4 mt-6 bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Create a News Post</h2>

          {/* Post Title */}
          <input
            type="text"
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
          />


          {/* Tiptap Editor */}
          <div className="border rounded-lg shadow-sm">
            <MenuBar editor={editor} />
            <div className="p-4 min-h-[300px] prose focus:outline-none">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Image Upload */}
          <ImageUpload value={newPost.image} onChange={(url) => setNewPost({ ...newPost, image: url })} />

          {/* Category Selection */}
          <h2 className="text-xl font-bold mt-10">Category</h2>
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 mb-5 border rounded"
            required
          >
            <option value="" disabled>Select a category</option>
            {categoryList.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Save & Cancel Buttons */}
          <div className="flex space-x-4 mt-4">
            <Button onClick={handleAddPost} className="bg-blue-500" disabled={!selectedCategory}>
              Save Post
            </Button>
            <Button onClick={() => setShowAddPost(false)} className="bg-gray-500">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Sidebar and Main Content */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Category Sidebar */}
        <CategorySidebar
          categories={categories}
          basePath="news" // This ensures the links are relative to "news"
        />

        {/* Main content */}
        <main className="flex-grow p-4">
          {/* Search Bar and Filter */}
          <section className="container mx-auto px-4 mt-8">
            <h2 className="text-4xl font-bold text-center mb-4">News Feed</h2>
            <div className="flex justify-evenly">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-1/2 p-3 border rounded"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="p-3 border rounded"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </section>

          {/* News Posts */}
          <section className="container mx-auto px-4 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 mb-6">



              {currentPosts.map((post) => (
                <Card key={post.id} className="bg-yellow-50 shadow-lg hover:shadow-xl transition duration-300">
                  <CardHeader>
                    <div className="relative w-full h-56">
                      <Image src={post.image} alt={post.title} fill className="rounded-t-lg object-cover" />
                    </div>
                  </CardHeader>
                  <CardContent className="break-words">
                    <CardTitle>{post.title}</CardTitle>

                    {/* Date */}
                    <p className="text-sm text-gray-600">{new Date(post.date).toDateString()}</p>


                    {/* Categories under the date */}
                    <p className="text-sm font-semibold text-ss-blue">
                      {post.categories.map((cat, index) => {
                        const categoryName = cat?.name || "Uncategorized";

                        const slug = categoryName.toLowerCase().replace(/\s+/g, "-");

                        return (
                          <span key={slug}>
                            <Link href={`/news/categories/${slug}`} className="hover:underline hover:text-blue-600">
                              {categoryName}
                            </Link>
                            {index < post.categories.length - 1 && ", "}
                          </span>
                        );
                      })}
                    </p>


                    {/* Post Preview */}
                    <p>
                      {(() => {
                        const textContent = stripHtml(post.content);
                        return textContent.length > 150 ? `${textContent.substring(0, 150)}...` : textContent;
                      })()}
                    </p>

                    {/* Read More Link */}
                    <Link href={`/news/${post.id}`} className="bg-ss-blue text-white max-w-24 px-3 py-2 rounded block mt-4">
                      Read More
                    </Link>

                    {/* Admin Controls */}
                    {isAdmin && (
                      <div className="mt-4 flex justify-between">
                        <Link href={`/news/${post.id}/edit`} className="bg-blue-500 text-white px-2 py-2 rounded">Edit</Link>
                        <Button onClick={() => handleDeletePost(post.id)} className="bg-red-500">Delete</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>


          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="flex justify-center mt-8">
              <ul className="inline-flex -space-x-px">
                <li>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, index) => (
                  <li key={index}>
                    <button
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-2 leading-tight border border-gray-300 ${currentPage === index + 1
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                        }`}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

