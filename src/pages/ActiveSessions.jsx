import React from "react";
import { base44 } from "../base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Zap, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function ActiveSessions() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: activeSessions, isLoading } = useQuery({
    queryKey: ['activeSessions'],
    queryFn: async () => {
      const sessions = await base44.entities.MarketplaceRequest.filter({ status: 'in_session' }, '-session_start_time', 100);
      const awaitingPayment = await base44.entities.MarketplaceRequest.filter({ status: 'awaiting_payment' }, '-session_start_time', 100);
      return [...sessions, ...awaitingPayment];
    },
    initialData: [],
  });

  // Redirect if not admin
  if (user && user.role !== 'admin') {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#FF0080" }}>
          ⚡ ACTIVE SESSIONS
        </h1>
        <p className="text-xl font-bold text-white mt-2">
          MONITOR ALL ONGOING SESSIONS
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-[#FF0080] border-t-white rounded-full animate-spin"></div>
        </div>
      ) : activeSessions.length === 0 ? (
        <div className="brutalist-card p-12 text-center">
          <Zap className="w-16 h-16 mx-auto mb-4 text-black" />
          <h3 className="text-2xl font-black text-black uppercase">NO ACTIVE SESSIONS</h3>
          <p className="text-black font-bold mt-2">All quiet on the learning front!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSessions.map(session => {
            const duration = session.session_start_time ? Math.floor((new Date() - new Date(session.session_start_time)) / 60000) : 0;
            
            return (
              <Link
                key={session.id}
                to={createPageUrl(`SessionChat?gig=${session.id}`)}
                className="brutalist-card p-6 block hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 border-3 border-black font-black text-xs uppercase ${
                    session.status === 'awaiting_payment' ? 'bg-[#FFE500]' : 'bg-[#00FF41]'
                  }`}>
                    {session.status === 'awaiting_payment' ? '💰 PAYMENT' : '⚡ LIVE'}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Clock className="w-4 h-4" />
                    {duration} min
                  </div>
                </div>

                <h3 className="text-xl font-black text-black uppercase mb-2">{session.title}</h3>
                
                <div className="space-y-2 text-sm font-bold text-black">
                  <p>👨‍🎓 Student: {session.author_name}</p>
                  <p>🎓 Helper: {session.responder_name}</p>
                  <p>📚 Subject: {session.subject}</p>
                  {session.compensation_type === 'paid' && (
                    <p className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {session.offered_price}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t-2 border-black text-xs font-bold text-gray-600">
                  Started: {format(new Date(session.session_start_time), "h:mm a")}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
