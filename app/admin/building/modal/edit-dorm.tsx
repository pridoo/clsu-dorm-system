"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, UserCircle, Users2, Loader2, ChevronDown, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';

export default function EditDormModal({ isOpen, onClose, dormData }: { isOpen: boolean, onClose: () => void, dormData: any }) {
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]); // Individual room states
  const [dormName, setDormName] = useState('');
  const [manager, setManager] = useState('');

  // 1. Initial Data Load
  useEffect(() => {
    if (dormData && isOpen) {
      setDormName(dormData.group);
      setManager(dormData.dorm_manager);
      fetchRoomDetails();
    }
  }, [dormData, isOpen]);

  const fetchRoomDetails = async () => {
    try {
      const q = query(
        collection(db, "rooms"), 
        where("dormGroup", "==", dormData.group)
      );
      const snap = await getDocs(q);
      const roomList = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })).sort((a: any, b: any) => parseInt(a.room_number) - parseInt(b.room_number));
      setRooms(roomList);
    } catch (err) {
      console.error("Fetch Rooms Error:", err);
    }
  };

  // Fetch Managers for the Dropdown
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "dorm_manager"));
        const snap = await getDocs(q);
        setManagers(snap.docs.map(d => ({ 
          id: d.id, 
          fullName: `${d.data().first_name} ${d.data().last_name}` 
        })));
      } catch (err) { console.error(err); }
    };
    if (isOpen) fetchManagers();
  }, [isOpen]);

  // 2. NaN Prevention Logic: Handle bed count changes safely
  const handleBedChange = (roomId: string, value: string) => {
    // Kung blangko ang input, i-set sa 0 muna para iwas NaN crash
    const newCount = value === "" ? 0 : parseInt(value);
    setRooms(prev => prev.map(r => 
      r.id === roomId ? { ...r, total_beds: newCount } : r
    ));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const batch = writeBatch(db);

    try {
      rooms.forEach((room) => {
        const roomRef = doc(db, "rooms", room.id);
        batch.update(roomRef, {
          dormGroup: dormName,
          total_beds: Number(room.total_beds), // Individual update
          manager: manager
        });
      });

      await batch.commit();
      alert(`Successfully synchronized ${dormName} configuration! 🚀`);
      onClose();
    } catch (error: any) {
      alert("Sync failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 text-left leading-none">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md" />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }} 
          className="relative w-full max-w-4xl bg-white rounded-[50px] shadow-2xl p-12 overflow-hidden text-left flex flex-col max-h-[90vh]"
        >
          
          <header className="flex justify-between items-center mb-10 flex-shrink-0">
            <div className="text-left">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-2 italic">Dormitory Registry</p>
                <h2 className="text-3xl font-light text-slate-900 tracking-tight leading-none italic uppercase">Granular <span className="font-bold text-emerald-950 not-italic uppercase tracking-tighter">Customization</span></h2>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-300 hover:text-slate-900"><X size={24}/></button>
          </header>

          <form onSubmit={handleUpdate} className="flex-1 flex flex-col overflow-hidden text-left leading-none">
            {/* Global Cluster Settings */}
            <div className="grid grid-cols-2 gap-8 mb-10 flex-shrink-0">
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cluster Label</label>
                    <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><Building2 size={18} /></div>
                        <input 
                            type="text" required value={dormName}
                            onChange={(e) => setDormName(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[22px] py-4 pl-14 pr-6 outline-none focus:bg-white focus:border-emerald-500 transition-all text-sm text-slate-700 font-bold" 
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned parent</label>
                    <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><UserCircle size={18} /></div>
                        <select 
                            required value={manager}
                            onChange={(e) => setManager(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[22px] py-4 pl-14 pr-12 outline-none focus:bg-white focus:border-emerald-500 transition-all text-sm appearance-none cursor-pointer text-slate-700 font-bold"
                        >
                            {managers.map((m) => <option key={m.id} value={m.fullName}>{m.fullName}</option>)}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><ChevronDown size={16} /></div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                <div className="h-[1px] flex-1 bg-slate-100" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Room-by-Room Inventory</p>
                <div className="h-[1px] flex-1 bg-slate-100" />
            </div>

            {/* Individual Room Grid */}
            <div className="flex-1 overflow-y-auto internal-scroll pr-4 mb-8">
                <div className="grid grid-cols-4 gap-4">
                    {rooms.map((room) => (
                        <div key={room.id} className="bg-slate-50/50 border border-slate-100 p-5 rounded-[30px] flex flex-col items-center gap-3 group hover:bg-white hover:border-emerald-200 transition-all shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-emerald-950 shadow-inner group-hover:bg-emerald-950 group-hover:text-white transition-all italic uppercase">
                                R{room.room_number}
                            </div>
                            <div className="space-y-2 text-center">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Bed Capacity</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number"
                                        min="0"
                                        // SAFE VALUE: Fallback to empty string if 0 or NaN
                                        value={room.total_beds === 0 ? "" : room.total_beds}
                                        onChange={(e) => handleBedChange(room.id, e.target.value)}
                                        className="w-16 bg-white border-2 border-slate-100 rounded-xl py-2 text-center text-xs font-black text-slate-700 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-emerald-950 text-white py-5 rounded-[25px] font-bold uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-emerald-900/40 hover:bg-emerald-900 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18}/> Commit Infrastructure Changes</>}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}