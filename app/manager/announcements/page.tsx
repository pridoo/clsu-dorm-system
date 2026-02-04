"use client";
import { useState } from 'react';
import ManagerSidebar from '@/components/managers/Sidebar';
import { 
  Search, BellRing, Plus, Calendar, 
  Trash2, Edit3, Send, Sparkles, 
  Filter, Megaphone, Info, Clock, 
  ChevronRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementsPage() {
  const [isPosting, setIsPosting] = useState(false);
  const [priority, setPriority] = useState('Medium');

  const announcements = [
    { id: 1, title: 'Dorm General Cleaning', date: 'Feb 05, 2026', type: 'Maintenance', priority: 'High', content: 'All residents are required to participate in the upcoming general cleaning scheduled this Friday.' },
    { id: 2, title: 'Curfew Adjustment', date: 'Feb 01, 2026', type: 'Policy', priority: 'Medium', content: 'Starting next week, the curfew will be strictly implemented at 9:00 PM.' },
    { id: 3, title: 'Water Interruption', date: 'Jan 28, 2026', type: 'Utility', priority: 'High', content: 'There will be a temporary water interruption due to tank maintenance from 1PM to 5PM.' },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] p-6 gap-6 overflow-hidden text-left font-sans">
      <ManagerSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden bg-white border border-slate-300 shadow-[0_0_50px_rgba(0,0,0,0.08)] rounded-[45px] relative">
        
        {/* Header Section */}
        <nav className="h-24 px-12 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md z-10 flex-shrink-0">
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-6 bg-emerald-600 rounded-full" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none italic">Communication Hub</p>
            </div>
            <h1 className="text-3xl font-extralight text-slate-900 tracking-tighter leading-none italic text-left">
              Public <span className="font-bold text-emerald-950 not-italic tracking-tight text-4xl">Announcements</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-200 w-64 focus-within:bg-white focus-within:border-emerald-500 transition-all shadow-sm">
                <Search size={16} className="text-slate-400" />
                <input type="text" placeholder="Search archives..." className="bg-transparent text-[11px] outline-none w-full font-bold text-slate-700 text-left" />
             </div>
             <button 
                onClick={() => setIsPosting(true)}
                className="flex items-center gap-2 bg-emerald-950 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all"
             >
                <Plus size={16} /> Create Notice
             </button>
          </div>
        </nav>

        <div className="flex-1 overflow-hidden flex bg-[#f8fafc]/30">
          <div className="flex-1 overflow-y-auto internal-scroll p-10">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 mb-10">
               <MetricCard icon={<Megaphone size={18}/>} label="Active Notices" value="08" color="text-emerald-600" bg="bg-emerald-50" />
               <MetricCard icon={<Clock size={18}/>} label="Scheduled" value="02" color="text-blue-600" bg="bg-blue-50" />
               <MetricCard icon={<Info size={18}/>} label="High Priority" value="03" color="text-rose-600" bg="bg-rose-50" />
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-6 italic">Recent Broadcasts</p>
               {announcements.map((post) => (
                 <motion.div 
                   key={post.id}
                   whileHover={{ x: 10 }}
                   className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-sm flex items-center justify-between group hover:border-emerald-500 transition-all"
                 >
                    <div className="flex items-start gap-8 text-left">
                       <div className="mt-1">
                          <div className={`w-14 h-14 rounded-3xl flex items-center justify-center border-2 ${
                             post.priority === 'High' ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-slate-50 border-slate-100 text-slate-400'
                          }`}>
                             <BellRing size={24} className={post.priority === 'High' ? 'animate-bounce' : ''} />
                          </div>
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                                post.priority === 'High' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-900 text-white'
                             }`}>{post.priority} Priority</span>
                             <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{post.type} • {post.date}</span>
                          </div>
                          <h3 className="text-xl font-black text-slate-800 tracking-tight italic mb-2">{post.title}</h3>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">{post.content}</p>
                       </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-emerald-600 transition-colors"><Edit3 size={18}/></button>
                       <button className="p-3 hover:bg-rose-50 rounded-2xl text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={18}/></button>
                    </div>
                 </motion.div>
               ))}
            </div>
          </div>

          {/* Creation Side Panel */}
          <AnimatePresence>
            {isPosting && (
              <motion.aside 
                initial={{ x: 450 }} animate={{ x: 0 }} exit={{ x: 450 }}
                className="w-[450px] bg-white border-l border-slate-300 shadow-2xl z-20 flex flex-col"
              >
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
                   <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] italic text-left">Draft Notice</h2>
                   <button onClick={() => setIsPosting(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                      <X size={20} />
                   </button>
                </div>

                <div className="p-10 flex-1 overflow-y-auto space-y-8 text-left internal-scroll bg-[#f8fafc]/50">
                   <div className="bg-emerald-950 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                      <Sparkles className="absolute top-4 right-4 text-emerald-500/20" size={40} />
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic">Broadcast System</p>
                      <h3 className="text-3xl font-extralight italic tracking-tighter leading-none">New Announcement</h3>
                   </div>

                   <div className="space-y-6 text-left">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Title of Notice</label>
                         <input type="text" placeholder="e.g. Mandatory Water Test" className="w-full bg-white border-2 border-slate-100 px-6 py-4 rounded-[25px] text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all shadow-sm" />
                      </div>

                      <div className="space-y-2 text-left">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Priority Level</label>
                         <div className="flex gap-2">
                            {['Low', 'Medium', 'High'].map((p) => (
                              <button key={p} onClick={() => setPriority(p)} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${
                                priority === p ? (p === 'High' ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-emerald-950 border-emerald-950 text-white shadow-lg') : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                              }`}>{p}</button>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-2 text-left">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Content / Message</label>
                         <textarea rows={6} placeholder="Describe the announcement details here..." className="w-full bg-white border-2 border-slate-100 px-6 py-5 rounded-[35px] text-xs font-medium text-slate-600 outline-none focus:border-emerald-500 transition-all shadow-sm resize-none leading-relaxed" />
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-slate-100 mt-auto bg-white/80 backdrop-blur-md">
                   <button className="w-full bg-emerald-950 text-white py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-emerald-900/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                      <Send size={16} /> Broadcast to All Residents
                   </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon, label, value, color, bg }: any) {
  return (
    <div className={`p-6 rounded-[35px] border border-slate-100 bg-white shadow-sm flex items-center gap-5 text-left group hover:shadow-md transition-all`}>
       <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
          <p className="text-2xl font-black text-slate-800 tracking-tighter italic leading-none">{value}</p>
       </div>
    </div>
  );
}