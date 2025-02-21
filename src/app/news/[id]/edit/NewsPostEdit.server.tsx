
import { prisma } from "@/lib/prisma"; // Import prisma to fetch content
import NewsEditPage from "./NewsPostEditClient";
import { getServerSession } from "next-auth"; // Get session using next-auth
import { authOptions } from "@/lib/auth"; // Your auth options
import SessionProviderWrapper from "@/components/Admin/SessionProviderWrapper";

interface EditPostPageProps {
	params: { id: string };
}

export default async function NewsPageWrapper({ params }: EditPostPageProps) {
	// Fetch session on the server-side
	const { id } = params;  // Destructure the ID from params
	const session = await getServerSession(authOptions);

	const post = await prisma.newsPost.findUnique({
		where: { id },
		include: {
			comments: {
				orderBy: { createdAt: "desc" },
				include: {
					author: { select: { username: true } }, // Directly include the username in the comment
				},
			},
		},
	});

	const categories = await prisma.category.findMany({
		select: {
			id: true,
			name: true,
			slug: true,
			_count: { select: { newsPosts: true } } // Ensure this is included
		},
	});





	// Return the NewsPageClient component with the fetched content, posts, categories, and session
	return (
		<SessionProviderWrapper session={session}>
			<NewsEditPage
				post={post}
				categories={categories}
			/>
		</SessionProviderWrapper>
	);
}


