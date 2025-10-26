import React from "react";
import { MessageSquare, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function MegathreadCard({ thread, isOdd }) {
  // Get reply count for this thread
  const { data: replies } = useQuery({
    queryKey: ['threadRepliesCount', thread.id],
    queryFn: () => base44.entities.ThreadReply.filter({ megathread_id: thread.id }),
    initialData: []
  });

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

  return (
    <Link
      to={createPageUrl(`MegathreadView?id=${thread.id}`)}
      className="brutalist-card bg-white p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0_0_#000] transition-all block"
      style={{
        transform: isOdd ? 'rotate(0.5deg)' : 'rotate(-0.5deg)'
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="px-3 py-1 border-3 border-black font-black text-xs uppercase"
          style={{ backgroundColor: subjectColors[thread.subject] || "#F5F5F5" }}
        >
          {thread.subject}
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-black">
          <Calendar className="w-4 h-4" />
          {format(new Date(thread.created_date), "MMM d")}
        </div>
      </div>

      <h3 className="text-2xl font-black text-black uppercase mb-3 leading-tight">
        {thread.title}
      </h3>

      <p className="text-black font-bold mb-4 line-clamp-3">
        {thread.content}
      </p>

      <div className="flex items-center justify-between pt-4 border-t-3 border-black">
        <div className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#00FFFF] border-3 border-black flex items-center justify-center group-hover:bg-[#FF0080] transition-colors">
            <User className="w-4 h-4 text-black" />
          </div>
          <span className="font-black text-black text-sm group-hover:underline">
            {thread.author_name}
          </span>
        </div>
        <div className="flex items-center gap-2 text-black font-black">
          <MessageSquare className="w-5 h-5" />
          <span className="text-lg">{replies.length}</span>
        </div>
      </div>
    </Link>
  );
}
