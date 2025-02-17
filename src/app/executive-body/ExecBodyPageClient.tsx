'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/layout/HeroSection';
import Button from '@/components/ui/button';
import ImageUpload from '@/components/admin/ImageUpload';
import type { PageContent, ExecMember } from '@prisma/client';

interface ExecBodyPageProps {
  execContent: PageContent | null;
  initialMembers: ExecMember[];
}

export default function ExecBodyPageClient({ execContent, initialMembers }: ExecBodyPageProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const [members, setMembers] = useState(initialMembers);
  const [heroImage, setHeroImage] = useState(execContent?.heroImage || '/default-exec.jpg');
  const [draftHeroImage, setDraftHeroImage] = useState(heroImage);
  const [editHero, setEditHero] = useState(false);
  const [editMember, setEditMember] = useState<ExecMember | null>(null);
  const [title, setTitle] = useState(execContent?.title);
  const [draftTitle, setDraftTitle] = useState(title);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', position: '', imageUrl: '' });

  const handleSaveHeroImage = async () => {
    try {
      const response = await fetch('/api/exec-body/update-hero', {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroImage: draftHeroImage,
          title: draftTitle // Add title to the request body
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      // Update both state values
      setTitle(draftTitle);
      setHeroImage(draftHeroImage);
      setEditHero(false);
      alert("Title and image updated successfully!");

    } catch (err) {
      console.error("Update error:", err);
      alert(`Update failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleAddMember = async () => {
    try {
      const response = await fetch('/api/exec-body', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      if (!response.ok) throw new Error('Failed to add new member');
      const createdMember = await response.json();
      setMembers([createdMember, ...members]);
      setShowAddMember(false);
      setNewMember({ name: '', position: '', imageUrl: '' });
    } catch (err) {
      console.error('Error adding member:', err);
    }
  };

  const handleSaveMemberEdit = async () => {
    if (!editMember) return;
    try {
      const response = await fetch(`/api/exec-body/${editMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editMember),
      });
      if (!response.ok) throw new Error('Failed to update member');
      setMembers(members.map((m) => (m.id === editMember.id ? editMember : m)));
      setEditMember(null);
    } catch (err) {
      console.error('Error updating member:', err);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this member?');
    if (!isConfirmed) return;
    try {
      const response = await fetch(`/api/exec-body/${memberId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete member');
      setMembers(members.filter((m) => m.id !== memberId));
    } catch (err) {
      console.error('Error deleting member:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HeroSection
        title={title || 'Executive Body'}
        heroImage={heroImage}
        isAdmin={isAdmin}
        onEditClick={() => setEditHero(true)}
      />

      {isAdmin && editHero && (
        <div className="container mx-auto mt-4 px-4">

          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            className="w-fit p-2 mb-4 border rounded"
          />

          <h2 className="text-lg font-bold mb-2">Change Hero Image:</h2>
          <ImageUpload value={draftHeroImage} onChange={setDraftHeroImage} />
          <div className="flex space-x-4 mt-4">
            <Button onClick={handleSaveHeroImage} className="bg-blue-500">Save Changes</Button>
            <Button onClick={() => setEditHero(false)} className="bg-gray-500">Cancel</Button>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="container mx-auto px-4 mt-6 flex justify-end">
          <Button onClick={() => setShowAddMember(true)} className="bg-green-500">+ Add Member</Button>
        </div>
      )}

      {isAdmin && showAddMember && (
        <div className="container mx-auto px-4 mt-6 bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Add a New Member</h2>
          <input type="text" placeholder="Name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} className="w-full p-2 mb-4 border rounded" />
          <input type="text" placeholder="Position" value={newMember.position} onChange={(e) => setNewMember({ ...newMember, position: e.target.value })} className="w-full p-2 mb-4 border rounded" />
          <ImageUpload value={newMember.imageUrl} onChange={(url) => setNewMember({ ...newMember, imageUrl: url })} />
          <div className="flex space-x-4 mt-4">
            <Button onClick={handleAddMember} className="bg-blue-500">Save Member</Button>
            <Button onClick={() => setShowAddMember(false)} className="bg-gray-500">Cancel</Button>
          </div>
        </div>
      )}

      {editMember && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Edit Image</h2>
            <input
              type="text"
              placeholder="Title"
              value={editMember.name}
              onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <textarea
              placeholder="Description"
              value={editMember.position}
              onChange={(e) => setEditMember({ ...editMember, position: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
              rows={3}
            />
            <ImageUpload
              value={editMember.imageUrl}
              onChange={(url) => setEditMember({ ...editMember, imageUrl: url })}
            />
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleSaveMemberEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditMember(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}



      <section className="py-16 bg-gradient-to-b from-ss-white to-ss-blue/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member) => (
              <Card key={member.id} className="bg-white shadow-lg">
                <CardHeader>
                  <Image src={member.imageUrl} alt={member.name} width={400} height={300} className="rounded-t-lg object-cover h-64 w-full" />
                </CardHeader>
                <CardContent>
                  <CardTitle className='text-3xl text-ss-blue'>{member.name}</CardTitle>
                  <p className="text-xl">{member.position}</p>
                  {isAdmin && (
                    <div className="mt-4 flex justify-between">
                      <Button onClick={() => setEditMember(member)} className="bg-blue-500">Edit</Button>
                      <Button onClick={() => handleDeleteMember(member.id)} className="bg-red-500">Delete</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

