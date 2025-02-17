import { prisma } from "@/lib/prisma"; // Import prisma to fetch content
import NewsCategoryPageClient from "./NewsCategoryPageClient";
import { getServerSession } from "next-auth"; // Get session using next-auth
import { authOptions } from "@/lib/auth"; // Your auth options
import SessionProviderWrapper from "@/components/Admin/SessionProviderWrapper";

export default async function NewsPageWrapper() {
	// Fetch session on the server-side
	const session = await getServerSession(authOptions);

	// Fetch news content, posts, and categories from the database
	const [newsContent, initialPosts, categories] = await Promise.all([
		prisma.pageContent.findUnique({
			where: { pageSlug: "news" }
		}),

		prisma.newsPost.findMany({
			orderBy: { date: "desc" },
			select: {
				id: true,
				title: true,
				content: true,
				image: true,
				date: true,
				categories: {
					select: {
						category: { // ✅ Get the actual Category object
							select: {
								id: true,
								slug: true,
								name: true
							}
						}
					}
				}
			}
		}),

		prisma.category.findMany({
			select: {
				id: true,
				name: true,
				slug: true,
				_count: { select: { newsPosts: true } }
			}
		})
	]);



	// Return the NewsPageClient component with the fetched content, posts, categories, and session
	return (
		<SessionProviderWrapper session={session}>
			<NewsCategoryPageClient
				newsContent={newsContent}
				initialPosts={initialPosts}
				categories={categories}
			/>
		</SessionProviderWrapper>
	);
}


