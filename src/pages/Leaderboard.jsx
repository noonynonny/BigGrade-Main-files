import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "../firebaseClient";
import { Crown, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "../utils";

export default function Leaderboard() {
    // Simple query - just fetch all users from PublicUserDirectory
    const { data: allUsers, isLoading, error } = useQuery({
        queryKey: ['publicLeaderboard'],
        queryFn: async () => {
            console.log("🏆 Fetching leaderboard...");
            const users = await base44.entities.PublicUserDirectory.list('', 999);
            console.log("✅ Fetched", users?.length || 0, "users for leaderboard");
            return users || [];
        },
        refetchInterval: 5000, // Refresh every 5 seconds
        staleTime: 2000,
        retry: 2,
    });

    // Calculate top users
    const topTutors = React.useMemo(() => {
        if (!allUsers) return [];
        return allUsers
            .filter(u => u.user_type === 'tutor')
            .sort((a, b) => (b.tutor_rating || 0) - (a.tutor_rating || 0))
            .slice(0, 10);
    }, [allUsers]);

    const topStudents = React.useMemo(() => {
        if (!allUsers) return [];
        return allUsers
            .filter(u => u.user_type === 'student')
            .sort((a, b) => (b.student_rating || 0) - (a.student_rating || 0))
            .slice(0, 10);
    }, [allUsers]);

    const topPeerHelpers = React.useMemo(() => {
        if (!allUsers) return [];
        return allUsers
            .filter(u => u.user_type === 'student')
            .sort((a, b) => (b.peer_points || 0) - (a.peer_points || 0))
            .slice(0, 10);
    }, [allUsers]);

    if (isLoading) {
        return (
            <div className="space-y-12">
                <div className="text-center">
                    <h1 className="text-6xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "var(--accent)" }}>
                        LEADERBOARDS
                    </h1>
                    <p className="text-xl font-bold text-white mt-2">LOADING...</p>
                </div>
                <div className="text-center py-12">
                    <div className="inline-block w-12 h-12 border-4 border-black border-t-white rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-12">
                <div className="text-center">
                    <h1 className="text-6xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "var(--accent)" }}>
                        LEADERBOARDS
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
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="text-6xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "var(--accent)" }}>
                    LEADERBOARDS
                </h1>
                <p className="text-xl font-bold text-white mt-2">SEE WHO'S ON TOP</p>
                <p className="text-lg font-black text-[#00FF41] mt-2">
                    TRACKING {allUsers.length} USERS • LIVE UPDATES
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Top Tutors */}
                <div>
                    <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3" style={{color: 'var(--primary)'}}>
                        <Crown className="w-8 h-8"/>
                        Top Tutors
                    </h2>
                    <div className="space-y-4">
                        {topTutors.length === 0 ? (
                            <div className="brutalist-card p-6 text-center">
                                <p className="font-black text-black uppercase">No tutors yet</p>
                            </div>
                        ) : (
                            topTutors.map((user, index) => {
                                const rankColors = ['bg-gradient-to-r from-[#FFE500] to-[#FFB627]', 'bg-gradient-to-r from-gray-300 to-gray-100', 'bg-gradient-to-r from-yellow-700 to-yellow-500'];
                                return (
                                    <div key={user.id} className={`brutalist-card p-4 flex items-center gap-4 ${index < 3 ? rankColors[index] : 'bg-white'}`}>
                                        <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border-3 border-black ${index < 3 ? '' : 'bg-[var(--primary)]'}`}>
                                            <span className="text-3xl font-black text-black">{index + 1}</span>
                                        </div>
                                        <Link to={createPageUrl(`ViewProfile?email=${encodeURIComponent(user.user_email)}`)} className="flex items-center gap-3 flex-1">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF0080] to-[#B026FF] rounded-full border-3 border-black flex-shrink-0 overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white font-black text-xl flex items-center justify-center h-full">{user.full_name?.[0] || 'U'}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-black uppercase truncate">{user.full_name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Crown className="w-6 h-6 text-[#FFB627]" />
                                                    <span className="text-2xl font-black text-black">{user.tutor_rating || 0} PTS</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Top Students */}
                <div>
                    <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3" style={{color: 'var(--secondary)'}}>
                        <Star className="w-8 h-8"/>
                        Top Students
                    </h2>
                    <div className="space-y-4">
                        {topStudents.length === 0 ? (
                            <div className="brutalist-card p-6 text-center">
                                <p className="font-black text-black uppercase">No students yet</p>
                            </div>
                        ) : (
                            topStudents.map((user, index) => {
                                const rankColors = ['bg-gradient-to-r from-[#FFE500] to-[#FFB627]', 'bg-gradient-to-r from-gray-300 to-gray-100', 'bg-gradient-to-r from-yellow-700 to-yellow-500'];
                                return (
                                    <div key={user.id} className={`brutalist-card p-4 flex items-center gap-4 ${index < 3 ? rankColors[index] : 'bg-white'}`}>
                                        <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border-3 border-black ${index < 3 ? '' : 'bg-[var(--primary)]'}`}>
                                            <span className="text-3xl font-black text-black">{index + 1}</span>
                                        </div>
                                        <Link to={createPageUrl(`ViewProfile?email=${encodeURIComponent(user.user_email)}`)} className="flex items-center gap-3 flex-1">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF0080] to-[#B026FF] rounded-full border-3 border-black flex-shrink-0 overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white font-black text-xl flex items-center justify-center h-full">{user.full_name?.[0] || 'U'}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-black uppercase truncate">{user.full_name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Star className="w-6 h-6 text-[#00D9FF]" />
                                                    <span className="text-2xl font-black text-black">{user.student_rating || 0} PTS</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Top Peer Helpers */}
                <div>
                    <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3" style={{color: '#00FF41'}}>
                        <Users className="w-8 h-8"/>
                        Top Peer Helpers
                    </h2>
                    <div className="space-y-4">
                        {topPeerHelpers.length === 0 ? (
                            <div className="brutalist-card p-6 text-center">
                                <p className="font-black text-black uppercase">No peer helpers yet</p>
                            </div>
                        ) : (
                            topPeerHelpers.map((user, index) => {
                                const rankColors = ['bg-gradient-to-r from-[#FFE500] to-[#FFB627]', 'bg-gradient-to-r from-gray-300 to-gray-100', 'bg-gradient-to-r from-yellow-700 to-yellow-500'];
                                return (
                                    <div key={user.id} className={`brutalist-card p-4 flex items-center gap-4 ${index < 3 ? rankColors[index] : 'bg-white'}`}>
                                        <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border-3 border-black ${index < 3 ? '' : 'bg-[var(--primary)]'}`}>
                                            <span className="text-3xl font-black text-black">{index + 1}</span>
                                        </div>
                                        <Link to={createPageUrl(`ViewProfile?email=${encodeURIComponent(user.user_email)}`)} className="flex items-center gap-3 flex-1">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF0080] to-[#B026FF] rounded-full border-3 border-black flex-shrink-0 overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white font-black text-xl flex items-center justify-center h-full">{user.full_name?.[0] || 'U'}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-black uppercase truncate">{user.full_name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Users className="w-6 h-6 text-[#00FF41]" />
                                                    <span className="text-2xl font-black text-black">{user.peer_points || 0} PTS</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
