import React from "react";
import { base44 } from "../firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Bell, Check, Clock } from "lucide-react";
import { format } from "date-fns";

export default function Notifications() {
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['allNotifications', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.SessionNotification.filter({ recipient_email: user.email }, '-created_date', 50);
    },
    enabled: !!user?.email,
    initialData: []
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.SessionNotification.update(notificationId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['sessionNotifications'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      for (const notif of unread) {
        await base44.entities.SessionNotification.update(notif.id, { is_read: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['sessionNotifications'] });
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black text-white neon-text uppercase tracking-tight" style={{ color: "#FFE500" }}>
            NOTIFICATIONS
          </h1>
          <p className="text-xl font-bold text-white mt-2">
            STAY UPDATED ON YOUR SESSIONS
          </p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="brutalist-button bg-[var(--primary)] text-black px-4 py-2 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            MARK ALL READ
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-[#FFE500] border-t-[#FF0080] rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="brutalist-card p-12 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-black" />
          <h3 className="text-2xl font-black text-black uppercase">NO NOTIFICATIONS</h3>
          <p className="text-black font-bold mt-2">YOU'RE ALL CAUGHT UP!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`brutalist-card p-6 ${notif.is_read ? 'bg-gray-100' : 'bg-white'}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className={`w-5 h-5 ${notif.is_read ? 'text-gray-400' : 'text-[#FF0080]'}`} />
                    <span className={`text-xs font-black uppercase px-2 py-1 border-2 border-black ${
                      notif.notification_type === 'payment_reminder' ? 'bg-[#FFE500]' :
                      notif.notification_type === 'session_started' ? 'bg-[#00FF41]' :
                      'bg-[#00D9FF]'
                    }`}>
                      {notif.notification_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="font-bold text-black mb-2">{notif.message}</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                    <Clock className="w-4 h-4" />
                    {format(new Date(notif.created_date), "MMM d, h:mm a")}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!notif.is_read && (
                    <button
                      onClick={() => markReadMutation.mutate(notif.id)}
                      className="brutalist-button bg-white text-black p-2"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <Link
                    to={createPageUrl(`SessionChat?gig=${notif.gig_id}`)}
                    className="brutalist-button bg-[var(--primary)] text-black px-4 py-2"
                  >
                    VIEW SESSION
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
