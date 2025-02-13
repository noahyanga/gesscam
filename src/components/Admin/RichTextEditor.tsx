'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';

export default function RichTextEditor({ value, onChange }) {
	const [isUploading, setIsUploading] = useState(false);

	const editor = useEditor({
		extensions: [
			StarterKit,
			Image.configure({
				inline: true,
				allowBase64: false,
			}),
		],
		content: value,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
	});

	const { getRootProps, getInputProps } = useDropzone({
		accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
		multiple: false,
		onDrop: async (acceptedFiles) => {
			const file = acceptedFiles[0];
			setIsUploading(true);

			// Upload image to your server
			const formData = new FormData();
			formData.append('file', file);

			try {
				const response = await fetch('/api/upload', {
					method: 'POST',
					body: formData,
				});
				const { url } = await response.json();

				if (editor) {
					editor.chain().focus().setImage({ src: url }).run();
				}
			} catch (error) {
				console.error('Upload failed:', error);
			}
			setIsUploading(false);
		},
	});

	return (
		<div className="border rounded-lg p-4 min-h-[300px]">
			{/* Toolbar */}
			<div className="flex flex-wrap gap-2 mb-4">
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
				>
					<strong>B</strong>
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
				>
					<em>I</em>
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
				>
					• List
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					className={`p-2 rounded ${editor?.isActive('heading') ? 'bg-gray-200' : ''}`}
				>
					H2
				</button>
				<div {...getRootProps()} className="p-2 bg-gray-100 rounded cursor-pointer">
					<input {...getInputProps()} />
					{isUploading ? 'Uploading...' : '📷 Image'}
				</div>
			</div>

			{/* Editor Content */}
			<EditorContent editor={editor} className="prose max-w-none" />
		</div>
	);
}
