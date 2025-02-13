import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
	try {
		const { username, email, password } = await req.json();

		// Validate input
		if (!username || !email || !password) {
			return NextResponse.json({ error: "All fields are required" }, { status: 400 });
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return NextResponse.json({ error: "User already exists" }, { status: 409 });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const newUser = await prisma.user.create({
			data: { username, email, password: hashedPassword },
		});

		return NextResponse.json({ message: "User registered successfully", user: newUser }, { status: 201 });
	} catch (error) {
		console.error("Registration error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

