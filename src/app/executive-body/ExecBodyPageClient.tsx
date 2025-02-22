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
import { ChevronDown, Plus, Edit2, Trash2 } from "lucide-react";

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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <HeroSection
        title={title || 'Executive Body'}
        heroImage={heroImage}
        isAdmin={isAdmin}
        onEditClick={() => setEditHero(true)}
      />

      {/* Admin Edit Hero Modal */}
      {isAdmin && editHero && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6">Edit Hero Section</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
                <ImageUpload
                  value={draftHeroImage}
                  onChange={setDraftHeroImage}
                  className="rounded-lg border border-dashed border-gray-300 p-4 hover:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex space-x-4 mt-6">
                <Button
                  onClick={handleSaveHeroImage}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setEditHero(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Button */}
      {isAdmin && (
        <div className="container mx-auto px-4 mt-8">
          <Button
            onClick={() => setShowAddMember(true)}
            className="group bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Add Member
          </Button>
        </div>
      )}

      {/* Add Member Modal */}
      {isAdmin && showAddMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6">Add New Member</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              />

              <input
                type="text"
                placeholder="Position"
                value={newMember.position}
                onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              />

              <ImageUpload
                value={newMember.imageUrl}
                onChange={(url) => setNewMember({ ...newMember, imageUrl: url })}
                className="rounded-lg border border-dashed border-gray-300 p-4 hover:border-blue-500 transition-colors"
              />

              <div className="flex space-x-4 mt-6">
                <Button
                  onClick={handleAddMember}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                >
                  Save Member
                </Button>
                <Button
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Grid Section */}
      <section className="py-10 px-4 mb-10 mt-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {members.map((member) => (
              <Card
                key={member.id}
                className="bg-white shadow-md hover:shadow-lg transition duration-300 p-4 flex flex-col items-center text-center"
              >
                <Image
                  src={member.imageUrl}
                  alt={member.name}

                  width={300}
                  height={500}
                  className="w-64 h-64 rounded-full object-cover border-4 border-gray-300 shadow-sm"
                />
                <CardTitle className="text-xl font-bold text-gray-900 mt-3">
                  {member.name}
                </CardTitle>
                <p className="text-sm text-gray-600">{member.position}</p>

                {isAdmin && (
                  <div className="mt-3 flex space-x-3">
                    <Button
                      onClick={() => setEditMember(member)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteMember(member.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* Edit Member Modal */}
      {
        editMember && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-fade-in-up">
              <h2 className="text-2xl font-bold mb-6">Edit Member</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={editMember.name}
                  onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                />

                <textarea
                  placeholder="Position"
                  value={editMember.position}
                  onChange={(e) => setEditMember({ ...editMember, position: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                  rows={3}
                />

                <ImageUpload
                  value={editMember.imageUrl}
                  onChange={(url) => setEditMember({ ...editMember, imageUrl: url })}
                  className="rounded-lg border border-dashed border-gray-300 p-4 hover:border-blue-500 transition-colors"
                />

                <div className="flex space-x-4 mt-6">
                  <Button
                    onClick={handleSaveMemberEdit}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setEditMember(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      <Footer />
    </div >
  );
}
