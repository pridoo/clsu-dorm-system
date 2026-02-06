"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { Plus, Home, Building2, Loader2, User, Edit3 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import AddDormModal from './modal/add-dorm';
import EditDormModal from './modal/edit-dorm'; 
import DormInfoModal from './modal/info-modal';
import { motion } from 'framer-motion';

// 1. Define Interface para sa TypeScript Safety
interface RoomData {
  id: string;
  dormGroup: string;
  total_beds: number;
  [key: string]: any;
}

export default function BuildingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDorm, setSelectedDorm] = useState<any>(null);
  const [dormToEdit, setDormToEdit] = useState<any>(null);
  const [dormsData, setDormsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConfig, setActiveConfig] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const configSnap = await getDoc(doc(db, "system", "config"));
      if (!configSnap.exists()) {
        setLoading(false);
        return;
      }
      const config = configSnap.data();
      setActiveConfig(config);

      const unsubRooms = onSnapshot(collection(db, "rooms"), async (roomSnap) => {
        // Explicitly map as RoomData type
        const allRooms: RoomData[] = roomSnap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as RoomData[];
        
        const qAlloc = query(
          collection(db, "allocations"),
          where("academicYear", "==", config.academicYear),
          where("semester", "==", config.semester)
        );
        const allocSnap = await getDocs(qAlloc);
        const termAllocations = allocSnap.docs.map(doc => doc.data());

        const managerQuery = query(collection(db, "users"), where("role", "==", "dorm_manager"));
        const managerSnap = await getDocs(managerQuery);
        const managersList = managerSnap.docs.map(d => ({
          fullName: `${d.data().first_name} ${d.data().last_name}`,
          assignedBuilding: d.data().assigned_building
        }));

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
          const roomsInGroup = allRooms.filter((r) => r.dormGroup === g.group);
          const allocsInGroup = termAllocations.filter((a: any) => a.dormGroup === g.group);
          
          const occupied = allocsInGroup.length; 
          // FIX: explicitly typed curr as RoomData
          const total = roomsInGroup.reduce((acc, curr: RoomData) => acc + (curr.total_beds || 0), 0);
          const managerMatch = managersList.find(m => m.assignedBuilding === g.group);
          
          return {
            ...g,
            occupied,
            total: total || 160,
            bedsPerRoom: roomsInGroup[0]?.total_beds || 8, 
            dorm_manager: managerMatch ? managerMatch.fullName : "No Manager Assigned"
          };
        });

        setDormsData(processedDorms);
        setLoading(false);
      });

      return () => unsubRooms();
    };

    fetchData();
  }, []);

  const menDorms = dormsData.filter(d => d.type === "Men");
  const ladiesDorms = dormsData.filter(d => d.type === "Ladies");

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] p-6 gap-6 overflow-hidden font-sans text-slate-900 text-left leading-none">
      <Sidebar />
      
      <main className="flex-1 main-shell bg-white rounded-[48px] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <nav className="h-24 px-12 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md z-10 flex-shrink-0">
          <div className="flex items-center gap-4 text-left leading-none">
            <div className="p-3 bg-emerald-950 rounded-2xl text-emerald-50 shadow-lg">
               <Building2 size={24} strokeWidth={1.5} />
            </div>
            <div className="text-left leading-none">
              <h1 className="text-xl font-normal text-slate-900 tracking-tight leading-none">Dormitory Registry</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] mt-2 leading-none">CLSU Housing Units</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-emerald-50/50 px-5 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3 text-right leading-none">
               <div className="text-right leading-none">
                 <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1 italic leading-none">Term Context</p>
                 <p className="text-[10px] font-black text-emerald-950 uppercase leading-none">{activeConfig?.academicYear} | {activeConfig?.semester}</p>
               </div>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 bg-emerald-950 text-white px-8 py-3.5 rounded-2xl hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-900/20 leading-none">
              <Plus size={18} />
              <span className="text-[10px] uppercase tracking-[0.2em] leading-none">Add Unit</span>
            </button>
          </div>
        </nav>

        <div className="flex-1 internal-scroll p-12 overflow-y-auto bg-[#f8fafc]/50 text-left leading-none">
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-emerald-600 leading-none">
              <Loader2 className="animate-spin" size={40} />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Syncing Term Analytics...</p>
            </div>
          ) : (
            <>
              <SectionHeader title="Men's Dormitories" subtitle="Sector Alpha" color="text-blue-600" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 text-left leading-none">
                {menDorms.map((dorm, i) => (
                  <DormCard key={i} dorm={dorm} 
                    onClick={() => setSelectedDorm(dorm)} 
                    onEdit={(e: any) => { e.stopPropagation(); setDormToEdit(dorm); setIsEditModalOpen(true); }} 
                  />
                ))}
              </div>

              <SectionHeader title="Ladies' Dormitories" subtitle="Sector Beta" color="text-rose-600" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 text-left leading-none">
                {ladiesDorms.map((dorm, i) => (
                  <DormCard key={i} dorm={dorm} 
                    onClick={() => setSelectedDorm(dorm)} 
                    onEdit={(e: any) => { e.stopPropagation(); setDormToEdit(dorm); setIsEditModalOpen(true); }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <AddDormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {isEditModalOpen && <EditDormModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} dormData={dormToEdit} />}
      
      {selectedDorm && <DormInfoModal isOpen={!!selectedDorm} onClose={() => setSelectedDorm(null)} dormData={selectedDorm} />}
    </div>
  );
}

function DormCard({ dorm, onClick, onEdit }: any) {
  const percent = dorm.total > 0 ? Math.round((dorm.occupied / dorm.total) * 100) : 0;
  const isFull = percent >= 100;
  const isNearFull = percent >= 90 && percent < 100;
  const borderClass = isFull ? 'border-rose-400' : 'border-emerald-400';

  return (
    <div onClick={onClick} className={`bg-white border-2 ${borderClass} rounded-[45px] p-8 transition-all hover:shadow-2xl hover:border-emerald-500 cursor-pointer relative overflow-hidden group flex flex-col min-h-[320px] text-left leading-none`}>
      <div className={`absolute top-0 left-0 w-[8px] h-full ${isFull ? 'bg-rose-500' : isNearFull ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      
      <div className="flex justify-between items-start mb-6 text-left leading-none">
        <div className="p-4 bg-slate-50 rounded-2xl transition-colors shadow-inner leading-none">
          <Home size={22} className="text-slate-400 group-hover:text-emerald-600 transition-all" />
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={onEdit}
                className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-950 hover:text-white transition-all shadow-sm"
            >
                <Edit3 size={14} />
            </button>
            <div className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest text-white shadow-lg leading-none ${isFull ? 'bg-rose-500 shadow-rose-200' : isNearFull ? 'bg-amber-500 shadow-amber-200' : 'bg-emerald-500 shadow-emerald-200'}`}>
                {isFull ? 'Full' : isNearFull ? 'Near Cap' : 'Operational'}
            </div>
        </div>
      </div>
      
      <div className="mb-4 text-left leading-none">
        <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-2 italic">{dorm.group}</p>
        <h3 className="text-2xl font-normal text-slate-900 tracking-tight uppercase leading-tight text-left">{dorm.title}</h3>
      </div>

      <div className="flex items-center gap-3 mb-8 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-left leading-none">
         <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 leading-none">
            <User size={14} />
         </div>
         <div className="text-left overflow-hidden leading-none">
            <p className="text-[7px] text-slate-400 uppercase tracking-widest leading-none mb-1">Manager</p>
            <p className="text-[10px] font-normal text-slate-700 truncate uppercase tracking-tighter leading-none text-left">{dorm.dorm_manager}</p>
         </div>
      </div>

      <div className="mt-auto text-left leading-none">
        <div className="flex justify-between items-end mb-3 text-left leading-none">
          <div className="text-left leading-none">
             <p className="text-[8px] text-slate-400 uppercase mb-1 italic leading-none">Sync Progress</p>
             <span className="text-sm text-slate-700 uppercase tracking-tighter leading-none text-left">{dorm.occupied} / {dorm.total} Beds</span>
          </div>
          <span className={`text-2xl font-normal tracking-tighter leading-none ${percent >= 90 ? 'text-rose-500' : 'text-emerald-600'}`}>{percent}%</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner leading-none">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full rounded-full transition-all leading-none ${percent >= 90 ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'}`} 
          />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, color }: any) {
    return (
      <div className="flex items-center gap-10 mb-12 text-left leading-none">
        <div className="text-left leading-none">
          <h2 className="text-2xl font-normal text-slate-800 uppercase tracking-tight leading-none text-left">{title}</h2>
          <p className={`text-[10px] uppercase tracking-[0.4em] mt-3 ${color} leading-none text-left`}>{subtitle}</p>
        </div>
        <div className="h-[1px] flex-1 bg-slate-200/60 shadow-sm leading-none" />
      </div>
    );
}