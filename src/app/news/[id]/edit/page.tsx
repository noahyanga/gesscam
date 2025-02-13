"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImageUpload from "@/components/Admin/ImageUpload";
import Button from "@/components/ui/button";

export default function NewsEditPage() {
	const { id } = useParams();
	const router = useRouter();
	const { data: session } = useSession();
	const isAdmin = session?.user?.role === "admin";

	const [post, setPost] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [editImage, setEditImage] = useState(false);

	useEffect(() => {
		const fetchPost = async () => {
			try {
				const response = await fetch(`/api/news/${id}`);
				if (!response.ok) throw new Error("Failed to fetch post");
				const data = await response.json();
				setPost(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchPost();
	}, [id]);

	const handleSaveChanges = async () => {
		try {
			const response = await fetch(`/api/news/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(post),
			});

			if (!response.ok) throw new Error("Failed to save changes");
			alert("Changes saved successfully!");
			router.push("/news");
		} catch (err) {
			console.error("Error saving changes:", err);
		}
	};

	if (!isAdmin) {
		return <p className="text-center text-red-500 font-bold mt-10">Access Denied</p>;
	}

	if (loading) return <p className="text-center">Loading...</p>;
	if (error) return <p className="text-center text-red-500">Error: {error}</p>;

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />

			{/* Post Hero Section (Title Only, No Input) */}
			<section className="relative h-96 flex items-center justify-center bg-gradient-to-tl from-ss-blue to-ss-red">
				{/* Dark overlay */}
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

			{/* Image Upload Modal (Admin Only) */}
			{editImage && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded shadow-lg max-w-md">
						<h2 className="text-xl font-bold mb-4">Update Image</h2>
						<ImageUpload value={post.image} onChange={(url) => setPost({ ...post, image: url })} />
						<div className="flex justify-end space-x-2 mt-4">
							<button
								onClick={() => setEditImage(false)}
								className="bg-gray-500 text-white px-3 py-1 rounded"
							>
								Cancel
							</button>
							<button
								onClick={() => setEditImage(false)}
								className="bg-blue-500 text-white px-3 py-1 rounded"
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Post Content Section (Now Contains Editable Title) */}
			<section className="py-20">
				<div className="container mx-auto px-4 max-w-4xl">
					<div className="bg-white rounded-lg shadow-lg p-8">



						{/* Editable Title (Above Image) */}
						<label className="block font-semibold mb-2">Title:</label>
						<input
							type="text"
							value={post.title}
							onChange={(e) => setPost({ ...post, title: e.target.value })}
							className="w-full p-2 mb-4 border rounded"
						/>

						{/* Edit Image Button */}
						{isAdmin && (
							<button
								onClick={() => setEditImage(true)}
								className="mb-4 left-1-4 bg-ss-blue text-ss-white px-3 py-1 rounded"
							>
								Edit Image
							</button>
						)}


						{/* Editable Image */}
						{post.image && (
							<div className="relative h-96 mb-8 rounded-lg overflow-hidden">
								<img src={post.image} alt={post.title} className="object-cover w-full h-full" />
							</div>
						)}

						{/* Editable Content */}
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
