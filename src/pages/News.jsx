import React from "react";
import { base44 } from "../firebaseClient";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, Calendar, User } from "lucide-react";
import { format } from "date-fns";

export default function News() {
  const { data: newsPosts, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: () => base44.entities.NewsPost.filter({ is_active: true }, '-created_date', 50),
    initialData: [],
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#FFE500" }}>
          📰 NEWS & ANNOUNCEMENTS
        </h1>
        <p className="text-xl font-bold text-white mt-2">
          STAY UPDATED WITH BIGGRADE
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-[#FFE500] border-t-[#FF0080] rounded-full animate-spin"></div>
        </div>
      ) : newsPosts.length === 0 ? (
        <div className="brutalist-card p-12 text-center">
          <Newspaper className="w-16 h-16 mx-auto mb-4 text-black" />
          <h3 className="text-2xl font-black text-black uppercase">NO NEWS YET</h3>
          <p className="text-black font-bold mt-2">Check back later for updates!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {newsPosts.map((post, index) => (
            <div 
              key={post.id} 
              className="brutalist-card p-8"
              style={{
                transform: index % 2 !== 0 ? 'rotate(0.3deg)' : 'rotate(-0.3deg)'
              }}
            >
              {post.image_url && (
                <div className="mb-6 border-4 border-black">
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-600">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.created_date), "MMMM d, yyyy 'at' h:mm a")}
              </div>

              <h2 className="text-3xl font-black text-black uppercase mb-4 leading-tight">
                {post.title}
              </h2>

              <div className="p-6 bg-white border-3 border-black">
                <p className="text-lg font-bold text-black whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-600">
                <User className="w-4 h-4" />
                Posted by: {post.author_email === 'admin@biggrade.system' ? 'BIGGRADE ADMIN' : post.author_email}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
