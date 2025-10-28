import React from "react";
import { base44 } from "../firebaseClient";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Shield, BookOpen, Circle, Award, Star, Users } from "lucide-react";

export default function Directory() {
  // Simple query - just fetch all users from PublicUserDirectory
  const { data: allUsers, isLoading, error } = useQuery({
    queryKey: ['directoryAllUsers'],
    queryFn: async () => {
      console.log("🔍 Fetching directory users...");
      const users = await base44.entities.PublicUserDirectory.list('-last_active', 999);
      console.log("✅ Fetched", users?.length || 0, "users");
      return users || [];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 2000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#B026FF" }}>
            USER DIRECTORY
          </h1>
          <p className="text-xl font-bold text-white mt-2">LOADING USERS...</p>
        </div>
        <div className="brutalist-card p-12 text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#B026FF] border-t-[#FF0080] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#B026FF" }}>
            USER DIRECTORY
          </h1>
        </div>
        <div className="brutalist-card p-12 text-center bg-red-100">
          <h3 className="text-2xl font-black text-black uppercase mb-2">⚠️ ERROR</h3>
          <p className="text-black font-bold">{error.message}</p>
          <button onClick={() => window.location.reload()} className="brutalist-button bg-[#FF0080] text-white px-6 py-3 mt-4">
            REFRESH PAGE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#B026FF" }}>
          USER DIRECTORY
        </h1>
        <p className="text-xl font-bold text-white mt-2">ALL PLATFORM USERS</p>
        <p className="text-lg font-black text-[#00FF41] mt-2">
          TOTAL: {allUsers.length} USERS • LIVE UPDATES
        </p>
      </div>

      {allUsers.length === 0 ? (
        <div className="brutalist-card p-12 text-center">
          <h3 className="text-2xl font-black text-black uppercase">NO USERS YET</h3>
          <p className="text-black font-bold mt-2">Be the first to register!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allUsers.map(user => {
            const isOnline = user.last_active && (new Date() - new Date(user.last_active)) < 20 * 60 * 1000;
            const isTutor = user.user_type === 'tutor';
            
            return (
              <Link
                key={user.id}
                to={createPageUrl(`ViewProfile?email=${encodeURIComponent(user.user_email)}`)}
                className="brutalist-card p-4 block hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FF0080] to-[#B026FF] rounded-full border-3 border-black flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-black text-white">{user.full_name?.[0]?.toUpperCase() || "U"}</span>
                      )}
                    </div>
                    {isOnline && (
                      <Circle className="absolute bottom-0 right-0 w-5 h-5 fill-[#00FF41] text-[#00FF41] border-2 border-white rounded-full online-pulse" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-black uppercase truncate">{user.full_name}</h3>
                    
                    {user.role === 'admin' ? (
                      <div className="flex items-center gap-1 text-xs font-black text-white px-2 py-0.5 bg-black border-2 border-[#FF0080] w-fit mt-1">
                        <Shield className="w-3 h-3" />
                        ADMIN
                      </div>
                    ) : isTutor ? (
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-1 text-xs font-black text-white px-2 py-0.5 bg-[#B026FF] border-2 border-black w-fit">
                          <Shield className="w-3 h-3" />
                          TUTOR
                        </div>
                        <div className="flex items-center gap-1 text-xs font-black text-black px-2 py-0.5 bg-[#FFB627] border-2 border-black w-fit">
                          <Award className="w-3 h-3" />
                          {user.tutor_rating || 0} PTS
                        </div>
                      </div>
                    ) : (
                       <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-1 text-xs font-black text-black px-2 py-0.5 bg-white border-2 border-black w-fit">
                          <BookOpen className="w-3 h-3" />
                          STUDENT
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs font-black text-black px-2 py-0.5 bg-[#00D9FF] border-2 border-black">
                            <Star className="w-3 h-3" />
                            {user.student_rating || 0}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-black text-black px-2 py-0.5 bg-[#00FF41] border-2 border-black">
                            <Users className="w-3 h-3" />
                            {user.peer_points || 0}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
