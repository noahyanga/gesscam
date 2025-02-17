import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Function to generate a slug from a category name
const generateSlug = (name: string) => {
	return name
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/[^a-z0-9-]/g, ""); // Remove special characters except hyphens
};

export async function POST(req: Request) {
	try {
		const { name } = await req.json();

		if (!name) {
			return NextResponse.json({ error: "Category name is required" }, { status: 400 });
		}

		// Convert name to slug (lowercase + hyphens)
		const slug = name.toLowerCase().replace(/\s+/g, "-");

		// Check if slug already exists
		const existingCategory = await prisma.category.findUnique({ where: { slug } });
		if (existingCategory) {
			return NextResponse.json({ error: "Category already exists" }, { status: 400 });
		}

		// Create category
		const newCategory = await prisma.category.create({
			data: { name, slug },
		});

		return NextResponse.json(newCategory, { status: 201 });

	} catch (error) {
		console.error("Error creating category:", error);
		return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
	}
}

