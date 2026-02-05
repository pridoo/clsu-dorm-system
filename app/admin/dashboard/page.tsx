"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { 
  Bell, Activity, Zap, Search, Users, DoorOpen, 
  TrendingUp, ChevronRight, PieChart, Loader2, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, limit, orderBy, getDoc, doc, where } from 'firebase/firestore';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalResidents: 0,
    vacantSlots: 0,
    activeAllocations: 0,
    utilization: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    // 1. Total Residents (FILTERED: Active only)
    const qResidents = query(collection(db, "residents"), where("isArchived", "==", false));
    const unsubResidents = onSnapshot(qResidents, (snap) => {
      setStats(prev => ({ ...prev, totalResidents: snap.size }));
    });

    // 2. Rooms & Vacant Slots
    const unsubRooms = onSnapshot(collection(db, "rooms"), (snap) => {
      let total = 0;
      let occupied = 0;
      snap.forEach(doc => {
        total += doc.data().total_beds || 0;
        occupied += doc.data().occupied_beds || 0;
      });
      setStats(prev => ({ 
        ...prev, 
        vacantSlots: total - occupied,
        utilization: total > 0 ? Math.round((occupied / total) * 100) : 0
      }));
    });

    // 3. Recent Activity (Allocations collection only contains active assignments)
    const qAlloc = query(collection(db, "allocations"), orderBy("assignedAt", "desc"), limit(5));
    const unsubActivity = onSnapshot(qAlloc, async (snap) => {
      setLoadingActivity(true);
      const activityPromises = snap.docs.map(async (allocationDoc) => {
        const data = allocationDoc.data();
        
        let residentName = "Unknown Resident";
        if (data.studentID) {
          const resSnap = await getDoc(doc(db, "residents", data.studentID));
          if (resSnap.exists()) {
            residentName = `${resSnap.data().first_name} ${resSnap.data().last_name}`;
          }
        }

        let managerName = "System";
        if (data.assignedBy) {
          const userSnap = await getDoc(doc(db, "users", data.assignedBy));
          if (userSnap.exists()) {
            managerName = `${userSnap.data().first_name} ${userSnap.data().last_name}`;
          }
        } else {
           managerName = data.dormGroup ? `${data.dormGroup} Manager` : "Admin";
        }

        return {
          id: allocationDoc.id,
          residentName,
          roomID: data.roomID?.split('-').pop() || "N/A",
          dormID: data.dormID || "N/A",
          managerName,
          timestamp: data.assignedAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "Just now"
        };
      });

      const resolvedActivity = await Promise.all(activityPromises);
      setRecentActivity(resolvedActivity);
      setStats(prev => ({ ...prev, activeAllocations: snap.size }));
      setLoadingActivity(false);
    });

    return () => {
      unsubResidents();
      unsubRooms();
      unsubActivity();
    };
  }, []);

  return (
    <div className="flex h-screen w-screen bg-[#f1f3f6] p-6 gap-6 overflow-hidden font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 bg-[#fcfdfe] rounded-[48px] shadow-2xl border border-white flex flex-col overflow-hidden">
        {/* Top Header */}
        <nav className="h-20 px-10 flex items-center justify-between border-b border-slate-50 flex-shrink-0 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <Search size={14} className="text-slate-400" />
            <input type="text" placeholder="Search active analytics..." className="bg-transparent text-[11px] outline-none w-48 font-bold text-slate-700" />
          </div>
          <button className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all shadow-sm group">
            <Bell size={18} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform" />
          </button>
        </nav>

        <div className="flex-1 internal-scroll p-10 overflow-y-auto scrollbar-hide">
          <header className="mb-10 flex justify-between items-end">
            <div className="text-left">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-2 italic">Active Period Insights</p>
              <h1 className="text-4xl font-extralight text-slate-900 tracking-tighter leading-none italic text-left">
                Admin <span className="font-bold text-emerald-950 not-italic tracking-tight underline decoration-emerald-200 underline-offset-8">Intelligence</span>
              </h1>
            </div>
            <div className="bg-emerald-50/50 px-5 py-2.5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest italic">Live: Sync Operational</span>
            </div>
          </header>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-4 gap-6 mb-12">
            <StatCard label="Active Residents" value={stats.totalResidents.toString()} trend="+Live" icon={<Users size={20} />} variant="blue" />
            <StatCard label="Vacant Slots" value={stats.vacantSlots.toString()} trend={stats.vacantSlots < 10 ? "Critical" : "Available"} icon={<DoorOpen size={20} />} variant="amber" isAlert={stats.vacantSlots < 10} />
            <StatCard label="Active Allocations" value={stats.activeAllocations.toString()} trend={`${stats.utilization}% Load`} icon={<TrendingUp size={20} />} variant="emerald" />
            
            <div className="bg-emerald-950 rounded-[35px] p-8 text-white flex flex-col justify-between shadow-2xl shadow-emerald-900/40 border-b-4 border-emerald-500 relative overflow-hidden group">
               <div className="relative z-10 bg-emerald-500/20 w-10 h-10 rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <Zap size={20} className="text-emerald-400" />
               </div>
               <div className="relative z-10 text-left">
                  <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1 italic">Registry Status</p>
                  <p className="text-lg font-light tracking-tight text-emerald-50 italic">Period <span className="font-black text-white not-italic uppercase tracking-tighter">Verified</span></p>
               </div>
               <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8 text-left">
            {/* Recent Activity Table */}
            <section className="col-span-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-[40px] p-10 flex flex-col text-left">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800 italic">Registry Pulse</h3>
                </div>
              </div>
              
              <div className="space-y-4">
                {loadingActivity ? (
                   <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" /></div>
                ) : recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-6 rounded-[28px] bg-slate-50/50 border border-transparent hover:border-emerald-100 hover:bg-white hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-6 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-all">
                        <Activity size={20} />
                      </div>
                      <div className="text-left leading-none">
                        <p className="text-[13px] font-bold text-slate-800 tracking-tight mb-2">
                          <span className="text-emerald-700 uppercase italic mr-1">{activity.residentName}</span> 
                          <span className="font-light text-slate-400">allocated to</span> 
                          <span className="text-slate-900 uppercase ml-1">Room {activity.roomID}</span>
                        </p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic leading-none">Cluster: {activity.dormID} • {activity.timestamp}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-200 group-hover:text-emerald-500 transition-all" />
                  </div>
                )) : (
                  <div className="py-20 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No active assignments recorded</p>
                  </div>
                )}
              </div>
            </section>

            {/* Infrastructure Breakdown */}
            <aside className="col-span-4 bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-[40px] p-10 flex flex-col text-left">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2 italic">
                <PieChart size={14} className="text-emerald-600" /> Capacity Analytics
              </h4>
              
              <div className="space-y-10 flex-1 flex flex-col justify-center">
                 <ProgressItem label="Utilization Rate" percent={stats.utilization} color="bg-emerald-500" shadow="shadow-emerald-200" />
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-left">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Active Registry</p>
                       <p className="text-xl font-black text-slate-800 italic">{stats.activeAllocations}</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-left">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Available</p>
                       <p className="text-xl font-black text-emerald-600 italic">{stats.vacantSlots}</p>
                    </div>
                 </div>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1 italic">Current System Load</p>
                 <h2 className="text-6xl font-extralight text-slate-900 tracking-tighter italic">{stats.utilization}<span className="text-2xl text-slate-200 not-italic ml-1 font-bold">%</span></h2>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components stay modular
