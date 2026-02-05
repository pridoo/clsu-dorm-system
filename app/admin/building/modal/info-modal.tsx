"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Users, MapPin, ShieldCheck, 
  Activity, ArrowRight, PieChart, Info, 
  Settings, Clock, Lock, Loader2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, limit } from 'firebase/firestore';

export default function DormInfoModal({ isOpen, onClose, dormData }: any) {
  const [activeTab, setActiveTab] = useState('overview');
  const [residents, setResidents] = useState<any[]>([]);
  const [assignedManager, setAssignedManager] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && dormData) {
      // 1. FETCH ASSIGNED MANAGER
      const fetchManager = async () => {
        const q = query(
          collection(db, "users"), 
          where("role", "==", "dorm_manager"),
          where("assigned_building", "==", dormData.group)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setAssignedManager(snap.docs[0].data());
        } else {
          setAssignedManager(null);
        }
      };
      fetchManager();

      // 2. FETCH RESIDENTS (REAL-TIME)
      if (activeTab === 'residents') {
        setLoading(true);
        // Hinahanap natin sa allocations lahat ng kabilang sa grupong ito (e.g. MD 4 & 5)
        const q = query(
          collection(db, "allocations"), 
          where("dormGroup", "==", dormData.group)
        );

        const unsub = onSnapshot(q, async (snap) => {
          const residentsList: any[] = [];
          
          // Gagamit tayo ng Promise.all para mabilis ang pag-fetch ng names
          const promises = snap.docs.map(async (allocationDoc) => {
            const allocData = allocationDoc.data();
            const resDoc = await getDoc(doc(db, "residents", allocData.studentID));
            if (resDoc.exists()) {
              return {
                id: allocationDoc.id,
                room: allocData.roomID.split('-').pop(), // MD4-RM1 -> RM1
                ...resDoc.data()
              };
            }
            return null;
          });

          const results = await Promise.all(promises);
          setResidents(results.filter(r => r !== null));
          setLoading(false);
        });
        
        return () => unsub();
      }
    }
  }, [isOpen, dormData, activeTab]);

  if (!isOpen || !dormData) return null;

  const percent = dormData.total > 0 ? Math.round((dormData.occupied / dormData.total) * 100) : 0;

  const handleOpenFloorPlan = () => {
    // Kinoconvert ang "Men's Dorm 4 & 5" into a URL safe slug
    const slug = dormData.group.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
    router.push(`/admin/building/${slug}/rooms`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />

        <motion.div initial={{ scale: 0.9, opacity: 0, y: 60 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 60 }} className="relative w-full max-w-5xl bg-[#fcfdfe] rounded-[56px] shadow-2xl overflow-hidden flex h-[680px] border border-white/50">
          
          {/* LEFT PANEL */}
          <div className="w-[38%] bg-emerald-950 p-14 text-white flex flex-col justify-between relative overflow-hidden flex-shrink-0 text-left font-sans">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-400/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-[24px] border border-emerald-500/30 flex items-center justify-center mb-10">
                <ShieldCheck className="text-emerald-400" size={32} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-emerald-400/60 mb-3">Facility Hub</p>
              <h2 className="text-5xl font-light tracking-tight mb-4 leading-none italic">{dormData.title}</h2>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] tracking-widest uppercase">
                {dormData.group}
              </div>
            </div>

            <div className="relative z-10">
              <div className="space-y-2 mb-8 text-left">
                <div className="flex justify-between items-end">
                   <span className="text-6xl font-light tracking-tighter">{percent}%</span>
                   <span className="text-[10px] uppercase font-bold opacity-40 mb-3 tracking-widest text-left">Occupancy</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-[2px]">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1 }} className="h-full bg-emerald-400 rounded-full shadow-[0_0_20px_#10b981]" />
                </div>
              </div>
              <p className="text-[11px] font-medium leading-relaxed opacity-50 text-left">Monitoring housing cluster operations and real-time registry status.</p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
            <div className="px-14 pt-12 pb-6 flex items-center justify-between border-b border-slate-100 flex-shrink-0 bg-white">
               <nav className="flex gap-10">
                  {['overview', 'residents', 'settings'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`relative pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'text-emerald-950' : 'text-slate-300 hover:text-slate-400'}`}>
                      {tab}
                      {activeTab === tab && <motion.div layoutId="t-line" className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-600 rounded-full" />}
                    </button>
                  ))}
               </nav>
               <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-900 border border-slate-100 transition-colors"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 internal-scroll">
               {activeTab === 'overview' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                    <section className="text-left">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Management</h3>
                      <div className="group flex items-center gap-6 p-6 rounded-[35px] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 uppercase font-black">
                          {assignedManager ? assignedManager.first_name[0] : <User size={24} />}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Designated Manager</p>
                          <p className="text-lg font-medium text-slate-800 uppercase italic">
                            {assignedManager ? `${assignedManager.first_name} ${assignedManager.last_name}` : "Pending Assignment"}
                          </p>
                        </div>
                        <ArrowRight size={18} className="text-slate-200" />
                      </div>
                    </section>

                    <section className="text-left">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 text-left">Facility Breakdown</h3>
                      <div className="grid grid-cols-2 gap-5">
                        <InfoItem icon={<Users size={18} />} label="Total Population" value={`${dormData.occupied} Enrolled`} />
                        <InfoItem icon={<PieChart size={18} />} label="Group Category" value={dormData.group} />
                        <InfoItem icon={<MapPin size={18} />} label="Sector" value="CLSU Main" />
                        <InfoItem icon={<Activity size={18} />} label="Registry Status" value="Live Sync" />
                      </div>
                    </section>
                 </motion.div>
               )}

               {activeTab === 'residents' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-emerald-600" size={32} />
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Fetching Registry...</p>
                      </div>
                    ) : residents.length > 0 ? residents.map((r) => (
                      <div key={r.id} className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-all text-left group">
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-700 font-bold text-[10px] uppercase shadow-inner group-hover:bg-emerald-50 transition-colors">RM {r.room}</div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-slate-800 tracking-tight uppercase">{r.first_name} {r.last_name}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">{r.course} • YEAR {r.year_level}</p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-emerald-600 transition-all"><Info size={16} /></button>
                      </div>
                    )) : (
                      <div className="text-center py-20">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Users className="text-slate-200" size={24} />
                         </div>
                         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No residents found in this cluster</p>
                      </div>
                    )}
                 </motion.div>
               )}
            </div>

            <div className="px-14 py-8 bg-white border-t border-slate-100 flex gap-4 flex-shrink-0">
              <button onClick={handleOpenFloorPlan} className="flex-1 bg-emerald-950 text-white py-5 rounded-[22px] text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl hover:bg-emerald-900 transition-all active:scale-95">Open Floor Plan</button>
              <button className="px-10 py-5 rounded-[22px] border border-slate-200 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all">Download Masterlist</button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function InfoItem({ icon, label, value }: any) {
  return (
    <div className="p-7 rounded-[35px] border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-all duration-500 group text-left">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-700 mb-5 group-hover:scale-110 transition-transform shadow-inner">{icon}</div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-left">{label}</p>
      <p className="text-sm font-semibold text-slate-800 tracking-tight leading-none text-left uppercase">{value}</p>
    </div>
  );
}