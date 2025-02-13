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

interface GalleryPageProps {
  galleryContent: PageContent | null;
  initialImages: GalleryImage[];
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
  const [editImage, setEditImage] = useState<GalleryImage | null>(null);
  const [showAddImage, setShowAddImage] = useState(false);
  const [newImage, setNewImage] = useState({ title: "", description: "", imageUrl: "" });
  const [modalImage, setModalImage] = useState<GalleryImage | null>(null);
  const [categoryList, setCategoryList] = useState<Category[]>(categories);
  const [selectedCategory, setSelectedCategory] = useState("All");


  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const closeModal = () => setModalImage(null);

  const handleSaveHeroImage = async () => {
    try {
      const response = await fetch("/api/gallery/update-hero", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: draftTitle,
          heroImage: draftHeroImage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update hero content");
      }

      // Update local state only after successful API response
      setTitle(draftTitle);
      setHeroImage(draftHeroImage);
      setEditHero(false);
      alert("Hero content updated successfully!");

    } catch (err) {
      console.error("Error updating hero content:", err);
      alert(`Update failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleSaveImageEdit = async () => {
    if (!editImage) return;

    try {
      const response = await fetch(`/api/gallery/${editImage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editImage),
      });

      if (!response.ok) throw new Error("Failed to update image");

      setImages(images.map((image) => (image.id === editImage.id ? editImage : image)));
      setEditImage(null);
    } catch (err) {
      console.error("Error updating image:", err);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this image?");
    if (!isConfirmed) return; // If user cancels, do nothing

    try {
      const response = await fetch(`/api/gallery/${imageId}`, { method: "DELETE" });

      if (!response.ok) throw new Error("Failed to delete image");
      setImages(images.filter((img) => img.id !== imageId)); // Remove the image from the list
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  const handleAddImage = async () => {
    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newImage),
      });

      if (!response.ok) throw new Error("Failed to add image");
      const createdImage = await response.json();
      setImages([createdImage, ...images]);
      setShowAddImage(false);
      setNewImage({ title: "", description: "", imageUrl: "" });
    } catch (err) {
      console.error("Error adding image:", err);
    }
  };

  const filteredImages = images
    .filter((image) => image.title.toLowerCase().includes(searchTerm.toLowerCase()) || image.description.toLowerCase().includes(searchTerm.toLowerCase()))
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

      <HeroSection
        title={title || "Photo Gallery"}
        heroImage={heroImage}
        isAdmin={isAdmin}
        onEditClick={() => setEditHero(true)}
      />

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

      {isAdmin && (
        <div className="container mx-auto px-4 mt-6 flex justify-end">
          <Button onClick={() => setShowAddImage(true)} className="bg-green-500 text-white px-4 py-2 rounded">
            + Add Image
          </Button>
        </div>
      )}

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

      {/* Sidebar and Main Content */}
      <div className="flex flex-grow">
        {/* Category Sidebar */}
        <CategorySidebar
          categories={categories}
          basePath="gallery" // This ensures the links are relative to "news"

        />



        <section className="py-16 bg-gradient-to-b from-ss-white to-ss-blue/10">
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
                              className="rounded-t-lg "
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        </CardHeader>
                      </div>

                      <CardContent>
                        <CardTitle className="text-2xl font-bold text-ss-blue mb-2">{item.title}</CardTitle>
                        <p className="text-ss-black">{item.description}</p>

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
