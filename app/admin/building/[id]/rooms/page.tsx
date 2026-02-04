"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { ArrowLeft, Users, DoorOpen, LayoutGrid, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface Room {
  id: string;
  dormID: string;
  dormGroup: string;
  room_number: string;
  total_beds: number;
  occupied_beds: number;
}

export default function RoomSelectionPage() {
  const params = useParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const dormTitle = params.id ? params.id.toString().replace(/-/g, ' ').replace('and', '&').toUpperCase() : "";

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "rooms"), (snap) => {
      const allRooms = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Room[];
      
      const filtered = allRooms.filter(r => {
        if (!r.dormGroup) return false;
        const dbSlug = r.dormGroup.toLowerCase().replace(/['’]/g, '').replace(/ & /g, '-and-').replace(/ \+ /g, '-and-').replace(/ /g, '-').replace(/-+/g, '-');
        const shortSlug = dbSlug.replace("mens-dorm", "md").replace("ladies-dorm", "ld");
        return dbSlug === params.id || shortSlug === params.id;
      });

      setRooms(filtered);
      setLoading(false);
    });

    return () => unsub();
  }, [params.id]);

  const filteredRooms = rooms.filter(r => 
    r.room_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🛠️ SORTING LOGIC: Sinisiguro nito na Room 1 to 10 ang pagkakasunod-sunod
  const groupedRooms = filteredRooms.reduce((acc: Record<string, Room[]>, room: Room) => {
    const key = room.dormID || "Unassigned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(room);
    
    // I-sort ang rooms sa loob ng bawat Dorm ID (e.g. MD4 Room 1, 2, 3...)
    acc[key].sort((a, b) => parseInt(a.room_number) - parseInt(b.room_number));
    
    return acc;
  }, {});

  const totalBeds = rooms.reduce((acc, curr) => acc + (curr.total_beds || 0), 0);
  const totalOccupied = rooms.reduce((acc, curr) => acc + (curr.occupied_beds || 0), 0);

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] p-6 gap-6 overflow-hidden text-left">
      <Sidebar />
      <main className="flex-1 main-shell flex flex-col overflow-hidden bg-white border border-slate-200 rounded-[48px] shadow-2xl">
        
        {/* NAV BAR */}
        <nav className="h-20 px-10 flex items-center justify-between border-b border-slate-50 flex-shrink-0">
          <div className="flex items-center gap-6">
            <Link href="/admin/building" className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-700 border border-transparent hover:border-slate-100 transition-all">
              <ArrowLeft size={18} />
            </Link>
            <div className="text-left">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none uppercase">Housing Hub</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">{dormTitle} Sector</p>
            </div>
          </div>
          <div className="bg-emerald-50 px-5 py-2 rounded-xl border border-emerald-100">
             <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Interactive Map</span>
          </div>
        </nav>

        {/* SEARCH & LEGEND */}
        <div className="px-10 py-5 flex items-center justify-between border-b border-slate-50 flex-shrink-0 bg-slate-50/30">
           <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm focus-within:border-emerald-500 transition-all">
              <Search size={14} className="text-slate-400" />
              <input type="text" placeholder="Find room..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent text-xs outline-none w-40 font-light" />
           </div>
           <div className="flex gap-8">
              <Legend label="Occupied" color="bg-emerald-500" />
              <Legend label="Available" color="bg-slate-200" />
              <Legend label="Full" color="bg-red-500" />
           </div>
        </div>

        {/* ROOM GRID AREA */}
        <div className="flex-1 internal-scroll p-10 overflow-y-auto">
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Organizing Floor Plan...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2 opacity-30">
              <LayoutGrid size={48} strokeWidth={1} />
              <p className="text-xs font-bold uppercase tracking-widest">No rooms found. Run Seeder again.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {Object.keys(groupedRooms).sort().map((dormID) => (
                <div key={dormID} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h3 className="text-[11px] font-black text-emerald-900 uppercase tracking-[0.4em] bg-emerald-50 px-6 py-2.5 rounded-full border border-emerald-100 shadow-sm">
                      {dormID} Identification
                    </h3>
                    <div className="h-[1px] flex-1 bg-slate-100" />
                  </div>

                  <div className="grid grid-cols-3 gap-8">
                    {groupedRooms[dormID].map((room) => (
                      <RoomNode key={room.id} room={room} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER STATS */}
        <footer className="h-24 px-12 border-t border-slate-50 flex items-center justify-between bg-white flex-shrink-0">
           <div className="flex gap-12">
              <StatItem icon={<Users size={16} />} label="Total Group Census" value={`${totalOccupied} / ${totalBeds} Beds`} />
              <StatItem icon={<DoorOpen size={16} />} label="Group Vacancy" value={`${totalBeds - totalOccupied} Slots`} color="amber" />
           </div>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">CLSU HMS v2.6 • Room Order Optimized</p>
        </footer>
      </main>
    </div>
  );
}

function RoomNode({ room }: { room: Room }) {
  const isFull = (room.occupied_beds || 0) >= room.total_beds;
  return (
    <div className={`bg-white border-2 ${isFull ? 'border-red-400' : 'border-emerald-400'} rounded-[40px] p-8 transition-all hover:shadow-xl relative overflow-hidden group text-left`}>
      <div className={`absolute top-0 left-0 w-[6px] h-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} />
      <div className="flex justify-between items-start mb-10 pl-2">
        <div>
           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] mb-2">{room.total_beds}P UNIT</p>
           <h4 className="text-2xl font-semibold text-slate-800 tracking-tight leading-none">Room {room.room_number}</h4>
        </div>
        <div className={`p-3 rounded-2xl ${isFull ? 'bg-red-50' : 'bg-emerald-50'} border border-slate-100`}>
           <LayoutGrid size={18} className={isFull ? 'text-red-500' : 'text-emerald-600'} />
        </div>
      </div>
      <div className="flex flex-wrap gap-3.5 mb-10 pl-2">
        {Array.from({ length: room.total_beds }).map((_, i) => (
          <div key={i} className={`h-4.5 w-4.5 rounded-full border-2 ${i < (room.occupied_beds || 0) ? 'bg-emerald-500 border-emerald-600 shadow-sm' : 'bg-transparent border-slate-200'}`} />
        ))}
      </div>
      <div className="pt-6 border-t border-slate-100 flex justify-between items-end pl-2">
         <div className="text-left">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status</span>
            <span className="text-xs font-semibold text-slate-700">{room.occupied_beds || 0} Occupied</span>
         </div>
         <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl border-2 ${isFull ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-emerald-700 border-emerald-100'}`}>
            {isFull ? 'FULL' : `${room.total_beds - (room.occupied_beds || 0)} OPEN`}
         </span>
      </div>
    </div>
  );
}

function Legend({ label, color }: any) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-3 h-3 rounded-full ${color} border border-slate-200`} />
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function StatItem({ icon, label, value, color = "emerald" }: any) {
  const styles: any = {
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700"
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl border ${styles[color]}`}>{icon}</div>
      <div className="text-left">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}