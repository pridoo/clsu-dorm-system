"use client";
import Sidebar from '@/components/managers/Sidebar';
import { 
  Users, DoorOpen, UserCheck, UserMinus, 
  ArrowUpRight, Search, Zap, Activity, Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

export default function ManagerDashboard() {
  const [managerInfo, setManagerInfo] = useState({ name: "Loading...", building: "Scanning..." });
  const [stats, setStats] = useState({ total: 0, vacant: 0, unassigned: 0, load: 0 });
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const building = userData.assigned_building || "Unassigned";
          setManagerInfo({ 
            name: `${userData.first_name} ${userData.last_name}`, 
            building: building 
          });

          const qAlloc = query(collection(db, "allocations"), where("dormGroup", "==", building));
          const unsubAlloc = onSnapshot(qAlloc, async (snap) => {
            const fullData: any[] = [];
            for (const alloc of snap.docs) {
              const resDoc = await getDoc(doc(db, "residents", alloc.data().studentID));
              if (resDoc.exists()) {
                fullData.push({
                  id: alloc.data().studentID,
                  ...resDoc.data(),
                  room: alloc.data().roomID.split('-').pop(),
                  status: "Verified"
                });
              }
            }
            setResidents(fullData);

            const capacity = 160; 
            setStats({
              total: fullData.length,
              vacant: capacity - fullData.length,
              unassigned: 0,
              load: Math.round((fullData.length / capacity) * 100)
            });
            setLoading(false);
          });
          return () => unsubAlloc();
        }
      }
    });
    return () => unsubAuth();
  }, []);

  const filteredResidents = residents.filter(r => 
    `${r.first_name} ${r.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.includes(searchTerm)
  );

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] p-6 gap-6 overflow-hidden text-left font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden bg-white border border-slate-300 shadow-[0_0_50px_rgba(0,0,0,0.08)] rounded-[45px] relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.03] blur-[120px] -z-10 rounded-full" />

        {/* Top Header Section */}
        <nav className="h-24 px-10 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md relative z-20 flex-shrink-0">
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-5 bg-emerald-600 rounded-full shadow-[0_0_12px_rgba(5,150,105,0.4)]" />
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none italic">Operations Center</p>
            </div>
            <h1 className="text-3xl font-extralight text-slate-900 tracking-tighter leading-none italic">
              {managerInfo.building} <span className="font-bold text-emerald-950 not-italic tracking-tight text-4xl">Suite</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end mr-2">
               <div className="flex items-center gap-2 mb-1">
                  <Activity size={10} className="text-emerald-500 animate-pulse" />
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Live: Operational</p>
               </div>
               <div className="flex gap-1">
                  {[1,2,3,4].map(i => <div key={i} className="h-0.5 w-4 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div animate={{ x: [-20, 20] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} className="h-full w-1/2 bg-emerald-400 rounded-full" />
                  </div>)}
               </div>
            </div>
            <div className="flex items-center gap-3 bg-emerald-950 p-2 pr-6 rounded-[22px] shadow-2xl border border-emerald-800">
              <div className="w-9 h-9 rounded-[16px] bg-emerald-800 flex items-center justify-center text-emerald-400 shadow-inner">
                <UserCheck size={18} />
              </div>
              <div className="text-left">
                <p className="text-[7px] font-black text-emerald-500/50 uppercase tracking-widest leading-none mb-0.5">Manager</p>
                <p className="text-[12px] font-bold text-white tracking-tight italic uppercase">{managerInfo.name}</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Stats Grid */}
        <div className="px-10 py-8 grid grid-cols-4 gap-6 bg-[#f8fafc]/30 relative z-10 flex-shrink-0">
          <ManagerStatCard label="Residents" value={stats.total.toString()} sub="Verified" icon={<Users size={18}/>} color="emerald" glow="shadow-emerald-200/50" />
          <ManagerStatCard label="Vacant" value={stats.vacant.toString()} sub="Beds" icon={<DoorOpen size={18}/>} color="blue" glow="shadow-blue-200/50" />
          <ManagerStatCard label="Unassigned" value={stats.unassigned.toString()} sub="No Room" icon={<UserMinus size={18}/>} color="amber" glow="shadow-amber-200/50" />
          
          <motion.div whileHover={{ y: -6, scale: 1.01 }} className="bg-emerald-950 rounded-[35px] p-6 text-white relative overflow-hidden group shadow-2xl shadow-emerald-900/40 border border-emerald-800">
             <div className="relative z-10 h-full flex flex-col justify-between text-left">
               <div>
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic leading-none">Building Load</p>
                  <h3 className="text-4xl font-extralight italic tracking-tighter leading-none mt-1">{stats.load}%</h3>
               </div>
               <div className="flex items-center gap-2 mt-4">
                  <Zap size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-100">Live Sync</span>
               </div>
             </div>
             <ArrowUpRight className="absolute top-6 right-6 text-emerald-500/20 group-hover:text-emerald-400 transition-all" size={24} />
          </motion.div>
        </div>

        {/* Resident Registry Table Area - Seamless Design */}
        <div className="flex-1 px-10 pb-10 bg-[#f8fafc]/30 flex flex-col relative z-10 overflow-hidden">
          <div className="flex items-center justify-between mb-6 px-1">
             <div className="flex items-center gap-4 text-left">
                <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.4em] italic leading-none">Resident Registry</h2>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
             </div>
             <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-300 shadow-sm focus-within:border-emerald-500 transition-all w-64 text-left">
                <Search size={14} className="text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search profiles..." 
                  className="bg-transparent text-[10px] outline-none w-full font-bold text-slate-700 placeholder:text-slate-300" 
                />
             </div>
          </div>
          
          <div className="flex-1 bg-white border border-slate-200 rounded-[35px] shadow-[0_20px_60px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-hide"> 
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10">
                  <tr>
                    <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Identity Profile</th>
                    <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center italic">Room Assignment</th>
                    <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right italic">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="animate-spin text-emerald-600" size={24} />
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Syncing Records...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredResidents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-24 text-center">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic font-sans">No active residents detected</p>
                      </td>
                    </tr>
                  ) : (
                    filteredResidents.map((student, i) => (
                      <tr key={i} className="group hover:bg-emerald-50/40 transition-all cursor-pointer">
                        <td className="px-10 py-5">
                          <div className="flex items-center gap-5">
                              <div className="w-11 h-11 rounded-[16px] bg-slate-100 border border-slate-200 flex items-center justify-center text-[13px] font-black text-emerald-900 group-hover:bg-white group-hover:border-emerald-300 transition-all uppercase shadow-inner italic">
                                {student.first_name[0]}
                              </div>
                              <div className="text-left">
                                <p className="text-[15px] font-bold text-slate-800 tracking-tight leading-none mb-1.5 uppercase italic">{student.first_name} {student.last_name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic font-sans">{student.id} • {student.course}</p>
                              </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <span className="text-[11px] font-black italic px-5 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm font-sans">Room {student.room}</span>
                        </td>
                        <td className="px-10 py-5 text-right">
                           <div className="inline-flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 italic">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                              {student.status}
                           </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ManagerStatCard({ label, value, sub, icon, color, glow }: any) {
  const colors: any = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    amber: "text-amber-600 bg-amber-50 border-amber-200"
  };

  return (
    <motion.div whileHover={{ y: -6, scale: 1.01 }} className={`bg-white border-2 border-slate-200 p-6 rounded-[35px] transition-all text-left group relative shadow-md ${glow}`}>
      <div className={`w-11 h-11 rounded-[18px] flex items-center justify-center mb-4 border ${colors[color]}`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic mb-0.5 leading-none">{label}</p>
      <div className="flex items-baseline gap-2">
         <span className="text-3xl font-extralight italic text-slate-900 tracking-tighter leading-none">{value}</span>
         <span className="text-[10px] font-bold text-slate-300 lowercase">{sub}</span>
      </div>
    </motion.div>
  );
}