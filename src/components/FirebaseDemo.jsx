import React, { useState, useEffect } from 'react';
import firebaseClient from '../firebase/firebaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const FirebaseDemo = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return new Promise((resolve) => {
        const unsubscribe = base44.auth((user) => {
          unsubscribe();
          resolve(user);
        });
      });
    },
    staleTime: Infinity,
  });

  // Get megathreads
  const { data: megathreads, isLoading } = useQuery({
    queryKey: ['demoMegathreads'],
    queryFn: () => base44.Megathread.filter({}, '-created_date', 10),
  });

  // Create megathread mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.Megathread.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['demoMegathreads']);
      setTitle('');
      setContent('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    createMutation.mutate({
      title,
      content,
      author_type: 'student',
      author_name: user.displayName || 'Anonymous',
      author_email: user.email || '',
      created_date: new Date().toISOString()
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Firebase Demo</h1>
      
      {!user ? (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-4">Please sign in with Google to use the demo.</p>
          <button
            onClick={() => base44.signIn()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in with Google
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Megathread</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                  placeholder="Enter title"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                  placeholder="Enter content"
                />
              </div>
              <button
                type="submit"
                disabled={!title.trim() || createMutation.isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {createMutation.isLoading ? 'Creating...' : 'Create Megathread'}
              </button>
            </form>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Megathreads</h2>
            {megathreads && megathreads.length > 0 ? (
              <div className="space-y-4">
                {megathreads.map((thread) => (
                  <div key={thread.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900">{thread.title}</h3>
                    <p className="text-gray-600 mt-2">{thread.content}</p>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <span>By {thread.author_name}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(thread.created_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No megathreads found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FirebaseDemo;