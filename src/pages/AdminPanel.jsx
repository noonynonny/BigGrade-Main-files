import React, { useState } from "react";
import { base44 } from "../base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Users, Trash2, FileText, MessageSquare, Upload, Send, Award, XCircle } from "lucide-react";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [newsForm, setNewsForm] = useState({ title: '', content: '', image_url: '' });
  const [imageFile, setImageFile] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allUsers } = useQuery({
    queryKey: ['allUsersAdmin'],
    queryFn: () => base44.entities.User.list('', 500),
    initialData: [],
  });

  const { data: allRequests } = useQuery({
    queryKey: ['allRequestsAdmin'],
    queryFn: () => base44.entities.MarketplaceRequest.list('-created_date', 500),
    initialData: [],
  });

  const { data: allMegathreads } = useQuery({
    queryKey: ['allMegathreadsAdmin'],
    queryFn: () => base44.entities.Megathread.list('-created_date', 500),
    initialData: [],
  });

  const { data: allNews } = useQuery({
    queryKey: ['allNewsAdmin'],
    queryFn: () => base44.entities.NewsPost.list('-created_date', 100),
    initialData: [],
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userData) => {
      // Delete from User entity
      await base44.entities.User.delete(userData.id);
      
      // Delete from PublicUserDirectory
      const publicUsers = await base44.entities.PublicUserDirectory.filter({ user_email: userData.email });
      if (publicUsers.length > 0) {
        await base44.entities.PublicUserDirectory.delete(publicUsers[0].id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['directoryAllUsers'] });
      queryClient.invalidateQueries({ queryKey: ['publicLeaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['allUsersDirectory'] });
      alert('✅ User completely removed from platform!');
    },
  });

  const updateUserPointsMutation = useMutation({
    mutationFn: async ({ userData, updates }) => {
      // Update User entity
      await base44.entities.User.update(userData.id, updates);
      
      // Update PublicUserDirectory
      const publicUsers = await base44.entities.PublicUserDirectory.filter({ user_email: userData.email });
      if (publicUsers.length > 0) {
        await base44.entities.PublicUserDirectory.update(publicUsers[0].id, updates);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['directoryAllUsers'] });
      queryClient.invalidateQueries({ queryKey: ['publicLeaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['allUsersDirectory'] });
      alert('✅ User points updated!');
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: (requestId) => base44.entities.MarketplaceRequest.delete(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allRequestsAdmin'] });
      alert('✅ Request deleted!');
    },
  });

  const deleteMegathreadMutation = useMutation({
    mutationFn: (threadId) => base44.entities.Megathread.delete(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMegathreadsAdmin'] });
      alert('✅ Megathread deleted!');
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    },
    onSuccess: (url) => {
      setNewsForm({ ...newsForm, image_url: url });
      setImageFile(null);
      alert('✅ Image uploaded!');
    },
  });

  const postNewsMutation = useMutation({
    mutationFn: (data) => base44.entities.NewsPost.create({
      ...data,
      author_email: 'arcanimater@gmail.com'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNewsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      setNewsForm({ title: '', content: '', image_url: '' });
      alert('✅ News posted!');
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: (newsId) => base44.entities.NewsPost.update(newsId, { is_active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNewsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      alert('✅ News removed!');
    },
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      uploadImageMutation.mutate(file);
    }
  };

  // Redirect if not admin - AFTER all hooks
  if (user && user.role !== 'admin') {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#FF0080" }}>
          🛡️ ADMIN CONTROL PANEL
        </h1>
        <p className="text-xl font-bold text-white mt-2">
          FULL SITE MANAGEMENT
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { id: 'users', label: 'MANAGE USERS', icon: Users },
          { id: 'requests', label: 'MANAGE REQUESTS', icon: FileText },
          { id: 'megathreads', label: 'MANAGE MEGATHREADS', icon: MessageSquare },
          { id: 'news', label: 'POST NEWS', icon: Send },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`brutalist-button px-6 py-3 flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-[#FF0080] text-white' : 'bg-white text-black'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="brutalist-card p-6">
          <h2 className="text-3xl font-black text-black uppercase mb-6">ALL USERS ({allUsers.length})</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {allUsers.filter(u => u.role !== 'admin').map(u => (
              <div key={u.id} className="brutalist-card p-4 bg-white flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00D9FF] to-[#B026FF] rounded-full border-3 border-black flex items-center justify-center">
                    <span className="text-xl font-black text-white">{u.full_name?.[0] || 'U'}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-black">{u.full_name || u.email}</h4>
                    <p className="text-sm font-bold text-gray-600">{u.email} • {u.user_type?.toUpperCase()}</p>
                    <div className="flex gap-3 text-xs font-bold mt-1">
                      {u.user_type === 'tutor' && <span>⭐ Tutor: {u.tutor_rating || 0}</span>}
                      {u.user_type === 'student' && (
                        <>
                          <span>📚 Student: {u.student_rating || 0}</span>
                          <span>🤝 Peer: {u.peer_points || 0}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const action = prompt('Type "remove_points" to remove 5 points, or "add_points" to add 5 points:');
                      if (action === 'remove_points') {
                        if (u.user_type === 'tutor') {
                          updateUserPointsMutation.mutate({ userData: u, updates: { tutor_rating: Math.max(0, (u.tutor_rating || 0) - 5) }});
                        } else {
                          const pointType = prompt('Remove from: "student" or "peer"?');
                          if (pointType === 'student') {
                            updateUserPointsMutation.mutate({ userData: u, updates: { student_rating: Math.max(0, (u.student_rating || 0) - 5) }});
                          } else if (pointType === 'peer') {
                            updateUserPointsMutation.mutate({ userData: u, updates: { peer_points: Math.max(0, (u.peer_points || 0) - 5) }});
                          }
                        }
                      } else if (action === 'add_points') {
                        if (u.user_type === 'tutor') {
                          updateUserPointsMutation.mutate({ userData: u, updates: { tutor_rating: (u.tutor_rating || 0) + 5 }});
                        } else {
                          const pointType = prompt('Add to: "student" or "peer"?');
                          if (pointType === 'student') {
                            updateUserPointsMutation.mutate({ userData: u, updates: { student_rating: (u.student_rating || 0) + 5 }});
                          } else if (pointType === 'peer') {
                            updateUserPointsMutation.mutate({ userData: u, updates: { peer_points: (u.peer_points || 0) + 5 }});
                          }
                        }
                      }
                    }}
                    className="brutalist-button bg-[#FFE500] text-black p-2"
                    title="Manage Points"
                  >
                    <Award className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`⚠️ PERMANENTLY REMOVE ${u.email} FROM THE ENTIRE PLATFORM?\n\nThis will delete:\n- User account\n- Directory listing\n- Leaderboard stats\n- All associated data\n\nThis action CANNOT be undone!`)) {
                        deleteUserMutation.mutate(u);
                      }
                    }}
                    className="brutalist-button bg-[#FF0080] text-white p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="brutalist-card p-6">
          <h2 className="text-3xl font-black text-black uppercase mb-6">ALL REQUESTS ({allRequests.length})</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {allRequests.map(req => (
              <div key={req.id} className="brutalist-card p-4 bg-white flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-black text-black">{req.title}</h4>
                  <p className="text-sm font-bold text-gray-600">
                    {req.author_name} • {req.subject} • {req.status.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this request?')) {
                      deleteRequestMutation.mutate(req.id);
                    }
                  }}
                  className="brutalist-button bg-[#FF0080] text-white p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Megathreads Tab */}
      {activeTab === 'megathreads' && (
        <div className="brutalist-card p-6">
          <h2 className="text-3xl font-black text-black uppercase mb-6">ALL MEGATHREADS ({allMegathreads.length})</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {allMegathreads.map(thread => (
              <div key={thread.id} className="brutalist-card p-4 bg-white flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-black text-black">{thread.title}</h4>
                  <p className="text-sm font-bold text-gray-600">
                    {thread.author_name} • {thread.subject} • {thread.author_type.toUpperCase()} HUB
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this megathread?')) {
                      deleteMegathreadMutation.mutate(thread.id);
                    }
                  }}
                  className="brutalist-button bg-[#FF0080] text-white p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News Tab */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="brutalist-card p-8">
            <h2 className="text-3xl font-black text-black uppercase mb-6">📰 POST NEWS</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-black text-black uppercase mb-2">TITLE *</label>
                <input
                  type="text"
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                  className="brutalist-input w-full px-4 py-3 font-bold"
                  placeholder="News headline..."
                />
              </div>

              <div>
                <label className="block font-black text-black uppercase mb-2">CONTENT *</label>
                <textarea
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
                  className="brutalist-input w-full px-4 py-3 font-bold h-40 resize-none"
                  placeholder="Write your announcement..."
                />
              </div>

              <div>
                <label className="block font-black text-black uppercase mb-2">IMAGE (OPTIONAL)</label>
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="newsImage"
                  />
                  <label
                    htmlFor="newsImage"
                    className="brutalist-button bg-[#00D9FF] text-black px-6 py-3 cursor-pointer flex items-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    {uploadImageMutation.isPending ? 'UPLOADING...' : 'UPLOAD IMAGE'}
                  </label>
                  {newsForm.image_url && (
                    <button
                      onClick={() => setNewsForm({...newsForm, image_url: ''})}
                      className="brutalist-button bg-[#FF0080] text-white px-6 py-3 flex items-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      REMOVE IMAGE
                    </button>
                  )}
                </div>
                {newsForm.image_url && (
                  <img src={newsForm.image_url} alt="Preview" className="mt-4 w-full max-w-md border-4 border-black" />
                )}
              </div>

              <button
                onClick={() => {
                  if (newsForm.title && newsForm.content) {
                    postNewsMutation.mutate(newsForm);
                  } else {
                    alert('Please fill in title and content!');
                  }
                }}
                disabled={postNewsMutation.isPending}
                className="brutalist-button bg-gradient-to-r from-[#00FF41] to-[#FFE500] text-black w-full py-4 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {postNewsMutation.isPending ? 'POSTING...' : 'POST NEWS'}
              </button>
            </div>
          </div>

          <div className="brutalist-card p-6">
            <h2 className="text-3xl font-black text-black uppercase mb-6">PUBLISHED NEWS ({allNews.filter(n => n.is_active).length})</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {allNews.filter(n => n.is_active).map(news => (
                <div key={news.id} className="brutalist-card p-4 bg-white flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-black text-black">{news.title}</h4>
                    <p className="text-sm font-bold text-gray-600 line-clamp-2">{news.content}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Remove this news post?')) {
                        deleteNewsMutation.mutate(news.id);
                      }
                    }}
                    className="brutalist-button bg-[#FF0080] text-white p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
