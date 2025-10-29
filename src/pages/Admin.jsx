import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Users, MessageSquare, BookOpen, TrendingUp } from 'lucide-react';
import { base44 } from '../base44Client';
import authManager from '../authManager';

export default function Admin() {
  const user = authManager.getCurrentUser();

  // Check if user is admin
  if (!user?.isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  // Fetch statistics
  const { data: users } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => base44.PublicUserDirectory.filter(),
  });

  const { data: threads } = useQuery({
    queryKey: ['admin', 'threads'],
    queryFn: () => base44.Megathread.filter(),
  });

  const { data: gigs } = useQuery({
    queryKey: ['admin', 'gigs'],
    queryFn: () => base44.TutorListing.filter(),
  });

  const { data: messages } = useQuery({
    queryKey: ['admin', 'messages'],
    queryFn: () => base44.GlobalChatMessage.filter(),
  });

  const stats = [
    {
      name: 'Total Users',
      value: users?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Megathreads',
      value: threads?.length || 0,
      icon: MessageSquare,
      color: 'bg-green-500',
    },
    {
      name: 'Tutor Gigs',
      value: gigs?.length || 0,
      icon: BookOpen,
      color: 'bg-purple-500',
    },
    {
      name: 'Global Messages',
      value: messages?.length || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  const studentCount = users?.filter(u => u.user_type === 'student').length || 0;
  const tutorCount = users?.filter(u => u.user_type === 'tutor').length || 0;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Shield className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <p className="text-gray-600">Welcome, {user.displayName}. Here's an overview of your platform.</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Students</span>
              <span className="text-2xl font-bold text-indigo-600">{studentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tutors</span>
              <span className="text-2xl font-bold text-green-600">{tutorCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors">
              View All Users
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors">
              Manage Content
            </button>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded transition-colors">
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peer Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.slice(0, 10).map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.user_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.user_type === 'tutor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.user_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.peer_points || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
