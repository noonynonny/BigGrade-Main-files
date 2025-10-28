import React, { useState } from "react";
import { base44 } from "../firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Save, Shield, Award, Star, Users, Book, Mail, Calendar, User as UserIcon } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const queryClient = useQueryClient();

  // Get current user
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return new Promise((resolve) => {
        const unsubscribe = firebaseClient.auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user);
        });
      });
    },
    staleTime: Infinity,
  });

  // Get user profile data from Firestore
  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: () => firebaseClient.entities.User.get(user.uid),
    enabled: !!user,
  });

  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || user?.displayName || "",
    bio: userProfile?.bio || "",
    expertise: userProfile?.expertise || [],
    major: userProfile?.major || "",
    year: userProfile?.year || "",
    email: userProfile?.email || user?.email || "",
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => firebaseClient.entities.User.update(user.uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile', user?.uid]);
      setIsEditing(false);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExpertiseChange = (e) => {
    const value = e.target.value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      expertise: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      // In a full implementation, you would upload this to Firebase Storage
      // and update the user's photoURL
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const displayName = userProfile?.full_name || user?.displayName || 'Anonymous';
  const email = userProfile?.email || user?.email || 'No email';
  const bio = userProfile?.bio || 'No bio available';
  const expertise = userProfile?.expertise || [];
  const major = userProfile?.major || 'Not specified';
  const year = userProfile?.year || 'Not specified';
  const joinDate = user?.metadata?.creationTime ? new Date(user.metadata.creationTime) : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              User Profile
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Save className="-ml-0.5 mr-2 h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
        <div className="border-t border-gray-200">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6 flex items-center">
                  <div className="flex-shrink-0">
                    {user?.photoURL ? (
                      <img className="h-24 w-24 rounded-full" src={user.photoURL} alt={displayName} />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
                        <UserIcon className="h-12 w-12 text-indigo-600" />
                      </div>
                    )}
                  </div>
                  <div className="ml-6">
                    <label className="inline-block bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                      <Camera className="-ml-1 mr-2 h-5 w-5 inline" />
                      Change Avatar
                      <input 
                        type="file" 
                        className="sr-only" 
                        onChange={handleAvatarChange}
                        accept="image/*"
                      />
                    </label>
                    <p className="mt-2 text-sm text-gray-500">
                      JPG, GIF or PNG. 2MB max.
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="full_name"
                      id="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="expertise" className="block text-sm font-medium text-gray-700">
                    Expertise (comma separated)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="expertise"
                      id="expertise"
                      value={formData.expertise.join(', ')}
                      onChange={handleExpertiseChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                      placeholder="Math, Physics, English, etc."
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                    Major
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="major"
                      id="major"
                      value={formData.major}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                    Year
                  </label>
                  <div className="mt-1">
                    <select
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    >
                      <option value="">Select year</option>
                      <option value="Freshman">Freshman</option>
                      <option value="Sophomore">Sophomore</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {updateProfileMutation.isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          ) : (
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  {user?.photoURL ? (
                    <img className="h-24 w-24 rounded-full" src={user.photoURL} alt={displayName} />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserIcon className="h-12 w-12 text-indigo-600" />
                    </div>
                  )}
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                  <p className="text-sm text-gray-500">{email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Bio</dt>
                  <dd className="mt-1 text-sm text-gray-900">{bio}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Major</dt>
                  <dd className="mt-1 text-sm text-gray-900">{major}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Year</dt>
                  <dd className="mt-1 text-sm text-gray-900">{year}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <Mail className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                    {email}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <Calendar className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                    {joinDate ? format(joinDate, "MMMM d, yyyy") : "Unknown"}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Expertise</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {expertise.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {expertise.map((item, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">No expertise specified</span>
                    )}
                  </dd>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                        <Shield className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Vouches Received
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              24
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                        <Award className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Endorsements
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              18
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                        <Users className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Sessions Completed
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              42
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}