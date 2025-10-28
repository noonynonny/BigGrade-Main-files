import React, { useState } from "react";
import firebaseClient from "@/firebase/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Shield, Award } from "lucide-react";

export default function AccountSetup() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    bio: "",
    major: "",
    year: "",
    role: "student"
  });

  // Get current user
  const { data: user } = useQuery({
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

  // Create user profile mutation
  const createProfileMutation = useMutation({
    mutationFn: (data) => firebaseClient.entities.User.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile', user?.uid]);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return;

    createProfileMutation.mutate({
      ...formData,
      email: user.email,
      uid: user.uid,
      created_date: new Date().toISOString()
    });
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Account Setup Required
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Please sign in with Google to set up your account.
              </p>
            </div>
            <div className="mt-5">
              <button
                onClick={() => firebaseClient.auth.signInWithGoogle()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Complete Your Profile
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Please provide some information to complete your account setup.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
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
                    required
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
                    value={user.email}
                    disabled
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2 bg-gray-100"
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
                    placeholder="Tell us about yourself..."
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

              <div className="sm:col-span-6">
                <fieldset>
                  <legend className="text-sm font-medium text-gray-700">Role</legend>
                  <div className="mt-2 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                    <div className="flex items-center">
                      <input
                        id="role-student"
                        name="role"
                        type="radio"
                        value="student"
                        checked={formData.role === "student"}
                        onChange={handleInputChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label htmlFor="role-student" className="ml-3 block text-sm font-medium text-gray-700">
                        Student
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="role-tutor"
                        name="role"
                        type="radio"
                        value="tutor"
                        checked={formData.role === "tutor"}
                        onChange={handleInputChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label htmlFor="role-tutor" className="ml-3 block text-sm font-medium text-gray-700">
                        Tutor
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createProfileMutation.isLoading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {createProfileMutation.isLoading ? "Saving..." : "Complete Setup"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Your Account
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                    <User className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Name
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-medium text-gray-900">
                          {user.displayName || "Not set"}
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
                    <Mail className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Email
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-medium text-gray-900">
                          {user.email}
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
                    <Shield className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Member Since
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-medium text-gray-900">
                          {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown"}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}