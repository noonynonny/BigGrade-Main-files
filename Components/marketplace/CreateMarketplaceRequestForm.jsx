import React, { useState } from "react";
import { X, DollarSign, GraduationCap, Users, Globe } from "lucide-react";

export default function CreateMarketplaceRequestForm({ user, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "math",
    compensation_type: "undecided",
    offered_price: "",
    help_from: "anyone"
  });

  const subjects = ["math", "science", "programming", "writing", "languages", "history", "business", "art", "music", "other"];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="brutalist-card p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-black uppercase">REQUEST HELP</h2>
        <button onClick={onCancel} className="brutalist-button bg-[#FF0080] text-white p-2">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-black text-black uppercase mb-2">REQUEST TITLE *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="brutalist-input w-full px-4 py-3 font-bold"
            placeholder="What do you need help with?"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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
            <label className="block font-black text-black uppercase mb-2">COMPENSATION *</label>
            <select
              value={formData.compensation_type}
              onChange={(e) => setFormData({...formData, compensation_type: e.target.value})}
              className="brutalist-input w-full px-4 py-3 font-bold"
              required
            >
              <option value="undecided">UNDECIDED</option>
              <option value="free">FREE</option>
              <option value="paid">PAID</option>
            </select>
          </div>
        </div>

        {formData.compensation_type === 'paid' && (
          <div>
            <label className="block font-black text-black uppercase mb-2">PRICE YOU'RE WILLING TO PAY *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={formData.offered_price}
                onChange={(e) => setFormData({...formData, offered_price: e.target.value})}
                className="brutalist-input w-full pl-12 pr-4 py-3 font-bold"
                placeholder="e.g., $25, $50/hour, $100 total"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block font-black text-black uppercase mb-2">WHO CAN HELP? *</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFormData({...formData, help_from: 'tutor'})}
              className={`brutalist-button py-3 flex flex-col items-center gap-2 ${formData.help_from === 'tutor' ? 'bg-[#B026FF] text-white' : 'bg-white text-black'}`}
            >
              <GraduationCap className="w-6 h-6" />
              TUTOR ONLY
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, help_from: 'student'})}
              className={`brutalist-button py-3 flex flex-col items-center gap-2 ${formData.help_from === 'student' ? 'bg-[#00D9FF] text-white' : 'bg-white text-black'}`}
            >
              <Users className="w-6 h-6" />
              PEER ONLY
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, help_from: 'anyone'})}
              className={`brutalist-button py-3 flex flex-col items-center gap-2 ${formData.help_from === 'anyone' ? 'bg-[#00FF41] text-black' : 'bg-white text-black'}`}
            >
              <Globe className="w-6 h-6" />
              ANYONE
            </button>
          </div>
        </div>

        <div>
          <label className="block font-black text-black uppercase mb-2">DESCRIPTION *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="brutalist-input w-full px-4 py-3 font-bold h-32 resize-none"
            placeholder="Describe what you need help with in detail..."
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
            {isSubmitting ? "POSTING..." : "POST REQUEST"}
          </button>
        </div>
      </form>
    </div>
  );
}
