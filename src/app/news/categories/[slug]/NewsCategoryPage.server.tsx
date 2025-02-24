import { prisma } from "@/lib/prisma";
import NewsCategoryPageClient from "./NewsCategoryPageClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProviderWrapper from "@/components/Admin/SessionProviderWrapper";

export default async function NewsPageWrapper() {
	const session = await getServerSession(authOptions);

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
						category: {
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

	// Transform initialPosts to match client-side expectations
	const transformedPosts = initialPosts.map(post => ({
		...post,
		categories: post.categories.map(cat => cat.category)
	}));

	return (
		<SessionProviderWrapper session={session}>
			<NewsCategoryPageClient
				newsContent={newsContent}
				initialPosts={transformedPosts}
				categories={categories}
			/>
		</SessionProviderWrapper>
	);
}
