"use client";


import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/layout/HeroSection";
import Button from "@/components/ui/button";
import ImageUpload from "@/components/admin/ImageUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import '@/app/globals.css';

interface HomePageProps {
  homeContent: {
    title: string;
    heroImage: string;
    content: string;
  } | null;
  homePosts: {
    id: string;
    title: string;
    content: string;
  }[];
  newsPosts: {
    id: string;
    title: string;
    content: string;
    image: string;
    date: string;
  }[];
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



export default function HomePageClient({ homeContent, homePosts, newsPosts }: HomePageProps) {
  //  const { data: session } = useSession();
  //  const isAdmin = session?.user?.role === "admin";
  //
  //  // Main states
  //  const [title, setTitle] = useState(homeContent?.title || "");
  //  const [heroImage, setHeroImage] = useState(homeContent?.heroImage || "/default-hero.jpg");
  //  const [content, setContent] = useState(homeContent?.content || "");
  //  const [posts, setPosts] = useState(homePosts);
  //
  //  // Draft states for editing
  //  const [draftTitle, setDraftTitle] = useState(title);
  //  const [draftHeroImage, setDraftHeroImage] = useState(heroImage);
  //  const [draftContent, setDraftContent] = useState(content);
  //  const [editHero, setEditHero] = useState(false);
  //
  //  // Post states
  //  const [newPost, setNewPost] = useState({ title: "", content: "" });
  //  const [showAddPost, setShowAddPost] = useState(false);
  //  const [editPostId, setEditPostId] = useState<string | null>(null);
  //  const [editPostTitle, setEditPostTitle] = useState("");
  //  const [editPostContent, setEditPostContent] = useState("");
  //
  //
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  // Main states
  const [title, setTitle] = useState(homeContent?.title || "");
  const [heroImage, setHeroImage] = useState(homeContent?.heroImage || "/default-hero.jpg");
  const [content, setContent] = useState(homeContent?.content || "");
  const [posts, setPosts] = useState(homePosts);
  const [newsItems, setNewsItems] = useState(newsPosts);

  // Draft states for editing
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftHeroImage, setDraftHeroImage] = useState(heroImage);
  const [draftContent, setDraftContent] = useState(content);
  const [editHero, setEditHero] = useState(false);

  // Post states
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [showAddPost, setShowAddPost] = useState(false);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");




