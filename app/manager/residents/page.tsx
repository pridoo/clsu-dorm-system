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
        // 1. Kunin ang building ng manager
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const building = userDoc.data().assigned_building;

          // 2. Makinig sa Residents ng building na ito
          const qResidents = query(
            collection(db, "residents"), 
            where("assigned_building", "==", building)
          );

          const unsubRes = onSnapshot(qResidents, async (resSnap) => {
            // Kunin ang lahat ng allocations para i-map sa residents
            const allocSnap = await getDocs(collection(db, "allocations"));
            const allocMap = new Map();
            
            allocSnap.forEach(a => {
              const d = a.data();
              // I-save ang allocation gamit ang studentID bilang susi
              allocMap.set(d.studentID, d);
            });

            const liveResidents = resSnap.docs.map(docSnap => {
              const data = docSnap.data();
              // Mapping logic gamit ang Firestore Document ID
              const alloc = allocMap.get(docSnap.id);
              
              return {
                id: docSnap.id,
                ...data,
                name: `${data.first_name} ${data.last_name}`,
                // Kunin ang Dorm ID (e.g., MD4, MD5) para sa Building Location Column                
                dorm: alloc ? alloc.dormID : 'N/A',                 
                // Kunin ang Room Number (e.g., Rm 1)
                room: alloc ? `Rm ${alloc.roomID.split('-').pop()}` : 'Unassigned',
                status: alloc ? 'Active' : 'Pending',
                fb: data.fb_link || 'Not Provided',
                contact: data.contact_number,
                address: `${data.address_street}, ${data.address_city}, ${data.address_province}`,
                mother_name: `${data.mother_first_name} ${data.mother_last_name}`,
                father_name: `${data.father_first_name} ${data.father_last_name}`,
                guardian_name: data.guardian_first_name ? `${data.guardian_first_name} ${data.guardian_last_name}` : null,
                mother_contact: data.mother_contact,
                father_contact: data.father_contact,
                guardian_contact: data.guardian_contact
              };
            });

            setResidents(liveResidents);
            setLoading(false);
          });

          return () => unsubRes();
        }
      }
    });
    return () => unsubAuth();
  }, []);

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.student_id.includes(searchTerm) ||
    r.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.dorm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] p-6 gap-6 overflow-hidden text-left font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden bg-white border border-slate-300 shadow-[0_0_50px_rgba(0,0,0,0.08)] rounded-[45px] relative text-left">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] blur-[120px] -z-10 rounded-full" />
        
        {/* Header Section */}
        <nav className="h-24 px-12 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md z-10 text-left">
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 text-left">
               <div className="h-1.5 w-5 bg-emerald-600 rounded-full shadow-[0_0_12px_rgba(5,150,105,0.4)]" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Management Suite</p>
            </div>
            <h1 className="text-3xl font-extralight text-slate-900 tracking-tighter leading-none italic text-left">
              Resident <span className="font-bold text-emerald-950 not-italic tracking-tight text-4xl">Masterlist</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 focus-within:bg-white focus-within:border-emerald-500 transition-all w-80 text-left">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, ID, or room..." 
                className="bg-transparent text-[11px] outline-none w-full font-bold text-slate-700" 
              />
            </div>
            <button 
              onClick={() => router.push('/manager/residents/assign')}
              className="flex items-center gap-2 bg-emerald-950 text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:scale-105 active:scale-95 transition-all"
            >
               <UserPlus size={14} /> Bulk Assign
            </button>
          </div>
        </nav>

        {/* Table Content */}
        <div className="flex-1 overflow-hidden flex bg-[#f8fafc]/30 text-left">
          <div className="flex-1 overflow-y-auto internal-scroll p-10 text-left">
            <div className="bg-white border border-slate-300 rounded-[40px] shadow-sm overflow-hidden text-left">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 italic leading-none text-left">Resident Identity</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-center italic leading-none">Building Location</th>                    
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-center italic leading-none">Assignment</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-center italic leading-none">Year / Program</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-right italic leading-none">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-left">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-32 text-center text-left">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="animate-spin text-emerald-600" size={30} />
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Syncing Masterlist...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredResidents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-32 text-center text-left">
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic font-sans text-left px-10">No matching records found</p>
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
                          <div className="flex items-center gap-5 text-left">
                             <div className="w-11 h-11 rounded-[18px] bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-emerald-900 group-hover:bg-white transition-all italic shadow-inner">
                                {student.first_name?.[0]}
                             </div>
                             <div className="text-left">
                                <p className="text-sm font-bold text-slate-800 tracking-tight leading-none mb-1.5 uppercase italic">{student.name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic leading-none">{student.student_id} • {student.gender}</p>
                             </div>
                          </div>
                        </td>
                        {/* BUILDING LOCATION CELL - DISPLAYING DORM ID (MD4, MD5, etc.) */}
                        <td className="px-6 py-5 text-center">
                           <div className="flex flex-col items-center">
                              <p className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.2em] leading-none italic">{student.dorm}</p>
                           </div>
                        </td>                        
                        <td className="px-6 py-5 text-center">
                           <span className={`text-[10px] font-black italic px-4 py-1.5 rounded-xl border-2 transition-all ${
                              student.room === 'Unassigned' 
                              ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' 
                              : 'bg-slate-50 text-slate-700 border-slate-200 uppercase'
                           }`}>
                              {student.room}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <p className="text-[10px] font-black text-slate-700 uppercase tracking-tighter leading-none">{student.year_level}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic leading-none mt-1">{student.course}</p>
                        </td>
                        <td className="px-10 py-5 text-right">
                           <div className="flex items-center justify-end gap-2 text-right">
                              <button className="p-2 text-slate-300 group-hover:text-emerald-600 transition-all">
                                 <ChevronRight size={18} />
                              </button>
                           </div>
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
                initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                className="w-[500px] bg-white border-l border-slate-300 shadow-2xl z-20 flex flex-col text-left"
              >
                <div className="p-8 border-b border-slate-100 flex justify-between items-center text-left">
                   <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] italic leading-none text-left">Resident Profile</h2>
                   <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                      <X size={20} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 internal-scroll text-left">
                   <div className="flex items-center gap-6 text-left">
                      <div className="w-20 h-20 rounded-[30px] bg-emerald-950 text-white flex items-center justify-center text-2xl font-black italic shadow-xl shadow-emerald-950/20">
                         {selectedStudent.first_name?.[0]}
                      </div>
                      <div className="text-left">
                         <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic leading-tight uppercase text-left">{selectedStudent.name}</h3>
                         <div className="flex items-center gap-2 mt-2 text-left">
                            <div className={`h-1.5 w-1.5 rounded-full ${selectedStudent.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Status: {selectedStudent.status}</p>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-[30px] text-left">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic text-left">Room Assignment</p>
                         <p className="text-sm font-black text-slate-800 italic uppercase text-left">{selectedStudent.room}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-[30px] text-left">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic text-left">Student ID</p>
                         <p className="text-sm font-black text-slate-800 italic uppercase text-left">{selectedStudent.student_id}</p>
                      </div>
                   </div>

                   <div className="space-y-4 text-left">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-blue-500 italic text-left">Connectivity</p>
                      <div className="grid grid-cols-2 gap-3 text-left">
                         <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-left">
                            <Facebook size={16} className="text-blue-600" />
                            <span className="text-[10px] font-bold text-slate-600 truncate">{selectedStudent.fb_link || 'No FB Provided'}</span>
                         </div>
                         <div className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-left">
                            <Phone size={16} className="text-emerald-600" />
                            <span className="text-[10px] font-bold text-slate-600">{selectedStudent.contact}</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4 text-left">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-rose-500 italic text-left">Family Contacts</p>
                      <div className="space-y-3 text-left">
                         <div className="bg-rose-50/30 border border-rose-100 p-5 rounded-[30px] flex items-center justify-between text-left">
                            <div className="flex items-center gap-4 text-left">
                               <UserCircle size={18} className="text-rose-500" />
                               <div className="text-left">
                                  <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1 italic text-left">Maternal Details</p>
                                  <p className="text-xs font-bold text-slate-800 tracking-tight leading-none uppercase italic text-left">{selectedStudent.mother_name}</p>
                               </div>
                            </div>
                            <p className="text-[11px] font-black text-rose-600 italic tracking-tighter">{selectedStudent.mother_contact}</p>
                         </div>

                         <div className="bg-blue-50/30 border border-blue-100 p-5 rounded-[30px] flex items-center justify-between text-left">
                            <div className="flex items-center gap-4 text-left">
                               <UserCircle size={18} className="text-blue-500" />
                               <div className="text-left">
                                  <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1 italic text-left">Paternal Details</p>
                                  <p className="text-xs font-bold text-slate-800 tracking-tight leading-none uppercase italic text-left">{selectedStudent.father_name}</p>
                               </div>
                            </div>
                            <p className="text-[11px] font-black text-blue-600 italic tracking-tighter">{selectedStudent.father_contact}</p>
                         </div>

                         {selectedStudent.guardian_name && (
                           <div className="bg-amber-50/30 border border-amber-100 p-5 rounded-[30px] flex items-center justify-between text-left">
                              <div className="flex items-center gap-4 text-left">
                                 <ShieldCheck size={18} className="text-amber-500" />
                                 <div className="text-left">
                                    <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1 italic text-left">Guardian / Proxy</p>
                                    <p className="text-xs font-bold text-slate-800 tracking-tight leading-none uppercase italic text-left">{selectedStudent.guardian_name}</p>
                                 </div>
                              </div>
                              <p className="text-[11px] font-black text-amber-600 italic tracking-tighter">{selectedStudent.guardian_contact}</p>
                           </div>
                         )}
                      </div>
                   </div>

                   <div className="space-y-4 text-left pb-10">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-orange-500 italic text-left">Home Address</p>
                      <div className="flex items-start gap-4 p-5 bg-orange-50/30 border border-orange-100 rounded-[30px] text-left">
                         <MapPin size={16} className="text-orange-500 mt-1" />
                         <p className="text-xs font-bold text-slate-600 leading-relaxed italic uppercase text-left">
                           {selectedStudent.address_street}, {selectedStudent.address_city}, {selectedStudent.address_province}
                         </p>
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 mt-auto flex gap-4 relative text-left">
                   <button 
                    onClick={() => router.push(`/manager/residents/assign?studentId=${selectedStudent.student_id}`)}
                    className="flex-1 bg-emerald-950 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-emerald-900/20 active:scale-95 transition-all"
                   >
                    {selectedStudent.room === 'Unassigned' ? 'Assign Room' : 'Manage Stay'}
                   </button>
                   
                   <div className="relative text-left">
                      <button onClick={() => setIsActionsOpen(!isActionsOpen)} className="px-6 h-full border border-slate-200 text-slate-400 rounded-2xl hover:bg-white transition-all"><MoreVertical size={16}/></button>
                      <AnimatePresence>
                        {isActionsOpen && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full right-0 mb-4 w-48 bg-white border border-slate-200 shadow-2xl rounded-[25px] p-2 z-[30] text-left">
                             <button onClick={() => { setIsEditModalOpen(true); setIsActionsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all italic leading-none text-left"><Edit3 size={14} className="text-blue-500" /> Edit Info</button>
                             <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl text-red-600 text-[10px] font-black uppercase tracking-widest transition-all italic leading-none text-left"><Trash2 size={14} /> Remove Entry</button>
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