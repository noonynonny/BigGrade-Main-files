import React, { useState } from "react";
import { base44 } from "../base44Client";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, ArrowRight } from "lucide-react";
import MarketplaceRequestCard from "../components/marketplace/MarketplaceRequestCard";

export default function MyGigs() {
  const [filter, setFilter] = useState("my_posts"); // "my_posts", "accepted_gigs"
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: requests, isLoading } = useQuery({
    queryKey: ['myGigs', user?.email, filter],
    queryFn: async () => {
      if (!user?.email) return [];
      if (filter === "my_posts") {
        // Show all posts (open, completed, cancelled) - exclude in_session and awaiting_payment
        const posts = await base44.entities.MarketplaceRequest.filter({ author_email: user.email }, '-created_date', 100);
        return posts.filter(p => p.status !== 'in_session' && p.status !== 'awaiting_payment');
      }
      if (filter === "accepted_gigs") {
        // Show all accepted gigs (completed, cancelled) - exclude in_session and awaiting_payment
        const gigs = await base44.entities.MarketplaceRequest.filter({ responder_email: user.email }, '-created_date', 100);
        return gigs.filter(g => g.status !== 'in_session' && g.status !== 'awaiting_payment');
      }
      return [];
    },
    enabled: !!user?.email,
    initialData: [],
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#00FF41" }}>
          MY GIGS
        </h1>
        <p className="text-xl font-bold text-white mt-2">
          VIEW YOUR COMPLETED & CANCELLED SESSIONS
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={() => setFilter('my_posts')} className={`brutalist-button px-6 py-3 flex items-center gap-2 ${filter === 'my_posts' ? 'bg-[#00FF41] text-black' : 'bg-white text-black'}`}>
          <ArrowRight className="w-5 h-5" /> MY POSTS
        </button>
        <button onClick={() => setFilter('accepted_gigs')} className={`brutalist-button px-6 py-3 flex items-center gap-2 ${filter === 'accepted_gigs' ? 'bg-[#00FF41] text-black' : 'bg-white text-black'}`}>
          <Briefcase className="w-5 h-5" /> ACCEPTED GIGS
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="inline-block w-12 h-12 border-4 border-black border-t-[#00FF41] rounded-full animate-spin"></div></div>
      ) : requests.length === 0 ? (
        <div className="brutalist-card p-12 text-center"><Briefcase className="w-16 h-16 mx-auto mb-4 text-black" /><h3 className="text-2xl font-black text-black uppercase">NO PAST SESSIONS</h3><p className="text-black font-bold mt-2">COMPLETE SOME SESSIONS TO SEE THEM HERE!</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {requests.map(req => ( <MarketplaceRequestCard key={req.id} request={req} currentUser={user} isMyGigsView={true} /> ))}
        </div>
      )}
    </div>
  );
}
