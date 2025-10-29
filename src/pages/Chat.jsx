import React, { useState, useEffect, useRef } from "react";
import { base44 } from "../base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, ArrowLeft, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { format } from "date-fns";

export default function Chat() {
  const urlParams = new URLSearchParams(window.location.search);
  const otherUserEmail = urlParams.get('with');
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: otherUser } = useQuery({
    queryKey: ['otherUser', otherUserEmail],
    queryFn: async () => {
      const users = await base44.entities.PublicUserDirectory.filter({ user_email: otherUserEmail });
      return users[0];
    },
    enabled: !!otherUserEmail,
    refetchInterval: 5000,
  });

  const conversationId = [user?.email, otherUserEmail].sort().join('_');

  const { data: messages, isLoading } = useQuery({
    queryKey: ['chatMessages', conversationId],
    queryFn: async () => {
      const msgs = await base44.entities.ChatMessage.filter({ conversation_id: conversationId }, 'created_date', 100);
      
      // Mark received messages as read
      const unreadMessages = msgs.filter(m => m.receiver_email === user?.email && !m.is_read);
      
      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map(msg => base44.entities.ChatMessage.update(msg.id, { is_read: true }))
        );

        return msgs.map(m => {
          if (unreadMessages.some(unread => unread.id === m.id)) {
            return { ...m, is_read: true };
          }
          return m;
        });
      }
      
      return msgs;
    },
    enabled: !!conversationId && !!user,
    refetchInterval: 1000, // Check every 1 second for near-instant messaging
    staleTime: 500,
    initialData: [],
  });

  const sendMutation = useMutation({
    mutationFn: (messageData) => base44.entities.ChatMessage.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['allMessages'] });
      queryClient.invalidateQueries({ queryKey: ['unreadMessages'] });
      setMessage("");
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !user || !otherUserEmail) return;

    sendMutation.mutate({
      conversation_id: conversationId,
      sender_email: user.email,
      receiver_email: otherUserEmail,
      message: message.trim(),
      sender_name: user.full_name
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isOnline = otherUser?.last_active && 
    (new Date() - new Date(otherUser.last_active)) < 20 * 60 * 1000; // 20 minutes

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="brutalist-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={createPageUrl("ChatList")}
              className="brutalist-button bg-white text-black p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#00D9FF] to-[#B026FF] rounded-full border-3 border-black flex items-center justify-center overflow-hidden">
                  {otherUser?.avatar_url ? (
                    <img src={otherUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-white">
                      {otherUserEmail?.[0].toUpperCase()}
                    </span>
                  )}
                </div>
                {isOnline && (
                  <Circle className="absolute bottom-0 right-0 w-4 h-4 fill-[#00FF41] text-[#00FF41] border-2 border-white rounded-full online-pulse" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-black uppercase">
                  {otherUser?.full_name || otherUserEmail?.split('@')[0]}
                </h2>
                <p className="text-sm font-bold text-gray-600">
                  {isOnline ? "🟢 ONLINE" : "OFFLINE"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="brutalist-card p-6 h-[500px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-3 border-black border-t-[#00FF41] rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-black text-black uppercase">NO MESSAGES YET</p>
              <p className="font-bold text-gray-600 mt-2">START THE CONVERSATION!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_email === user?.email;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-4 border-3 border-black ${
                      isMe 
                        ? 'bg-gradient-to-r from-[#00D9FF] to-[#00FF41]' 
                        : 'bg-white'
                    }`}
                    style={{
                      boxShadow: isMe ? '4px 4px 0 0 #000' : '-4px 4px 0 0 #000'
                    }}
                  >
                    <p className="font-bold text-black break-words">
                      {msg.message}
                    </p>
                    <p className="text-xs font-bold text-gray-700 mt-2">
                      {format(new Date(msg.created_date), "h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="TYPE YOUR MESSAGE..."
            className="brutalist-input flex-1 px-4 py-3 font-bold"
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMutation.isPending}
            className="brutalist-button bg-gradient-to-r from-[#FF0080] to-[#B026FF] text-white px-6 py-3"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
