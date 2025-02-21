"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/layout/HeroSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategorySidebar from "@/components/layout/CategorySidebar";
import Button from "@/components/ui/button";

import ImageUpload from "@/components/admin/ImageUpload";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill/dist/quill.snow.css";
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




export default function NewsCategoryPageClient({ newsContent, initialPosts, categories }: NewsPageProps) {
	const params = useParams();
	const { slug } = params as { slug: string };
	const { data: session } = useSession();
	const isAdmin = session?.user?.role === "admin";

	// States for posts and hero section
	const [posts, setPosts] = useState(initialPosts);
	const [heroImage, setHeroImage] = useState(newsContent?.heroImage || "/default-news.jpg");
	const [title, setTitle] = useState(newsContent?.title || "News");
	const [editHero, setEditHero] = useState(false);
	const [draftTitle, setDraftTitle] = useState(newsContent?.title || "");
	const [draftHeroImage, setDraftHeroImage] = useState(heroImage);

	const [showAddPost, setShowAddPost] = useState(false);
	const [newPost, setNewPost] = useState({ title: "", content: "", image: null });
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [categoryList, setCategoryList] = useState<Category[]>(categories);
	const [newCategoryName, setNewCategoryName] = useState<string>("");
	const [showAddCategory, setShowAddCategory] = useState(false);


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


	const handleAddPost = async () => {
		if (!selectedCategory && !newCategoryName) {
			alert("Please select or create at least one category.");
			return;
		}

		try {
			const categoryIds: number[] = [];

			// If a category is selected, add its ID
			if (selectedCategory) {
				categoryIds.push(selectedCategory);
			}

			// If creating a new category, add its ID
			if (newCategoryName) {
				const newCategoryId = await createCategory(newCategoryName);
				if (newCategoryId) categoryIds.push(newCategoryId);
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
			setNewPost({ title: "", content: "", image: null });
			setNewCategoryName(""); // Reset category input
			setSelectedCategory(null); // Reset selected category to null

		} catch (err) {
			console.error("Error adding post:", err);
		}
	};


	// Add a new post

	const createCategory = async (categoryName) => {
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

			if (!response.ok) throw new Error("Failed to delete post");
			setPosts(posts.filter((post) => post.id !== postId));
		} catch (err) {
			console.error("Error deleting post:", err);
		}
	};

	function stripHtml(html: string) {
		if (typeof window === 'undefined') {
			return html.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...";
		}

		const doc = new DOMParser().parseFromString(html, "text/html");
		const text = doc.body.textContent || "";
		return text.length > 150 ? `${text.substring(0, 150)}...` : text;
	}


	useEffect(() => {
		if (!slug) return;

		const filteredPosts = initialPosts.filter((post) => {
			return post.categories.some((cat) => cat.category.slug === slug);
		});

		console.log("Filtered Posts:", filteredPosts);
		setPosts(filteredPosts);
	}, [slug, initialPosts]);


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





	// Find the current category based on the slug
	const currentCategory = categories.find((cat) => cat.slug === slug);

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<HeroSection title={currentCategory?.name || "Loading..."} heroImage={heroImage} />
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

			{/* Category Sidebar */}
			<div className="flex flex-col md:flex-row flex-grow">
				<CategorySidebar categories={categories} basePath="news" className="w-full md:w-full" />

				<main className="flex-grow p-4">
					{/* Search Bar and Filter */}
					<section className="container mx-auto px-4 mt-8">
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
									<CardContent className="break-words">
										<CardTitle>{post.title}</CardTitle>

										{/* Date */}
										<p className="text-sm text-gray-600">{new Date(post.date).toDateString()}</p>


										{/* Categories under the date */}
										<p className="text-sm font-semibold text-ss-blue">
											{post.categories.map((cat, index) => {
												const slug = cat.category.name.toLowerCase().replace(/\s+/g, "-"); // Convert to lowercase and replace spaces
												return (
													<span key={slug}>
														<Link href={`/news/categories/${slug}`} className="hover:underline hover:text-blue-600">
															{cat.category.name}
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



				</main>

			</div >
			<Footer />
		</div >
	);
}

