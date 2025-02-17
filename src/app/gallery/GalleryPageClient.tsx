'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/layout/HeroSection";
import Button from "@/components/ui/button";
import ImageUpload from "@/components/Admin/ImageUpload";
import { XMarkIcon } from "@heroicons/react/24/solid";
import type { PageContent, GalleryImage } from "@prisma/client";
import CategorySidebar from "@/components/layout/CategorySidebar";
import type { Category } from "@/types/category"; // Adjust import as needed

interface GalleryPageProps {
  galleryContent: PageContent | null;
  initialImages: GalleryImage[];
  categories: Category[];
}

export default function GalleryPageClient({ galleryContent, initialImages, categories }: GalleryPageProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [images, setImages] = useState(initialImages);
  const [heroImage, setHeroImage] = useState(galleryContent?.heroImage || "/default-gallery.jpg");
  const [editHero, setEditHero] = useState(false);
  const [draftTitle, setDraftTitle] = useState(galleryContent?.title || "");
  const [draftHeroImage, setDraftHeroImage] = useState(heroImage);
  const [title, setTitle] = useState(galleryContent?.title);
  // When an image is being edited, its data is stored here
  const [editImage, setEditImage] = useState<GalleryImage | null>(null);
  const [showAddImage, setShowAddImage] = useState(false);
  const [newImage, setNewImage] = useState({ title: "", description: "", imageUrl: null });
  const [modalImage, setModalImage] = useState<GalleryImage | null>(null);
  const [categoryList, setCategoryList] = useState<Category[]>(categories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>("All");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const closeModal = () => setModalImage(null);

  const handleSaveHeroImage = async () => {
    try {
      const response = await fetch("/api/gallery/update-hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draftTitle,
          heroImage: draftHeroImage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update hero content");
      }
      setTitle(draftTitle);
      setHeroImage(draftHeroImage);
      setEditHero(false);
      alert("Hero content updated successfully!");
    } catch (err) {
      console.error("Error updating hero content:", err);
      alert(`Update failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  // Add a new category (for images)
  const createCategory = async (categoryName: string) => {
    const response = await fetch("/api/news/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: categoryName }),
    });
    const data = await response.json();
    return data;
  };

  const handleDeleteImage = async (imageId: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this image?");
    if (!isConfirmed) return;
    try {
      const response = await fetch(`/api/gallery/${imageId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete image");
      setImages(images.filter((img) => img.id !== imageId));
      alert("Image was successfully deleted.");
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  const handleAddImage = async () => {
    if (!selectedCategory && !newCategoryName) {
      alert("Please select or create one category.");
      return;
    }
    try {
      const categoryIds: number[] = [];
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
      setNewImage({ title: "", description: "", imageUrl: null });
      setNewCategoryName("");
      setSelectedCategory(null);
    } catch (err) {
      console.error("Error adding image:", err);
    }
  };

  const handleEditImage = async (imageId: string, updatedImage: { title: string; description: string; imageUrl: string; categoryIds: number[] }) => {
    try {
      if (!updatedImage.title.trim() || !updatedImage.description.trim() || !updatedImage.imageUrl.trim()) {
        alert("Title, description, and image URL cannot be empty.");
        return;
      }

      const response = await fetch(`/api/gallery/${imageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedImage),
      });

      if (!response.ok) throw new Error("Failed to update image");

      const editedImage = await response.json();

      // Update state: replace old image with the edited one
      setImages((prevImages) =>
        prevImages.map((img) => (img.id === imageId ? editedImage : img))
      );

      setShowEditImage(false);

    } catch (err) {
      console.error("Error updating image:", err);
    }
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
      alert("Image updated successfully! 🎉");
    } catch (err) {
      console.error("Error updating image:", err);
      alert("Failed to update image. Please try again.");
    }
  };



  const filteredImages = images
    .filter(
      (image) =>
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    });

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data: { categoryList: Category[] }) => {
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

      <HeroSection
        title={title}
        heroImage={heroImage}
        isAdmin={isAdmin}
        onEditClick={() => setEditHero(true)}
      />

      {/* Admin Edit Hero Section */}
      {isAdmin && editHero && (
        <div className="container mx-auto mt-4 px-4">
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <h2 className="text-lg font-bold mb-2">Change Hero Image:</h2>
          <ImageUpload value={draftHeroImage} onChange={setDraftHeroImage} />
          <div className="flex space-x-4 mt-4">
            <button onClick={handleSaveHeroImage} className="bg-blue-500 text-white px-4 py-2 rounded">
              Save Changes
            </button>
            <button onClick={() => setEditHero(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Admin Controls */}
      {isAdmin && (
        <div className="container mx-auto px-4 mt-6 flex justify-end space-x-4">
          <Button onClick={() => setShowAddImage(true)} className="bg-green-500">
            + Add Image
          </Button>
          <Button onClick={() => setShowAddCategory(true)} className="bg-blue-500">
            + Add Category
          </Button>
        </div>
      )}

      {/* Admin: Add New Image Modal */}
      {isAdmin && showAddImage && (
        <div className="container mx-auto px-4 mt-6 bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Upload a New Image</h2>
          <input
            type="text"
            placeholder="Title"
            value={newImage.title}
            onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
          />
          <textarea
            placeholder="Description"
            value={newImage.description}
            onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
            rows={3}
          />
          <ImageUpload value={newImage.imageUrl} onChange={(url) => setNewImage({ ...newImage, imageUrl: url })} />

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

          <div className="flex space-x-4 mt-4">
            <button onClick={handleAddImage} className="bg-blue-500 text-white px-4 py-2 rounded">
              Save Image
            </button>
            <button onClick={() => setShowAddImage(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Image Modal */}
      {isAdmin && editImage && (
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
      )}

      {/* Sidebar and Main Content */}
      <div className="flex flex-grow">
        <CategorySidebar categories={categories} basePath="gallery" />

        <section className="py-16 bg-gradient-to-b from-ss-white to-ss-blue/10 w-full">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-semibold text-center mb-6">Community Photos</h2>

            {/* Search and Sort */}
            <div className="flex justify-evenly mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for images..."
                className="w-1/3 p-2 border rounded"
              />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="newest">Newest to Oldest</option>
                <option value="oldest">Oldest to Newest</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredImages.length === 0 ? (
                <p className="text-center text-gray-600">No images available.</p>
              ) : (
                filteredImages.map((item) => (
                  <Card key={item.id} className="bg-yellow-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
        </section>

        {modalImage && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in"
            onClick={() => setModalImage(null)}
          >
            <div
              className="relative max-w-4xl w-full mx-4 bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <XMarkIcon
                className="absolute top-2 right-2 w-10 h-10 text-white cursor-pointer"
                onClick={closeModal}
              />
              <Image
                src={modalImage.imageUrl}
                alt={modalImage.title}
                width={1000}
                height={1000}
                className="rounded-t-xl"
              />
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">{modalImage.title}</h2>
                <p>{modalImage.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

