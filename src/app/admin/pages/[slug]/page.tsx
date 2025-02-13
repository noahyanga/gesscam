'use client'

import { useParams } from 'next/navigation'
import PageEditor from '@/components/admin/PageEditor'

export default function AdminPageEditor() {
	const { slug } = useParams()
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold mb-8 text-ss-blue">
				Editing {slug} Page
			</h1>
			<PageEditor slug={slug} />
		</div>
	)
}
