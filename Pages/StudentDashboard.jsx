import React, { useState } from "react";
import firebaseClient from "@/firebase/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MessageSquare } from "lucide-react";
import MegathreadCard from "../Components/megathreads/megathreadCard";
import CreateMegathreadForm from "../Components/megathreads/CreateMegathreadForm";

export default function StudentsDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return new Promise((resolve) => {
        const unsubscribe = firebaseClient.auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user);
        });
      });
    },
    staleTime: Infinity,
  });

  // Get megathreads
  const { data: megathreads, isLoading } = useQuery({
    queryKey: ['studentMegathreads'],
    queryFn: () => firebaseClient.entities.Megathread.filter({ author_type: 'student' }, '-created_date', 50),
    initialData: [],
  });

  // Create megathread mutation
  const createMutation = useMutation({
    mutationFn: (data) => firebaseClient.entities.Megathread.create({
      ...data,
      author_type: 'student',
      author_name: user?.displayName || 'Student',
      author_email: user?.email || '',
      author_avatar_url: user?.photoURL || '',
      created_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['studentMegathreads']);
      setShowCreateForm(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Student Dashboard
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            New Megathread
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="mb-8">
          <CreateMegathreadForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setShowCreateForm(false)}
            isLoading={createMutation.isLoading}
          />
        </div>
      )}

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === "all"
                ? "bg-indigo-100 text-indigo-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All Threads
          </button>
          <button
            onClick={() => setFilter("mine")}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === "mine"
                ? "bg-indigo-100 text-indigo-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Threads
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {megathreads && megathreads.length > 0 ? (
          megathreads.map((thread) => (
            <MegathreadCard key={thread.id} thread={thread} />
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No megathreads</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new megathread.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Megathread
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}