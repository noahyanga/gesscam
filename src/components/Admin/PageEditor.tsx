// components/admin/PageEditor.tsx
'use client'

import { useForm } from 'react-hook-form'
import { PageContent } from '@prisma/client'

export default function PageEditor({ page }: { page: PageContent }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: page
  })

  const onSubmit = async (data: PageContent) => {
    try {
      const response = await fetch(`/api/pages/${page.pageSlug}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Update failed')
    } catch (error) {
      console.error('Update error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Title</label>
        <input {...register('title')} className="w-full p-2 border rounded" />
      </div>

      <div>
        <label>Content</label>
        <textarea
          {...register('content')}
          className="w-full p-2 border rounded h-32"
        />
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Save Changes
      </button>
    </form>
  )
}
