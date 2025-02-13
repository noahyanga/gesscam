import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function POST(req) {
	const formData = await req.formData();
	const file = formData.get("file");

	if (!file) {
		return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
	}

	// Allowed formats for security
	const allowedFormats = ["image/jpeg", "image/png", "image/svg+xml", "image/jpg", "image/gif"];
	if (!allowedFormats.includes(file.type)) {
		return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
	}

	try {
		// Read file as a buffer
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Define the upload directory
		const uploadDir = path.join(process.cwd(), "public/uploads");
		await fs.mkdir(uploadDir, { recursive: true }); // Ensure directory exists

		// Create a unique file name
		const filename = `${Date.now()}-${file.name}`;
		const filePath = path.join(uploadDir, filename);

		// Save the file to /public/uploads/
		await fs.writeFile(filePath, buffer);

		// Return the accessible URL for the stored image
		const imageUrl = `/uploads/${filename}`;

		return NextResponse.json({ url: imageUrl }, { status: 200 });
	} catch (error) {
		console.error("File upload failed:", error);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}

