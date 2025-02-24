import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const { id } = params;
	const { name, position, imageUrl } = await req.json();

	if (!id || !name || !position || !imageUrl) {
		return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
	}

	try {
		const updatedMember = await prisma.execMember.update({
			where: { id },
			data: { name, position, imageUrl },
		});

		return NextResponse.json(updatedMember, { status: 200 });
	} catch (error) {
		console.error('Error updating executive member:', error);
		return NextResponse.json({ error: 'Failed to update executive member' }, { status: 500 });
	}
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const { id } = params;

	if (!id) {
		return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
	}

	try {
		await prisma.execMember.delete({
			where: { id },
		});

		return NextResponse.json({ message: 'Member deleted successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error deleting executive member:', error);
		return NextResponse.json({ error: 'Failed to delete executive member' }, { status: 500 });
	}
}

export async function POST(req: Request) {
	const { name, position, imageUrl } = await req.json();

	if (!name || !position || !imageUrl) {
		return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
	}

	try {
		// Fetch the highest existing order
		const existingMembers = await prisma.execMember.findMany({
			orderBy: {
				order: 'desc',
			},
			take: 1,
		});

		let nextOrder = 1;
		if (existingMembers.length > 0) {
			nextOrder = existingMembers[0].order + 1;
		}

		const newMember = await prisma.execMember.create({
			data: {
				name,
				position,
				imageUrl,
				order: nextOrder, // Add the calculated order
			},
		});



		return NextResponse.json(newMember, { status: 201 });
	} catch (error) {
		console.error('Error adding executive member:', error);
		return NextResponse.json({ error: 'Failed to add executive member' }, { status: 500 });
	}
}

