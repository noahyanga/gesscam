import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
	try {
		const members = await prisma.execMember.findMany({
			orderBy: { order: 'asc' },
			select: {
				id: true,
				name: true,
				position: true,
				imageUrl: true
			}
		});

		return NextResponse.json(members);
	} catch (error) {
		console.error('Exec Body API Error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch executive body members' },
			{ status: 500 }
		);
	}
}

export async function POST(req: Request) {
	try {
		const { name, position, imageUrl } = await req.json();

		// Validate input
		if (!name || !position || !imageUrl) {
			return NextResponse.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		// Create member with proper field names
		const newMember = await prisma.execMember.create({
			data: {
				name,
				position,
				imageUrl,
				order: 0, // Add default order or make optional in schema
			},
		});

		return NextResponse.json(newMember, { status: 201 });
	} catch (error) {
		console.error("DB Error:", error);
		return NextResponse.json(
			{ error: "Failed to create executive member" },
			{ status: 500 }
		);
	}
}

