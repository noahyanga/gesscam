// src/app/api/upload/route.ts
// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with your credentials
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("env:", process.env);

export async function POST(req: Request) {
	const formData = await req.formData();
	const file = formData.get("file");

	if (!file) {
		return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
	}

	if (typeof file === 'string') {
		return NextResponse.json({ error: "file was a string, and not a file" }, { status: 400 });
	}

	// Allowed formats for security
	const allowedFormats = ["image/jpeg", "image/png", "image/svg+xml", "image/jpg", "image/gif"];
	if (!allowedFormats.includes(file.type)) {
		return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
	}

	try {
		// Read the file as an array buffer and convert to Buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Helper function to upload via a stream
		const streamUpload = (buffer: Buffer) => {
			return new Promise((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream(
					{ folder: "uploads" }, // Optional: specify a folder in Cloudinary
					(error, result) => {
						if (result) {
							resolve(result);
						} else {
							reject(error);
						}
					}
				);
				stream.end(buffer);
			});
		};

		// Upload the buffer to Cloudinary
		const uploadResult: any = await streamUpload(buffer);

		// Return the secure URL of the uploaded image
		return NextResponse.json({ url: uploadResult.secure_url }, { status: 200 });
	} catch (error) {
		console.error("Cloudinary upload failed:", error);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
