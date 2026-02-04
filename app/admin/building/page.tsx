"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { Plus, Home, Building2, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import AddDormModal from './modal/add-dorm';
import DormInfoModal from './modal/info-modal';

export default function BuildingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDorm, setSelectedDorm] = useState<any>(null);
  const [dormsData, setDormsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Real-time listener para sa Rooms
    const unsub = onSnapshot(collection(db, "rooms"), (snap) => {
      const allRooms = snap.docs.map(doc => doc.data());
      
      // 2. Grouping Logic base sa Handbook na binigay mo
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
        const occupied = roomsInGroup.reduce((acc, curr) => acc + (curr.occupied_beds || 0), 0);
        const total = roomsInGroup.reduce((acc, curr) => acc + (curr.total_beds || 0), 0);
        
        return {
          ...g,
          occupied,
          total: total || 80, // Fallback kung wala pang rooms na-seed
          manager: "Assigned Manager" // Pwede nating i-fetch sa users soon
        };
      });

      setDormsData(processedDorms);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const menDorms = dormsData.filter(d => d.type === "Men");
  const ladiesDorms = dormsData.filter(d => d.type === "Ladies");

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] p-6 gap-6 overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 main-shell bg-white rounded-[48px] shadow-2xl flex flex-col overflow-hidden">
        <nav className="h-24 px-12 flex items-center justify-between border-b border-slate-50 flex-shrink-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-950 rounded-2xl text-emerald-50 shadow-lg">
               <Building2 size={24} strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-medium text-slate-900">Dormitory Registry</h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.4em] mt-2">CLSU Housing Units</p>
            </div>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 bg-emerald-950 text-white px-8 py-3.5 rounded-2xl hover:bg-emerald-900 transition-all shadow-xl group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Add Unit</span>
          </button>
        </nav>

        <div className="flex-1 internal-scroll p-12 overflow-y-auto">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-emerald-600">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : (
            <>
              <SectionHeader title="Men's Dormitories" subtitle="Sector Alpha" color="text-blue-600" />
              <div className="grid grid-cols-3 gap-8 mb-20">
                {menDorms.map((dorm, i) => (
                  <DormCard key={i} dorm={dorm} onClick={() => setSelectedDorm(dorm)} />
                ))}
              </div>

              <SectionHeader title="Ladies' Dormitories" subtitle="Sector Beta" color="text-rose-600" />
              <div className="grid grid-cols-3 gap-8 mb-16">
                {ladiesDorms.map((dorm, i) => (
                  <DormCard key={i} dorm={dorm} onClick={() => setSelectedDorm(dorm)} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <AddDormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <DormInfoModal isOpen={!!selectedDorm} onClose={() => setSelectedDorm(null)} dormData={selectedDorm} />
    </div>
  );
}

// ... SectionHeader function remains the same ...

function DormCard({ dorm, onClick }: any) {
  const percent = dorm.total > 0 ? Math.round((dorm.occupied / dorm.total) * 100) : 0;
  const isFull = percent >= 100;
  const isNearFull = percent >= 90 && percent < 100;
  const borderClass = isFull ? 'border-red-400' : 'border-emerald-400';

  return (
    <div onClick={onClick} className={`bg-white border-2 ${borderClass} rounded-[40px] p-8 transition-all hover:shadow-xl cursor-pointer relative overflow-hidden group`}>
      <div className={`absolute top-0 left-0 w-[6px] h-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} />
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white transition-colors">
          <Home size={20} className="text-slate-400 group-hover:text-emerald-600" />
        </div>
        <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white ${isFull ? 'bg-red-500' : isNearFull ? 'bg-amber-500' : 'bg-emerald-500'}`}>
          {isFull ? 'Full' : isNearFull ? 'Near Full' : 'Available'}
        </div>
      </div>
      <div className="mb-8">
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{dorm.group}</p>
        <h3 className="text-2xl font-medium text-slate-900 tracking-tight">{dorm.title}</h3>
      </div>
      <div className="mt-auto">
        <div className="flex justify-between items-end mb-3">
          <span className="text-sm font-medium text-slate-700">{dorm.occupied} / {dorm.total} Beds</span>
          <span className={`text-xl font-medium ${percent >= 90 ? 'text-red-500' : 'text-emerald-600'}`}>{percent}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
          <div className={`h-full rounded-full transition-all duration-1000 ${percent >= 90 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}
// Include SectionHeader at bottom for safety
function SectionHeader({ title, subtitle, color }: any) {
    return (
      <div className="flex items-center gap-8 mb-10 text-left">
        <div>
          <h2 className="text-xl font-medium text-slate-800">{title}</h2>
          <p className={`text-[10px] font-medium uppercase tracking-[0.3em] mt-2 ${color}`}>{subtitle}</p>
        </div>
        <div className="h-[1px] flex-1 bg-slate-200/60" />
      </div>
    );
}