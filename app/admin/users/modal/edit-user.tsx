"use client";
import { X, Save, Key, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function EditUserModal({ user, onClose }: { user: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.first_name || "",
    lastName: user.last_name || "",
    assignedBuilding: user.assigned_building || "Ladies' Dorm 1"
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Reference sa document ng specific manager gamit ang kanilang UID
      const userRef = doc(db, "users", user.id);

      // 2. Update ang Firestore fields
      await updateDoc(userRef, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        assigned_building: formData.assignedBuilding,
      });

      alert("Personnel profile updated successfully! 🚀");
      onClose();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert("Update failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white w-full max-w-md rounded-[35px] shadow-2xl overflow-hidden border border-slate-100"
      >
        <div className="bg-emerald-950 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-950 flex items-center justify-center font-black text-xl uppercase">
              {formData.firstName.charAt(0)}
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold tracking-tight italic">Edit Profile</h2>
              <p className="text-[10px] font-medium text-emerald-400 uppercase tracking-widest mt-1">ID: {user.id.substring(0, 8)}...</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-4 text-left bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-xs font-medium outline-none focus:border-emerald-500" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
              <input 
                type="text" 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-xs font-medium outline-none focus:border-emerald-500" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Update Assigned Building</label>
            <select 
              value={formData.assignedBuilding}
              onChange={(e) => setFormData({...formData, assignedBuilding: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-xs font-medium outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
                <option>Ladies' Dorm 1</option>
                <option>Ladies' Dorm 2</option>
                <option>Ladies' Dorm 3</option>
                <option>Ladies' Dorm 4</option>
                <option>Ladies' Dorm 5 + Annex</option>
                <option>Men's Dorm 4 & 5</option>
                <option>Men's Dorm 6 & 7</option>
                <option>Athlete Dorm</option>
            </select>
          </div>

          <div className="pt-2">
            <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2 border-l-2 border-emerald-500 pl-2">Access Control</p>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-3">
                    <Key size={14} className="text-amber-600" />
                    <p className="text-[10px] font-medium text-amber-800">Password management is handled via secure recovery email for privacy safety.</p>
                </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-4 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all"
            >
                Cancel
            </button>
            <button 
              disabled={loading}
              className="flex-[2] bg-emerald-950 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <><Save size={14} /> Update Profile</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}