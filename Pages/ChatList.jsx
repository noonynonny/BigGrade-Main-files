
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function ChatList() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['allMessages', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const sent = await base44.entities.ChatMessage.filter({ sender_email: user.email }, '-created_date', 100);
      const received = await base44.entities.ChatMessage.filter({ receiver_email: user.email }, '-created_date', 100);
      return [...sent, ...received];
    },
    enabled: !!user?.email,
    refetchInterval: 30000, // Add 30 second refetch
    staleTime: 20000,
    initialData: [],
  });

  // Group by conversation
  const conversations = React.useMemo(() => {
    const convMap = new Map();
    
    messages.forEach(msg => {
      const conversationId = msg.conversation_id;
      if (!convMap.has(conversationId)) {
        const otherEmail = msg.sender_email === user?.email ? msg.receiver_email : msg.sender_email;
        convMap.set(conversationId, {
          conversationId,
          otherEmail,
          lastMessage: msg,
          unreadCount: 0,
          messages: []
        });
      }
      
      const conv = convMap.get(conversationId);
      conv.messages.push(msg);
      
      if (msg.receiver_email === user?.email && !msg.is_read) {
        conv.unreadCount++;
      }
      
      if (new Date(msg.created_date) > new Date(conv.lastMessage.created_date)) {
        conv.lastMessage = msg;
      }
    });
    
    return Array.from(convMap.values()).sort((a, b) => 
      new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date)
    );
  }, [messages, user]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#00FF41" }}>
          MESSAGES
        </h1>
        <p className="text-xl font-bold text-white mt-2">
          YOUR CONVERSATIONS
        </p>
      </div>

      {/* Conversations List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-[#00FF41] border-t-[#FF0080] rounded-full animate-spin"></div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="brutalist-card p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-black" />
          <h3 className="text-2xl font-black text-black uppercase">NO MESSAGES YET</h3>
          <p className="text-black font-bold mt-2">START A CONVERSATION!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv, index) => (
            <Link
              key={conv.conversationId}
              to={createPageUrl(`Chat?with=${encodeURIComponent(conv.otherEmail)}`)}
              className="brutalist-card p-6 block hover:translate-x-1 hover:translate-y-1 transition-all"
              style={{
                transform: index % 2 !== 0 ? 'rotate(0.5deg)' : 'rotate(-0.5deg)'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FF0080] to-[#B026FF] rounded-full border-3 border-black flex items-center justify-center">
                      <span className="text-xl font-black text-white">
                        {conv.otherEmail[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-black uppercase">
                        {conv.otherEmail.split('@')[0]}
                      </h3>
                      <p className="text-sm font-bold text-gray-600">
                        {conv.otherEmail}
                      </p>
                    </div>
                  </div>
                  <p className="text-black font-bold ml-15 line-clamp-2">
                    {conv.lastMessage.message}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-black">
                    <Clock className="w-4 h-4" />
                    {format(new Date(conv.lastMessage.created_date), "MMM d, h:mm a")}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-8 h-8 bg-[#FF0080] text-white text-sm font-black flex items-center justify-center rounded-full border-3 border-black online-pulse">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