  const handleSaveHomeContent = async () => {
    try {
      const response = await fetch("/api/home/update-hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify
          ({ heroImage: draftHeroImage, title: draftTitle }),
      });

      if (!response.ok) throw new Error("Failed to update hero image");
      alert("Hero image updated successfully!");

      setTitle(draftTitle);
      setHeroImage(draftHeroImage);
      setDraftTitle(draftTitle);
      setEditHero(false);
    } catch (err) {
      console.error("Error updating hero image:", err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/home/${postId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete post");
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleAddPost = async () => {
    try {
      const response = await fetch("/api/home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) throw new Error("Failed to add post");
      const createdPost = await response.json();
      setPosts([createdPost, ...posts]);
      setShowAddPost(false);
      setNewPost({ title: "", content: "" });
      newPostEditor?.commands.setContent("");
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const handleSaveEditPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/home/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editPostTitle, content: editPostContent }),
      });

      if (!response.ok) throw new Error("Failed to update post");

      setPosts(posts.map(post => post.id === postId ? { ...post, title: editPostTitle, content: editPostContent } : post));
      setEditPostId(null);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };





  // Main content editor
  const mainEditor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ],
    content: draftContent,
    onUpdate: ({ editor }) => {
      setDraftContent(editor.getHTML());
    },
  });

  // New post editor
  const newPostEditor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ],
    content: newPost.content,
    onUpdate: ({ editor }) => {
      setNewPost({ ...newPost, content: editor.getHTML() });
    },
  });

  // Edit post editor
  const editPostEditor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ],
    content: editPostContent,
    onUpdate: ({ editor }) => {
      setEditPostContent(editor.getHTML());
    },
  });

  // News slider state
  const [activeSlide, setActiveSlide] = useState(0);
  const chunkedNewsPosts = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < newsPosts.length; i += 3) {
      chunks.push(newsPosts.slice(i, i + 3));
    }
    return chunks;
  }, [newsPosts]);

  // Auto-advance slider
  useEffect(() => {
    if (chunkedNewsPosts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % chunkedNewsPosts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [chunkedNewsPosts.length]);

  // Update drafts when homeContent changes
  useEffect(() => {
    if (homeContent) {
      setTitle(homeContent.title);
      setHeroImage(homeContent.heroImage);
      setContent(homeContent.content);
    }
  }, [homeContent]);


  useEffect(() => {
    setNewsItems(newsPosts || []);
  }, [newsPosts]);

  // Rest of your existing functions remain the same...

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HeroSection
        title={title}
        heroImage={heroImage}
        isAdmin={isAdmin}
        onEditClick={() => {
          setEditHero(true);
          mainEditor?.commands.setContent(content);
        }}
      />

      {isAdmin && editHero && (
        <div className="container mx-auto mt-4 px-4">
          <h2 className="text-2xl font-bold mb-4">Edit Home Content</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Hero Image</label>
            <ImageUpload value={draftHeroImage} onChange={setDraftHeroImage} />
          </div>


          <div className="flex space-x-4 mt-6">
            <Button onClick={handleSaveHomeContent} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
            <Button onClick={() => setEditHero(false)} className="bg-gray-600 hover:bg-gray-700">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="container mx-auto p-4 flex justify-end">
          <Button onClick={() => setShowAddPost(true)} className="bg-green-600 hover:bg-green-700">
            + Add Post
          </Button>
        </div>
      )}

      {isAdmin && showAddPost && (
        <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg mt-4">
          <h2 className="text-xl font-bold mb-4">Create a New Post</h2>
          <input
            type="text"
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
          />
          <div className="border rounded-lg">
            <MenuBar editor={newPostEditor} />
            <div className="p-4 prose max-w-none [&_li]:leading-[1.2] [&_li>p]:leading-[0.8]">
              <EditorContent editor={newPostEditor} />
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <Button onClick={handleAddPost} className="bg-blue-500">Save Post</Button>
            <Button onClick={() => setShowAddPost(false)} className="bg-gray-500">Cancel</Button>
          </div>
        </div>
      )}

      {/* Editable Sections
      <section className="container mx-auto p-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 mt-4">
            {isAdmin && editPostId === post.id ? (
              <>
                <input
                  type="text"
                  value={editPostTitle}
                  onChange={(e) => setEditPostTitle(e.target.value)}
                  className="w-full p-2 mb-2 border rounded"
                />
                <div className="border rounded-lg">
                  <MenuBar editor={editPostEditor} />
                  <div className="p-4 prose max-w-none [&_li]:leading-[1.2] [&_li>p]:leading-[0.8]">
                    <EditorContent editor={editPostEditor} />
                  </div>
                </div>
                <div className="mt-4 flex space-x-4">
                  <Button onClick={() => handleSaveEditPost(post.id)} className="bg-blue-500">Save Changes</Button>
                  <Button onClick={() => setEditPostId(null)} className="bg-gray-500">Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-3xl text-ss-blue font-bold">{post.title}</h3>
                <div
                  className="prose max-w-none [&_li]:leading-[1.2] [&_li>p]:leading-[0.8]"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                {isAdmin && (
                  <div className="mt-4 flex space-x-4">
                    <Button
                      onClick={() => {
                        setEditPostId(post.id);
                        setEditPostTitle(post.title);
                        setEditPostContent(post.content);
                        editPostEditor?.commands.setContent(post.content);
                      }}
                      className="bg-blue-500"
                    >
                      Edit
                    </Button>
                    <Button onClick={() => handleDeletePost(post.id)} className="bg-red-500">
                      Delete
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </section>
      */}

      {/* About Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 flex items-center justify-between space-x-12">
          <div className="w-1/2">
            <h2 className="text-5xl font-bold text-ss-blue mb-6 text-left">About Us</h2>
            <p className="text-gray-700 text-2xl text-left max-w-xl mb-6">
              We are dedicated to fostering a strong and engaged community. Our mission is to
              create meaningful opportunities for collaboration, learning, and growth.
            </p>
            <a href="/about" className="mt-4 inline-block bg-ss-blue hover:bg-blue-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-ss-blue-dark transition-colors duration-300">
              Learn More
            </a>
          </div>
          <div className="w-1/3">
            <img
              src="images/gesscam.svg" // Replace with your image URL
              alt="About Us Image"
              className="rounded-lg shadow-xl w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 text-center bg-blue-600 text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-5xl font-bold mb-6">Get Involved</h2>
          <p className="text-2xl mx-auto mb-8 max-w-3xl">
            Join us in making a difference! Whether you want to participate, volunteer, or
            support our initiatives, there's a place for you.
          </p>
          <div className="flex justify-center gap-6">
            <a
              href="#contact"
              className="bg-ss-yellow text-blue-600 px-8 py-3 rounded-lg shadow-lg hover:bg-yellow-200 transition-colors duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>


      {/* News Posts Section */}
      <section className="container mx-auto px-4 mt-8 mb-8">
        <h2 className="text-4xl font-bold mb-6 text-ss-blue text-center">Recent News</h2>
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {chunkedNewsPosts.map((chunk, index) => (
              <div key={index} className="w-full flex-shrink-0 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {chunk.map((post) => (
                    <Card key={post.id} className="bg-yellow-50 shadow-lg hover:shadow-xl transition duration-300 h-full">
                      <CardHeader>
                        <div className="relative w-full h-56">
                          <Image
                            src={post.image || '/default-news.jpg'}
                            alt={post.title}
                            fill
                            className="rounded-t-lg object-cover"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col justify-between h-[calc(100%-14rem)]">
                        <div>
                          <CardTitle>{post.title}</CardTitle>
                          <p className="text-sm text-gray-600 mb-2">
                            {new Date(post.date).toDateString()}
                          </p>
                          <div
                            className="prose max-w-none mb-4 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                          />
                        </div>
                        <Link
                          href={`/news/${post.id}`}
                          className="inline-block bg-ss-blue text-white px-4 py-2 mb-10 rounded hover:bg-blue-700 transition duration-300"
                        >
                          Read More
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          {chunkedNewsPosts.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {chunkedNewsPosts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`h-3 w-3 rounded-full transition-colors duration-300 ${index === activeSlide ? 'bg-ss-blue' : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/news"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            View All News
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
