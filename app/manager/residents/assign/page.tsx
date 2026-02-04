"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/managers/Sidebar';
import { 
  ChevronLeft, Users, Save, Sparkles, X, 
  Loader2, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs, writeBatch, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function AssignRoomPage() {
  const router = useRouter();
  
  // Data States
  const [pendingResidents, setPendingResidents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Drag/Selection States
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const buildingGroup = userDoc.data().assigned_building;
          
          // 1. Fetch Rooms and sort them by Building ID then Room Number
          const qRooms = query(collection(db, "rooms"), where("dormGroup", "==", buildingGroup));
          const roomsSnap = await getDocs(qRooms);
          const initialRooms = roomsSnap.docs.map(d => ({ 
            db_id: d.id, 
            ...d.data(), 
            occupants: [] as any[] 
          })).sort((a: any, b: any) => {
            if (a.dormID !== b.dormID) return a.dormID.localeCompare(b.dormID);
            return parseInt(a.room_number) - parseInt(b.room_number);
          });

          // 2. Real-time sync for Residents and Allocations
          const unsubData = onSnapshot(collection(db, "residents"), async (resSnap) => {
            const allResidents = resSnap.docs.map(d => {
              const data = d.data() as any;
              return { 
                id: d.id, 
                ...data, 
                initial: data.first_name ? data.first_name[0] : '?' 
              };
            });
            
            const allocSnap = await getDocs(collection(db, "allocations"));
            const allocMap = new Map();
            allocSnap.forEach(a => allocMap.set(a.data().studentID, a.data().roomID));

            const queue: any[] = [];
            const updatedRooms = JSON.parse(JSON.stringify(initialRooms));

            allResidents.forEach((res: any) => {
              const roomId = allocMap.get(res.id);
              if (roomId) {
                const roomObj = updatedRooms.find((r: any) => r.db_id === roomId);
                if (roomObj) roomObj.occupants.push(res);
              } else if (res.assigned_building === buildingGroup) {
                queue.push(res);
              }
            });

            setPendingResidents(queue);
            setRooms(updatedRooms);
            setLoading(false);
          });
          return () => unsubData();
        }
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && isDirty) {
        e.preventDefault();
        e.stopPropagation();
        setShowExitModal(true);
      }
    };
    window.addEventListener('click', handleAnchorClick, true);
    return () => window.removeEventListener('click', handleAnchorClick, true);
  }, [isDirty]);

  const handleBack = () => {
    if (isDirty) setShowExitModal(true);
    else router.back();
  };

  const handleSaveLayout = async () => {
    setLoading(true);
    const batch = writeBatch(db);
    
    rooms.forEach(room => {
      room.occupants.forEach((occ: any) => {
        const allocId = `${occ.id}_2025-2026-2nd`;
        const allocRef = doc(db, "allocations", allocId);
        batch.set(allocRef, {
          studentID: occ.id,
          roomID: room.db_id,
          dormID: room.dormID,
          dormGroup: room.dormGroup,
          semesterID: "2025-2026-2nd",
          assignedAt: serverTimestamp()
        });
      });
    });

    try {
      await batch.commit();
      setIsDirty(false);
      setShowExitModal(false);
      alert("Database Synchronized! 🚀");
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    if (selectedUser) window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [selectedUser]);

  const handleSelectFromQueue = (student: any) => {
    setSelectedUser(selectedUser?.id === student.id ? null : student);
  };

  const handleMoveFromRoom = (e: React.MouseEvent, room: any, occupant: any) => {
    e.stopPropagation();
    setIsDirty(true);
    setSelectedUser(occupant);
    setRooms(prev => prev.map(r => r.db_id === room.db_id ? { ...r, occupants: r.occupants.filter((o: any) => o.id !== occupant.id) } : r));
  };

  const handleRoomClick = (roomDbId: string) => {
    if (!selectedUser) return;
    setIsDirty(true);
    setRooms(prev => prev.map(room => {
      if (room.db_id === roomDbId && room.occupants.length < (room.total_beds || 8)) {
        if (!room.occupants.find((o: any) => o.id === selectedUser.id)) {
          return { ...room, occupants: [...room.occupants, selectedUser] };
        }
      }
      return room;
    }));
    setPendingResidents(prev => prev.filter(p => p.id !== selectedUser.id));
    setSelectedUser(null);
  };

  const handleReturnToQueue = () => {
    if (!selectedUser) return;
    setIsDirty(true);
    if (!pendingResidents.find(p => p.id === selectedUser.id)) {
      setPendingResidents(prev => [...prev, selectedUser]);
    }
    setSelectedUser(null);
  };

  const occupiedBeds = rooms.reduce((acc, curr) => acc + curr.occupants.length, 0);
  const totalBeds = rooms.reduce((acc, curr) => acc + (curr.total_beds || 8), 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Group rooms by Dorm ID (e.g. MD4, MD5)
  const groupedRooms = rooms.reduce((groups: any, room) => {
    const dorm = room.dormID;
    if (!groups[dorm]) groups[dorm] = [];
    groups[dorm].push(room);
    return groups;
  }, {});

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] p-6 gap-6 overflow-hidden text-left font-sans cursor-default text-slate-900">
      <Sidebar />
      
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            style={{ position: 'fixed', left: mousePos.x, top: mousePos.y, pointerEvents: 'none', zIndex: 9999, translateX: '-50%', translateY: '-50%' }}
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="p-4 bg-emerald-600 text-white rounded-[24px] shadow-2xl flex items-center gap-4 border-2 border-white/20 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[10px] font-black">{selectedUser.initial}</div>
              <div className="pr-4 text-left">
                <p className="text-[10px] font-bold leading-none uppercase">{selectedUser.first_name} {selectedUser.last_name}</p>
                <p className="text-[8px] opacity-70 uppercase font-black tracking-tighter italic">Relocating...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LayoutGroup>
      <main className="flex-1 flex flex-col overflow-hidden bg-white border border-slate-300 shadow-[0_0_50px_rgba(0,0,0,0.08)] rounded-[45px] relative text-left">
        <nav className="h-24 px-10 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-6 text-left">
            <button onClick={handleBack} className="p-3 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all active:scale-90">
              <ChevronLeft size={20} className="text-slate-400" />
            </button>
            <div className="space-y-0.5 text-left">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] leading-none italic">Allocation Engine</p>
              <h1 className="text-3xl font-extralight text-slate-900 tracking-tighter leading-none italic">Floor Plan <span className="font-bold text-emerald-950 not-italic tracking-tight">Assignment</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-8 bg-slate-50 px-8 py-3 rounded-[24px] border border-slate-200 shadow-inner">
               <div className="text-left">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Building Occupancy</p>
                  <div className="flex items-center gap-3">
                     <span className="text-xl font-black text-slate-800 italic">{occupancyRate}%</span>
                     <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div animate={{ width: `${occupancyRate}%` }} className="h-full bg-emerald-500 rounded-full" />
                     </div>
                     <span className="text-[10px] font-black text-emerald-600 uppercase italic">{occupiedBeds}/{totalBeds} BEDS</span>
                  </div>
               </div>
               <div className="h-8 w-[1px] bg-slate-200" />
               <button 
                onClick={handleSaveLayout}
                disabled={!isDirty || loading}
                className="flex items-center gap-3 bg-emerald-950 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-950/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
               >
                 {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                 {loading ? "Syncing..." : "Save Layout"}
               </button>
            </div>
          </div>
        </nav>

        <div className="flex-1 flex overflow-hidden bg-[#f8fafc]/40 text-left">
          <aside 
            onClick={handleReturnToQueue}
            className={`w-80 border-r border-slate-200 p-8 flex flex-col relative z-20 transition-colors ${selectedUser ? 'bg-emerald-50/30 cursor-pointer hover:bg-emerald-50' : 'bg-white'}`}
          >
             <div className="flex items-center justify-between mb-8 px-2 text-left">
                <div className="flex items-center gap-2 text-left">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">Unassigned Queue</p>
                </div>
                <Users size={14} className="text-slate-300" />
             </div>

             <div className="flex-1 space-y-3 overflow-y-auto internal-scroll pr-2 text-left">
                <AnimatePresence mode="popLayout">
                  {pendingResidents.map((student) => (
                    <motion.div 
                      key={student.id} layout
                      onClick={(e) => { e.stopPropagation(); handleSelectFromQueue(student); }}
                      className={`p-4 rounded-[28px] border-2 flex items-center gap-4 cursor-pointer transition-all ${
                        selectedUser?.id === student.id ? 'bg-emerald-50 border-emerald-500 shadow-md scale-[0.98]' : 'bg-white border-slate-100 hover:border-emerald-300'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-[11px] font-black ${selectedUser?.id === student.id ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                        {student.initial}
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-xs font-bold text-slate-800 leading-none mb-1 uppercase">{student.first_name} {student.last_name}</p>
                        <p className="text-[9px] font-black text-slate-300 uppercase italic leading-none">{student.course} • {student.year_level}</p>
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

          <div className="flex-1 p-12 overflow-y-auto internal-scroll relative text-left">
              <div className="max-w-6xl mx-auto space-y-20">
                {Object.keys(groupedRooms).map((dormId) => (
                  <div key={dormId} className="space-y-8">
                    {/* SECTION HEADER FOR THE DORM BUILDING */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                        <h2 className="text-lg font-black uppercase tracking-[0.4em] text-[#022c22] italic">
                          {dormId === "MD4" ? "Men's Dorm 4" : 
                           dormId === "MD5" ? "Men's Dorm 5" : 
                           dormId === "LD5" ? "Ladies' Dorm 5" : dormId}
                        </h2>
                      </div>
                      <div className="h-[1px] flex-1 bg-slate-200" />
                    </div>

                    {/* GRID OF ROOMS FOR THIS SPECIFIC DORM */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                      {groupedRooms[dormId].map((room: any) => (
                        <div 
                          key={room.db_id}
                          onClick={() => handleRoomClick(room.db_id)}
                          className={`bg-white border-2 rounded-[50px] p-8 shadow-sm flex flex-col items-center justify-center relative transition-all min-h-[300px] cursor-pointer ${
                            selectedUser && room.occupants.length < (room.total_beds || 8) ? 'border-emerald-500 bg-emerald-50/20 shadow-xl scale-[1.02]' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-center mb-8">
                            <p className="text-[16px] font-black uppercase tracking-[0.1em] text-slate-800 italic leading-none">Room {room.room_number}</p>
                          </div>

                          <div className="grid grid-cols-4 gap-4 relative z-10">
                            {[...Array(room.total_beds || 8)].map((_, idx) => {
                              const occupant = room.occupants[idx];
                              return (
                                <div key={idx} className="relative group/avatar">
                                  <div 
                                    onClick={(e) => occupant && handleMoveFromRoom(e, room, occupant)}
                                    className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                                      occupant ? 'bg-[#022c22] border-emerald-800 shadow-xl scale-105 cursor-pointer hover:bg-emerald-900' : 'border-slate-400 border-dashed bg-slate-100/50'
                                    }`}
                                  >
                                    {occupant ? <span className="text-white font-black italic text-sm">{occupant.initial}</span> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400/50" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="absolute bottom-6 flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                            <div className={`w-1.5 h-1.5 rounded-full ${room.occupants.length === (room.total_beds || 8) ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest">{room.occupants.length}/{room.total_beds || 8} OCCUPANCY</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </main>
      </LayoutGroup>

      {/* Aesthetic Unsaved Changes Modal */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 text-left text-slate-900">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl" onClick={() => setShowExitModal(false)} />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[45px] shadow-2xl overflow-hidden p-10 text-center border border-white/20"
            >
              <div className="w-20 h-20 bg-amber-50 rounded-[30px] flex items-center justify-center text-amber-500 mx-auto mb-6 shadow-inner">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight italic mb-2 leading-none">Save Progress?</h2>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-10 px-4 text-center">
                You have modified the room layout. Moving away now will revert all residents to their previous assignments.
              </p>
              <div className="space-y-3 text-center">
                <button 
                  onClick={handleSaveLayout}
                  className="w-full bg-emerald-950 text-white py-4 rounded-[22px] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-900 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
                >
                  <Save size={14} /> Sync and Exit
                </button>
                <button 
                  onClick={() => { setIsDirty(false); router.back(); }}
                  className="w-full py-4 text-[10px] font-black text-rose-500 hover:bg-rose-50 rounded-[22px] uppercase tracking-widest transition-all italic"
                >
                  Discard Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}