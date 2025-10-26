
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageSquare, Shield, Circle, ArrowLeft, Award, Star, Users, Edit } from "lucide-react";

export default function ViewProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const userEmail = urlParams.get('email');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({});
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch user from PublicUserDirectory (accessible to everyone)
  const { data: user, isLoading } = useQuery({
    queryKey: ['viewPublicUser', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const users = await base44.entities.PublicUserDirectory.filter({ user_email: userEmail });
      return users.length > 0 ? users[0] : null;
    },
    enabled: !!userEmail,
    staleTime: 60000,
  });

  // Fetch detailed user info (only if admin and editing)
  const { data: detailedUser } = useQuery({
    queryKey: ['detailedUser', userEmail],
    queryFn: async () => {
      if (!userEmail || currentUser?.role !== 'admin') return null;
      const users = await base44.entities.User.filter({ email: userEmail });
      return users[0];
    },
    enabled: !!userEmail && currentUser?.role === 'admin' && isEditing,
  });

  React.useEffect(() => {
    if (user) {
      setEditForm({
        full_name: user.full_name || '',
        tutor_rating: user.tutor_rating || 0,
        student_rating: user.student_rating || 0,
        peer_points: user.peer_points || 0,
      });
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: async (data) => {
      // Update User entity
      await base44.entities.User.update(user.user_id, data);
      // Update PublicUserDirectory
      await base44.entities.PublicUserDirectory.update(user.id, {
        full_name: data.full_name,
        tutor_rating: data.tutor_rating,
        student_rating: data.student_rating,
        peer_points: data.peer_points,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewPublicUser', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['publicDirectory'] });
      queryClient.invalidateQueries({ queryKey: ['publicLeaderboard'] });
      setIsEditing(false);
      alert('✅ User updated!');
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-[#00D9FF] border-t-[#FF0080] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Directory')} className="brutalist-button bg-white text-black p-3">
            <ArrowLeft className="w-5 h-5"/>
          </Link>
          <h1 className="text-4xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#00D9FF" }}>
            USER PROFILE
          </h1>
        </div>
        <div className="brutalist-card p-12 text-center">
          <h3 className="text-2xl font-black text-black uppercase">USER NOT FOUND</h3>
          <p className="text-black font-bold mt-2">This user does not exist or has been removed.</p>
          <Link to={createPageUrl('Directory')} className="brutalist-button bg-[#00D9FF] text-black px-6 py-3 mt-4 inline-block">
            BACK TO DIRECTORY
          </Link>
        </div>
      </div>
    );
  }

  const isOnline = user.last_active && (new Date() - new Date(user.last_active)) < 20 * 60 * 1000; // 20 minutes
  const lastSeen = user.last_active ? `Last seen: ${new Date(user.last_active).toLocaleString()}` : "Never";
  const isTutor = user.user_type === 'tutor';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={createPageUrl('Directory')} className="brutalist-button bg-white text-black p-3">
          <ArrowLeft className="w-5 h-5"/>
        </Link>
        <h1 className="text-4xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#00D9FF" }}>
          USER PROFILE
        </h1>
      </div>
      
      <div className="brutalist-card p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar and Status */}
          <div className="flex-shrink-0 text-center">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-[#00D9FF] to-[#B026FF] rounded-full border-4 border-black flex items-center justify-center overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-black text-white">{user.full_name?.[0] || "U"}</span>
                )}
              </div>
              {isOnline && (
                <Circle className="absolute bottom-0 right-0 w-8 h-8 fill-[#00FF41] text-[#00FF41] border-4 border-white rounded-full online-pulse" />
              )}
            </div>
            <div className="mt-4">
              <p className={`text-lg font-black uppercase ${isOnline ? 'text-green-500 neon-text' : 'text-gray-500'}`} style={{color: isOnline ? '#00FF41' : undefined}}>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </p>
              {!isOnline && (
                <p className="text-xs font-bold text-gray-500">{lastSeen}</p>
              )}
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    className="brutalist-input px-4 py-2 font-black text-2xl"
                  />
                ) : (
                  <h2 className="text-4xl font-black text-black uppercase">{user.full_name}</h2>
                )}
                {user.is_qualified_teacher && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#FFE500] border-3 border-black">
                    <Shield className="w-4 h-4 text-black" />
                    <span className="font-black text-black uppercase text-sm">CERTIFIED</span>
                  </div>
                )}
              </div>
              
              {isAdmin && (
                <button
                  onClick={() => {
                    if (isEditing) {
                      updateUserMutation.mutate(editForm);
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className="brutalist-button bg-[#FF0080] text-white px-6 py-2 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {isEditing ? 'SAVE' : 'EDIT USER'}
                </button>
              )}
            </div>
            
            {/* Points Display - Editable by admin */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              {isTutor ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#FFB627] border-3 border-black">
                  <Award className="w-6 h-6 text-black"/>
                  <div>
                    <p className="text-xs font-black text-black uppercase">Tutor Points</p>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.tutor_rating}
                        onChange={(e) => setEditForm({...editForm, tutor_rating: parseInt(e.target.value) || 0})}
                        className="brutalist-input w-20 px-2 py-1 text-xl font-black"
                      />
                    ) : (
                      <p className="text-2xl font-black text-black">{user.tutor_rating || 0}</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#00D9FF] border-3 border-black">
                    <Star className="w-6 h-6 text-black"/>
                    <div>
                      <p className="text-xs font-black text-black uppercase">Student Points</p>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.student_rating}
                          onChange={(e) => setEditForm({...editForm, student_rating: parseInt(e.target.value) || 0})}
                          className="brutalist-input w-20 px-2 py-1 text-xl font-black"
                        />
                      ) : (
                        <p className="text-2xl font-black text-black">{user.student_rating || 0}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#00FF41] border-3 border-black">
                    <Users className="w-6 h-6 text-black"/>
                    <div>
                      <p className="text-xs font-black text-black uppercase">Peer Points</p>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.peer_points}
                          onChange={(e) => setEditForm({...editForm, peer_points: parseInt(e.target.value) || 0})}
                          className="brutalist-input w-20 px-2 py-1 text-xl font-black"
                        />
                      ) : (
                        <p className="text-2xl font-black text-black">{user.peer_points || 0}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6">
              <h4 className="font-black text-black uppercase mb-2">USER TYPE</h4>
              <div className="flex items-center gap-2 px-4 py-2 bg-white border-3 border-black w-fit">
                {isTutor ? (
                  <>
                    <Shield className="w-5 h-5 text-black" />
                    <span className="font-black text-black uppercase">TUTOR</span>
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 text-black" />
                    <span className="font-black text-black uppercase">STUDENT</span>
                  </>
                )}
              </div>
            </div>
            
            {currentUser?.email !== user.user_email && (
              <Link
                to={createPageUrl(`Chat?with=${encodeURIComponent(user.user_email)}`)}
                className="mt-6 brutalist-button bg-gradient-to-r from-[#FF0080] to-[#B026FF] text-white px-6 py-3 flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <MessageSquare className="w-5 h-5" />
                CHAT WITH {user.full_name?.split(' ')[0] || 'USER'}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
