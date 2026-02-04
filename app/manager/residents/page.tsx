"use client";
import { useState } from 'react';
import Sidebar from '@/components/managers/Sidebar';
import EditResidentModal from './modal/edit-residents';
import { 
  Search, Filter, MoreVertical, Eye, 
  MapPin, Facebook, Phone, Heart, 
  UserCheck, UserMinus, X, ChevronRight,
  Home, GraduationCap, ArrowUpRight, Edit3, Trash2,
  UserPlus, Map as MapIcon
} from 'lucide-react'; // Siniguro nating andito si ArrowUpRight
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ResidentsPage() {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const residents = [
    { id: '20-0123', name: 'Althea Reyes', room: 'Rm 204', program: 'BSIT', year: '4th', type: 'Scholar', status: 'Active', fb: 'fb.com/althea.reyes', contact: '0912-345-6789', address: 'Bantug, Muñoz, NE', mother: 'Melinda Reyes', motherContact: '0922-111-2222' },
    { id: '21-0456', name: 'Bea Santos', room: 'Unassigned', program: 'BSA', year: '3rd', type: 'Regular', status: 'Pending', fb: 'fb.com/bea.santos', contact: '0945-888-1234', address: 'Maligaya, Muñoz, NE', mother: 'Gloria Santos', motherContact: '0918-999-0000' },
    { id: '19-0889', name: 'Celine Garcia', room: 'Rm 103', program: 'BSME', year: '4th', type: 'Regular', status: 'Active', fb: 'fb.com/celine.g', contact: '0977-123-4567', address: 'Villa Santos, Muñoz, NE', mother: 'Rosa Garcia', motherContact: '0915-123-1234' },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] p-6 gap-6 overflow-hidden text-left font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden bg-white border border-slate-300 shadow-[0_0_50px_rgba(0,0,0,0.08)] rounded-[45px] relative">
        
        {/* Header Section */}
        <nav className="h-24 px-12 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md relative z-10 text-left">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-5 bg-emerald-600 rounded-full shadow-[0_0_12px_rgba(5,150,105,0.4)]" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none italic text-left">Management Suite</p>
            </div>
            <h1 className="text-3xl font-extralight text-slate-900 tracking-tighter leading-none italic text-left">
              Resident <span className="font-bold text-emerald-950 not-italic tracking-tight text-4xl">Masterlist</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 focus-within:bg-white focus-within:border-emerald-500 transition-all w-80">
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Search by name, ID, or room..." className="bg-transparent text-[11px] outline-none w-full font-bold text-slate-700" />
            </div>

            <button 
              onClick={() => router.push('/manager/residents/assign')}
              className="flex items-center gap-2 bg-emerald-950 text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:scale-105 active:scale-95 transition-all"
            >
               <UserPlus size={14} /> Bulk Assign
            </button>

            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
              <Filter size={18} />
            </button>
          </div>
        </nav>

        {/* Table Content */}
        <div className="flex-1 overflow-hidden flex bg-[#f8fafc]/30 text-left">
          <div className="flex-1 overflow-y-auto internal-scroll p-10">
            <div className="bg-white border border-slate-300 rounded-[40px] shadow-sm overflow-hidden">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 italic leading-none text-left">Resident Identity</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-center italic leading-none">Assignment</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-center italic leading-none">Year / Type</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-right italic leading-none">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {residents.map((student, i) => (
                    <tr 
                      key={i} 
                      onClick={() => setSelectedStudent(student)}
                      className={`group hover:bg-emerald-50/30 transition-all cursor-pointer ${selectedStudent?.id === student.id ? 'bg-emerald-50/50' : ''}`}
                    >
                      <td className="px-10 py-5">
                        <div className="flex items-center gap-5">
                           <div className="w-11 h-11 rounded-[18px] bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-emerald-900 group-hover:bg-white transition-all italic">
                              {student.name.charAt(0)}
                           </div>
                           <div className="text-left">
                              <p className="text-sm font-bold text-slate-800 tracking-tight leading-none mb-1.5">{student.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic leading-none">{student.id} • {student.program}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <span className={`text-[10px] font-black italic px-4 py-1.5 rounded-xl border-2 transition-all ${
                            student.room === 'Unassigned' 
                            ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse' 
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                         }`}>
                            {student.room}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <p className="text-[10px] font-black text-slate-700 uppercase tracking-tighter leading-none">{student.year} Year</p>
                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic leading-none mt-1">{student.type}</p>
                      </td>
                      <td className="px-10 py-5 text-right">
                         <div className="flex items-center justify-end gap-2">
                            {student.room === 'Unassigned' ? (
                               <button 
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/manager/residents/assign?studentId=${student.id}`);
                                 }}
                                 className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                 title="Assign Room"
                               >
                                  <UserPlus size={16} />
                               </button>
                            ) : (
                               <button 
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/manager/residents/assign?roomId=${student.room}`);
                                 }}
                                 className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-950 hover:text-white transition-all shadow-sm"
                                 title="See Room Location"
                               >
                                  <MapIcon size={16} />
                               </button>
                            )}
                            <button className="p-2 text-slate-300 group-hover:text-emerald-600 transition-all">
                               <ChevronRight size={18} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <AnimatePresence>
            {selectedStudent && (
              <motion.aside 
                initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                className="w-[450px] bg-white border-l border-slate-300 shadow-2xl z-20 flex flex-col text-left"
              >
                <div className="p-8 border-b border-slate-100 flex justify-between items-center text-left">
                   <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] italic text-left leading-none">Resident Profile</h2>
                   <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                      <X size={20} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 internal-scroll text-left">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-[30px] bg-emerald-950 text-white flex items-center justify-center text-2xl font-black italic shadow-xl shadow-emerald-950/20">
                         {selectedStudent.name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic leading-tight">{selectedStudent.name}</h3>
                         <div className="flex items-center gap-2 mt-2 text-left">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic leading-none">Status: {selectedStudent.status}</p>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-[30px]">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Room Assignment</p>
                         <p className="text-sm font-black text-slate-800 italic">{selectedStudent.room}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-[30px]">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">ID Number</p>
                         <p className="text-sm font-black text-slate-800 italic">{selectedStudent.id}</p>
                      </div>
                   </div>

                   <div className="space-y-4 text-left">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-blue-500 italic">Connectivity</p>
                      <div className="space-y-2">
                         <div className="flex items-center gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl group hover:bg-blue-50 transition-colors cursor-pointer">
                            <Facebook size={16} className="text-blue-600" />
                            <span className="text-xs font-bold text-slate-600 tracking-tight">{selectedStudent.fb}</span>
                            <ArrowUpRight size={14} className="ml-auto text-blue-200 group-hover:text-blue-500 transition-colors" />
                         </div>
                         <div className="flex items-center gap-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                            <Phone size={16} className="text-emerald-600" />
                            <span className="text-xs font-bold text-slate-600 tracking-tight">{selectedStudent.contact}</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4 text-left">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-rose-500 italic">Emergency Protocol</p>
                      <div className="bg-rose-50/30 border border-rose-100 p-6 rounded-[35px] space-y-4">
                         <div className="flex items-center gap-3">
                            <Heart size={16} className="text-rose-500" />
                            <div className="text-left">
                               <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">Maternal / Contact</p>
                               <p className="text-xs font-bold text-slate-800 tracking-tight leading-none">{selectedStudent.mother}</p>
                            </div>
                         </div>
                         <p className="text-xs font-bold text-slate-400 ml-7 italic text-left">{selectedStudent.motherContact}</p>
                      </div>
                   </div>

                   <div className="space-y-4 text-left">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-orange-500 italic">Permanent Residence</p>
                      <div className="flex items-start gap-4 p-5 bg-orange-50/30 border border-orange-100 rounded-[30px] text-left">
                         <MapPin size={16} className="text-orange-500 mt-1" />
                         <p className="text-xs font-bold text-slate-600 leading-relaxed italic">{selectedStudent.address}</p>
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 mt-auto flex gap-4 relative">
                   <button 
                    onClick={() => router.push(selectedStudent.room === 'Unassigned' ? `/manager/residents/assign?studentId=${selectedStudent.id}` : `/manager/residents/assign?roomId=${selectedStudent.room}`)}
                    className="flex-1 bg-emerald-950 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-emerald-900/20 active:scale-95 transition-all"
                   >
                    {selectedStudent.room === 'Unassigned' ? 'Assign Room' : 'See Room Layout'}
                   </button>
                   
                   <div className="relative text-left">
                      <button onClick={() => setIsActionsOpen(!isActionsOpen)} className="px-6 h-full border border-slate-200 text-slate-400 rounded-2xl hover:bg-white transition-all"><MoreVertical size={16}/></button>
                      <AnimatePresence>
                        {isActionsOpen && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full right-0 mb-4 w-48 bg-white border border-slate-200 shadow-2xl rounded-[25px] p-2 z-[30] text-left">
                             <button onClick={() => { setIsEditModalOpen(true); setIsActionsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all italic leading-none"><Edit3 size={14} className="text-blue-500" /> Edit Info</button>
                             <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl text-red-600 text-[10px] font-black uppercase tracking-widest transition-all italic leading-none"><Trash2 size={14} /> Remove Entry</button>
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