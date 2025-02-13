// app/api/pages/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
	req: NextRequest,
	{ params }: { params: { slug: string } }
) {
	const page = await prisma.pageContent.findUnique({
		where: { pageSlug: params.slug }
	});

	if (!page) {
		return NextResponse.json(
			{ error: 'Page not found' },
			{ status: 404 }
		);
	}

	return NextResponse.json(page);
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: { slug: string } }
) {
	const body = await req.json();

	const updatedPage = await prisma.pageContent.update({
		where: { pageSlug: params.slug },
		data: body
	});

	return NextResponse.json(updatedPage);
}
