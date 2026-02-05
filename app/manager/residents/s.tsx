"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/managers/Sidebar';
import EditResidentModal from './modal/edit-residents';
import { 
  Search, Filter, Eye, MapPin, Facebook, Phone, Heart, 
  MoreVertical, X, ChevronRight, UserPlus, Map as MapIcon,
  Loader2, AlertCircle, Edit3, Trash2, UserCircle, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';

export default function ResidentsPage() {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  
  // Live Data States
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const configSnap = await getDoc(doc(db, "system", "config"));
          if (!configSnap.exists()) return;
          const activeConfig = configSnap.data();

          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const managerBuilding = userDoc.data().assigned_building;

            const qResidents = query(
              collection(db, "residents"), 
              where("assigned_building", "==", managerBuilding),
              where("isArchived", "==", false),
              where("registered_academic_year_label", "==", activeConfig.academicYear),
              where("registered_semester_label", "==", activeConfig.semester)
            );

            const unsubRes = onSnapshot(qResidents, async (resSnap) => {
              const allocSnap = await getDocs(collection(db, "allocations"));
              const allocMap = new Map();
              
              allocSnap.forEach(a => {
                const d = a.data();
                allocMap.set(d.studentID, d);
              });

              const liveResidents = resSnap.docs.map(docSnap => {
                const data = docSnap.data();
                const alloc = allocMap.get(docSnap.id);
                
                return {
                  id: docSnap.id,
                  ...data,
                  name: `${data.first_name} ${data.last_name}`,
                  dorm: managerBuilding || 'N/A',                 
                  room: alloc ? `Rm ${alloc.roomID.split('-').pop()}` : 'Unassigned',
                  status: alloc ? 'Active' : 'Pending',
                  contact: data.contact_number || 'N/A',
                  address: `${data.address_street || ''}, ${data.address_city || ''}, ${data.address_province || ''}`,
                  mother_name: `${data.mother_first_name || ''} ${data.mother_last_name || ''}`,
                  father_name: `${data.father_first_name || ''} ${data.father_last_name || ''}`,
                };
              });

              setResidents(liveResidents);
              setLoading(false);
            });

            return () => unsubRes();
          }
        } catch (err) {
          console.error("Fetch Error:", err);
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubAuth();
  }, [router]);

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.student_id && r.student_id.includes(searchTerm)) ||
    r.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] p-6 gap-6 overflow-hidden text-left font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden bg-white border border-slate-300 shadow-[0_0_50px_rgba(0,0,0,0.08)] rounded-[45px] relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] blur-[120px] -z-10 rounded-full" />
        
        <nav className="h-24 px-12 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md z-10">
          <div className="space-y-0.5 text-left leading-none">
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-5 bg-emerald-600 rounded-full" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none italic">Management Suite</p>
            </div>
            <h1 className="text-3xl font-extralight text-slate-900 tracking-tighter leading-none italic uppercase">
              Resident <span className="font-bold text-emerald-950 not-italic tracking-tight text-4xl">Masterlist</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 leading-none">
            <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 focus-within:bg-white focus-within:border-emerald-500 transition-all w-80 text-left">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search active profiles..." 
                className="bg-transparent text-[11px] outline-none w-full font-bold text-slate-700 placeholder:text-slate-300" 
              />
            </div>
            <button 
              onClick={() => router.push('/manager/registration')}
              className="flex items-center gap-2 bg-emerald-950 text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
               <UserPlus size={14} /> New Registry
            </button>
          </div>
        </nav>

        <div className="flex-1 overflow-hidden flex bg-[#f8fafc]/30 text-left">
          <div className="flex-1 overflow-y-auto internal-scroll p-10 text-left scrollbar-hide">
            <div className="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden text-left">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10">
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 italic leading-none text-left">Resident Identity</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-center italic leading-none">Building</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-center italic leading-none">Unit Assignment</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-center italic leading-none">Academic Info</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-right italic leading-none">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-32 border-none">
                        <div className="flex flex-col items-center justify-center gap-3 w-full">
                          <Loader2 className="animate-spin text-emerald-600" size={30} />
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Syncing Masterlist...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredResidents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-32 border-none">
                        <div className="flex justify-center w-full">
                          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">No residents registered for this active period</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredResidents.map((student) => (
                      <tr 
                        key={student.id} 
                        onClick={() => setSelectedStudent(student)}
                        className={`group hover:bg-emerald-50/30 transition-all cursor-pointer ${selectedStudent?.id === student.id ? 'bg-emerald-50/50' : ''}`}
                      >
                        <td className="px-10 py-5">
                          <div className="flex items-center gap-5 text-left leading-none">
                             <div className="w-11 h-11 rounded-[16px] bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-emerald-900 group-hover:bg-white transition-all uppercase shadow-inner italic leading-none">
                                {student.first_name?.[0] || "?"}
                             </div>
                             <div className="text-left leading-none">
                                <p className="text-[15px] font-bold text-slate-800 tracking-tight leading-none mb-1.5 uppercase italic leading-none">{student.name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic leading-none">{student.student_id} • {student.gender}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                            <p className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.2em] italic leading-none">{student.dorm}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <div className="flex justify-center">
                             <span className={`text-[10px] font-black italic px-4 py-1.5 rounded-xl border-2 transition-all ${
                               student.room === 'Unassigned' ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200 uppercase'
                             }`}>
                               {student.room}
                             </span>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-tighter leading-none">{student.year_level}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic mt-1 leading-none">{student.course}</p>
                        </td>
                        <td className="px-10 py-5 text-right">
                           <button className="p-2 text-slate-300 group-hover:text-emerald-600 transition-all leading-none"><ChevronRight size={18} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <AnimatePresence>
            {selectedStudent && (
              <motion.aside 
                initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }}
                className="w-[500px] bg-white border-l border-slate-300 shadow-2xl z-20 flex flex-col text-left"
              >
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
                   <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] italic leading-none">Registry Intel</h2>
                   <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 internal-scroll scrollbar-hide bg-[#f8fafc]/50 text-left">
                   <div className="flex items-center gap-6 leading-none text-left">
                      <div className="w-20 h-20 rounded-[30px] bg-emerald-950 text-white flex items-center justify-center text-2xl font-black italic shadow-xl shadow-emerald-900/20">{selectedStudent.first_name?.[0]}</div>
                      <div className="text-left leading-none">
                         <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase mb-2 leading-none">{selectedStudent.name}</h3>
                         <div className="flex items-center gap-2 leading-none">
                            <div className={`h-1.5 w-1.5 rounded-full ${selectedStudent.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Status: {selectedStudent.status}</p>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 text-left leading-none">
                      <div className="bg-white border border-slate-200 p-5 rounded-[30px] shadow-sm"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Room Location</p><p className="text-sm font-black text-slate-800 italic uppercase leading-none">{selectedStudent.room}</p></div>
                      <div className="bg-white border border-slate-200 p-5 rounded-[30px] shadow-sm"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Registry ID</p><p className="text-sm font-black text-slate-800 italic uppercase leading-none">{selectedStudent.student_id}</p></div>
                   </div>

                   <div className="space-y-4 text-left leading-none">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-blue-500 italic leading-none">Connectivity Hub</p>
                      <div className="grid grid-cols-2 gap-3 text-left leading-none">
                         <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"><Facebook size={16} className="text-blue-600 shrink-0" /><span className="text-[10px] font-bold text-slate-600 truncate leading-none">{selectedStudent.fb_link || 'No FB'}</span></div>
                         <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm"><Phone size={16} className="text-emerald-600 shrink-0" /><span className="text-[10px] font-bold text-slate-600 leading-none">{selectedStudent.contact}</span></div>
                      </div>
                   </div>

                   <div className="space-y-4 text-left leading-none">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-rose-500 italic leading-none">Kinship / Emergency</p>
                      <div className="space-y-3 leading-none text-left">
                         <ContactCard icon={<UserCircle size={18} className="text-rose-500"/>} label="Maternal Contact" name={selectedStudent.mother_name} contact={selectedStudent.mother_contact || 'N/A'} color="rose" />
                         <ContactCard icon={<UserCircle size={18} className="text-blue-500"/>} label="Paternal Contact" name={selectedStudent.father_name} contact={selectedStudent.father_contact || 'N/A'} color="blue" />
                      </div>
                   </div>

                   <div className="space-y-4 text-left pb-10 leading-none">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-orange-500 italic leading-none">Origin Address</p>
                      <div className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-[30px] shadow-sm text-left leading-none">
                         <MapPin size={16} className="text-orange-500 mt-1 shrink-0" />
                         <p className="text-xs font-bold text-slate-600 leading-relaxed italic uppercase text-left leading-none">{selectedStudent.address}</p>
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-slate-100 bg-white/80 backdrop-blur-md mt-auto flex gap-4 leading-none text-left">
                   <button onClick={() => router.push(`/manager/registration?studentId=${selectedStudent.student_id}`)} className="flex-1 bg-emerald-950 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all leading-none">
                    {selectedStudent.room === 'Unassigned' ? 'PROVISION ROOM' : 'MANAGE STAY'}
                   </button>
                   <div className="relative text-left leading-none">
                      <button onClick={() => setIsActionsOpen(!isActionsOpen)} className="px-6 h-full border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all leading-none"><MoreVertical size={16}/></button>
                      <AnimatePresence>
                        {isActionsOpen && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full right-0 mb-4 w-48 bg-white border border-slate-200 shadow-2xl rounded-[25px] p-2 z-[30] text-left leading-none">
                             <button onClick={() => { setIsEditModalOpen(true); setIsActionsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all italic leading-none text-left"><Edit3 size={14} className="text-blue-500" /> Update Profile</button>
                             <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl text-red-600 text-[10px] font-black uppercase tracking-widest transition-all italic leading-none text-left"><Trash2 size={14} /> Remove Resident</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {isEditModalOpen && <EditResidentModal student={selectedStudent} onClose={() => setIsEditModalOpen(false)} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function ContactCard({ icon, label, name, contact, color }: any) {
  const themes: any = {
    rose: "bg-rose-50/30 border-rose-100 text-rose-600",
    blue: "bg-blue-50/30 border-blue-100 text-blue-600",
    amber: "bg-amber-50/30 border-amber-100 text-amber-600"
  };
  return (
    <div className={`${themes[color]} border p-5 rounded-[30px] flex items-center justify-between shadow-sm text-left leading-none`}>
       <div className="flex items-center gap-4 text-left leading-none">
          {icon}
          <div className="text-left leading-none">
             <p className={`text-[8px] font-black uppercase tracking-widest mb-1 italic opacity-60 text-left leading-none`}>{label}</p>
             <p className="text-xs font-bold text-slate-800 tracking-tight uppercase italic text-left leading-none">{name}</p>
          </div>
       </div>
       <p className="text-[11px] font-black italic tracking-tighter text-left leading-none">{contact}</p>
    </div>
  );
}