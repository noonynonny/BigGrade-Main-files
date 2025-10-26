import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MessageSquare, Briefcase } from "lucide-react";
import MegathreadCard from "../components/megathreads/MegathreadCard";
import CreateMegathreadForm from "../components/megathreads/CreateMegathreadForm";
import CreateTutorListingForm from "../components/tutorListings/CreateTutorListingForm";
import TutorListingCard from "../components/tutorListings/TutorListingCard";

export default function TutorsDashboard() {
  const [showCreateMegathread, setShowCreateMegathread] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("megathreads"); // "megathreads" or "listings"
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: megathreads, isLoading: megathreadsLoading } = useQuery({
    queryKey: ['tutorMegathreads'],
    queryFn: () => base44.entities.Megathread.filter({ author_type: 'tutor' }, '-created_date', 50),
    initialData: [],
  });

  const { data: myListings, isLoading: listingsLoading } = useQuery({
    queryKey: ['myTutorListings', user?.email],
    queryFn: () => base44.entities.TutorListing.filter({ tutor_email: user.email, is_active: true }, '-created_date', 20),
    enabled: !!user?.email,
    initialData: [],
  });

  const createMegathreadMutation = useMutation({
    mutationFn: (data) => base44.entities.Megathread.create({
      ...data,
      author_type: 'tutor',
      author_name: user?.full_name || 'Tutor'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutorMegathreads'] });
      setShowCreateMegathread(false);
    },
  });

  const createListingMutation = useMutation({
    mutationFn: (data) => base44.entities.TutorListing.create({
      ...data,
      tutor_email: user.email,
      tutor_name: user.full_name,
      tutor_avatar_url: user.avatar_url
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTutorListings'] });
      setShowCreateListing(false);
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: (listingId) => base44.entities.TutorListing.update(listingId, { is_active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTutorListings'] });
      queryClient.invalidateQueries({ queryKey: ['allTutorListings'] });
    },
  });

  const filteredThreads = filter === "all" 
    ? megathreads 
    : megathreads.filter(t => t.subject === filter);

  const subjects = ["all", "math", "science", "programming", "writing", "languages", "history", "business", "art", "music", "general", "other"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "var(--secondary)" }}>
            TUTOR HUB
          </h1>
          <p className="text-lg font-bold text-white mt-2">
            SHARE KNOWLEDGE & ADVERTISE SERVICES
          </p>
        </div>
        <div className="flex gap-2">
          {view === 'listings' && (
            <button
              onClick={() => setShowCreateListing(!showCreateListing)}
              className="brutalist-button bg-[#00FF41] text-black px-6 py-3 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              NEW SERVICE
            </button>
          )}
          {view === 'megathreads' && (
            <button
              onClick={() => setShowCreateMegathread(!showCreateMegathread)}
              className="brutalist-button bg-[#FF1493] text-white px-6 py-3 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              NEW MEGATHREAD
            </button>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setView('megathreads')}
          className={`brutalist-button px-8 py-3 flex items-center gap-2 ${
            view === 'megathreads' ? 'bg-[#FF1493] text-white' : 'bg-white text-black'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          MEGATHREADS
        </button>
        <button
          onClick={() => setView('listings')}
          className={`brutalist-button px-8 py-3 flex items-center gap-2 ${
            view === 'listings' ? 'bg-[#00FF41] text-black' : 'bg-white text-black'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          MY SERVICES
        </button>
      </div>

      {/* Create Forms */}
      {showCreateMegathread && view === 'megathreads' && (
        <CreateMegathreadForm
          onSubmit={(data) => createMegathreadMutation.mutate(data)}
          onCancel={() => setShowCreateMegathread(false)}
          isSubmitting={createMegathreadMutation.isPending}
        />
      )}

      {showCreateListing && view === 'listings' && (
        <CreateTutorListingForm
          onSubmit={(data) => createListingMutation.mutate(data)}
          onCancel={() => setShowCreateListing(false)}
          isSubmitting={createListingMutation.isPending}
        />
      )}

      {/* Megathreads View */}
      {view === 'megathreads' && (
        <>
          <div className="brutalist-card bg-white p-4">
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setFilter(subject)}
                  className={`brutalist-button px-4 py-2 text-sm ${
                    filter === subject
                      ? "bg-[#00FFFF] text-black"
                      : "bg-[#FFFF00] text-black"
                  }`}
                >
                  {subject.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {megathreadsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-black border-t-[#FF1493] rounded-full animate-spin"></div>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="brutalist-card bg-white p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-black" />
              <h3 className="text-2xl font-black text-black uppercase">NO THREADS YET</h3>
              <p className="text-black font-bold mt-2">BE THE FIRST TO POST!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredThreads.map((thread, index) => (
                <MegathreadCard 
                  key={thread.id} 
                  thread={thread}
                  isOdd={index % 2 !== 0}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Listings View */}
      {view === 'listings' && (
        <>
          {listingsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-black border-t-[#00FF41] rounded-full animate-spin"></div>
            </div>
          ) : myListings.length === 0 ? (
            <div className="brutalist-card bg-white p-12 text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-black" />
              <h3 className="text-2xl font-black text-black uppercase">NO SERVICES LISTED</h3>
              <p className="text-black font-bold mt-2">CREATE YOUR FIRST SERVICE LISTING!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((listing) => (
                <TutorListingCard
                  key={listing.id}
                  listing={listing}
                  currentUser={user}
                  canDelete={true}
                  onDelete={(id) => deleteListingMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
