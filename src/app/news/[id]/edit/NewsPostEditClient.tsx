"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImageUpload from "@/components/Admin/ImageUpload";
import Button from "@/components/ui/button";
import Image from "next/image";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Placeholder from "@tiptap/extension-placeholder";

interface NewsPostEditClientProps {
	post: {
		id: string;
		title: string;
		content: string;
		date: string;
		image?: string;
		comments: {
			id: string;
			content: string;
			createdAt: string;
			userId: string;
			username: string;
		}[];
	};
	categories: Category[];
}

// Add the MenuBar component from your AboutPageClient
const MenuBar = ({ editor }: { editor: any }) => {
	if (!editor) return null;

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



export default function NewsEditPage({ post: initialPost, categories }: NewsPostEditClientProps) {
	const { id } = useParams();
	const router = useRouter();
	const { data: session } = useSession();
	const isAdmin = session?.user?.role === "admin";

	// Create state for editable post data
	const [editablePost, setEditablePost] = useState({
		id: initialPost.id,
		title: initialPost.title,
		content: initialPost.content,
		image: initialPost.image || "",
		date: initialPost.date
	});


	const [selectedCategory, setSelectedCategory] = useState("");
	const [categoryList, setCategoryList] = useState<Category[]>(categories);
	const [newCategoryName, setNewCategoryName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [editImage, setEditImage] = useState(false);
	const [tempImage, setTempImage] = useState<string | null>(null);


	// Handle input changes
	const handleInputChange = (field: string, value: string) => {
		setEditablePost(prev => ({
			...prev,
			[field]: value
		}));
	};

	// Tiptap Editor setup
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
		content: editablePost.content,
		onUpdate: ({ editor }) => {
			handleInputChange('content', editor.getHTML());
		},
	});

	useEffect(() => {
		if (editor && !editor.isDestroyed && editablePost.content) {
			if (editor.getHTML() !== editablePost.content) {
				editor.commands.setContent(editablePost.content, false);
			}
		}
	}, [editor, editablePost.content]);



	const handleSaveChanges = async () => {
		if (!editablePost) return;

		try {
			setLoading(true);

			// Collect category IDs
			const categoryIds: string[] = [];
			if (selectedCategory) {
				categoryIds.push(selectedCategory);
			}

			if (newCategoryName) {
				const newCategoryId = await createCategory(newCategoryName);
				if (newCategoryId) categoryIds.push(newCategoryId);
			}

			// Ensure categoryIds is not empty
			if (categoryIds.length === 0) {
				alert("Please select at least one category.");
				setLoading(false);
				return;
			}

			// Send the updated data
			const response = await fetch(`/api/news/${editablePost.id}/edit`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: editablePost.title,
					content: editablePost.content,
					image: editablePost.image,
					categoryIds, // Ensure the correct property name
				}),
			});

			if (!response.ok) throw new Error("Failed to save changes");

			alert("Changes saved successfully!");
			setNewCategoryName("");
			setSelectedCategory(null);
			router.push("/news");
		} catch (err: any) {
			console.error("Error saving changes:", err);
			setError(err.message);
			alert("Failed to save changes. Please try again. Make sure a category was selected.");
		} finally {
			setLoading(false);
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
			<main className="flex-grow bg-ss-white">
				{/* Hero Section */}
				<section className="relative h-96 flex items-center justify-center bg-gradient-to-tl from-ss-blue to-ss-red">
					<div className="absolute inset-0 bg-black opacity-40" />
					<div className="text-center text-ss-white max-w-4xl px-4 relative z-10">
						<h1 className="text-4xl md:text-5xl font-bold mb-6">{editablePost.title}</h1>
						<time className="text-lg">
							{new Date(editablePost.date).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</time>
					</div>
				</section>

				{/* Edit Form Section */}
				<section className="py-20">
					<div className="container mx-auto px-4 max-w-4xl">
						<div className="bg-white rounded-lg shadow-lg p-8">
							<div className="mb-6">
								<label className="block font-semibold mb-2">Title:</label>
								<input
									type="text"
									value={editablePost.title}
									onChange={(e) => handleInputChange('title', e.target.value)}
									className="w-full p-3 border rounded-lg"
								/>
							</div>

							<div className="mb-6">
								<Button
									onClick={() => setEditImage(true)}
									className="bg-ss-blue hover:bg-ss-red text-ss-white"
								>
									Edit Image
								</Button>

								{editablePost.image && (
									<div className="relative h-96 mt-4 rounded-lg overflow-hidden">
										<Image
											src={editablePost.image}
											alt={editablePost.title}
											fill
											className="object-cover"
										/>
									</div>
								)}
							</div>

							<div className="mb-6">
								<label className="block font-semibold mb-2">Category:</label>
								<select
									value={selectedCategory || ""}
									onChange={(e) => setSelectedCategory(e.target.value)}
									className="w-full p-3 border rounded-lg mb-4"
								>
									<option value="" disabled>Select a category</option>
									{categoryList.map((cat) => (
										<option key={cat.id} value={cat.id}>
											{cat.name}
										</option>
									))}
								</select>

							</div>

							{/* Tiptap Editor */}
							<label className="block font-semibold mb-2">Content:</label>
							<div className="border rounded-lg shadow-sm">
								<MenuBar editor={editor} />
								<div className="p-4 min-h-[300px] prose focus:outline-none">
									<EditorContent editor={editor} />
								</div>
							</div>



							<div className="flex justify-between space-x-4">
								<Button
									onClick={handleSaveChanges}
									className="bg-ss-green hover:bg-ss-blue text-ss-white"
								>
									Save Changes
								</Button>
								<Button
									onClick={() => router.push(`/news/${id}`)}
									className="bg-ss-red hover:bg-ss-blue text-ss-white"
								>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* Image Upload Modal */}
				{editImage && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
							<h2 className="text-xl font-bold mb-4">Update Image</h2>
							<ImageUpload
								value={tempImage || editablePost.image} // Show the temp image if one exists
								onChange={(url) => setTempImage(url)} // Store the image in temp state
							/>

							<div className="flex justify-end space-x-2 mt-4">
								<Button
									onClick={() => setEditImage(false)}
									className="bg-ss-red hover:bg-ss-blue text-ss-white"
								>
									Cancel
								</Button>
								<Button
									onClick={() => {
										if (tempImage) {
											handleInputChange("image", tempImage); // Apply the change
										}
										setEditImage(false); // Close modal
									}}
									className="bg-ss-green hover:bg-ss-blue text-ss-white"
								>
									Save
								</Button>
							</div>
						</div>
					</div>
				)}
			</main>
			<Footer />
		</div>
	);
}
