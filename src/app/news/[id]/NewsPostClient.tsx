"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Button from "@/components/ui/button";
import Image from "next/image";
import { useSession } from "next-auth/react";
import parse from 'html-react-parser';


interface NewsPostClientProps {
  post: {
    id: string;
    title: string;
    content: string;
    date: Date;
    image: string;
    comments: {
      id: string;
      content: string;
      createdAt: Date;
      userId: string;
      authorId: string;
      postId: string;
      author: { username: string };
    }[];
  };
}


export default function NewsPostClient({ post }: NewsPostClientProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const admin = session?.user?.role;

  console.log("post", post);

  // State for adding comments
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments);

  console.log("Comment:", comments); // Log user role to confirm it's correct


  const handleAddComment = async () => {
    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }

    if (comment.trim() === "") {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`/api/news/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) throw new Error("Failed to add comment");

      const newComment = await response.json();

      // Update the state by appending the new comment to the existing comments array
      setComments((prevComments) => [newComment, ...prevComments]);

      // Clear the comment input field after posting
      setComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("There was an error adding your comment.");
    }
  };




  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/news/${post.id}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete comment");

      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };


  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/news/${post.id}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to edit comment");
      }

      const updatedComment = await response.json();
      setComments(
        comments.map((comment) =>
          comment.id === commentId ? { ...comment, content: updatedComment.content } : comment
        )
      );
    } catch (err) {
      console.error("Error editing comment:", err);
      alert("There was an error editing the comment.");
    }
  };


  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-ss-white">
        {/* Post Hero Section */}
        <section className="relative h-96 flex items-center justify-center bg-gradient-to-tl from-ss-blue to-ss-red">
          <div className="text-center text-ss-white max-w-4xl px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>
            <time className="text-lg">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </section>

        {/* Post Content Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {post.image && (
                <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
                  <Image src={post.image} alt={post.title} fill className="object-cover" />
                </div>
              )}
              <div
                className="prose lg:prose-xl text-ss-black"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              {/* Comments Section */}
              <section className="mt-12 pt-8 border-t border-ss-blue">
                <h2 className="text-2xl font-bold text-ss-blue mb-6">Comments</h2>

                {!user && (
                  <p className="text-ss-black mb-6">You need to be logged in to post comments</p>
                )}

                {/* Display comments */}
                {comments.length === 0 ? (
                  <p className="text-ss-black">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
                      {/* Display the username above the comment */}
                      <h3 className="text-lg font-semibold">{comment.author?.username}</h3>
                      <p className="text-ss-black mb-2">{comment.content}</p>
                      <time className="text-sm text-ss-blue">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </time>
                      <div className="mt-2 flex justify-end space-x-2">

                        {/* Only allow the user to edit or delete their comment or an admin to delete it */}
                        {(comment.authorId === user?.id || session?.user?.role === "admin") && (
                          <>
                            {comment.authorId === user?.id && (
                              <Button
                                onClick={() =>
                                  handleEditComment(comment.id, prompt("Edit your comment:", comment.content) || comment.content)
                                }
                                className="bg-ss-blue text-ss-white"
                              >
                                Edit
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="bg-ss-red text-ss-white"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Add Comment Form for logged-in users */}
                {user && (
                  <div className="mt-6">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full p-3 border rounded-lg"
                    />
                    <Button onClick={handleAddComment} className="mt-3 bg-ss-green hover:bg-ss-red text-ss-white">
                      Post Comment
                    </Button>
                  </div>
                )}
              </section>

              <div className="mt-12 w-full">
                <Button className="w-full bg-ss-blue hover:bg-blue-600 text-ss-white p-4 flex items-center justify-center">
                  <Link
                    href="/news"
                    className="w-full h-full flex items-center justify-center"
                  >
                    Back to News
                  </Link>
                </Button>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
};

