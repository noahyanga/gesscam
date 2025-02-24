"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/layout/HeroSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategorySidebar from "@/components/layout/CategorySidebar";
import Button from "@/components/ui/button";
import ImageUpload from "@/components/Admin/ImageUpload";


interface Category {
	id: string;
	name: string;
	slug: string;
	_count: {
		galleryPosts: number;
	}
}

interface NewImage {
	title: string;
	description: string;
	imageUrl: string | null; // Allow string or null
	categories: string[];
}

interface GalleryImage {
	id: string;
	title: string;
	description: string;
	imageUrl: string;
	date: Date;
	categories: { id: string; name: string; slug: string }[];
}

interface GalleryPageProps {
	galleryContent: {
		title: string;
		heroImage: string;
	} | null;
	initialImages: GalleryImage[];
	categories: Category[];
}

export default function GalleryCategoryPageClient({ galleryContent, initialImages, categories }: GalleryPageProps) {
	const params = useParams();
	const { slug } = params as { slug: string };
	const { data: session } = useSession();
	const isAdmin = session?.user?.role === "admin";

	// States
	const [images, setImages] = useState(initialImages);
	const [heroImage, setHeroImage] = useState(galleryContent?.heroImage || "/default-gallery.jpg");
	const [title, setTitle] = useState(galleryContent?.title);
	const [editHero, setEditHero] = useState(false);
	const [editImage, setEditImage] = useState<GalleryImage | null>(null);
	const [draftTitle, setDraftTitle] = useState(galleryContent?.title || "");
	const [draftHeroImage, setDraftHeroImage] = useState(heroImage);
	const [modalImage, setModalImage] = useState<GalleryImage | null>(null);
	const [showAddImage, setShowAddImage] = useState(false);
	const [newImage, setNewImage] = useState<NewImage>({
		title: "",
		description: "",
		imageUrl: null, // Initial value is null
		categories: [],
	});




	const [categoryList, setCategoryList] = useState<Category[]>(categories);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [newCategoryName, setNewCategoryName] = useState<string>("");
	const [showAddCategory, setShowAddCategory] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

	const closeModal = () => setModalImage(null);

	useEffect(() => {
		if (!slug) return;

		// Filter images based on the category slug
		const filteredImages = initialImages.filter((image) =>
			image.categories.some((cat) => cat.slug === slug)
		);

		console.log("Filtered Images:", filteredImages);
		setImages(filteredImages);
	}, [slug, initialImages]);


	const handleSaveHeroImage = async () => {
		try {
			const response = await fetch("/api/gallery/update-hero", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: draftTitle,
					heroImage: draftHeroImage
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update hero content");
			}

			setTitle(draftTitle);
			setHeroImage(draftHeroImage);
			setEditHero(false);
		} catch (error) {
			console.error("Error updating hero content:", error);
		}
	};

	const handleAddImage = async () => {
		if (!selectedCategory && !newCategoryName) {
			alert("Please select or create one category.");
			return;
		}
		try {
			const categoryIds: string[] = [];
			if (selectedCategory) {
				categoryIds.push(selectedCategory);
			}
			if (newCategoryName) {
				const newCategoryId = await createCategory(newCategoryName);
				if (newCategoryId) categoryIds.push(newCategoryId);
			}
			const imageData = {
				title: newImage.title,
				description: newImage.description,
				imageUrl: newImage.imageUrl,
				categoryIds,
			};
			const response = await fetch("/api/gallery", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(imageData),
			});
			if (!response.ok) throw new Error("Failed to add image");
			const createdImage = await response.json();
			setImages([createdImage, ...images]);
			setShowAddImage(false);
			setNewImage({ title: "", description: "", imageUrl: null, categories: [] });
			setNewCategoryName("");
			setSelectedCategory(null);
		} catch (err) {
			console.error("Error adding image:", err);
		}
	};

	const handleDeleteImage = async (imageId: string) => {
		if (!window.confirm("Are you sure you want to delete this image?")) return;

		try {
			const response = await fetch(`/api/gallery/${imageId}`, {
				method: "DELETE"
			});

			if (!response.ok) throw new Error("Failed to delete image");
			setImages(images.filter(img => img.id !== imageId));
			alert("Image updated successfully!");
		} catch (error) {
			console.error("Error deleting image:", error);
		}
	};

	const filteredImages = images
		.filter(image =>
			image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
		)
		.sort((a, b) => {
			if (sortOrder === "newest") {
				return new Date(b.date).getTime() - new Date(a.date).getTime();
			}
			return new Date(a.date).getTime() - new Date(b.date).getTime();
		});

	const currentCategory = categories.find((cat) => cat.slug === slug);

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

	const handleSaveImageEdit = async () => {
		if (!editImage) return;

		try {
			const categoryIds: string[] = [];
			if (selectedCategory) {
				categoryIds.push(selectedCategory);
			}
			if (newCategoryName) {
				const newCategoryId = await createCategory(newCategoryName);
				if (newCategoryId) categoryIds.push(newCategoryId);
			}

			const imageData = {
				title: editImage.title,
				description: editImage.description,
				imageUrl: editImage.imageUrl,
				categoryIds,
			};

			const response = await fetch(`/api/gallery/${editImage.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(imageData),
			});

			if (!response.ok) throw new Error("Failed to update image");

			const updatedImage = await response.json();

			// Remove the image from the old category and update the state
			setImages((prevImages) =>
				prevImages
					.filter((img) => img.id !== editImage.id) // Remove old instance
					.concat(updatedImage) // Add updated image in new category
			);

			setEditImage(null);
			setNewCategoryName("");
			setSelectedCategory(null);

			// Show success alert message
			alert("Image updated successfully!");
		} catch (err) {
			console.error("Error updating image:", err);
			alert("Failed to update image. Please try again.");
		}
	};



	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<HeroSection
				title={categories.find((cat) => cat.slug === slug)?.name || "Gallery"}
				heroImage={heroImage}
				isAdmin={isAdmin}
				onEditClick={() => setEditHero(true)}
			/>

			<main className=" flex flex-col md:flex-row flex-grow">
				<div className="flex flex-col md:flex-row flex-grow">
					<CategorySidebar categories={categories} basePath="gallery" className="w-full md:w-full" />

					<div className="flex-1 ml-8">
						{/* Admin: Edit Hero Section */}
						{isAdmin && editHero && (
							<div className="mb-8 bg-white p-6 rounded-lg shadow">
								<input
									type="text"
									value={draftTitle}
									onChange={(e) => setDraftTitle(e.target.value)}
									className="w-full p-2 mb-4 border rounded"
									placeholder="Enter hero title"
								/>
								<ImageUpload value={draftHeroImage} onChange={setDraftHeroImage} />
								<div className="flex gap-4 mt-4">
									<Button onClick={handleSaveHeroImage}>Save Changes</Button>
									<Button onClick={() => setEditHero(false)} variant="outlined">
										Cancel
									</Button>
								</div>
							</div>
						)}

						{/* Admin: Add Image & Add Category Buttons */}
						{isAdmin && (
							<div className="container mx-auto px-4 mt-6 flex justify-end space-x-4">
								<Button onClick={() => setShowAddImage(true)} className="bg-green-500">
									+ Add New Image
								</Button>
								<Button onClick={() => setShowAddCategory(true)} className="bg-blue-500">
									+ Add Category
								</Button>
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

						{/* Search and Sort */}
						<div className="mt-10 mb-8 px-4">

							{/* Search and Filter Row */}
							<div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl mx-auto">
								<input
									type="text"
									placeholder="Search for images..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full sm:flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
								<select
									value={sortOrder}
									onChange={(e) => {
										if (e.target.value === "newest" || e.target.value === "oldest") {
											setSortOrder(e.target.value);
										}
									}}
									className="w-full sm:w-auto p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
								>
									<option value="newest">Newest First</option>
									<option value="oldest">Oldest First</option>
								</select>
							</div>
						</div>


						<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{filteredImages.length === 0 ? (
								<p className="text-center text-gray-600">No images available.</p>
							) : (
								filteredImages.map((item) => (
									<Card key={item.id} className="bg-yellow-50 shadow-lg hover:shadow-xl transition-shadow duration-300 mt-6 mb-4">
										<div className="relative">
											<div
												className="relative w-full h-56 overflow-hidden cursor-pointer"
												onClick={() => setModalImage(item)}
											>
												<CardHeader className="p-0">
													<div className="absolute inset-0">
														<Image
															src={item.imageUrl}
															alt={item.title}
															fill
															className="rounded-t-lg"
															sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
														/>
													</div>
												</CardHeader>
											</div>
											<CardContent>
												<CardTitle className="text-2xl font-bold text-ss-blue mb-2">{item.title}</CardTitle>
												<p className="text-sm text-gray-600 mt-2">
													{new Date(item.date).toLocaleDateString()}
												</p>

												{/* Categories under the date */}
												<p className="text-sm font-semibold text-ss-blue">
													{item.categories.map((cat, index) => {
														const categoryName = cat.name || "Uncategorized";
														const slug = cat.slug; // Use the slug from the category object

														return (
															<span key={slug}>
																<Link href={`/gallery/categories/${slug}`} className="hover:underline hover:text-blue-600">
																	{categoryName}
																</Link>
																{index < item.categories.length - 1 && ", "}
															</span>
														);
													})}
												</p>






												{isAdmin && (
													<div className="mt-4 flex justify-between">
														<button
															onClick={(e) => {
																e.stopPropagation();
																setEditImage(item);
															}}
															className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
														>
															Edit
														</button>
														<button
															onClick={(e) => {
																e.stopPropagation();
																handleDeleteImage(item.id);
															}}
															className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
														>
															Delete
														</button>
													</div>
												)}
											</CardContent>
										</div>
									</Card>
								))
							)}
						</div>


					</div>
				</div>
			</main >

			{/* Modal for Viewing Image */}
			{modalImage && (
				<div
					className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-sm"
					onClick={() => setModalImage(null)}
				>
					<div
						className="relative rounded-xl max-w-lg w-full h-auto overflow-hidden shadow-xl m-4"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Close Button with Soft Hover */}

						<XMarkIcon
							className=" w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-white/70 text-ss-red cursor-pointer transition-all mb-5"
							onClick={closeModal}
						/>

						{/* Scrollable Image Container */}
						<div className="relative w-full max-h-[70vh] overflow-auto rounded-t-xl">
							<Image
								src={modalImage.imageUrl}
								alt={modalImage.title}
								width={1200}
								height={800}
								className="w-full h-auto object-contain" // 'object-contain' ensures image fits inside container
							/>
						</div>

						{/* Modal Content with Dark Text Background */}
						<div className="bg-ss-black/70 text-white p-6 rounded-b-xl">
							<h2 className="text-xl sm:text-2xl font-semibold mb-4">{modalImage.title}</h2>
							<p className="text-sm sm:text-base">{modalImage.description}</p>
						</div>
					</div>
				</div>
			)}




			{/* Modal for Adding a New Image */}
			{
				isAdmin && showAddImage && (
					<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
						<div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
							<h2 className="text-xl font-bold mb-4">Add New Image</h2>
							<input
								type="text"
								placeholder="Image Title"
								value={newImage.title}
								onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
								className="w-full p-2 mb-4 border rounded"
							/>
							<textarea
								placeholder="Image Description"
								value={newImage.description}
								onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
								className="w-full p-2 mb-4 border rounded"
								rows={3}
							/>
							<ImageUpload
								value={newImage.imageUrl}
								onChange={(url) => setNewImage({ ...newImage, imageUrl: url })}
							/>

							{/* Category Selection */}
							<h2 className="text-xl font-bold mb-10">Category</h2>
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

							<div className="flex justify-end gap-4 mt-4">
								<Button onClick={handleAddImage}>Save</Button>
								<Button variant="outlined" onClick={() => setShowAddImage(false)}>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				)
			}

			{/* Edit Image Modal */}
			{
				isAdmin && editImage && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
						<div className="bg-white p-6 rounded-lg w-full max-w-md">
							<h2 className="text-xl font-bold mb-4">Edit Image</h2>
							<input
								type="text"
								value={editImage.title}
								onChange={(e) => setEditImage({ ...editImage, title: e.target.value })}
								placeholder="Title"
								className="w-full p-2 border rounded mb-4"
							/>
							<textarea
								value={editImage.description}
								onChange={(e) => setEditImage({ ...editImage, description: e.target.value })}
								placeholder="Description"
								className="w-full p-2 border rounded mb-4"
								rows={3}
							/>
							<ImageUpload value={editImage.imageUrl} onChange={(url) => setEditImage({ ...editImage, imageUrl: url })} />


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
							<div className="flex justify-end space-x-4 mt-4">
								<Button onClick={handleSaveImageEdit} className="bg-blue-500 text-white px-4 py-2 rounded">
									Save Changes
								</Button>
								<Button onClick={() => setEditImage(null)} className="bg-gray-500 text-white px-4 py-2 rounded">
									Cancel
								</Button>
							</div>
						</div>
					</div>
				)
			}
			<Footer />
		</div >
	);
}
