import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { GraduationCap, Users, MessageSquare, Briefcase, Search, Zap, UserCircle, Globe, Book, LogOut, Settings, Sun, Moon, Tv, BarChart, Shield, Newspaper } from "lucide-react";
import { base44 } from "./base44Client";
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
  const [isIdle, setIsIdle] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
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
    resetIdleTimer();

    const handleActivity = () => resetIdleTimer();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("click", handleActivity);

    return () => {
      clearTimeout(idleTimeoutRef.current);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [resetIdleTimer]);

  // Check for authentication state
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      // Check if user is already logged in
      const currentUser = base44.auth();
      return currentUser;
    },
    staleTime: Infinity,
  });

  // Sign out function
  const signOutMutation = useMutation({
    mutationFn: async () => {
      base44.signOut();
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/';
    },
  });

  // Get user's notification count
  const { data: notificationCount } = useQuery({
    queryKey: ['notificationCount', user?.uid],
    queryFn: async () => {
      if (!user) return 0;
      // Get notifications from Base44
      try {
        const notifications = await base44.find('notifications', {
          where: [{ field: 'user_id', operator: '==', value: user.uid }]
        });
        return notifications.filter(n => !n.is_read).length;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return 0;
      }
    },
    enabled: !!user,
  });

  const handleSignOut = () => {
    signOutMutation.mutate();
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const navItems = [
    { name: "Dashboard", icon: GraduationCap, path: "StudentDashboard" },
    { name: "Megathreads", icon: Users, path: "MegathreadView" },
    { name: "Chat", icon: MessageSquare, path: "ChatList" },
    { name: "Marketplace", icon: Briefcase, path: "RequestHub" },
    { name: "Find Tutors", icon: Search, path: "FindTutors" },
    { name: "My Gigs", icon: Zap, path: "MyGigs" },
    { name: "Leaderboard", icon: BarChart, path: "Leaderboard" },
    { name: "Global Chat", icon: Globe, path: "GlobalChat" },
    { name: "News", icon: Newspaper, path: "News" },
    { name: "Directory", icon: Book, path: "Directory" },
  ];

  const isCurrentPage = (path) => {
    return location.pathname === `/${path}` || currentPageName === path;
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If user is not authenticated, show login form
  if (!user) {
    const handleLogin = async (e) => {
      e.preventDefault();
      if (!email) return;
      
      try {
        await base44.signIn(email, name || email.split('@')[0]);
        queryClient.invalidateQueries(['currentUser']);
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <GraduationCap className="h-12 w-12 text-indigo-600" />
            <h1 className="ml-2 text-3xl font-bold text-gray-900">BigGrade</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Display Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              Enter App
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile dropdown */}
      {showProfileMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <Link
            to={createPageUrl("Profile")}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Your Profile
          </Link>
          <Link
            to={createPageUrl("AccountSetup")}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <GraduationCap className="h-8 w-8 text-indigo-300" />
                <span className="ml-2 text-xl font-bold">BigGrade</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={createPageUrl(item.path)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isCurrentPage(item.path)
                          ? "bg-indigo-900 text-white"
                          : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button className="p-1 rounded-full text-indigo-200 hover:text-white focus:outline-none">
                  <span className="sr-only">View notifications</span>
                  <div className="relative">
                    <MessageSquare className="h-6 w-6" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </div>
                </button>

                {/* Profile dropdown */}
                <div className="ml-3 relative">
                  <div>
                    <button
                      onClick={toggleProfileMenu}
                      className="max-w-xs flex items-center text-sm rounded-full focus:outline-none"
                    >
                      <span className="sr-only">Open user menu</span>
                      {user.photoURL ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.photoURL}
                          alt="Profile"
                        />
                      ) : (
                        <UserCircle className="h-8 w-8 rounded-full text-indigo-300" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
