import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import TutorListingCard from "../components/tutorListings/TutorListingCard";
import { Search } from "lucide-react";

export default function FindTutors() {
  const [subjectFilter, setSubjectFilter] = useState("all");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: listings, isLoading } = useQuery({
    queryKey: ['allTutorListings', subjectFilter],
    queryFn: async () => {
      const filters = { is_active: true };
      if (subjectFilter !== 'all') {
        filters.subject = subjectFilter;
      }
      return base44.entities.TutorListing.filter(filters, '-created_date', 100);
    },
    initialData: [],
  });

  const subjects = ["all", "math", "science", "programming", "writing", "languages", "history", "business", "art", "music", "other"];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#FF0080" }}>
          FIND TUTORS
        </h1>
        <p className="text-xl font-bold text-white mt-2">
          BROWSE AVAILABLE TUTORING SERVICES
        </p>
      </div>

      {/* Subject Filter */}
      <div className="brutalist-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6 text-black" />
          <h3 className="text-xl font-black text-black uppercase">FILTER BY SUBJECT</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSubjectFilter(subject)}
              className={`brutalist-button px-4 py-2 text-sm ${
                subjectFilter === subject
                  ? "bg-[#FF0080] text-white"
                  : "bg-white text-black"
              }`}
            >
              {subject.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-[#FF0080] border-t-white rounded-full animate-spin"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="brutalist-card p-12 text-center">
          <h3 className="text-2xl font-black text-black uppercase">NO TUTORS FOUND</h3>
          <p className="text-black font-bold mt-2">Try a different subject filter!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <TutorListingCard
              key={listing.id}
              listing={listing}
              currentUser={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
