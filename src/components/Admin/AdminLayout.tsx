// components/admin/AdminLayout.tsx
'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function AdminLayout({ children }) {
	const { data: session, status } = useSession()
	const router = useRouter()

	if (status === "loading") return <div>Loading...</div>

	if (status === "unauthenticated" || session?.user?.role !== 'admin') {
		router.push('/login')
		return null
	}

	return (
		<div className="admin-dashboard">
			<AdminNavbar />
			<main>{children}</main>
		</div>
	)
}
