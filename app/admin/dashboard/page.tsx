"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { Bell, Activity, Zap, Search, Users, DoorOpen, TrendingUp, ChevronRight, PieChart } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalResidents: 0,
    vacantSlots: 0,
    activeAllocations: 0,
    utilization: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // 1. Real-time listener para sa Total Residents
    const unsubResidents = onSnapshot(collection(db, "residents"), (snap) => {
      setStats(prev => ({ ...prev, totalResidents: snap.size }));
    });

    // 2. Real-time listener para sa Rooms & Vacant Slots
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

    // 3. Real-time listener para sa Recent Activity (Allocations)
    const q = query(collection(db, "allocations"), orderBy("assignedAt", "desc"), limit(4));
    const unsubActivity = onSnapshot(q, (snap) => {
      const activity = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentActivity(activity);
      setStats(prev => ({ ...prev, activeAllocations: snap.size }));
    });

    return () => {
      unsubResidents();
      unsubRooms();
      unsubActivity();
    };
  }, []);

  return (
    <div className="flex h-screen w-screen bg-[#f1f3f6] p-6 gap-6 overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 bg-[#fcfdfe] rounded-[48px] shadow-2xl shadow-slate-200/50 border border-white flex flex-col overflow-hidden">
        {/* Top Header */}
        <nav className="h-20 px-10 flex items-center justify-between border-b border-slate-50 flex-shrink-0 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <Search size={14} className="text-slate-400" />
            <input type="text" placeholder="Search residents..." className="bg-transparent text-[11px] outline-none w-48 font-light" />
          </div>
          
          <button className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all shadow-sm group">
            <Bell size={18} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform" />
          </button>
        </nav>

        <div className="flex-1 internal-scroll p-10 overflow-y-auto">
          <header className="mb-10 flex justify-between items-end">
            <div className="text-left">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] mb-2">Campus Overview</p>
              <h1 className="text-4xl font-light text-slate-900 tracking-tight">
                Dashboard <span className="font-normal text-emerald-950 italic underline decoration-emerald-200 underline-offset-8">Analytics</span>
              </h1>
            </div>
            <div className="bg-emerald-50/50 px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Live: Feb 03, 2026</span>
            </div>
          </header>

          <div className="grid grid-cols-4 gap-6 mb-12">
            <StatCard label="Total Residents" value={stats.totalResidents.toString()} trend="+Active" icon={<Users size={20} />} variant="blue" />
            <StatCard label="Vacant Slots" value={stats.vacantSlots.toString()} trend={stats.vacantSlots < 10 ? "Low" : "Available"} icon={<DoorOpen size={20} />} variant="amber" isAlert={stats.vacantSlots < 10} />
            <StatCard label="Allocations" value={stats.activeAllocations.toString()} trend={`${stats.utilization}%`} icon={<TrendingUp size={20} />} variant="emerald" />
            
            <div className="bg-emerald-950 rounded-[35px] p-8 text-white flex flex-col justify-between shadow-2xl shadow-emerald-900/40 border-b-4 border-emerald-500 relative overflow-hidden group">
               <div className="relative z-10 bg-emerald-500/20 w-10 h-10 rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <Zap size={20} className="text-emerald-400" />
               </div>
               <div className="relative z-10 text-left">
                  <p className="text-[10px] opacity-40 uppercase tracking-widest mb-1">System Node</p>
                  <p className="text-lg font-light tracking-tight text-emerald-50">Fully <span className="font-semibold text-white">Operational</span></p>
               </div>
               <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <section className="col-span-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-[40px] p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800">Activity Pulse</h3>
                </div>
              </div>
              
              <div className="space-y-3">
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50/50 border border-transparent hover:border-emerald-100 hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                        <Activity size={18} strokeWidth={1.5} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-800">Resident Assigned</p>
                        <p className="text-[10px] text-slate-400 font-light uppercase tracking-tighter">
                          Student: {activity.studentID} — Room {activity.roomID}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-all" />
                  </div>
                )) : (
                  <p className="text-center text-slate-400 text-xs py-10">No recent assignments found.</p>
                )}
              </div>
            </section>

            <aside className="col-span-4 bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-[40px] p-10">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                <PieChart size={14} className="text-emerald-600" /> Dorm Capacity
              </h4>
              
              <div className="space-y-8 text-left">
                 <ProgressItem label="Overall Utilization" percent={stats.utilization} color="bg-emerald-500" shadow="shadow-emerald-200" />
              </div>

              <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                 <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-1">Total Utilization</p>
                 <h2 className="text-5xl font-light text-slate-900 tracking-tighter italic">{stats.utilization}<span className="text-2xl text-slate-200 not-italic ml-1">%</span></h2>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, trend, icon, variant, isAlert }: any) {
  const styles: any = {
    blue: { bg: "bg-blue-50/50", iconBg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200", shadow: "shadow-blue-100" },
    amber: { bg: "bg-amber-50/50", iconBg: "bg-amber-100", text: "text-amber-600", border: "border-amber-200", shadow: "shadow-amber-100" },
    emerald: { bg: "bg-emerald-50/50", iconBg: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-200", shadow: "shadow-emerald-100" },
  };
  const current = styles[variant];
  return (
    <div className={`p-8 rounded-[35px] border-2 ${current.border} ${current.bg} shadow-xl ${current.shadow} border-b-4 flex flex-col text-left transition-all duration-500 hover:-translate-y-1`}>
      <div className="flex justify-between items-start mb-8">
        <div className={`p-3 rounded-2xl ${current.iconBg} ${current.text} shadow-sm`}>{icon}</div>
        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${isAlert ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-emerald-700 border-emerald-100 shadow-sm'}`}>
          {trend}
        </span>
      </div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-4xl font-light text-slate-900 tracking-tighter">{value}</h3>
    </div>
  );
}

function ProgressItem({ label, percent, color, shadow }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[11px] font-semibold text-slate-600 uppercase tracking-widest">
        <span>{label}</span>
        <span className="text-slate-900">{percent}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-[2px] border border-slate-50">
        <div className={`h-full ${color} ${shadow} shadow-lg rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}