function StatCard({ label, value, trend, icon, variant, isAlert }: any) {
  const styles: any = {
    blue: { bg: "bg-blue-50/50", iconBg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200", shadow: "shadow-blue-100" },
    amber: { bg: "bg-amber-50/50", iconBg: "bg-amber-100", text: "text-amber-600", border: "border-amber-200", shadow: "shadow-amber-100" },
    emerald: { bg: "bg-emerald-50/50", iconBg: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-200", shadow: "shadow-emerald-100" },
  };
  const current = styles[variant];
  return (
    <div className={`p-8 rounded-[40px] border-2 ${current.border} ${current.bg} shadow-xl border-b-8 flex flex-col text-left transition-all duration-500 hover:-translate-y-2 group`}>
      <div className="flex justify-between items-start mb-8">
        <div className={`p-3.5 rounded-2xl ${current.iconBg} ${current.text} group-hover:scale-110 transition-transform`}>{icon}</div>
        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${isAlert ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-white text-emerald-700 border-emerald-100'}`}>
          {trend}
        </span>
      </div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 italic leading-none">{label}</p>
      <h3 className="text-5xl font-extralight text-slate-900 tracking-tighter italic leading-none mt-1">{value}</h3>
    </div>
  );
}

function ProgressItem({ label, percent, color, shadow }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
        <span>{label}</span>
        <span className="text-slate-900">{percent}%</span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-[3px] border border-slate-50 shadow-inner">
        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className={`h-full ${color} ${shadow} shadow-lg rounded-full`} />
      </div>
    </div>
  );
}