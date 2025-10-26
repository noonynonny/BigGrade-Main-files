import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Briefcase } from "lucide-react";
import MarketplaceRequestCard from "../components/marketplace/MarketplaceRequestCard";
import CreateMarketplaceRequestForm from "../components/marketplace/CreateMarketplaceRequestForm";

export default function RequestHub() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({ compensation: "all", subject: "all" });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: requests, isLoading } = useQuery({
    queryKey: ['marketplaceRequests', filters, user?.user_type],
    queryFn: async () => {
      const queryFilters = { status: 'open', request_type: 'seeking_help' };
      if (filters.compensation !== 'all') queryFilters.compensation_type = filters.compensation;
      if (filters.subject !== 'all') queryFilters.subject = filters.subject;
      
      const allRequests = await base44.entities.MarketplaceRequest.filter(queryFilters, '-created_date', 100);
      
      // Filter based on user type and help_from preference
      return allRequests.filter(req => {
        // Anyone can see "anyone" requests
        if (req.help_from === 'anyone') return true;
        
        // Students don't see tutor-only requests
        if (user?.user_type === 'student' && req.help_from === 'tutor') return false;
        
        // Tutors don't see student-only requests
        if (user?.user_type === 'tutor' && req.help_from === 'student') return false;
        
        // Tutors can see tutor-only, students can see student-only
        if (req.help_from === 'tutor' && user?.user_type === 'tutor') return true;
        if (req.help_from === 'student' && user?.user_type === 'student') return true;
        
        return false;
      });
    },
    initialData: [],
    enabled: !!user,
    refetchInterval: 5000, // Check for new requests every 5 seconds
    staleTime: 2000,
  });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MarketplaceRequest.create({
      ...data,
      request_type: 'seeking_help',
      author_email: user.email,
      author_name: user.full_name,
      author_avatar_url: user.avatar_url,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceRequests'] });
      setShowCreateForm(false);
    },
  });

  const subjects = ["all", "math", "science", "programming", "writing", "languages", "history", "business", "art", "music", "other"];
  const compensationTypes = { all: "ALL", free: "FREE", paid: "PAID", undecided: "UNDECIDED" };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-5xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#00D9FF" }}>
            REQUEST HUB
          </h1>
          <p className="text-xl font-bold text-white mt-2">
            {user?.user_type === 'student' ? 'FIND HELP OR HELP OTHERS' : 'HELP STUDENTS IN NEED'}
          </p>
        </div>
        {user?.user_type === 'student' && (
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="brutalist-button bg-gradient-to-r from-[#FF0080] to-[#FFE500] text-black px-6 py-3 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            NEW REQUEST
          </button>
        )}
      </div>

      {showCreateForm && user?.user_type === 'student' && (
        <CreateMarketplaceRequestForm
          user={user}
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowCreateForm(false)}
          isSubmitting={createMutation.isPending}
        />
      )}

      <div className="brutalist-card p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-black text-black uppercase mb-2">COMPENSATION</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(compensationTypes).map(([key, value]) => (
                <button key={key} onClick={() => setFilters(f => ({ ...f, compensation: key }))} className={`brutalist-button px-3 py-1 text-sm ${filters.compensation === key ? "bg-[#FFE500] text-black" : "bg-white text-black"}`}>{value}</button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-black text-black uppercase mb-2">SUBJECT</h4>
             <select onChange={(e) => setFilters(f => ({ ...f, subject: e.target.value }))} value={filters.subject} className="brutalist-input w-full px-4 py-2 font-bold">
                {subjects.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="inline-block w-12 h-12 border-4 border-black border-t-[#00D9FF] rounded-full animate-spin"></div></div>
      ) : requests.length === 0 ? (
        <div className="brutalist-card p-12 text-center"><Briefcase className="w-16 h-16 mx-auto mb-4 text-black" /><h3 className="text-2xl font-black text-black uppercase">NO OPEN REQUESTS</h3><p className="text-black font-bold mt-2">CHECK FILTERS OR BE THE FIRST TO POST!</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {requests.map(req => ( <MarketplaceRequestCard key={req.id} request={req} currentUser={user} /> ))}
        </div>
      )}
    </div>
  );
}
