"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, UserCircle, Hash, Users2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';

export default function AddDormModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dormName: '',
    manager: '',
    totalRooms: 0,
    bedsPerRoom: 8 // Default based on your handbook logic
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.totalRooms <= 0) return alert("Please enter valid number of rooms.");
    
    setLoading(true);
    const batch = writeBatch(db);

    try {
      // 1. Create ang mga Rooms sa loob ng Dorm na ito
      for (let i = 1; i <= formData.totalRooms; i++) {
        // Naming format: MD12-RM1 (Halimbawa)
        const dormID = formData.dormName.replace(/\s+/g, '').toUpperCase();
        const roomID = `${dormID}-RM${i}`;
        
        const roomRef = doc(db, "rooms", roomID);
        batch.set(roomRef, {
          room_number: i.toString(),
          dormID: dormID,
          dormGroup: formData.dormName, // Ito yung mag-aappear sa groups
          total_beds: Number(formData.bedsPerRoom),
          occupied_beds: 0,
          manager: formData.manager,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      alert(`Successfully added ${formData.dormName} with ${formData.totalRooms} rooms!`);
      onClose();
    } catch (error: any) {
      console.error("Error adding dorm: ", error);
      alert("Failed to add unit: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 text-left">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-emerald-950/20 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden">
          <header className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-light text-slate-900 text-left">Add <span className="font-semibold italic">Housing Unit</span></h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-300 hover:text-slate-900"><X size={20}/></button>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputGroup 
              icon={<Building2 size={18} />} 
              label="Dorm Name / Group" 
              placeholder="e.g. Men's Dorm 12" 
              value={formData.dormName}
              onChange={(v: string) => setFormData({...formData, dormName: v})}
            />
            <InputGroup 
              icon={<UserCircle size={18} />} 
              label="Dorm Manager / Houseparent" 
              placeholder="Full Name" 
              value={formData.manager}
              onChange={(v: string) => setFormData({...formData, manager: v})}
            />
            
            <div className="grid grid-cols-2 gap-5 text-left">
              <InputGroup 
                icon={<Hash size={18} />} 
                label="Total Rooms" 
                placeholder="40" 
                type="number" 
                value={formData.totalRooms}
                onChange={(v: any) => setFormData({...formData, totalRooms: v})}
              />
              <InputGroup 
                icon={<Users2 size={18} />} 
                label="Beds per Room" 
                placeholder="8" 
                type="number" 
                value={formData.bedsPerRoom}
                onChange={(v: any) => setFormData({...formData, bedsPerRoom: v})}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-emerald-950 text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-900/20 mt-6 hover:bg-emerald-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Confirm Registration"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function InputGroup({ icon, label, placeholder, type = "text", value, onChange }: any) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors">{icon}</div>
        <input 
          type={type} 
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} 
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:border-emerald-200 transition-all text-sm" 
        />
      </div>
    </div>
  );
}