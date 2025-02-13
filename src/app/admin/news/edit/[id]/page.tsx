"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function EditNewsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id") // Get the post ID from the URL query
  const [post, setPost] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/news/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch post")
        }

        setPost(data)
        setTitle(data.title)
        setDate(data.date.split("T")[0]) // Format date for input type="date"
        setContent(data.content)
        setImageUrl(data.imageUrl)
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }

    if (id) fetchPost()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, date, content, imageUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update post")
      }

      router.push("/admin/news")
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit News Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="date" className="block font-medium">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block font-medium">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border p-2"
            rows={5}
            required
          />
        </div>
        <div>
          <label htmlFor="imageUrl" className="block font-medium">Image URL</label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border p-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}
