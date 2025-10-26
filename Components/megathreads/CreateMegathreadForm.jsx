import React, { useState } from "react";
import { X } from "lucide-react";

export default function CreateMegathreadForm({ onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    subject: "general"
  });

  const subjects = [
    "math", "science", "programming", "writing", "languages", 
    "history", "business", "art", "music", "general", "other"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="brutalist-card bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-black uppercase">
          CREATE MEGATHREAD
        </h2>
        <button
          onClick={onCancel}
          className="brutalist-button bg-[#FF1493] text-white p-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-black text-black uppercase mb-2">
            TITLE *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="brutalist-input w-full px-4 py-3 font-bold"
            placeholder="WHAT'S YOUR TOPIC?"
            required
          />
        </div>

        <div>
          <label className="block font-black text-black uppercase mb-2">
            SUBJECT *
          </label>
          <select
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            className="brutalist-input w-full px-4 py-3 font-bold"
            required
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>
                {subject.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-black text-black uppercase mb-2">
            CONTENT *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            className="brutalist-input w-full px-4 py-3 font-bold h-32 resize-none"
            placeholder="SHARE YOUR THOUGHTS..."
            required
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="brutalist-button bg-white text-black px-6 py-3"
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="brutalist-button bg-[#00FFFF] text-black px-6 py-3"
          >
            {isSubmitting ? "POSTING..." : "POST THREAD"}
          </button>
        </div>
      </form>
    </div>
  );
}
