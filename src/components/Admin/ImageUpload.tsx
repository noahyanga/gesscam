"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageUploadProps {
	value?: string | null;
	onChange?: (url: string) => void;
	className?: string;
}

export default function ImageUpload({ value, onChange, className }: ImageUploadProps) {
	const [preview, setPreview] = useState(value || "");

	const handleUpload = async (e) => {
		const file = e.target.files[0];

		if (!file) return;

		const allowedFormats = ["image/jpeg", "image/png", "image/svg+xml", "image/jpg", "image/gif"];
		if (!allowedFormats.includes(file.type)) {
			alert("Invalid file type. Please upload a JPG, JPEG, PNG, or SVG image.");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);

		try {
			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			const { url } = await response.json();
			if (onChange) {
				onChange(url);
			}
			setPreview(url);
		} catch (error) {
			console.error("Upload failed:", error);
		}
	};

	return (
		<div className={className}>
			<input type="file" onChange={handleUpload} />
			{preview && (
				<div className="relative mt-2 max-w-xs h-40">
					<Image
						src={preview}
						alt="Preview"
						fill
						style={{ objectFit: "contain" }} // or 'cover'
					/>
				</div>
			)}
		</div>
	);
}
