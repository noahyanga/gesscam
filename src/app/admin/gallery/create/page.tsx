'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreateGalleryPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '' })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/gallery/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error('Failed to create gallery item')
      }

      router.push('/admin/gallery') // Redirect after creation
    } catch (err) {
      setError('Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create Gallery Item</h1>
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
      <button type="submit">Create</button>
    </form>
  )
}
