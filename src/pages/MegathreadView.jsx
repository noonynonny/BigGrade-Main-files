import React, { useState, useRef, useEffect } from "react";
import { base44 } from "../base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, User, MessageSquare } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "../utils";
import { format } from "date-fns";

export default function MegathreadView() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const threadId = urlParams.get('id');
  const [replyContent, setReplyContent] = useState("");
  const repliesEndRef = useRef(null);
  const queryClient = useQueryClient();

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

  // Get megathread data
  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ['megathread', threadId],
    queryFn: () => base44.Megathread.get(threadId),
    enabled: !!threadId,
  });

  // Subscribe to replies
  useEffect(() => {
    if (!threadId) return;

    const unsubscribe = base44.ThreadReply.subscribe(
      { megathread_id: threadId },
      (repliesData) => {
        setReplies(repliesData);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [threadId]);

  // Scroll to bottom when replies change
  useEffect(() => {
    repliesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  const createReplyMutation = useMutation({
    mutationFn: (newReply) => base44.ThreadReply.create({
      ...newReply,
      megathread_id: threadId,
      author_name: user?.displayName || 'Anonymous',
      author_email: user?.email || '',
      author_avatar_url: user?.photoURL || '',
      created_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['threadReplies', threadId]);
      setReplyContent("");
    },
  });

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    createReplyMutation.mutate({
      content: replyContent,
    });
  };

  if (!threadId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Megathread not found</h2>
          <p className="text-gray-600 mb-4">Please select a valid megathread to view.</p>
          <Link 
            to={createPageUrl("MegathreadView")} 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Megathreads
          </Link>
        </div>
      </div>
    );
  }

  if (threadLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Megathread not found</h2>
          <p className="text-gray-600 mb-4">The requested megathread could not be found.</p>
          <Link 
            to={createPageUrl("MegathreadView")} 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Megathreads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to={createPageUrl("MegathreadView")} 
          className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Megathreads
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-900">{thread.title}</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {thread.author_type}
            </span>
          </div>
          <div className="mt-4 flex items-center">
            <div className="flex-shrink-0">
              {thread.author_avatar_url ? (
                <img className="h-10 w-10 rounded-full" src={thread.author_avatar_url} alt={thread.author_name} />
              ) : (
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{thread.author_name}</p>
              <p className="text-sm text-gray-500">
                {thread.created_date ? format(new Date(thread.created_date), "MMMM d, yyyy 'at' h:mm a") : "Unknown date"}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="prose max-w-none">
            <p className="text-gray-700">{thread.content}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Replies ({replies.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {replies.length > 0 ? (
            replies.map((reply) => (
              <div key={reply.id} className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {reply.author_avatar_url ? (
                      <img className="h-10 w-10 rounded-full" src={reply.author_avatar_url} alt={reply.author_name} />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{reply.author_name}</p>
                    <p className="text-sm text-gray-500">
                      {reply.created_date ? format(new Date(reply.created_date), "MMMM d, yyyy 'at' h:mm a") : "Unknown date"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 ml-13">
                  <div className="text-gray-700">
                    <p>{reply.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No replies yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Be the first to reply to this megathread.
              </p>
            </div>
          )}
          <div ref={repliesEndRef} />
        </div>

        {user && (
          <div className="p-6 border-t border-gray-200">
            <form onSubmit={handleReplySubmit}>
              <div>
                <label htmlFor="reply" className="block text-sm font-medium text-gray-700">
                  Add a reply
                </label>
                <div className="mt-1">
                  <textarea
                    id="reply"
                    rows={3}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    placeholder="Write your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={!replyContent.trim() || createReplyMutation.isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <Send className="-ml-1 mr-2 h-5 w-5" />
                  {createReplyMutation.isLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}