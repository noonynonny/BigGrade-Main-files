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

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout currentPageName="Dashboard">
            <StudentsDashboard />
          </Layout>} />
          <Route path="/StudentDashboard" element={<Layout currentPageName="Dashboard">
            <StudentsDashboard />
          </Layout>} />
          <Route path="/MegathreadView" element={<Layout currentPageName="Megathreads">
            <MegathreadView />
          </Layout>} />
          <Route path="/ChatList" element={<Layout currentPageName="Chat">
            <ChatList />
          </Layout>} />
          <Route path="/RequestHub" element={<Layout currentPageName="Marketplace">
            <RequestHub />
          </Layout>} />
          <Route path="/FindTutors" element={<Layout currentPageName="Find Tutors">
            <FindTutors />
          </Layout>} />
          <Route path="/MyGigs" element={<Layout currentPageName="My Gigs">
            <MyGigs />
          </Layout>} />
          <Route path="/Leaderboard" element={<Layout currentPageName="Leaderboard">
            <Leaderboard />
          </Layout>} />
          <Route path="/GlobalChat" element={<Layout currentPageName="Global Chat">
            <GlobalChat />
          </Layout>} />
          <Route path="/News" element={<Layout currentPageName="News">
            <News />
          </Layout>} />
          <Route path="/Directory" element={<Layout currentPageName="Directory">
            <Directory />
          </Layout>} />
          <Route path="/Profile" element={<Layout currentPageName="Profile">
            <Profile />
          </Layout>} />
          <Route path="/AccountSetup" element={<Layout currentPageName="AccountSetup">
            <AccountSetup />
          </Layout>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;