
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Save, Shield, Award, Star, Users, Book } from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    bio: user?.bio || "",
    expertise: user?.expertise || [],
    teaching_credentials: user?.teaching_credentials || "",
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        bio: user.bio || "",
        expertise: user.expertise || [],
        teaching_credentials: user.teaching_credentials || "",
      });
    }
  }, [user]);

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.auth.updateMe({ avatar_url: file_url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setAvatarFile(null);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsEditing(false);
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleExpertiseAdd = (value) => {
    if (value && !formData.expertise.includes(value)) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, value]
      });
    }
  };

  const handleExpertiseRemove = (value) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter(e => e !== value)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-[#00D9FF] border-t-[#FF0080] rounded-full animate-spin"></div>
      </div>
    );
  }

  const expertiseOptions = ["Math", "Science", "Programming", "Writing", "Languages", "History", "Business", "Art", "Music"];
  const isTutor = user?.user_type === 'tutor';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#00D9FF" }}>
          MY PROFILE
        </h1>
        <p className="text-xl font-bold text-white mt-2">
          CUSTOMIZE YOUR IDENTITY
        </p>
      </div>

      {/* Profile Card */}
      <div className="brutalist-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-[#00D9FF] to-[#B026FF] rounded-full border-4 border-black flex items-center justify-center overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-black text-white">{user?.full_name?.[0] || "U"}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 brutalist-button bg-[#FFE500] text-black p-2 rounded-full cursor-pointer">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            
            {/* Badges and Points */}
            <div className="mt-4 flex flex-col items-center gap-2">
              {user?.is_qualified_teacher && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#FFE500] border-3 border-black">
                  <Shield className="w-5 h-5 text-black" />
                  <span className="font-black text-black uppercase">CERTIFIED TEACHER</span>
                </div>
              )}
              
              {/* Points Display */}
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {isTutor ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#FFB627] border-3 border-black">
                    <Award className="w-5 h-5 text-black"/>
                    <div className="text-center">
                      <p className="text-xs font-black text-black uppercase">Tutor Points</p>
                      <p className="text-xl font-black text-black">{user.tutor_rating || 0}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#00D9FF] border-3 border-black">
                      <Star className="w-5 h-5 text-black"/>
                      <div className="text-center">
                        <p className="text-xs font-black text-black uppercase">Student Points</p>
                        <p className="text-xl font-black text-black">{user.student_rating || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#00FF41] border-3 border-black">
                      <Users className="w-5 h-5 text-black"/>
                      <div className="text-center">
                        <p className="text-xs font-black text-black uppercase">Peer Points</p>
                        <p className="text-xl font-black text-black">{user.peer_points || 0}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-black text-black uppercase mb-2">
                FULL NAME *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="brutalist-input w-full px-4 py-3 font-bold"
                disabled={!isEditing}
                required
              />
            </div>

            <div>
              <label className="block font-black text-black uppercase mb-2">
                EMAIL
              </label>
              <input
                type="email"
                value={user?.email}
                className="brutalist-input w-full px-4 py-3 font-bold bg-gray-100"
                disabled
              />
            </div>
          </div>
          
          <div>
            <label className="block font-black text-black uppercase mb-2">
              ACCOUNT TYPE (PERMANENT)
            </label>
            <div className="brutalist-input w-full px-4 py-3 font-bold bg-gray-100 flex items-center gap-2">
              {isTutor ? (
                <>
                  <Shield className="w-5 h-5" />
                  TUTOR
                </>
              ) : (
                <>
                  <Book className="w-5 h-5" />
                  STUDENT
                </>
              )}
            </div>
            <p className="text-xs font-bold text-gray-600 mt-1">⚠️ Account type cannot be changed</p>
          </div>

          <div>
            <label className="block font-black text-black uppercase mb-2">
              BIO
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="brutalist-input w-full px-4 py-3 font-bold h-32 resize-none"
              placeholder="TELL US ABOUT YOURSELF..."
              disabled={!isEditing}
            />
          </div>

          {/* Expertise Tags */}
          <div>
            <label className="block font-black text-black uppercase mb-2">
              AREAS OF EXPERTISE
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.expertise.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-gradient-to-r from-[#00FF41] to-[#00D9FF] text-black border-3 border-black font-black text-sm flex items-center gap-2"
                >
                  {skill}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleExpertiseRemove(skill)}
                      className="font-black text-lg"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <select
                onChange={(e) => {
                  handleExpertiseAdd(e.target.value);
                  e.target.value = "";
                }}
                className="brutalist-input w-full px-4 py-3 font-bold"
              >
                <option value="">+ ADD EXPERTISE</option>
                {expertiseOptions.filter(opt => !formData.expertise.includes(opt)).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>

          {user?.is_qualified_teacher && (
            <div>
              <label className="block font-black text-black uppercase mb-2">
                TEACHING CREDENTIALS
              </label>
              <textarea
                value={formData.teaching_credentials}
                onChange={(e) => setFormData({...formData, teaching_credentials: e.target.value})}
                className="brutalist-input w-full px-4 py-3 font-bold h-24 resize-none"
                placeholder="YOUR QUALIFICATIONS, CERTIFICATIONS, ETC..."
                disabled={!isEditing}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t-4 border-black">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="brutalist-button bg-gradient-to-r from-[#FF0080] to-[#B026FF] text-white px-8 py-3"
              >
                EDIT PROFILE
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      full_name: user.full_name || "",
                      bio: user.bio || "",
                      expertise: user.expertise || [],
                      teaching_credentials: user.teaching_credentials || "",
                    });
                  }}
                  className="brutalist-button bg-white text-black px-6 py-3"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="brutalist-button bg-gradient-to-r from-[#00FF41] to-[#00D9FF] text-black px-8 py-3 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {updateProfileMutation.isPending ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
