"use client";
import Sidebar from '@/components/admin/Sidebar';
import { 
  Search, ChevronLeft, ChevronRight, 
  Download, Eye, BedDouble, ArrowUpRight, Users, 
  User, UserCheck, Loader2, ClipboardX
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import ResidentInfoModal from './modal/resident-info'; // IMPORTED HERE

export default function ManagementPage() {
  const [selectedDorm, setSelectedDorm] = useState("Men's Dorm 4 & 5");
  const [isDormListOpen, setIsDormListOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, male: 0, female: 0, capacity: 0 });
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const residentsPerPage = 10;

  const allDorms = [
    "Men's Dorm 4 & 5", "Men's Dorm 6 & 7", "Men's Dorm 8 & 9", "Men's Dorm 10 & 11",
    "Ladies' Dorm 1", "Ladies' Dorm 2", "Ladies' Dorm 3", "Ladies' Dorm 4", 
    "Ladies' Dorm 5 + Annex", "Ladies' Dorm 6", "Ladies' Dorm 7 & 8", 
    "Ladies' Dorm 9", "Ladies' Dorm 10", "Athletes", "Agriculture", "IGS Dorms"
  ];

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);
    
    const qAlloc = query(
      collection(db, "allocations"), 
      where("dormGroup", "==", selectedDorm)
    );
    
    const unsub = onSnapshot(qAlloc, async (snap) => {
      const allocData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const qRooms = query(collection(db, "rooms"), where("dormGroup", "==", selectedDorm));
      const roomSnap = await getDocs(qRooms);
      const totalCapacity = roomSnap.docs.reduce((acc, curr) => acc + (curr.data().total_beds || 0), 0);

      if (allocData.length === 0) {
        setResidents([]);
        setStats({ total: 0, male: 0, female: 0, capacity: totalCapacity });
        setLoading(false);
        return;
      }

      let mCount = 0;
      let fCount = 0;

      const residentPromises = allocData.map(async (alloc: any) => {
        const resDoc = await getDoc(doc(db, "residents", alloc.studentID));
        if (resDoc.exists()) {
          const data = resDoc.data();
          if (data.gender?.toLowerCase() === 'male') mCount++;
          else fCount++;
          
          return {
            ...data,
            room: alloc.roomID.split('-').pop(),
            dormGroup: alloc.dormGroup,
            allocationID: alloc.id,
            status: data.isArchived ? 'Archived' : 'Active'
          };
        }
        return null;
      });

      const results = await Promise.all(residentPromises);
      const validResidents = results.filter(r => r !== null);

      setResidents(validResidents);
      setStats({ 
        total: validResidents.length, 
        male: mCount, 
        female: fCount, 
        capacity: totalCapacity 
      });
      setLoading(false);
    });

    return () => unsub();
  }, [selectedDorm]);

  const filteredResidents = residents.filter(r => 
    `${r.first_name} ${r.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentID?.includes(searchTerm)
  );

  const indexOfLastResident = currentPage * residentsPerPage;
  const indexOfFirstResident = indexOfLastResident - residentsPerPage;
  const currentResidents = filteredResidents.slice(indexOfFirstResident, indexOfLastResident);
  const totalPages = Math.ceil(filteredResidents.length / residentsPerPage);

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] p-6 gap-6 overflow-hidden text-left font-sans text-slate-900">
      <Sidebar />
      <main className="flex-1 main-shell flex flex-col overflow-hidden bg-white border border-slate-200/60 shadow-2xl relative rounded-[48px]">
        
        {/* NAV BAR */}
        <nav className="h-24 px-10 flex items-center justify-between border-b border-slate-50 flex-shrink-0 bg-white">
          <div className="flex items-center gap-8 text-left">
            <div className="text-left relative">
              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-1 leading-none">Management Control</p>
              <button onClick={() => setIsDormListOpen(!isDormListOpen)} className="flex items-center gap-3 group">
                <h1 className="text-2xl font-normal text-slate-900 tracking-tight leading-none uppercase">
                  {selectedDorm} <span className="text-slate-400 text-lg ml-1 normal-case font-light">Registry</span>
                </h1>
                <ArrowUpRight size={16} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </button>

              <AnimatePresence>
                {isDormListOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-3 w-72 bg-white border border-slate-100 shadow-2xl rounded-[32px] z-[100] p-5 max-h-96 overflow-y-auto internal-scroll">
                    {allDorms.map((dorm) => (
                      <button key={dorm} onClick={() => { setSelectedDorm(dorm); setIsDormListOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all mb-1 ${
                          selectedDorm === dorm ? 'bg-emerald-950 text-white' : 'text-slate-400 hover:bg-slate-50'
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
            <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-emerald-300 transition-all w-80">
              <Search size={14} className="text-slate-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search resident..." className="bg-transparent text-[11px] outline-none w-full font-medium text-slate-700" />
            </div>
            <button className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
               <Download size={14} className="inline mr-2" /> Export
            </button>
          </div>
        </nav>

        {/* AUDIT CARDS */}
        <div className="px-10 py-8 bg-[#fbfcfd]">
           <div className="grid grid-cols-4 gap-6">
              <AuditCard label="Total Capacity" value={stats.capacity} sub="Beds" icon={<BedDouble size={18}/>} color="border-b-blue-500 shadow-blue-50" />
              <AuditCard label="Current Census" value={stats.total} sub="Total" icon={<Users size={18}/>} color="border-b-emerald-500 shadow-emerald-50" />
              <AuditCard label="Male Census" value={stats.male} sub="Students" icon={<User size={18}/>} color="border-b-indigo-500 shadow-indigo-50" />
              <AuditCard label="Female Census" value={stats.female} sub="Students" icon={<UserCheck size={18}/>} color="border-b-rose-500 shadow-rose-50" />
           </div>
        </div>

        {/* TABLE DATA */}
        <div className="flex-1 px-10 pb-4 bg-[#fbfcfd] overflow-hidden">
          <div className="h-full bg-white border border-slate-100 rounded-[45px] flex flex-col shadow-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto internal-scroll">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr>
                    <th className="w-[8%] px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">#</th>
                    <th className="w-[32%] px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Resident Identity</th>
                    <th className="w-[15%] px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Student ID</th>
                    <th className="w-[20%] px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Dorm Unit</th>
                    <th className="w-[15%] px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                    <th className="w-[10%] px-8 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr key="loading-row">
                      <td colSpan={6} className="py-32 text-center">
                        <Loader2 className="animate-spin text-emerald-600 inline" size={32} />
                      </td>
                    </tr>
                  ) : currentResidents.length > 0 ? (
                    currentResidents.map((res, index) => (
                      <tr key={res.allocationID} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="px-8 py-5 text-[10px] font-bold text-slate-300">
                          {(indexOfFirstResident + index + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 text-xs uppercase border border-slate-100">
                              {res.first_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-normal text-slate-900 leading-tight uppercase">{res.first_name} {res.last_name}</p>
                              <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5 font-bold">{res.course}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-mono text-slate-500">{res.studentID}</span>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs text-slate-800 uppercase leading-none font-normal">Room {res.room}</p>
                          <p className="text-[8px] text-slate-400 uppercase tracking-tighter mt-1">{res.dormGroup}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                              res.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {res.status}
                            </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button onClick={() => setSelectedResident(res)} className="p-2 text-slate-300 hover:text-emerald-600 transition-all">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key="empty-row">
                      <td colSpan={6} className="py-40 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-30">
                          <ClipboardX size={40} />
                          <p className="text-xs uppercase tracking-widest">No matching records found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            <div className="px-10 py-5 border-t border-slate-50 bg-white flex items-center justify-between">
               <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                 Showing <span className="text-slate-900 font-bold">{indexOfFirstResident + 1}</span> to <span className="text-slate-900 font-bold">{Math.min(indexOfLastResident, filteredResidents.length)}</span> of <span className="text-slate-900 font-bold">{filteredResidents.length}</span> Residents
               </p>
               <div className="flex gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-30">
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex items-center px-4 text-[10px] font-bold text-slate-900 uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-100">
                    Page {currentPage} / {totalPages || 1}
                  </div>
                  <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-30">
                    <ChevronRight size={16} />
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* MODAL SECTION */}
        <AnimatePresence>
          {selectedResident && (
            <ResidentInfoModal 
              resident={selectedResident} 
              dorm={selectedDorm} 
              onClose={() => setSelectedResident(null)} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function AuditCard({ label, value, sub, icon, color }: any) {
  return (
    <div className={`bg-white border border-slate-100 rounded-[35px] p-7 shadow-xl ${color} text-left border-b-[6px] transition-all hover:-translate-y-1`}>
       <div className="flex justify-between items-start mb-6">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner text-slate-400">{icon}</div>
          <span className="text-[8px] font-black text-slate-200 uppercase tracking-[0.3em] mt-1">Live Feed</span>
       </div>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{label}</p>
       <div className="flex items-baseline gap-2">
          <span className="text-4xl font-normal text-slate-900 tracking-tighter leading-none">{value}</span>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{sub}</span>
       </div>
    </div>
  );
}