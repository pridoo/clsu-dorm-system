"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/managers/Sidebar';
import { 
  ChevronLeft, Users, Save, Sparkles, 
  X
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AssignRoomPage() {
  const router = useRouter();
  
  const [pendingResidents, setPendingResidents] = useState([
    { id: '21-0456', name: 'Bea Santos', initial: 'B', course: 'BSIT', year: '3rd Year' },
    { id: '23-1122', name: 'Erika Mae', initial: 'E', course: 'BSA', year: '1st Year' },
    { id: '24-0999', name: 'Althea Reyes', initial: 'A', course: 'BSME', year: '4th Year' },
  ]);

  const [rooms, setRooms] = useState([
    { id: 101, occupants: [{id: '99', name: 'Celine G.', initial: 'C', course: 'BSED', year: '2nd Year'}], total: 8 },
    { id: 102, occupants: [], total: 8 },
    { id: 103, occupants: [{id: '88', name: 'Maika L.', initial: 'M', course: 'BSIT', year: '4th Year'}], total: 8 },
    { id: 104, occupants: [], total: 8 },
    { id: 105, occupants: [], total: 8 },
    { id: 106, occupants: [], total: 8 },
  ]);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    if (selectedUser) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [selectedUser]);

  const totalBeds = rooms.reduce((acc, curr) => acc + curr.total, 0);
  const occupiedBeds = rooms.reduce((acc, curr) => acc + curr.occupants.length, 0);
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  // Pagkuha sa sidebar
  const handleSelectFromQueue = (student: any) => {
    if (selectedUser?.id === student.id) {
      setSelectedUser(null);
    } else {
      setSelectedUser(student);
    }
  };

  // Pagkuha galing sa Room (Move out to cursor)
  const handleMoveFromRoom = (e: React.MouseEvent, room: any, occupant: any) => {
    e.stopPropagation(); // Iwas trigger sa room click
    setSelectedUser(occupant);
    setRooms(prev => prev.map(r => 
      r.id === room.id 
      ? { ...r, occupants: r.occupants.filter(o => o.id !== occupant.id) }
      : r
    ));
  };

  // Pag-assign sa Room
  const handleRoomClick = (roomId: number) => {
    if (!selectedUser) return;

    setRooms(prev => prev.map(room => {
      if (room.id === roomId && room.occupants.length < room.total) {
        if (!room.occupants.find(o => o.id === selectedUser.id)) {
          return { ...room, occupants: [...room.occupants, selectedUser] };
        }
      }
      return room;
    }));

    setPendingResidents(prev => prev.filter(p => p.id !== selectedUser.id));
    setSelectedUser(null);
  };

  // Pagbalik sa Queue
  const handleReturnToQueue = () => {
    if (!selectedUser) return;
    if (!pendingResidents.find(p => p.id === selectedUser.id)) {
      setPendingResidents(prev => [...prev, selectedUser]);
    }
    setSelectedUser(null);
  };

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] p-6 gap-6 overflow-hidden text-left font-sans cursor-default">
      <Sidebar />
      
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            style={{ 
              position: 'fixed', 
              left: mousePos.x, 
              top: mousePos.y, 
              pointerEvents: 'none', 
              zIndex: 9999,
              translateX: '-50%',
              translateY: '-50%'
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="p-4 bg-emerald-600 text-white rounded-[24px] shadow-2xl flex items-center gap-4 border-2 border-white/20 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[10px] font-black">{selectedUser.initial}</div>
              <div className="pr-4">
                <p className="text-[10px] font-bold leading-none">{selectedUser.name}</p>
                <p className="text-[8px] opacity-70 uppercase font-black tracking-tighter italic">Relocating Resident...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LayoutGroup>
      <main className="flex-1 flex flex-col overflow-hidden bg-white border border-slate-300 shadow-[0_0_50px_rgba(0,0,0,0.08)] rounded-[45px] relative">
        
        <nav className="h-24 px-10 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md z-30 flex-shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="p-3 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all active:scale-90">
              <ChevronLeft size={20} className="text-slate-400" />
            </button>
            <div className="space-y-0.5 text-left">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] leading-none italic">Allocation Engine</p>
              <h1 className="text-3xl font-extralight text-slate-900 tracking-tighter leading-none italic">Floor Plan <span className="font-bold text-emerald-950 not-italic tracking-tight">Assignment</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {selectedUser && (
              <button 
                onClick={() => setSelectedUser(null)}
                className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-all"
              >
                <X size={14} /> Cancel Selection
              </button>
            )}
            <div className="flex items-center gap-8 bg-slate-50 px-8 py-3 rounded-[24px] border border-slate-200 shadow-inner">
               <div className="text-left">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Building Occupancy</p>
                  <div className="flex items-center gap-3">
                     <span className="text-xl font-black text-slate-800 tracking-tighter italic">{occupancyRate}%</span>
                     <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${occupancyRate}%` }} className="h-full bg-emerald-500 rounded-full" />
                     </div>
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter italic">{occupiedBeds}/{totalBeds} BEDS</span>
                  </div>
               </div>
               <div className="h-8 w-[1px] bg-slate-200" />
               <button className="flex items-center gap-3 bg-emerald-950 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-950/30 hover:scale-105 active:scale-95 transition-all">
                 <Save size={14} /> Save Layout
               </button>
            </div>
          </div>
        </nav>

        <div className="flex-1 flex overflow-hidden bg-[#f8fafc]/40">
          <aside 
            onClick={handleReturnToQueue}
            className={`w-80 border-r border-slate-200 p-8 flex flex-col relative z-20 transition-colors ${selectedUser ? 'bg-emerald-50/30 cursor-pointer hover:bg-emerald-50' : 'bg-white'}`}
          >
             <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-2 text-left">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic leading-none">Unassigned Queue</p>
                </div>
                <Users size={14} className="text-slate-300" />
             </div>

             <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                <AnimatePresence mode="popLayout">
                  {pendingResidents.map((student) => (
                    <motion.div 
                      key={student.id}
                      layout
                      onClick={(e) => { e.stopPropagation(); handleSelectFromQueue(student); }}
                      className={`p-4 rounded-[28px] border-2 flex items-center gap-4 cursor-pointer transition-all group ${
                        selectedUser?.id === student.id 
                        ? 'bg-emerald-50 border-emerald-500 shadow-md ring-4 ring-emerald-500/10 scale-[0.98]' 
                        : 'bg-white border-slate-100 hover:border-emerald-300'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-[11px] font-black transition-colors ${
                        selectedUser?.id === student.id ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-emerald-600'
                      }`}>
                        {student.initial}
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-xs font-bold text-slate-800 leading-none mb-1">{student.name}</p>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter italic leading-none">{student.course} • {student.year}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>

             <div className="mt-8 p-5 bg-emerald-50/50 rounded-[32px] border border-emerald-100/50">
                <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest leading-none italic mb-2">Smart Assist</p>
                <p className="text-[10px] text-emerald-700/60 font-medium italic leading-relaxed text-left">
                  {selectedUser ? "Click here to return resident to queue." : "Click a resident to move them."}
                </p>
             </div>
          </aside>

          <div className="flex-1 p-12 overflow-y-auto internal-scroll relative">
             <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-12 px-6">
                   <div className="flex items-center gap-12 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 border-dashed bg-slate-100/50" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Available Bed</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#022c22]" />
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Occupied Slot</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                   {rooms.map((room) => (
                     <div 
                        key={room.id}
                        onClick={() => handleRoomClick(room.id)}
                        className={`bg-white border-2 rounded-[50px] p-8 shadow-sm flex flex-col items-center justify-center relative group transition-all min-h-[300px] cursor-pointer ${
                          selectedUser && room.occupants.length < room.total 
                          ? 'border-emerald-500 bg-emerald-50/20 shadow-xl scale-[1.02]' 
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                     >
                        <p className={`text-[11px] font-black uppercase tracking-[0.5em] mb-8 italic transition-colors ${selectedUser ? 'text-emerald-600' : 'text-slate-400'}`}>Room {room.id}</p>
                        
                        <div className="grid grid-cols-4 gap-4 relative z-10">
                            {[...Array(room.total)].map((_, idx) => {
                             const occupant = room.occupants[idx];
                             return (
                               <div key={idx} className="relative group/avatar">
                                  <div 
                                    onClick={(e) => occupant && handleMoveFromRoom(e, room, occupant)}
                                    className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                                      occupant 
                                      ? 'bg-[#022c22] border-emerald-800 shadow-xl scale-105 hover:bg-emerald-900 cursor-pointer' 
                                      : 'border-slate-400 border-dashed bg-slate-100/50'
                                    }`}
                                  >
                                     {occupant ? (
                                       <span className="text-white font-black italic text-sm">{occupant.initial}</span>
                                     ) : (
                                       <div className="w-1.5 h-1.5 rounded-full bg-slate-400/50" />
                                     )}
                                  </div>
                                  
                                  {/* Tooltip on Hover for occupants in room */}
                                  {occupant && !selectedUser && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-900 text-white p-2 rounded-lg text-[8px] opacity-0 group-hover/avatar:opacity-100 pointer-events-none transition-opacity z-50">
                                      {occupant.name} (Click to move)
                                    </div>
                                  )}
                               </div>
                             );
                            })}
                        </div>

                        <div className="absolute bottom-6 flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                           <div className={`w-1.5 h-1.5 rounded-full ${room.occupants.length === room.total ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                           <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest">{room.occupants.length}/{room.total} OCCUPANCY</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </main>
      </LayoutGroup>
    </div>
  );
}