import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, User, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function MegathreadView() {
  const urlParams = new URLSearchParams(window.location.search);
  const threadId = urlParams.get('id');
  const [replyContent, setReplyContent] = useState("");
  const repliesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: megathread } = useQuery({
    queryKey: ['megathread', threadId],
    queryFn: async () => {
      const threads = await base44.entities.Megathread.filter({ id: threadId });
      return threads[0];
    },
    enabled: !!threadId,
  });

  const { data: replies, isLoading } = useQuery({
    queryKey: ['threadReplies', threadId],
    queryFn: () => base44.entities.ThreadReply.filter({ megathread_id: threadId }, 'created_date', 200),
    enabled: !!threadId,
    refetchInterval: 3000,
    initialData: [],
  });

  const postReplyMutation = useMutation({
    mutationFn: (data) => base44.entities.ThreadReply.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threadReplies', threadId] });
      setReplyContent("");
    },
  });

  useEffect(() => {
    repliesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;

    postReplyMutation.mutate({
      megathread_id: threadId,
      author_email: user.email,
      author_name: user.full_name,
      author_avatar_url: user.avatar_url,
      author_type: user.user_type,
      content: replyContent.trim()
    });
  };

  if (!megathread) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-[#00D9FF] border-t-[#FF0080] rounded-full animate-spin"></div>
      </div>
    );
  }

  const subjectColors = {
    math: "#00FFFF",
    science: "#FF1493",
    programming: "#FFFF00",
    writing: "#00FF00",
    languages: "#FF6B6B",
    history: "#9D4EDD",
    business: "#06FFA5",
    art: "#FFB627",
    music: "#FF499E",
    general: "#06D6A0",
    other: "#EF476F"
  };

  const backUrl = megathread.author_type === 'student' 
    ? createPageUrl('StudentsDashboard') 
    : createPageUrl('TutorsDashboard');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={backUrl} className="brutalist-button bg-white text-black p-3">
          <ArrowLeft className="w-5 h-5"/>
        </Link>
        <h1 className="text-4xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "var(--primary)" }}>
          MEGATHREAD
        </h1>
      </div>

      {/* Original Megathread Post */}
      <div className="brutalist-card p-8 bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="px-4 py-2 border-3 border-black font-black text-sm uppercase"
            style={{ backgroundColor: subjectColors[megathread.subject] || "#F5F5F5" }}
          >
            {megathread.subject}
          </div>
          <div className="text-sm font-bold text-gray-500">
            {format(new Date(megathread.created_date), "MMM d, yyyy 'at' h:mm a")}
          </div>
        </div>

        <h2 className="text-4xl font-black text-black uppercase mb-4 leading-tight">
          {megathread.title}
        </h2>

        <div className="flex items-center gap-3 mb-6">
          <Link to={createPageUrl(`ViewProfile?email=${encodeURIComponent(megathread.created_by)}`)}>
            <div className="w-14 h-14 bg-gradient-to-br from-[#00D9FF] to-[#B026FF] rounded-full border-3 border-black flex items-center justify-center overflow-hidden">
              <User className="w-7 h-7 text-white" />
            </div>
          </Link>
          <div>
            <p className="font-black text-black text-lg">{megathread.author_name}</p>
            <p className="font-bold text-gray-600 text-sm uppercase">
              {megathread.author_type === 'tutor' ? '🎓 TUTOR' : '📚 STUDENT'}
            </p>
          </div>
        </div>

        <div className="p-6 bg-white border-3 border-black">
          <p className="text-black font-bold text-lg whitespace-pre-wrap">
            {megathread.content}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 text-gray-600">
          <MessageSquare className="w-5 h-5" />
          <span className="font-black text-sm">{replies.length} REPLIES</span>
        </div>
      </div>

      {/* Replies Section */}
      <div className="brutalist-card p-6">
        <h3 className="text-2xl font-black text-black uppercase mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          DISCUSSION ({replies.length})
        </h3>

        <div className="space-y-4 mb-6 max-h-[600px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-3 border-black border-t-[var(--primary)] rounded-full animate-spin"></div>
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-12 border-3 border-dashed border-gray-300">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-black text-gray-500 uppercase">NO REPLIES YET</p>
              <p className="font-bold text-gray-400 text-sm mt-1">Be the first to join the discussion!</p>
            </div>
          ) : (
            replies.map((reply, index) => (
              <div 
                key={reply.id} 
                className="brutalist-card p-4 bg-white hover:bg-gray-50 transition-colors"
                style={{
                  transform: index % 2 !== 0 ? 'rotate(0.3deg)' : 'rotate(-0.3deg)'
                }}
              >
                <div className="flex items-start gap-3">
                  <Link to={createPageUrl(`ViewProfile?email=${encodeURIComponent(reply.author_email)}`)}>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FF0080] to-[#B026FF] rounded-full border-3 border-black flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {reply.author_avatar_url ? (
                        <img src={reply.author_avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link to={createPageUrl(`ViewProfile?email=${encodeURIComponent(reply.author_email)}`)}>
                        <p className="font-black text-black hover:underline">{reply.author_name}</p>
                      </Link>
                      <span className={`text-xs px-2 py-0.5 border-2 border-black font-black ${
                        reply.author_type === 'tutor' ? 'bg-[#B026FF] text-white' : 'bg-[#00D9FF] text-black'
                      }`}>
                        {reply.author_type === 'tutor' ? '🎓 TUTOR' : '📚 STUDENT'}
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        {format(new Date(reply.created_date), "MMM d 'at' h:mm a")}
                      </span>
                    </div>
                    <p className="font-bold text-black whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={repliesEndRef} />
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSubmit} className="space-y-3 border-t-4 border-black pt-6">
          <label className="block font-black text-black uppercase">
            POST YOUR REPLY
          </label>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="brutalist-input w-full px-4 py-3 font-bold h-32 resize-none"
            placeholder="SHARE YOUR THOUGHTS..."
            required
          />
          <button
            type="submit"
            disabled={!replyContent.trim() || postReplyMutation.isPending}
            className="brutalist-button bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black px-6 py-3 flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            {postReplyMutation.isPending ? "POSTING..." : "POST REPLY"}
          </button>
        </form>
      </div>
    </div>
  );
}
