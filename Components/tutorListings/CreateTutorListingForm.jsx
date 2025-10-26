import React, { useState } from "react";
import { X, DollarSign } from "lucide-react";

export default function CreateTutorListingForm({ onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "math",
    price: "",
    sessions: 1
  });

  const subjects = ["math", "science", "programming", "writing", "languages", "history", "business", "art", "music", "other"];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="brutalist-card p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-black uppercase">LIST YOUR SERVICES</h2>
        <button onClick={onCancel} className="brutalist-button bg-[#FF0080] text-white p-2">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-black text-black uppercase mb-2">SERVICE TITLE *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="brutalist-input w-full px-4 py-3 font-bold"
            placeholder="e.g., 'AP Calculus Tutoring', 'Python Programming Lessons'"
            required
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block font-black text-black uppercase mb-2">SUBJECT *</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="brutalist-input w-full px-4 py-3 font-bold"
              required
            >
              {subjects.map(s => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-black text-black uppercase mb-2">PRICE *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="brutalist-input w-full pl-12 pr-4 py-3 font-bold"
                placeholder="25/hour or Free"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-black text-black uppercase mb-2">SESSIONS *</label>
            <input
              type="number"
              min="1"
              value={formData.sessions}
              onChange={(e) => setFormData({...formData, sessions: parseInt(e.target.value)})}
              className="brutalist-input w-full px-4 py-3 font-bold"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-black text-black uppercase mb-2">DESCRIPTION *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="brutalist-input w-full px-4 py-3 font-bold h-32 resize-none"
            placeholder="Describe what you'll teach, your experience, teaching style, etc."
            required
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t-4 border-black">
          <button type="button" onClick={onCancel} className="brutalist-button bg-white text-black px-6 py-3">
            CANCEL
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="brutalist-button bg-gradient-to-r from-[#00D9FF] to-[#00FF41] text-black px-8 py-3"
          >
            {isSubmitting ? "POSTING..." : "POST LISTING"}
          </button>
        </div>
      </form>
    </div>
  );
}
