import React from "react";
import { base44 } from "../firebaseClient";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { format } from "date-fns";

export default function ChatList() {
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

  // Mock chat data - in a real app, this would come from Firestore
  const mockChats = [
    {
      id: 1,
      name: "Study Group",
      lastMessage: "See you in the library at 3pm",
      timestamp: new Date(Date.now() - 3600000),
      unread: 2,
      avatar: null
    },
    {
      id: 2,
      name: "Math Help",
      lastMessage: "Thanks for explaining that concept!",
      timestamp: new Date(Date.now() - 86400000),
      unread: 0,
      avatar: null
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Your Chats
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Chat
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {mockChats.map((chat) => (
            <li key={chat.id}>
              <Link to={createPageUrl(`Chat?id=${chat.id}`)} className="block hover:bg-gray-50">
                <div className="flex items-center px-4 py-4 sm:px-6">
                  <div className="min-w-0 flex-1 flex items-center">
                    <div className="flex-shrink-0">
                      {chat.avatar ? (
                        <img className="h-12 w-12 rounded-full" src={chat.avatar} alt="" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-indigo-600" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                      <div>
                        <p className="text-sm font-medium text-indigo-600 truncate">{chat.name}</p>
                        <p className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="truncate">{chat.lastMessage}</span>
                        </p>
                      </div>
                      <div className="hidden md:block">
                        <div>
                          <p className="text-sm text-gray-900">
                            Last active <time dateTime={chat.timestamp.toISOString()}>{format(chat.timestamp, "MMM d, h:mm a")}</time>
                          </p>
                          {chat.unread > 0 && (
                            <p className="mt-2 flex items-center text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {chat.unread} unread
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}