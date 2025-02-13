"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/layout/HeroSection";
import Button from "@/components/ui/button";
import ImageUpload from "@/components/admin/ImageUpload";
import CategorySidebar from "@/components/layout/CategorySidebar";
import parse from 'html-react-parser';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Load React-Quill dynamically to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill/dist/quill.snow.css";


interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    newsPosts: number;
  };
}
// NewsPageProps interface
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
    date: string;
    categories: { id: string; name: string; slug: string }[]; // Categories associated with the post
  }[];
  categories: Category[]; // Categories passed as prop
}


export default function NewsPageClient({ newsContent, initialPosts, categories }: NewsPageProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  // States for posts and hero section
  const [posts, setPosts] = useState(initialPosts);
  const [heroImage, setHeroImage] = useState(newsContent?.heroImage || "/default-news.jpg");
  const [editHero, setEditHero] = useState(false);
  const [draftTitle, setDraftTitle] = useState(newsContent?.title || "");
  const [draftHeroImage, setDraftHeroImage] = useState(heroImage);
  const [title, setTitle] = useState(newsContent?.title);

  const [showAddPost, setShowAddPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", image: "" });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryList, setCategoryList] = useState<Category[]>(categories);



  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("newest"); // "newest" or "oldest"

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
    } catch (err) {
      console.error("Error updating news content:", err);
      alert(`Failed to update news content: ${err.message}`);
    }
  };

  // Handle Search and Filter Logic
  const filteredPosts = posts
    .filter((post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Add a new post
  const handleAddPost = async () => {
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) throw new Error("Failed to add news post");

      const createdPost = await response.json();
      setPosts([createdPost, ...posts]);
      setShowAddPost(false);
      setNewPost({ title: "", content: "", image: "" });
    } catch (err) {
      console.error("Error adding post:", err);
    }
  };

  // Delete a post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/news/${postId}`, { method: "DELETE" });

      if (!response.ok) throw new Error("Failed to delete post");
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
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

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data: { categoryList: Category[] }) => { // Explicit type
        console.log("Fetched categories:", data.categoryList);
        if (data.categoryList) {
          setCategoryList(data.categoryList);
        }
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);




  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <HeroSection
        title={newsContent?.title || 'News'}
        heroImage={newsContent?.heroImage}
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

      {/* Admin: Add News Post Button */}
      {isAdmin && (
        <div className="container mx-auto px-4 mt-6 flex justify-end">
          <Button onClick={() => setShowAddPost(true)} className="bg-green-500">+ Add Post</Button>
        </div>
      )}

      {/* Admin: Add News Post Form */}
      {isAdmin && showAddPost && (
        <div className="container mx-auto px-4 mt-6 bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Create a News Post</h2>
          <input
            type="text"
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
          />
          <ReactQuill value={newPost.content} onChange={(value) => setNewPost({ ...newPost, content: value })} />
          <ImageUpload value={newPost.image} onChange={(url) => setNewPost({ ...newPost, image: url })} />

          <div className="flex space-x-4 mt-4">
            <Button onClick={handleAddPost} className="bg-blue-500">Save Post</Button>
            <Button onClick={() => setShowAddPost(false)} className="bg-gray-500">Cancel</Button>
          </div>
        </div>
      )}

      {/* Sidebar and Main Content */}
      <div className="flex flex-grow">
        {/* Category Sidebar */}
        <CategorySidebar
          categories={categories}
          basePath="news" // This ensures the links are relative to "news"

        />


        {/* Main content */}
        <main className="flex-grow p-4">
          {/* Search Bar and Filter */}
          <section className="container mx-auto px-4 mt-8">
            <h2 className="text-5xl font-bold text-center mb-4">News Feed</h2>
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
              {filteredPosts.map((post) => (
                <Card key={post.id} className="bg-yellow-50 shadow-lg hover:shadow-xl transition duration-300">
                  <CardHeader>
                    <div className="relative w-full h-56">
                      <Image src={post.image} alt={post.title} fill className="rounded-t-lg object-cover" />

                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle>{post.title}</CardTitle>
                    <p className="text-sm text-gray-600">{new Date(post.date).toDateString()}</p>

                    {/* Category under the date */}
                    {post.categories && (
                      <p className="text-sm font-semibold text-ss-blue">
                        {post.categories.map((cat) => cat.name).join(", ")}
                      </p>
                    )}

                    <p>
                      {(() => {
                        const textContent = stripHtml(post.content);
                        return textContent.length > 150 ? `${textContent.substring(0, 150)}...` : textContent;
                      })()}
                    </p>

                    <Link href={`/news/${post.id}`} className="bg-ss-blue text-white max-w-24 px-3 py-2 rounded block mt-4">
                      Read More
                    </Link>

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


        </main>
      </div>

      <Footer />
    </div>
  );
}
