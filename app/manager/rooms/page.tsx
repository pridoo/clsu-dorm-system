"use client";
import { useState, useEffect } from 'react';
import ManagerSidebar from '@/components/managers/Sidebar';
import { 
  Search, Users, Bed, ChevronRight, 
  Sparkles, X, User, Info, 
  LayoutGrid, MapPin, ArrowRightLeft, Check, Loader2
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

export default function RoomsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [buildingName, setBuildingName] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [movingResident, setMovingResident] = useState<any>(null);
  const [destinationRoomId, setDestinationRoomId] = useState<string | null>(null);

  // 1. Live Data Synchronization
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push('/login');

      // Kunin ang profile para malaman ang building cluster
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.data();
      const cluster = userData?.assigned_building || "";
      setBuildingName(cluster);

      // Listen sa Rooms ng building na ito
      const qRooms = query(collection(db, "rooms"), where("dormGroup", "==", cluster));
      const unsubRooms = onSnapshot(qRooms, async (roomSnap) => {
        
        // Listen sa Allocations para makuha ang mga pangalan
        const qAlloc = query(collection(db, "allocations"), where("dormGroup", "==", cluster));
        onSnapshot(qAlloc, async (allocSnap) => {
          const allocData = allocSnap.docs.map(d => d.data());
          
          const roomsList = await Promise.all(roomSnap.docs.map(async (rDoc) => {
            const room = rDoc.data();
            const roomID = rDoc.id;
            
            // Hanapin ang occupants sa room na ito
            const occupantsInRoom = allocData.filter(a => a.roomID === roomID);
            
            // Fetch names for occupants (Minimal fetch logic)
            const occupantsWithNames = await Promise.all(occupantsInRoom.map(async (occ) => {
               const resSnap = await getDoc(doc(db, "residents", occ.studentID));
               const resData = resSnap.data();
               return {
                 id: occ.studentID,
                 name: `${resData?.first_name} ${resData?.last_name}`,
                 initial: resData?.first_name?.[0] || "R",
                 allocationId: occ.studentID // base sa document ID mo
               };
            }));

            return {
              id: roomID,
              displayId: room.room_number,
              type: room.total_beds + 'P',
              floor: roomID.includes('RM1') ? '1st Floor' : 'Upper Floor', // Simple floor logic
              total: room.total_beds,
              occupants: occupantsWithNames,
            };
          }));

          setRooms(roomsList.sort((a, b) => a.displayId.localeCompare(b.displayId)));
          setLoading(false);
        });
      });
    });
  }, []);

  // 2. Real Firestore Transfer Action
  const handleExecuteTransfer = async () => {
    if (!movingResident || !destinationRoomId || !selectedRoom) return;

    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      // Update Allocation Document
      const allocRef = doc(db, "allocations", movingResident.id); // Assuming ID is studentID
      batch.update(allocRef, { 
        roomID: destinationRoomId,
        updatedAt: serverTimestamp()
      });

      // Update Source Room Count
      const sourceRoomRef = doc(db, "rooms", selectedRoom.id);
      batch.update(sourceRoomRef, { occupied_beds: selectedRoom.occupants.length - 1 });

      // Update Destination Room Count
      const destRoom = rooms.find(r => r.id === destinationRoomId);
      const destRoomRef = doc(db, "rooms", destinationRoomId);
      batch.update(destRoomRef, { occupied_beds: destRoom.occupants.length + 1 });

      await batch.commit();
      
      setMovingResident(null);
      setDestinationRoomId(null);
      setSelectedRoom(null);
      alert("Resident Relocated Successfully! 🚀");
    } catch (error) {
      alert("Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] p-6 gap-6 overflow-hidden text-left font-sans">
      <ManagerSidebar />
      
      <LayoutGroup>
        <main className="flex-1 flex flex-col overflow-hidden bg-white border border-slate-300 shadow-2xl rounded-[45px] relative">
          
          {/* Header */}
          <nav className="h-24 px-12 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md z-10 flex-shrink-0">
            <div className="space-y-0.5 text-left">
              <div className="flex items-center gap-2">
                 <div className="h-1.5 w-6 bg-emerald-600 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic text-left">Inventory Hub</p>
              </div>
              <h1 className="text-3xl font-extralight text-slate-900 tracking-tighter leading-none italic text-left uppercase">
                {buildingName || "Loading..."} <span className="font-bold text-emerald-950 not-italic tracking-tight text-4xl">Floorplan</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <Users size={14} className="text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-950 uppercase tracking-widest leading-none">Live Capacity</span>
               </div>
            </div>
          </nav>

          <div className="flex-1 overflow-hidden flex bg-[#f8fafc]/30">
            {loading ? (
              <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>
            ) : (
              <div className="flex-1 overflow-y-auto internal-scroll p-10 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {rooms.map((room) => (
                    <motion.div 
                      key={room.id}
                      layout
                      whileHover={{ y: -8 }}
                      onClick={() => !movingResident && setSelectedRoom(room)}
                      className={`bg-white border-2 p-8 rounded-[50px] shadow-sm cursor-pointer transition-all relative ${
                        selectedRoom?.id === room.id ? 'border-emerald-500 shadow-2xl ring-8 ring-emerald-500/5' : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-10">
                         <div className="text-left">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Type: {room.type}</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight italic mt-2 leading-none uppercase">Room {room.displayId}</h3>
                         </div>
                         <div className="p-3 bg-slate-50 rounded-2xl shadow-inner"><LayoutGrid size={18} className="text-slate-300" /></div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-10">
                         {[...Array(room.total)].map((_, i) => {
                           const resident = room.occupants[i];
                           return (
                             <div key={i} className="relative group/avatar">
                                <motion.div 
                                  layoutId={resident?.id}
                                  className={`h-11 w-11 rounded-full border-2 flex items-center justify-center transition-all ${
                                    resident ? 'bg-emerald-950 border-emerald-800 shadow-lg' : 'border-slate-300 border-dashed bg-slate-50/50'
                                  }`}
                                >
                                  {resident ? <span className="text-white font-black italic text-[13px]">{resident.initial}</span> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                                </motion.div>
                                {resident && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-emerald-950 text-white rounded-lg opacity-0 group-hover/avatar:opacity-100 z-50 whitespace-nowrap text-[8px] font-black uppercase">
                                    {resident.name}
                                  </div>
                                )}
                             </div>
                           );
                         })}
                      </div>

                      <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                         <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                            <div className={`w-1.5 h-1.5 rounded-full ${room.occupants.length === room.total ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{room.occupants.length}/{room.total} Slots</p>
                         </div>
                         <ChevronRight size={18} className="text-slate-200" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Info Panel */}
            <AnimatePresence>
              {selectedRoom && (
                <motion.aside initial={{ x: 450 }} animate={{ x: 0 }} exit={{ x: 450 }} className="w-[450px] bg-white border-l border-slate-300 shadow-2xl z-20 flex flex-col">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
                     <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] italic text-left">Room Intel</h2>
                     <button onClick={() => {setSelectedRoom(null); setMovingResident(null);}} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><X size={20} /></button>
                  </div>

                  <div className="p-8 flex-1 overflow-y-auto space-y-8 text-left scrollbar-hide bg-[#f8fafc]/50">
                     {!movingResident ? (
                       <>
                         <div className="bg-emerald-950 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden border border-emerald-800">
                            <Sparkles className="absolute top-4 right-4 text-emerald-500/20" size={40} />
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">{selectedRoom.floor}</p>
                            <h3 className="text-5xl font-extralight italic tracking-tighter leading-none mt-2 uppercase">Unit {selectedRoom.displayId}</h3>
                         </div>

                         <div className="space-y-5">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-2 border-emerald-500 pl-3 italic">Registered Occupants</p>
                            <div className="space-y-3">
                               {selectedRoom.occupants.map((occ: any) => (
                                 <div key={occ.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[30px] shadow-sm hover:border-emerald-200 transition-all">
                                    <div className="flex items-center gap-5 text-left">
                                       <div className="w-11 h-11 rounded-[18px] bg-emerald-950 text-white flex items-center justify-center italic font-black shadow-lg">{occ.initial}</div>
                                       <div>
                                          <p className="text-sm font-bold text-slate-800 leading-none mb-1.5 uppercase">{occ.name}</p>
                                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic leading-none">Registry ID: {occ.id}</p>
                                       </div>
                                    </div>
                                    <button onClick={() => setMovingResident(occ)} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm"><ArrowRightLeft size={16} /></button>
                                 </div>
                               ))}
                            </div>
                         </div>
                       </>
                     ) : (
                       <div className="space-y-8 animate-in slide-in-from-right duration-300">
                          <div className="flex items-center gap-4 bg-blue-50 p-6 rounded-[35px] border border-blue-100">
                             <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black italic shadow-lg">{movingResident.initial}</div>
                             <div className="text-left">
                                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 italic">Relocation logic</p>
                                <h3 className="text-lg font-bold text-slate-800 uppercase">{movingResident.name}</h3>
                             </div>
                             <button onClick={() => setMovingResident(null)} className="ml-auto text-slate-400 hover:text-slate-900"><X size={16}/></button>
                          </div>

                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-2 border-blue-500 pl-3 italic">Select Destination Unit</p>
                          <div className="grid grid-cols-2 gap-4">
                             {rooms.map((r) => {
                               const isFull = r.occupants.length >= r.total;
                               const isCurrent = r.id === selectedRoom.id;
                               const isSelected = destinationRoomId === r.id;
                               return (
                                 <button 
                                   key={r.id} 
                                   disabled={isFull || isCurrent}
                                   onClick={() => setDestinationRoomId(r.id)}
                                   className={`p-6 rounded-[30px] border-2 transition-all flex flex-col items-center gap-3 relative ${
                                     isFull ? 'opacity-40 grayscale bg-slate-100 border-slate-200' : 
                                     isCurrent ? 'opacity-30 border-slate-100 bg-slate-50' :
                                     isSelected ? 'border-blue-600 bg-blue-50 shadow-xl scale-105' :
                                     'bg-white border-slate-100 hover:border-blue-400'
                                   }`}
                                 >
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Room</p>
                                    <h4 className="text-2xl font-black text-slate-800 italic uppercase">{r.displayId}</h4>
                                    <p className="text-[9px] font-bold text-slate-400">{r.occupants.length}/8</p>
                                    {isSelected && <div className="absolute top-3 right-3 bg-blue-600 p-1.5 rounded-full text-white shadow-lg"><Check size={10} /></div>}
                                 </button>
                               );
                             })}
                          </div>
                       </div>
                     )}
                  </div>

                  <div className="p-8 border-t border-slate-100 mt-auto bg-white/80 backdrop-blur-md">
                     {movingResident ? (
                       <button 
                         disabled={!destinationRoomId || loading}
                         onClick={handleExecuteTransfer}
                         className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl transition-all ${
                           destinationRoomId ? 'bg-blue-600 text-white hover:scale-[1.02]' : 'bg-slate-100 text-slate-300'
                         }`}
                       >
                         {loading ? <Loader2 className="animate-spin inline" size={14}/> : "EXECUTE TRANSFER"}
                       </button>
                     ) : (
                       <button onClick={() => router.push('/manager/registration')} className="w-full bg-emerald-950 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-all">MANAGE REGISTRY</button>
                     )}
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        </main>
      </LayoutGroup>
    </div>
  );
}