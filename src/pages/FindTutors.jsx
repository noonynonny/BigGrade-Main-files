import React, { useState } from "react";
import { base44 } from "../base44Client";
import { useQuery } from "@tanstack/react-query";
import TutorListingCard from "../components/tutorListings/TutorListingCard";
import { Search } from "lucide-react";

export default function FindTutors() {
  const [subjectFilter, setSubjectFilter] = useState("all");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return new Promise((resolve) => {
        const unsubscribe = base44.auth((user) => {
          unsubscribe();
          resolve(user);
        });
      });
    },
    staleTime: Infinity,
  });

  // Mock tutor data - in a real app, this would come from Firestore
  const mockTutors = [
    {
      id: 1,
      full_name: "Alex Johnson",
      subject: "Mathematics",
      rate: 25,
      rating: 4.8,
      bio: "Experienced math tutor with 5 years of teaching experience.",
      avatar_url: null
    },
    {
      id: 2,
      full_name: "Sarah Williams",
      subject: "Physics",
      rate: 30,
      rating: 4.9,
      bio: "Physics graduate with expertise in mechanics and thermodynamics.",
      avatar_url: null
    }
  ];

  const filteredTutors = subjectFilter === "all" 
    ? mockTutors 
    : mockTutors.filter(tutor => tutor.subject === subjectFilter);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Find Tutors
          </h2>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
            placeholder="Search tutors..."
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setSubjectFilter("all")}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              subjectFilter === "all"
                ? "bg-indigo-100 text-indigo-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All Subjects
          </button>
          <button
            onClick={() => setSubjectFilter("Mathematics")}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              subjectFilter === "Mathematics"
                ? "bg-indigo-100 text-indigo-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mathematics
          </button>
          <button
            onClick={() => setSubjectFilter("Physics")}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              subjectFilter === "Physics"
                ? "bg-indigo-100 text-indigo-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Physics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTutors.map((tutor) => (
          <TutorListingCard key={tutor.id} tutor={tutor} />
        ))}
      </div>
    </div>
  );
}