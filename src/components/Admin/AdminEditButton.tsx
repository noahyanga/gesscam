// components/AdminEditButton.tsx
'use client'

import { useSession } from 'next-auth/react'

export default function AdminEditButton({ pageSlug }) {
	const { data: session } = useSession()

	if (session?.user?.role !== 'admin') return null

	return (
		<a
			href={`/admin/pages/${pageSlug}`}
			className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg"
		>
			Edit Page
		</a>
	)
}
