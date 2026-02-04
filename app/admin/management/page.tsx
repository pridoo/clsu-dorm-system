"use client";
import Sidebar from '@/components/admin/Sidebar';
import { 
  Search, ChevronLeft, ChevronRight, 
  Download, Eye, BedDouble, ArrowUpRight, Users, 
  User, UserCheck, X, Facebook, Phone, Heart, Loader2, ClipboardX
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

export default function ManagementPage() {
  const [selectedDorm, setSelectedDorm] = useState('Ladies D1');
  const [isDormListOpen, setIsDormListOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, male: 0, female: 0, capacity: 160 });
  const [searchTerm, setSearchTerm] = useState("");

  const allDorms = [
    'Ladies D1', 'Ladies D2', 'Ladies D3', 'Ladies D4', 'Ladies Dorm 5 + Annex', 
    'Ladies Dorm 6', 'Ladies Dorm 7 & 8', 'Ladies Dorm 9', 'Ladies Dorm 10',
    'Men\'s Dorm 4 & 5', 'Men\'s Dorm 6 & 7', 'Men\'s Dorm 8 & 9', 'Men\'s Dorm 10 & 11', 
    'Athletes', 'Agriculture', 'IGS Dorms'
  ];

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "allocations"), where("semesterID", "==", "2025-2026-2nd"));
    
    const unsub = onSnapshot(q, async (snap) => {
      const allAllocations = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const filteredAlloc = allAllocations.filter((a: any) => {
        return a.dormID?.startsWith(selectedDorm.substring(0,2)) || a.dormGroup === selectedDorm;
      });

      if (filteredAlloc.length === 0) {
        setResidents([]);
        setStats({ total: 0, male: 0, female: 0, capacity: 160 });
        setLoading(false);
        return;
      }

      const residentsFullData: any[] = [];
      let mCount = 0;
      let fCount = 0;

      for (const alloc of filteredAlloc) {
        const resDoc = await getDoc(doc(db, "residents", (alloc as any).studentID));
        if (resDoc.exists()) {
          const data = resDoc.data();
          if (data.gender?.toLowerCase() === 'male') mCount++;
          else fCount++;
          
          residentsFullData.push({
            ...data,
            room: (alloc as any).roomID.split('-').pop(),
            allocationID: (alloc as any).id,
            status: data.isArchived ? 'Archived' : 'Active'
          });
        }
      }

      setResidents(residentsFullData);
      setStats(prev => ({ ...prev, total: residentsFullData.length, male: mCount, female: fCount }));
      setLoading(false);
    });

    return () => unsub();
  }, [selectedDorm]);

  const filteredResidents = residents.filter(r => 
    `${r.first_name} ${r.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentID?.includes(searchTerm)
  );

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] p-6 gap-6 overflow-hidden text-left font-sans">
      <Sidebar />
      <main className="flex-1 main-shell flex flex-col overflow-hidden bg-white border border-slate-200/60 shadow-2xl relative rounded-[48px]">
        
        {/* NAV BAR */}
        <nav className="h-20 px-10 flex items-center justify-between border-b border-slate-50 flex-shrink-0 bg-white">
          <div className="flex items-center gap-8">
            <div className="text-left relative">
              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-1 leading-none">Management Control</p>
              <button onClick={() => setIsDormListOpen(!isDormListOpen)} className="flex items-center gap-3 group">
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight leading-none italic">
                  {selectedDorm} <span className="font-light not-italic text-slate-400 text-base ml-1">Registry</span>
                </h1>
                <ArrowUpRight size={14} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </button>

              <AnimatePresence>
                {isDormListOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-100 shadow-2xl rounded-3xl z-[100] p-4 max-h-80 overflow-y-auto custom-scrollbar">
                    {allDorms.map((dorm) => (
                      <button key={dorm} onClick={() => { setSelectedDorm(dorm); setIsDormListOpen(false); }}
                        className={`w-full text-left px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all mb-1 ${
                          selectedDorm === dorm ? 'bg-emerald-950 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                        }`}>
                        {dorm}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 focus-within:bg-white focus-within:border-emerald-300 transition-all w-64">
              <Search size={14} className="text-slate-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search name or ID..." className="bg-transparent text-[10px] outline-none w-full font-light text-slate-900" />
            </div>
            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-xl hover:bg-slate-50 transition-all text-[9px] font-bold uppercase tracking-widest shadow-sm">
               <Download size={14} /> Export
            </button>
          </div>
        </nav>

        {/* AUDIT CARDS */}
        <div className="px-10 py-6 bg-[#fbfcfd]">
           <div className="grid grid-cols-4 gap-4">
              <AuditCard label="Unit Capacity" value={stats.capacity} sub="Beds" icon={<BedDouble size={16}/>} color="border-b-blue-400 shadow-blue-50" />
              <AuditCard label="Residents" value={stats.total} sub="Total" icon={<Users size={16}/>} color="border-b-emerald-400 shadow-emerald-50" />
              <AuditCard label="Male" value={stats.male} sub="Census" icon={<User size={16}/>} color="border-b-indigo-400 shadow-indigo-50" />
              <AuditCard label="Female" value={stats.female} sub="Census" icon={<UserCheck size={16}/>} color="border-b-rose-400 shadow-rose-50" />
           </div>
        </div>

        {/* TABLE DATA */}
        <div className="flex-1 px-10 pb-8 bg-[#fbfcfd] overflow-hidden">
          <div className="h-full bg-white border border-slate-100 rounded-[40px] flex flex-col shadow-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto internal-scroll">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                  <tr>
                    <th className="w-[30%] px-8 py-5 text-[8px] font-black text-slate-400 uppercase tracking-widest">Resident Identity</th>
                    <th className="w-[20%] px-6 py-5 text-[8px] font-black text-slate-400 uppercase tracking-widest">Student ID</th>
                    <th className="w-[20%] px-6 py-5 text-[8px] font-black text-slate-400 uppercase tracking-widest">Allocation</th>
                    <th className="w-[20%] px-6 py-5 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="w-[10%] px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin inline text-emerald-600" /></td>
                    </tr>
                  ) : filteredResidents.length > 0 ? (
                    filteredResidents.map((res) => (
                      <tr key={res.studentID} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-700 font-bold text-xs uppercase">
                              {res.first_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-tight">{res.first_name} {res.last_name}</p>
                              <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{res.course}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono font-bold text-slate-500">{res.studentID}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-slate-800 italic">Room {res.room}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                             res.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                           }`}>
                              {res.status}
                           </div>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button onClick={() => setSelectedResident(res)} className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    /* EMPTY STATE */
                    <tr>
                      <td colSpan={5} className="py-32 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 opacity-40">
                          <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100">
                             <ClipboardX size={32} className="text-slate-300" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">No residents is registered this sy.</p>
                            <p className="text-[10px] text-slate-400 font-medium italic uppercase tracking-tighter">Selected Unit: {selectedDorm}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RESIDENT DETAIL MODAL */}
        <AnimatePresence>
          {selectedResident && (
            <ResidentDetailModal resident={selectedResident} dorm={selectedDorm} onClose={() => setSelectedResident(null)} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// SUB-COMPONENTS
function ResidentDetailModal({ resident, dorm, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden text-left">
        <div className="bg-emerald-950 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[24px] bg-white text-emerald-900 flex items-center justify-center text-2xl font-black uppercase">{resident.first_name?.charAt(0)}</div>
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Resident Profile</p>
              <h2 className="text-xl font-bold tracking-tight">{resident.first_name} {resident.last_name}</h2>
              <p className="text-xs font-light opacity-60 italic">{dorm} Registry</p>
            </div>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Course & Year</p>
                <p className="text-xs font-bold text-slate-900">{resident.course} - {resident.yearLevel}</p>
             </div>
             <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Room</p>
                <p className="text-xs font-bold text-emerald-700 italic">Room {resident.room}</p>
             </div>
          </div>
          <div className="space-y-3">
             <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest px-2 border-l-2 border-emerald-500">Guardian Contact</p>
             <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl">
                <div className="flex items-center gap-3 mb-1">
                   <Heart size={14} className="text-rose-500" />
                   <span className="text-xs font-bold text-slate-800">{resident.guardian_name}</span>
                </div>
                <p className="text-[10px] text-slate-400 ml-7 font-bold">{resident.guardian_contact} ({resident.guardian_relationship})</p>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AuditCard({ label, value, sub, icon, color }: any) {
  return (
    <div className={`bg-white border border-slate-100 rounded-[28px] p-5 shadow-lg ${color} text-left border-b-4`}>
       <div className="flex justify-between items-start mb-3">
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">{icon}</div>
          <span className="text-[7px] font-black text-slate-200 uppercase tracking-[0.2em]">Live Audit</span>
       </div>
       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
       <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-slate-900 tracking-tighter leading-none">{value}</span>
          <span className="text-[8px] font-medium text-slate-400 italic lowercase">{sub}</span>
       </div>
    </div>
  );
}