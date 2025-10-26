
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { GraduationCap, Users, MessageSquare, Briefcase, Search, Zap, UserCircle, Globe, BookUser, LogOut, Settings, Sun, Moon, Tv, BarChart, Shield, Newspaper } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AccountSetup from './pages/AccountSetup';

const themes = {
  cyberpunk: { name: "Cyberpunk", icon: Sun, colors: ["#00D9FF", "#FF0080"] },
  vaporwave: { name: "Vaporwave", icon: Moon, colors: ["#FF71CE", "#01CDFE"] },
  outrun: { name: "Outrun", icon: Tv, colors: ["#FF4AD8", "#4194FF"] },
  monochrome: { name: "Monochrome", icon: Settings, colors: ["#000000", "#FFFF00"] },
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [lastMessageCount, setLastMessageCount] = React.useState(0);
  const [isIdle, setIsIdle] = React.useState(false); // true if user is idle
  const idleTimeoutRef = React.useRef(null);

  // Function to reset the idle timer
  const resetIdleTimer = React.useCallback(() => {
    clearTimeout(idleTimeoutRef.current);
    setIsIdle(false);
    idleTimeoutRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 20 * 60 * 1000); // 20 minutes idle timeout
  }, []);

  // Set up activity listeners
  React.useEffect(() => {
    resetIdleTimer(); // Initialize timer on component mount

    const handleActivity = () => resetIdleTimer();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("click", handleActivity); // For touch/mobile devices

    return () => {
      clearTimeout(idleTimeoutRef.current);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [resetIdleTimer]);

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      
      // Update last_active only if the user is not idle
      if (!isIdle) {
        const now = new Date().toISOString();
        await base44.auth.updateMe({ last_active: now });
        
        // Also update PublicUserDirectory
        try {
          const publicUsers = await base44.entities.PublicUserDirectory.filter({ user_email: currentUser.email });
          if (publicUsers.length > 0) {
            await base44.entities.PublicUserDirectory.update(publicUsers[0].id, { last_active: now });
          } else {
            // If user is not in public directory, create an entry for them
            await base44.entities.PublicUserDirectory.create({
              user_email: currentUser.email,
              user_type: currentUser.user_type,
              display_name: currentUser.display_name,
              avatar_url: currentUser.avatar_url,
              last_active: now,
              // Other relevant fields as needed for public display
              // e.g., subjects, bio, rating, etc.
            });
          }
        } catch (err) {
          console.log("Could not update/create public directory entry:", err);
        }
      }
      
      return currentUser;
    },
    refetchInterval: 5000, // Update every 5 seconds to keep user online (if active)
    staleTime: 2000,
  });

  const updateThemeMutation = useMutation({
    mutationFn: (theme) => base44.auth.updateMe({ theme }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setShowProfileMenu(false);
    },
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['unreadMessages', user?.email],
    queryFn: async () => {
      if (!user?.email) return 0;
      const messages = await base44.entities.ChatMessage.filter({ receiver_email: user.email, is_read: false });
      return messages.length;
    },
    enabled: !!user?.email,
    refetchInterval: 3000, // Check every 3 seconds for new messages
    staleTime: 1000,
  });

  // Play bell sound when new message arrives
  React.useEffect(() => {
    // Only play sound if unreadCount increased and it's not the initial load (lastMessageCount > 0)
    if (unreadCount > lastMessageCount && lastMessageCount > 0) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjWM0/LPeCsFKH3J8tiLNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjWM0/LPeCsFKH3J8tiLNwgZaLvt559NEAxQp+Pw');
      audio.play().catch(() => {});
    }
    setLastMessageCount(unreadCount);
  }, [unreadCount]);

  const { data: notifications } = useQuery({
    queryKey: ['sessionNotifications', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.SessionNotification.filter({ recipient_email: user.email, is_read: false }, '-created_date', 10);
    },
    enabled: !!user?.email,
    refetchInterval: 3000, // Check every 3 seconds for instant session invites
    staleTime: 1000,
    initialData: []
  });

  // Auto-redirect to session if student gets invitation
  React.useEffect(() => {
    if (notifications && notifications.length > 0) {
      const sessionInvite = notifications.find(n => n.redirect_to_session && n.notification_type === 'tutor_accepted');
      if (sessionInvite) {
        // Mark as read
        base44.entities.SessionNotification.update(sessionInvite.id, { is_read: true });
        // Redirect to session
        window.location.href = createPageUrl(`SessionChat?gig=${sessionInvite.gig_id}`);
      }
    }
  }, [notifications]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-[var(--secondary)] rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (user && !user.is_setup_complete && user.role !== 'admin') {
    return <AccountSetup />;
  }

  const userType = user?.user_type || "student";
  const currentTheme = user?.theme || "cyberpunk";
  const isAdmin = user?.role === 'admin';

  const baseNav = [
    { title: "NEWS", url: createPageUrl("News"), icon: Newspaper },
    { title: "MESSAGES", url: createPageUrl("ChatList"), icon: MessageSquare, badge: unreadCount },
    { title: "GLOBAL CHAT", url: createPageUrl("GlobalChat"), icon: Globe },
    { title: "DIRECTORY", url: createPageUrl("Directory"), icon: BookUser },
    { title: "LEADERBOARD", url: createPageUrl("Leaderboard"), icon: BarChart },
  ];

  // Build navigation based on user role
  let navigationItems;
  
  if (isAdmin) {
    // Admin sees EVERYTHING
    navigationItems = [
      { title: "🛡️ ADMIN PANEL", url: createPageUrl("AdminPanel"), icon: Shield },
      ...baseNav,
      { title: "STUDENT HUB", url: createPageUrl("StudentsDashboard"), icon: Users },
      { title: "TUTOR HUB", url: createPageUrl("TutorsDashboard"), icon: GraduationCap },
      { title: "REQUEST HUB", url: createPageUrl("RequestHub"), icon: Briefcase },
      { title: "FIND TUTORS", url: createPageUrl("FindTutors"), icon: Search },
      { title: "MY GIGS", url: createPageUrl("MyGigs"), icon: Zap },
    ];
  } else if (userType === "tutor") {
    navigationItems = [
      { title: "NEWS", url: createPageUrl("News"), icon: Newspaper },
      { title: "MESSAGES", url: createPageUrl("ChatList"), icon: MessageSquare, badge: unreadCount },
      { title: "REQUEST HUB", url: createPageUrl("RequestHub"), icon: Briefcase },
      { title: "GLOBAL CHAT", url: createPageUrl("GlobalChat"), icon: Globe },
      { title: "DIRECTORY", url: createPageUrl("Directory"), icon: BookUser },
      { title: "LEADERBOARD", url: createPageUrl("Leaderboard"), icon: BarChart },
      { title: "TUTOR HUB", url: createPageUrl("TutorsDashboard"), icon: GraduationCap },
      { title: "MY GIGS", url: createPageUrl("MyGigs"), icon: Zap },
    ];
  } else {
    // Students - Request Hub right after Messages
    navigationItems = [
      { title: "NEWS", url: createPageUrl("News"), icon: Newspaper },
      { title: "MESSAGES", url: createPageUrl("ChatList"), icon: MessageSquare, badge: unreadCount },
      { title: "REQUEST HUB", url: createPageUrl("RequestHub"), icon: Briefcase },
      { title: "GLOBAL CHAT", url: createPageUrl("GlobalChat"), icon: Globe },
      { title: "DIRECTORY", url: createPageUrl("Directory"), icon: BookUser },
      { title: "LEADERBOARD", url: createPageUrl("Leaderboard"), icon: BarChart },
      { title: "STUDENT HUB", url: createPageUrl("StudentsDashboard"), icon: Users },
      { title: "FIND TUTORS", url: createPageUrl("FindTutors"), icon: Search },
      { title: "MY GIGS", url: createPageUrl("MyGigs"), icon: Zap },
    ];
  }

  return (
    <div className="min-h-screen bg-[var(--background)]" data-theme={currentTheme}>
      <style>{`
        :root, [data-theme='cyberpunk'] {
          --primary: #00D9FF; --secondary: #FF0080; --accent: #FFE500; --highlight: #00FF41; --background: #000000;
          --header-gradient: linear-gradient(to right, #00D9FF, #FF0080, #B026FF);
        }
        [data-theme='vaporwave'] {
          --primary: #FF71CE; --secondary: #01CDFE; --accent: #05FFA1; --highlight: #F9F871; --background: #1D1F3A;
          --header-gradient: linear-gradient(to right, #FF71CE, #01CDFE, #05FFA1);
        }
        [data-theme='outrun'] {
          --primary: #FF4AD8; --secondary: #4194FF; --accent: #FF9A41; --highlight: #F1F2F2; --background: #1A0933;
          --header-gradient: linear-gradient(to right, #FF4AD8, #4194FF, #FF9A41);
        }
        [data-theme='monochrome'] {
          --primary: #FFFF00; --secondary: #000000; --accent: #FFFFFF; --highlight: #FFFF00; --background: #FFFFFF;
          --header-gradient: linear-gradient(to right, #000, #444);
        }
        .text-main { color: var(--text-main, white); }
        .bg-background { background-color: var(--background); }
        .brutalist-card {
          border: 4px solid #000;
          box-shadow: 8px 8px 0 0 var(--primary);
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
        }
        [data-theme='monochrome'] .brutalist-card { box-shadow: 8px 8px 0 0 #000; }
        .brutalist-card:hover { box-shadow: 10px 10px 0 0 var(--secondary); }
        [data-theme='monochrome'] .brutalist-card:hover { box-shadow: 10px 10px 0 0 #000; }

        .brutalist-button { border: 3px solid #000; box-shadow: 4px 4px 0 0 #000; font-weight: 900; text-transform: uppercase; transition: all 0.2s; }
        .brutalist-button:hover:not(:disabled) { transform: translate(2px, 2px); box-shadow: 2px 2px 0 0 #000; }
        .brutalist-button:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .brutalist-input { border: 3px solid #000; box-shadow: 4px 4px 0 0 #000; background: white; }
        .brutalist-input:focus { box-shadow: 6px 6px 0 0 var(--secondary); border-color: var(--secondary); outline: none; }

        .neon-text { text-shadow: 0 0 5px var(--accent), 0 0 10px var(--accent), 0 0 15px var(--primary); }
        [data-theme='monochrome'] .neon-text { text-shadow: none; }
        
        .online-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>

      <header className="border-b-4 border-black relative" style={{ background: 'var(--header-gradient)' }}>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[var(--accent)] to-[var(--secondary)] border-4 border-black flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform">
                <GraduationCap className="w-8 h-8 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white neon-text tracking-tight">BIGGRADE</h1>
                {user && (
                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <span className="text-sm font-black text-white">
                        🛡️ ADMIN
                      </span>
                    ) : (
                      <>
                        <span className="text-sm font-black text-white">
                          {userType === "tutor" ? "🎓 TUTOR" : "📚 STUDENT"}
                        </span>
                        {user.is_qualified_teacher && (
                          <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-black border-2 border-black font-black">
                            CERTIFIED
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {notifications.length > 0 && (
                <div className="relative">
                  <Link to={createPageUrl("Notifications")} className="brutalist-button bg-[var(--accent)] text-black p-2 relative">
                    <span className="text-2xl">🔔</span>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--secondary)] text-white text-xs font-black flex items-center justify-center rounded-full border-2 border-black online-pulse">
                      {notifications.length}
                    </span>
                  </Link>
                </div>
              )}

              <div className="relative">
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="brutalist-button bg-white text-black p-2 flex items-center gap-2">
                  {user?.avatar_url ? (<img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-black" />) : (<UserCircle className="w-8 h-8" />)}
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 brutalist-card bg-white z-50 p-2 space-y-2">
                    <Link to={createPageUrl("Profile")} onClick={() => setShowProfileMenu(false)} className="block brutalist-button bg-white text-black px-4 py-2 text-sm text-center">
                      MY PROFILE
                    </Link>
                    <div className="pt-2 border-t-2 border-black">
                        <p className="font-bold text-xs text-center mb-2 uppercase">CHOOSE THEME</p>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(themes).map(([key, { name, icon: Icon, colors }]) => (
                                <button key={key} onClick={() => updateThemeMutation.mutate(key)} className="brutalist-button p-2 text-black text-xs flex flex-col items-center gap-1" style={{backgroundColor: currentTheme === key ? 'var(--primary)' : 'white'}}>
                                    <div className="flex">
                                        <div className="w-3 h-3 border border-black" style={{backgroundColor: colors[0]}}></div>
                                        <div className="w-3 h-3 border border-black" style={{backgroundColor: colors[1]}}></div>
                                    </div>
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-2 border-t-2 border-black">
                        <button onClick={() => base44.auth.logout()} className="w-full brutalist-button bg-[var(--secondary)] text-white px-4 py-2 text-sm flex items-center justify-center gap-2">
                            <LogOut className="w-4 h-4"/>
                            SIGN OUT
                        </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-black border-b-4 border-[var(--primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto">
            {navigationItems.map((item) => (
              <Link key={item.title} to={item.url} className={`brutalist-button px-6 py-3 flex items-center gap-2 relative whitespace-nowrap ${ location.pathname === item.url ? "text-black neon-text" : "bg-white text-black hover:bg-opacity-90" }`} style={{ backgroundColor: location.pathname === item.url ? 'var(--primary)' : undefined }}>
                <item.icon className="w-5 h-5" />
                {item.title}
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--secondary)] text-white text-xs font-black flex items-center justify-center rounded-full border-2 border-black online-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="text-black py-6 mt-12 border-t-4 border-black" style={{background: 'var(--header-gradient)'}}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-black uppercase tracking-wider text-lg text-white neon-text">
            ⚡ BIGGRADE © 2025 - CONNECT. LEARN. GROW. ⚡
          </p>
        </div>
      </footer>
    </div>
  );
}
