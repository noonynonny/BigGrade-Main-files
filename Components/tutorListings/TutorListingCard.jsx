import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageSquare, DollarSign, Calendar, BookOpen, Trash2 } from "lucide-react";

export default function TutorListingCard({ listing, currentUser, onDelete, canDelete = false }) {
  const subjectColors = {
    math: "#00FFFF",
    science: "#FF1493",
    programming: "#FFFF00",
    writing: "#00FF00",
    languages: "#FF6B6B",
    history: "#9D4EDD",
    business: "#06FFA5",
    art: "#FFB627",
    music: "#FF499E",
    other: "#EF476F"
  };

  return (
    <div className="brutalist-card p-6 flex flex-col justify-between hover:translate-x-1 hover:translate-y-1 transition-all">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div
            className="px-4 py-2 border-3 border-black font-black text-sm uppercase"
            style={{ backgroundColor: subjectColors[listing.subject] }}
          >
            {listing.subject}
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#FFE500] border-3 border-black font-black text-sm">
            <DollarSign className="w-4 h-4" />
            {listing.price}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Link to={createPageUrl(`ViewProfile?email=${encodeURIComponent(listing.tutor_email)}`)}>
            <div className="w-14 h-14 bg-gradient-to-br from-[#FF0080] to-[#B026FF] rounded-full border-3 border-black flex items-center justify-center overflow-hidden">
              {listing.tutor_avatar_url ? (
                <img src={listing.tutor_avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-white">{listing.tutor_name[0]}</span>
              )}
            </div>
          </Link>
          <div>
            <h4 className="font-black text-black uppercase">{listing.tutor_name}</h4>
            <div className="flex items-center gap-1 text-xs font-black text-white px-2 py-0.5 bg-[#B026FF] border-2 border-black w-fit">
              TUTOR
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-black text-black uppercase mb-3">{listing.title}</h3>
        <p className="text-sm font-bold text-black mb-4 h-24 overflow-y-auto">{listing.description}</p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1 px-3 py-1 bg-white border-2 border-black font-black text-xs">
            <Calendar className="w-4 h-4" />
            {listing.sessions} SESSION{listing.sessions > 1 ? 'S' : ''}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t-4 border-black space-y-2">
        {!canDelete && currentUser?.email !== listing.tutor_email && (
          <Link
            to={createPageUrl(`Chat?with=${encodeURIComponent(listing.tutor_email)}`)}
            className="brutalist-button bg-gradient-to-r from-[#FF0080] to-[#B026FF] text-white w-full flex items-center justify-center gap-2 py-3"
          >
            <MessageSquare className="w-5 h-5" />
            CONTACT TUTOR
          </Link>
        )}

        {canDelete && (
          <button
            onClick={() => onDelete(listing.id)}
            className="brutalist-button bg-[#FF0080] text-white w-full flex items-center justify-center gap-2 py-3"
          >
            <Trash2 className="w-5 h-5" />
            DELETE LISTING
          </button>
        )}
      </div>
    </div>
  );
}
