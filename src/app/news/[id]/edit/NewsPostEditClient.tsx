"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImageUpload from "@/components/Admin/ImageUpload";
import Button from "@/components/ui/button";

interface Category {
	id: string;
	name: string;
	slug: string;
	_count: {
		newsPosts: number;
	};
}

interface NewsPost {
	id: string;
	title: string;
	content: string;
	image: string;
	date: string;
	categories: { id: string; name: string; slug: string }[];
}

// NewsPageProps interface
interface NewsPageProps {
	newsContent: {
		title: string;
		heroImage: string;
		content: string;
	} | null;
	initialPosts: NewsPost[];
	categories: Category[]; // Categories passed as prop
}

export default function NewsEditPage({ newsContent, initialPosts, categories }: NewsPageProps) {
	const { id } = useParams();
	const router = useRouter();
	const { data: session } = useSession();
	const isAdmin = session?.user?.role === "admin";

	// State for the post being edited
	const [post, setPost] = useState<NewsPost | null>(null);
	// For category selection: if the post belongs to a category, store its ID
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	// We'll use categoryList to manage the list (initialized from the prop)
	const [categoryList, setCategoryList] = useState<Category[]>(categories);
	// New category name input (if the user wants to create a new category)
	const [newCategoryName, setNewCategoryName] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [editImage, setEditImage] = useState(false);

	// Fetch the news post and categories on mount
	useEffect(() => {
		const fetchPost = async () => {
			try {
				const response = await fetch(`/api/news/${id}`);
				if (!response.ok) throw new Error("Failed to fetch post");
				const data = await response.json();
				setPost(data);
				// Assume the API returns a field "categoryId" for the post's category
				setSelectedCategory(data.categoryId || null);
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		const fetchCategories = async () => {
			try {
				const response = await fetch("/api/categories");
				if (!response.ok) throw new Error("Failed to fetch categories");
				const data = await response.json();
				setCategoryList(data);
			} catch (err) {
				console.error("Error fetching categories:", err);
			}
		};

		fetchPost();
		fetchCategories();
	}, [id]);

	// Create a new category (similar to the gallery edit)
	const createCategory = async (categoryName: string) => {
		const response = await fetch("/api/categories", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name: categoryName }),
		});
		const data = await response.json();
		return data.id; // assuming your API returns the new category's id
	};

	// Save changes including the category update
	const handleSaveChanges = async () => {
		if (!post) return;
		try {
			// Build the category IDs array (even if we are only selecting one)
			const categoryIds: string[] = [];
			if (selectedCategory) {
				categoryIds.push(selectedCategory);
			}
			if (newCategoryName) {
				const newCategoryId = await createCategory(newCategoryName);
				if (newCategoryId) categoryIds.push(newCategoryId);
			}

			const newsData = {
				title: post.title,
				content: post.content,
				image: post.image,
				categoryIds, // pass the category IDs
			};

			const response = await fetch(`/api/news/${post.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newsData),
			});

			if (!response.ok) throw new Error("Failed to save changes");
			alert("Changes saved successfully!");
			// Clear new category input and selected category (if needed)
			setNewCategoryName("");
			setSelectedCategory(null);
			router.push("/news");
		} catch (err: any) {
			console.error("Error saving changes:", err);
			alert("Failed to save changes. Please try again.");
		}
	};

	if (!isAdmin) {
		return <p className="text-center text-red-500 font-bold mt-10">Access Denied</p>;
	}

	if (loading) return <p className="text-center">Loading...</p>;
	if (error) return <p className="text-center text-red-500">Error: {error}</p>;
	if (!post) return null;

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />

			{/* Hero Section */}
			<section className="relative h-96 flex items-center justify-center bg-gradient-to-tl from-ss-blue to-ss-red">
				<div className="absolute inset-0 bg-black opacity-40"></div>
				<div className="text-center text-ss-white max-w-4xl px-4 relative z-10">
					<h1 className="text-4xl md:text-5xl font-bold">{post.title}</h1>
					<time className="text-lg block mt-2">
						{new Date(post.date).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</time>
				</div>
			</section>

			{/* Edit Image Modal */}
			{editImage && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded shadow-lg max-w-md">
						<h2 className="text-xl font-bold mb-4">Update Image</h2>
						<ImageUpload value={post.image} onChange={(url) => setPost({ ...post, image: url })} />
						<div className="flex justify-end space-x-2 mt-4">
							<button onClick={() => setEditImage(false)} className="bg-gray-500 text-white px-3 py-1 rounded">
								Cancel
							</button>
							<button onClick={() => setEditImage(false)} className="bg-blue-500 text-white px-3 py-1 rounded">
								Save
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Edit Form */}
			<section className="py-20">
				<div className="container mx-auto px-4 max-w-4xl">
					<div className="bg-white rounded-lg shadow-lg p-8">
						<label className="block font-semibold mb-2">Title:</label>
						<input
							type="text"
							value={post.title}
							onChange={(e) => setPost({ ...post, title: e.target.value })}
							className="w-full p-2 mb-4 border rounded"
						/>

						{isAdmin && (
							<button onClick={() => setEditImage(true)} className="mb-4 bg-ss-blue text-ss-white px-3 py-1 rounded">
								Edit Image
							</button>
						)}

						{post.image && (
							<div className="relative h-96 mb-8 rounded-lg overflow-hidden">
								<img src={post.image} alt={post.title} className="object-cover w-full h-full" />
							</div>
						)}

						{/* Category Selection */}
						<label className="block text-sm font-medium mb-2">Category</label>
						<select
							value={selectedCategory || ""}
							onChange={(e) => setSelectedCategory(e.target.value)}
							className="w-full p-2 mb-4 border rounded"
							required
						>
							<option value="" disabled>
								Select a category
							</option>
							{categoryList.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</select>

						<label className="block font-semibold mb-2">Content:</label>
						<textarea
							value={post.content}
							onChange={(e) => setPost({ ...post, content: e.target.value })}
							className="w-full p-2 border rounded min-h-[300px]"
						/>

						<div className="mt-8 flex justify-between">
							<Button onClick={handleSaveChanges} className="bg-ss-green text-white px-4 py-2 rounded">
								Save Changes
							</Button>
							<Button onClick={() => router.push(`/news/${id}`)} className="bg-gray-500 text-white px-4 py-2 rounded">
								Cancel
							</Button>
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}

