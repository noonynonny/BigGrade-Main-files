import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MessageSquare } from "lucide-react";
import MegathreadCard from "../components/megathreads/MegathreadCard";
import CreateMegathreadForm from "../components/megathreads/CreateMegathreadForm";

export default function StudentsDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: megathreads, isLoading } = useQuery({
    queryKey: ['studentMegathreads'],
    queryFn: () => base44.entities.Megathread.filter({ author_type: 'student' }, '-created_date', 50),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Megathread.create({
      ...data,
      author_type: 'student',
      author_name: user?.full_name || 'Student'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentMegathreads'] });
      setShowCreateForm(false);
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
          <h1 className="text-4xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "var(--primary)" }}>
            STUDENT HUB
          </h1>
          <p className="text-lg font-bold text-white mt-2">
            SHARE IDEAS & COLLABORATE
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="brutalist-button bg-[#00FFFF] text-black px-6 py-3 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          NEW MEGATHREAD
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <CreateMegathreadForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowCreateForm(false)}
          isSubmitting={createMutation.isPending}
        />
      )}

      {/* Subject Filter */}
      <div className="brutalist-card bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setFilter(subject)}
              className={`brutalist-button px-4 py-2 text-sm ${
                filter === subject
                  ? "bg-[#FF1493] text-white"
                  : "bg-[#FFFF00] text-black"
              }`}
            >
              {subject.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Megathreads Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-black border-t-[#00FFFF] rounded-full animate-spin"></div>
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
    </div>
  );
}
