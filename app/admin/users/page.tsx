"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import AddUserModal from './modal/add-user';
import EditUserModal from './modal/edit-user';
import { Search, UserPlus, Mail, ShieldCheck, MapPin, Edit3, Loader2, Users } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function UsersPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // 1. I-fetch lang ang mga users na ang role ay 'dorm_manager'
    const q = query(collection(db, "users"), where("role", "==", "dorm_manager"));

    const unsub = onSnapshot(q, (snap) => {
      const usersList = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setManagers(usersList);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Filter base sa Search Input (First Name or Last Name)
  const filteredManagers = managers.filter(m => 
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] p-6 gap-6 overflow-hidden text-left font-sans">
      <Sidebar />
      
      <main className="flex-1 bg-white border border-slate-200/60 shadow-2xl rounded-[40px] flex flex-col overflow-hidden relative">
        <nav className="h-20 px-10 flex items-center justify-between border-b border-slate-50 bg-white sticky top-0 z-10">
          <div>
            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-1 leading-none">Personnel Control</p>
            <h1 className="text-xl font-semibold text-slate-900 italic tracking-tight leading-none">
              Dorm Managers <span className="font-light not-italic text-slate-400 text-base ml-1">Registry</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-64 focus-within:bg-white focus-within:border-emerald-200 transition-all">
              <Search size={14} className="text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search verified personnel..." 
                className="bg-transparent text-[10px] outline-none w-full font-medium" 
              />
            </div>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 bg-emerald-950 text-white px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
            >
              <UserPlus size={14} /> Add Manager
            </button>
          </div>
        </nav>

        <div className="flex-1 p-8 overflow-y-auto bg-[#fbfcfd] internal-scroll">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
          ) : filteredManagers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredManagers.map((m) => (
                <div key={m.id} className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-700 font-black text-sm shadow-sm uppercase">
                      {m.first_name?.charAt(0)}
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-700 border-emerald-100`}>
                      Active
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 mb-1 italic tracking-tight uppercase">
                    {m.first_name} {m.last_name}
                  </h3>
                  
                  <div className="space-y-1.5 mb-5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail size={10} />
                      <span className="text-[9px] font-medium tracking-tight">{m.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 italic">
                      <MapPin size={10} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">
                        {m.assigned_building || "Unassigned Unit"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldCheck size={10} className="text-emerald-500" /> System Verified
                    </span>
                    <button 
                      onClick={() => setEditingUser(m)}
                      className="p-1.5 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center opacity-30">
              <Users size={48} strokeWidth={1} />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mt-4">No verified managers found</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {isAddOpen && <AddUserModal onClose={() => setIsAddOpen(false)} />}
          {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function AuditCard({ label, value, sub, icon, color }: any) {
  return (
    <div className={`bg-white border border-slate-100 rounded-[28px] p-5 shadow-lg ${color} text-left border-b-4`}>
       <div className="flex justify-between items-start mb-3">
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">{icon}</div>
          <span className="text-[7px] font-black text-slate-200 uppercase tracking-[0.2em]">Live Data</span>
       </div>
       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
       <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-slate-900 tracking-tighter leading-none">{value}</span>
          <span className="text-[8px] font-medium text-slate-400 italic lowercase">{sub}</span>
       </div>
    </div>
  );
}