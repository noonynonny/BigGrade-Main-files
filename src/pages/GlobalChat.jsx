import React, { useState, useEffect, useRef } from "react";
import { base44 } from "../base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { format } from "date-fns";

export default function GlobalChat() {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['globalChatMessages'],
    queryFn: () => base44.entities.GlobalChatMessage.list('created_date', 100),
    refetchInterval: 1000, // Check every 1 second for near-instant messaging
    staleTime: 500,
    initialData: [],
  });

  const sendMutation = useMutation({
    mutationFn: (messageData) => base44.entities.GlobalChatMessage.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalChatMessages'] });
      setMessage("");
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    sendMutation.mutate({
      sender_email: user.email,
      sender_name: user.full_name,
      sender_avatar_url: user.avatar_url,
      message: message.trim(),
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#FFE500" }}>
          GLOBAL CHAT
        </h1>
        <p className="text-xl font-bold text-white mt-2">
          CONNECT WITH EVERYONE
        </p>
      </div>

      {/* Messages */}
      <div className="brutalist-card p-6 h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-3 border-black border-t-[#FFE500] rounded-full animate-spin"></div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_email === user?.email;
              return (
                <div key={msg.id} className="flex items-start gap-4">
                  <Link to={createPageUrl(`ViewProfile?email=${encodeURIComponent(msg.sender_email)}`)}>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00D9FF] to-[#B026FF] rounded-full border-3 border-black flex items-center justify-center overflow-hidden flex-shrink-0">
                      {msg.sender_avatar_url ? (
                        <img src={msg.sender_avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-black text-white">
                          {msg.sender_name?.[0].toUpperCase() || "X"}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-black uppercase">
                        {isMe ? "YOU" : msg.sender_name}
                      </h4>
                      <span className="text-xs font-bold text-gray-500">
                        {format(new Date(msg.created_date), "h:mm a")}
                      </span>
                    </div>
                    <p className="p-3 bg-white border-3 border-black font-bold text-black break-words mt-1" style={{boxShadow: '3px 3px 0 0 #000'}}>
                      {msg.message}
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
            placeholder="SAY SOMETHING TO THE WORLD..."
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
