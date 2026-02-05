"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { Plus, Home, Building2, Loader2, User } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import AddDormModal from './modal/add-dorm';
import DormInfoModal from './modal/info-modal';
import { motion } from 'framer-motion';

export default function BuildingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDorm, setSelectedDorm] = useState<any>(null);
  const [dormsData, setDormsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Real-time listener para sa Rooms at Allocations
    const unsubData = onSnapshot(collection(db, "rooms"), async (roomSnap) => {
      const allRooms = roomSnap.docs.map(doc => doc.data());
      
      // Fetch Allocations directly para makuha ang occupancy
      const allocSnap = await getDocs(collection(db, "allocations"));
      const allAllocations = allocSnap.docs.map(doc => doc.data());

      // 2. Fetch Users na ang role ay "dorm_manager" (sakto sa screenshot mo)
      const managerQuery = query(collection(db, "users"), where("role", "==", "dorm_manager"));
      const managerSnap = await getDocs(managerQuery);
      const managersList = managerSnap.docs.map(d => ({
        fullName: `${d.data().first_name} ${d.data().last_name}`,
        assignedBuilding: d.data().assigned_building // "Men's Dorm 4 & 5"
      }));

      // 3. Grouping Logic
      const groups = [
        { title: "MD 4 & 5", group: "Men's Dorm 4 & 5", type: "Men" },
        { title: "MD 6 & 7", group: "Men's Dorm 6 & 7", type: "Men" },
        { title: "MD 8 & 9", group: "Men's Dorm 8 & 9", type: "Men" },
        { title: "MD 10 & 11", group: "Men's Dorm 10 & 11", type: "Men" },
        { title: "Ladies' D1", group: "Ladies' Dorm 1", type: "Ladies" },
        { title: "Ladies' D2", group: "Ladies' Dorm 2", type: "Ladies" },
        { title: "Ladies' D3", group: "Ladies' Dorm 3", type: "Ladies" },
        { title: "Ladies' D4", group: "Ladies' Dorm 4", type: "Ladies" },
        { title: "L5 & Annex", group: "Ladies' Dorm 5 + Annex", type: "Ladies" },
        { title: "Ladies' D6", group: "Ladies' Dorm 6", type: "Ladies" },
        { title: "L7 & L8", group: "Ladies' Dorm 7 & 8", type: "Ladies" },
        { title: "Ladies' D9", group: "Ladies' Dorm 9", type: "Ladies" },
        { title: "Ladies' D10", group: "Ladies' Dorm 10", type: "Ladies" },
      ];

      const processedDorms = groups.map(g => {
        const roomsInGroup = allRooms.filter(r => r.dormGroup === g.group);
        const allocsInGroup = allAllocations.filter(a => a.dormGroup === g.group);
        
        const occupied = allocsInGroup.length; 
        const total = roomsInGroup.reduce((acc, curr) => acc + (curr.total_beds || 0), 0);
        
        // Exact string comparison para sa manager matching
        const managerMatch = managersList.find(m => m.assignedBuilding === g.group);
        
        return {
          ...g,
          occupied,
          total: total || 160,
          dorm_manager: managerMatch ? managerMatch.fullName : "No Manager Assigned"
        };
      });

      setDormsData(processedDorms);
      setLoading(false);
    });

    return () => unsubData();
  }, []);

  const menDorms = dormsData.filter(d => d.type === "Men");
  const ladiesDorms = dormsData.filter(d => d.type === "Ladies");

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] p-6 gap-6 overflow-hidden font-sans text-slate-900 text-left">
      <Sidebar />
      
      <main className="flex-1 main-shell bg-white rounded-[48px] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <nav className="h-24 px-12 flex items-center justify-between border-b border-slate-50 flex-shrink-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-emerald-950 rounded-2xl text-emerald-50 shadow-lg">
               <Building2 size={24} strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-normal text-slate-900 tracking-tight leading-none">Dormitory Registry</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] mt-2 leading-none">CLSU Housing Units</p>
            </div>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 bg-emerald-950 text-white px-8 py-3.5 rounded-2xl hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-900/20">
            <Plus size={18} />
            <span className="text-[10px] uppercase tracking-[0.2em]">Add Unit</span>
          </button>
        </nav>

        <div className="flex-1 internal-scroll p-12 overflow-y-auto bg-[#f8fafc]/50 text-left">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-emerald-600">
              <Loader2 className="animate-spin" size={40} />
            </div>
          ) : (
            <>
              <SectionHeader title="Men's Dormitories" subtitle="Sector Alpha" color="text-blue-600" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 text-left">
                {menDorms.map((dorm, i) => (
                  <DormCard key={i} dorm={dorm} onClick={() => setSelectedDorm(dorm)} />
                ))}
              </div>

              <SectionHeader title="Ladies' Dormitories" subtitle="Sector Beta" color="text-rose-600" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 text-left">
                {ladiesDorms.map((dorm, i) => (
                  <DormCard key={i} dorm={dorm} onClick={() => setSelectedDorm(dorm)} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <AddDormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {selectedDorm && <DormInfoModal isOpen={!!selectedDorm} onClose={() => setSelectedDorm(null)} dormData={selectedDorm} />}
    </div>
  );
}

function DormCard({ dorm, onClick }: any) {
  const percent = dorm.total > 0 ? Math.round((dorm.occupied / dorm.total) * 100) : 0;
  const isFull = percent >= 100;
  const isNearFull = percent >= 90 && percent < 100;
  const borderClass = isFull ? 'border-rose-400' : 'border-emerald-400';

  return (
    <div onClick={onClick} className={`bg-white border-2 ${borderClass} rounded-[45px] p-8 transition-all hover:shadow-2xl hover:border-emerald-500 cursor-pointer relative overflow-hidden group flex flex-col min-h-[320px] text-left`}>
      <div className={`absolute top-0 left-0 w-[8px] h-full ${isFull ? 'bg-rose-500' : isNearFull ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      
      <div className="flex justify-between items-start mb-6 text-left">
        <div className="p-4 bg-slate-50 rounded-2xl transition-colors shadow-inner">
          <Home size={22} className="text-slate-400 group-hover:text-emerald-600 transition-all" />
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest text-white shadow-lg ${isFull ? 'bg-rose-500 shadow-rose-200' : isNearFull ? 'bg-amber-500 shadow-amber-200' : 'bg-emerald-500 shadow-emerald-200'}`}>
          {isFull ? 'Critical Full' : isNearFull ? 'Near Capacity' : 'Operational'}
        </div>
      </div>
      
      <div className="mb-4 text-left">
        <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-1">{dorm.group}</p>
        <h3 className="text-2xl font-normal text-slate-900 tracking-tight uppercase leading-tight">{dorm.title}</h3>
      </div>

      <div className="flex items-center gap-3 mb-8 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-left">
         <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
            <User size={14} />
         </div>
         <div className="text-left overflow-hidden">
            <p className="text-[7px] text-slate-400 uppercase tracking-widest leading-none mb-0.5">Dorm Manager</p>
            <p className="text-[10px] font-normal text-slate-700 truncate uppercase tracking-tighter">{dorm.dorm_manager}</p>
         </div>
      </div>

      <div className="mt-auto text-left">
        <div className="flex justify-between items-end mb-3 text-left">
          <div className="text-left">
             <p className="text-[8px] text-slate-400 uppercase mb-0.5">Utilization Status</p>
             <span className="text-sm text-slate-700 uppercase tracking-tighter">{dorm.occupied} / {dorm.total} Beds Occupied</span>
          </div>
          <span className={`text-2xl font-normal tracking-tighter ${percent >= 90 ? 'text-rose-500' : 'text-emerald-600'}`}>{percent}%</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full rounded-full transition-all ${percent >= 90 ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'}`} 
          />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, color }: any) {
    return (
      <div className="flex items-center gap-10 mb-12 text-left">
        <div className="text-left">
          <h2 className="text-2xl font-normal text-slate-800 uppercase tracking-tight leading-none">{title}</h2>
          <p className={`text-[10px] uppercase tracking-[0.4em] mt-3 ${color} leading-none`}>{subtitle}</p>
        </div>
        <div className="h-[1px] flex-1 bg-slate-200/60 shadow-sm" />
      </div>
    );
}