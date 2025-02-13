'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function EditGalleryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [form, setForm] = useState({ title: '', description: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGalleryItem() {
      try {
        const response = await fetch(`/api/gallery/${id}`)
        const data = await response.json()
        setForm({ title: data.title, description: data.description })
      } catch (err) {
        setError('Failed to fetch gallery item')
      }
    }
    if (id) fetchGalleryItem()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/gallery/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...form }),
      })

      if (!response.ok) {
        throw new Error('Failed to update gallery item')
      }

      router.push('/admin/gallery') // Redirect after editing
    } catch (err) {
      setError('Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Edit Gallery Item</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      ></textarea>
      <button type="submit">Save Changes</button>
    </form>
  )
}
