import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, User, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "../../base44Client";

export default function MegathreadCard({ thread }) {
  const [replyCount, setReplyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get reply count for this megathread
  useEffect(() => {
    if (!thread?.id) return;

    const unsubscribe = base44.ThreadReply.subscribe(
      { megathread_id: thread.id },
      (replies) => {
        setReplyCount(replies.length);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [thread?.id]);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {thread.title}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {thread.author_type}
          </span>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
          {thread.author_name}
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <div className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Content</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {thread.content}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div className="flex items-center">
                <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                {thread.created_date
                  ? format(new Date(thread.created_date), "MMMM d, yyyy")
                  : "N/A"}
              </div>
              <div className="flex items-center mt-1">
                <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                {thread.created_date
                  ? format(new Date(thread.created_date), "h:mm a")
                  : "N/A"}
              </div>
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Activity</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div className="flex items-center">
                <MessageCircle className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                {loading ? (
                  <span className="text-gray-500">Loading...</span>
                ) : (
                  <span>{replyCount} replies</span>
                )}
              </div>
            </dd>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="flex justify-end">
          <Link
            to={`/MegathreadView?id=${thread.id}`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Discussion
          </Link>
        </div>
      </div>
    </div>
  );
}