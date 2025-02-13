// app/admin/news/create/page.tsx and app/admin/gallery/create/page.tsx
"use client"

import { useRouter } from 'next/navigation'
import { ContentForm } from '@/components/forms/contentform'

export default function CreateContentPage({ 
  type = 'news' 
}: { 
  type?: 'news' | 'gallery' 
}) {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/admin/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to create content')
      }

      router.push(`/admin/${type}`)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Create {type.charAt(0).toUpperCase() + type.slice(1)}
      </h1>
      <ContentForm 
        onSubmit={handleSubmit} 
        type={type}
      />
    </div>
  )
}