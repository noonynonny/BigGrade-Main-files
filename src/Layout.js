import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Bell, User, LogOut, Shield } from "lucide-react";
import authManager from "./authManager";
import AuthScreen from "./components/AuthScreen";

export default function Layout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  // Initialize auth manager
  React.useEffect(() => {
    const unsubscribe = authManager.initialize();
    return () => unsubscribe && unsubscribe();
  }, []);

  // Check for authentication state
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => {
      const currentUser = authManager.getCurrentUser();
      return currentUser;
    },
    staleTime: Infinity,
  });

  // Sign out function
  const signOutMutation = useMutation({
    mutationFn: async () => {
      await authManager.signOut();
    },
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      navigate('/');
    },
  });

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      signOutMutation.mutate();
    }
  };

  // Loading state
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login form
  if (!user) {
    return (
      <AuthScreen
        onAuthSuccess={(user) => {
          queryClient.setQueryData(['currentUser'], user);
          queryClient.invalidateQueries(['currentUser']);
        }}
      />
    );
  }

  // Main app layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl">🎓</span>
                <span className="text-xl font-bold">BigGrade</span>
              </Link>
              
              <div className="hidden md:flex space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  Dashboard
                </Link>
                <Link to="/Megathreads" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  Megathreads
                </Link>
                <Link to="/Chat" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  Chat
                </Link>
                <Link to="/Marketplace" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  Marketplace
                </Link>
                <Link to="/FindTutors" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  Find Tutors
                </Link>
                <Link to="/MyGigs" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  My Gigs
                </Link>
                <Link to="/Leaderboard" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  Leaderboard
                </Link>
                <Link to="/GlobalChat" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  Global Chat
                </Link>
                <Link to="/News" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  News
                </Link>
                <Link to="/Directory" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  Directory
                </Link>
                {user?.isAdmin && (
                  <Link to="/Admin" className="px-3 py-2 rounded-md hover:bg-indigo-700 flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-indigo-700">
                <Bell className="w-5 h-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-indigo-700"
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="hidden md:block">{user?.displayName}</span>
                  {user?.userType && (
                    <span className="hidden md:block text-xs bg-indigo-800 px-2 py-1 rounded">
                      {user.userType}
                    </span>
                  )}
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{user?.displayName}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                      {user?.userType && (
                        <div className="text-xs text-indigo-600 mt-1">
                          Account: {user.userType}
                        </div>
                      )}
                      {user?.isAdmin && (
                        <div className="text-xs text-red-600 mt-1 flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          Administrator
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
