import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout';
import StudentsDashboard from './pages/StudentDashboard';
import MegathreadView from './pages/MegathreadView';
import ChatList from './pages/ChatList';
import RequestHub from './pages/RequestHub';
import FindTutors from './pages/FindTutors';
import MyGigs from './pages/MyGigs';
import Leaderboard from './pages/Leaderboard';
import GlobalChat from './pages/GlobalChat';
import News from './pages/News';
import Directory from './pages/Directory';
import Profile from './pages/Profile';
import AccountSetup from './pages/AccountSetup';
import Admin from './pages/Admin';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<StudentsDashboard />} />
            <Route path="StudentDashboard" element={<StudentsDashboard />} />
            <Route path="Dashboard" element={<StudentsDashboard />} />
            <Route path="Megathreads" element={<StudentsDashboard />} />
            <Route path="MegathreadView" element={<MegathreadView />} />
            <Route path="Chat" element={<ChatList />} />
            <Route path="ChatList" element={<ChatList />} />
            <Route path="Marketplace" element={<RequestHub />} />
            <Route path="RequestHub" element={<RequestHub />} />
            <Route path="FindTutors" element={<FindTutors />} />
            <Route path="MyGigs" element={<MyGigs />} />
            <Route path="Leaderboard" element={<Leaderboard />} />
            <Route path="GlobalChat" element={<GlobalChat />} />
            <Route path="News" element={<News />} />
            <Route path="Directory" element={<Directory />} />
            <Route path="Profile" element={<Profile />} />
            <Route path="AccountSetup" element={<AccountSetup />} />
            <Route path="Admin" element={<Admin />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
