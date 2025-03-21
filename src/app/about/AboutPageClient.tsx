"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/layout/HeroSection";
import Button from "@/components/ui/button";
import ImageUpload from "@/components/Admin/ImageUpload";
import Image from "next/image";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { motion } from "framer-motion";
import '@/app/globals.css';

interface AboutPageProps {
  aboutContent: {
    title: string;
    heroImage: string;
    content: string;
  } | null;
  aboutPosts: {
    id: string;
    title: string;
    content: string;
    date: Date;
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

export default function AboutPageClient({ aboutContent, aboutPosts }: AboutPageProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  console.log("status", isAdmin);

  // Main content states
  const [title, setTitle] = useState(aboutContent?.title || "About Us");
  const [heroImage, setHeroImage] = useState(aboutContent?.heroImage || "/default-gallery.jpg");
  const [content, setContent] = useState(aboutContent?.content || "");

  // Draft states for editing
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftHeroImage, setDraftHeroImage] = useState(heroImage);
  const [draftContent, setDraftContent] = useState(content);
  const [editHero, setEditHero] = useState(false);

  // Posts states
  const [posts, setPosts] = useState(aboutPosts);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");
  const [showAddPost, setShowAddPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });


  const handleSaveHeroImage = async () => {
    try {
      const response = await fetch('/api/about/update-hero', {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroImage: draftHeroImage,
          title: draftTitle // Add title to the request body
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      // Update both state values
      setTitle(draftTitle);
      setHeroImage(draftHeroImage);
      setEditHero(false);
      alert("Title and image updated successfully!");

    } catch (err) {
      console.error("Update error:", err);
      alert(`Update failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };


  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: draftContent,
    onUpdate: ({ editor }) => {
      setDraftContent(editor.getHTML());
    },
  });

  const newPostEditor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: newPost.content,
    onUpdate: ({ editor }) => {
      setNewPost({ ...newPost, content: editor.getHTML() });
    },
  });

  const editPostEditor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: editPostContent,
    onUpdate: ({ editor }) => {
      setEditPostContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (aboutContent) {
      setTitle(aboutContent.title);
      setHeroImage(aboutContent.heroImage);
      setContent(aboutContent.content);
    }
  }, [aboutContent]);


  const handleSaveAboutContent = async () => {
    try {
      const response = await fetch('/api/about/update-hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroImage: draftHeroImage }),
      });
      if (!response.ok) throw new Error('Failed to update hero image');
      alert('Hero image updated successfully!');
      setHeroImage(draftHeroImage);
      setTitle(draftTitle);
      setContent(draftContent);
      setEditHero(false);
    } catch (err) {
      console.error('Error updating hero image:', err);
    }
  };

  const startEditingPost = (postId: string, title: string, content: string) => {
    setEditPostId(postId);
    setEditPostTitle(title);
    setEditPostContent(content);
    editPostEditor?.commands.setContent(content);
  };

  const handleSavePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/about/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editPostTitle, content: editPostContent }),
      });

      if (!response.ok) throw new Error("Failed to update post");

      setPosts(posts.map(post =>
        post.id === postId ? { ...post, title: editPostTitle, content: editPostContent } : post
      ));
      setEditPostId(null);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/about/${postId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete post");
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleAddPost = async () => {
    try {
      const response = await fetch("/api/about", {
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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Modern Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[60vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-500/80">
          {heroImage && (
            <Image
              src={heroImage}
              alt="About Us"
              fill
              className="object-cover mix-blend-multiply"
              priority
            />
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center max-w-4xl px-4"
        >
          <h1 className="text-7xl md:text-7xl font-bold text-white mb-6 drop-shadow-xl">
            {title}
          </h1>
          {isAdmin && (
            <Button
              onClick={() => setEditHero(true)}
              className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
              variant="contained"
            >
              Edit Hero
            </Button>
          )}
        </motion.div>
      </motion.section>

      {isAdmin && editHero && (
        <div className="container mx-auto mt-4 px-4">
          <h2 className="text-2xl font-bold mb-4">Edit About Content</h2>

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
            <Button onClick={handleSaveHeroImage} className="bg-blue-600 hover:bg-blue-700">
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
            + Add Section
          </Button>
        </div>
      )}

      {isAdmin && showAddPost && (
        <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg mt-4">
          <h2 className="text-xl font-bold mb-4">Create New Section</h2>
          <input
            type="text"
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
          />
          <div className="border rounded-lg">
            <MenuBar editor={newPostEditor} />
            <div className="p-4">
              <EditorContent editor={newPostEditor} />
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <Button onClick={handleAddPost} className="bg-blue-500">Save Section</Button>
            <Button onClick={() => setShowAddPost(false)} className="bg-gray-500">Cancel</Button>
          </div>
        </div>
      )}

      <section className="container mx-auto p-4 space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="p-6 rounded-lg transition-shadow duration-300">
            {isAdmin && editPostId === post.id ? (
              <>
                <input
                  type="text"
                  value={editPostTitle}
                  onChange={(e) => setEditPostTitle(e.target.value)}
                  className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="border rounded-lg mb-4">
                  <MenuBar editor={editPostEditor} />
                  <div className="p-4 prose max-w-none [&_li]:leading-[1.4] [&_li>p]:leading-[1.2]">
                    <EditorContent editor={editPostEditor} />
                  </div>
                </div>
                <div className="mt-4 flex space-x-4 justify-center">
                  <Button onClick={() => handleSavePost(post.id)} className="bg-blue-500 text-white px-6 py-2 rounded-md">Save</Button>
                  <Button onClick={() => setEditPostId(null)} className="bg-gray-500 text-white px-6 py-2 rounded-md">Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-4xl sm:text-4xl text-ss-blue font-semibold mb-4">{post.title}</h3>
                <div className="prose prose-xl max-w-none [&_li]:leading-[1.4] [&_li>p]:leading-[1.2]" dangerouslySetInnerHTML={{ __html: post.content }} />
                {isAdmin && (
                  <div className="mt-4 flex space-x-4 justify-center">
                    <Button onClick={() => startEditingPost(post.id, post.title, post.content)} className="bg-blue-500 text-white px-6 py-2 rounded-md">
                      Edit
                    </Button>
                    <Button onClick={() => handleDeletePost(post.id)} className="bg-red-500 text-white px-6 py-2 rounded-md">
                      Delete
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </section>


      <Footer />
    </div >
  );
}
