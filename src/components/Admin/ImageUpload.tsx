"use client";

import { useState } from "react";

export default function ImageUpload({ value, onChange }) {
	const [preview, setPreview] = useState(value || "");

	const handleUpload = async (e) => {
		const file = e.target.files[0];

		if (!file) return;

		// Allowed image formats
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
			onChange(url); // Update the parent component state
			setPreview(url); // Show preview immediately
		} catch (error) {
			console.error("Upload failed:", error);
		}
	};

	return (
		<div>
			<input type="file" onChange={handleUpload} />
			{preview && <img src={preview} className="mt-2 max-w-xs" alt="Preview" />}
		</div>
	);
}

