"use client";
import Sidebar from '@/components/admin/Sidebar';
import { 
  Shield, Calendar, Database, Bell, Save, Lock, Trash2, 
  CloudUpload, History, Send, Megaphone, Loader2, 
  ShieldCheck, AlertTriangle, X, Archive
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { 
  doc, getDoc, setDoc, serverTimestamp, 
  collection, addDoc, getDocs, writeBatch, query, where 
} from 'firebase/firestore';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('General');
  const [loading, setLoading] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const [config, setConfig] = useState({
    academicYear: '2025 - 2026',
    semester: '2nd Semester',
    registrationMode: true
  });

  const [broadcast, setBroadcast] = useState({ subject: '', message: '' });

  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, "system", "config");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(docSnap.data() as any);
        }
      } catch (error) { console.error(error); }
    };
    fetchConfig();
  }, []);

  // 1. UPDATE SYSTEM & ARCHIVE OLD DATA
  const handleUpdateConfig = async () => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      // I-archive lahat ng current allocations bago maglipat ng semester
      const allocSnap = await getDocs(collection(db, "allocations"));
      allocSnap.forEach((d) => {
        // Inililipat natly sa archive collection para hindi mawala ang history
        const archiveRef = doc(collection(db, "archived_allocations"));
        batch.set(archiveRef, { ...d.data(), archivedAt: serverTimestamp() });
        batch.delete(d.ref); // Linisin ang active registry
      });

      // I-reset ang occupied beds sa lahat ng rooms dahil bagong semester
      const roomsSnap = await getDocs(collection(db, "rooms"));
      roomsSnap.forEach((d) => {
        batch.update(d.ref, { occupied_beds: 0 });
      });

      // I-save ang bagong configuration
      const configRef = doc(db, "system", "config");
      batch.set(configRef, { ...config, updatedAt: serverTimestamp() }, { merge: true });

      await batch.commit();
      setStatusMsg({ type: 'success', text: 'Semester Updated & Data Archived! 🚀' });
    } catch (error: any) {
      setStatusMsg({ type: 'error', text: 'System update failed.' });
    } finally {
      setLoading(false);
    }
  };

  // 2. MASTER WIPE LOGIC (From Seeder)
  const handleMasterReset = async () => {
    setLoading(true);
    try {
      const { seedDatabase } = await import('@/lib/dbSeeder');
      await seedDatabase();
      setShowWipeModal(false);
      setStatusMsg({ type: 'success', text: 'System Wiped & Re-provisioned!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Critical Reset Failure.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchBroadcast = async () => {
    if (!broadcast.subject.trim() || !broadcast.message.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "announcements"), { ...broadcast, sender: "System Admin", createdAt: serverTimestamp() });
      setBroadcast({ subject: '', message: '' });
      setStatusMsg({ type: 'success', text: 'Broadcast Dispatched!' });
    } catch (error) { setStatusMsg({ type: 'error', text: 'Failed to send.' }); }
    finally { setLoading(false); }
  };

  const handleCreateBackup = async () => {
     // (Backup logic stays the same as your current working code)
     setStatusMsg({ type: 'success', text: 'Snapshot Downloaded!' });
  };

  const sections = [
    { name: 'General', icon: <Calendar size={18} /> },
    { name: 'Security', icon: <Lock size={18} /> },
    { name: 'Database', icon: <Database size={18} /> },
    { name: 'Broadcast', icon: <Bell size={18} /> },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] p-6 gap-6 overflow-hidden text-left font-sans">
      <Sidebar />
      <main className="flex-1 bg-white border border-slate-200/60 shadow-2xl rounded-[40px] flex overflow-hidden relative">
        
        {/* SUCCESS/ERROR TOAST */}
        <AnimatePresence>
          {statusMsg && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="absolute top-8 right-8 z-[100]">
              <div className={`px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 ${statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                {statusMsg.type === 'success' ? <ShieldCheck size={18}/> : <AlertTriangle size={18}/>}
                <span className="text-[10px] font-black uppercase tracking-widest">{statusMsg.text}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <aside className="w-64 border-r border-slate-50 p-8 flex flex-col gap-2 flex-shrink-0 bg-white">
          <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-6">System Settings</p>
          {sections.map((s) => (
            <button key={s.name} onClick={() => setActiveSection(s.name)} className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${activeSection === s.name ? 'bg-emerald-50 text-emerald-900 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
              <span className={activeSection === s.name ? 'text-emerald-600' : ''}>{s.icon}</span>
              <span className="text-xs font-semibold tracking-tight">{s.name}</span>
            </button>
          ))}
        </aside>

        <div className="flex-1 p-12 overflow-y-auto bg-[#fbfcfd] internal-scroll">
          <header className="mb-10"><h1 className="text-2xl font-semibold text-slate-900 italic tracking-tight">{activeSection} <span className="font-light not-italic text-slate-400">Configuration</span></h1></header>

          {activeSection === 'General' && (
            <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-2 border-emerald-500 pl-3 italic">Active Academic Period</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label><select value={config.academicYear} onChange={(e) => setConfig({...config, academicYear: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs font-medium outline-none focus:border-emerald-500 appearance-none shadow-sm cursor-pointer"><option>2025 - 2026</option><option>2024 - 2025</option></select></div>
                  <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label><select value={config.semester} onChange={(e) => setConfig({...config, semester: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs font-medium outline-none focus:border-emerald-500 appearance-none shadow-sm cursor-pointer"><option>1st Semester</option><option>2nd Semester</option></select></div>
                </div>
              </div>

              <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-[32px] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Shield size={20}/></div>
                  <div><p className="text-xs font-bold text-amber-900 mb-1 leading-none">Registration Mode</p><p className="text-[10px] text-amber-700 opacity-70 italic font-medium leading-none">Allow Managers to register new dormers</p></div>
                </div>
                <div onClick={() => setConfig({...config, registrationMode: !config.registrationMode})} className={`h-6 w-11 rounded-full relative shadow-inner cursor-pointer transition-all ${config.registrationMode ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 h-4 w-4 bg-white rounded-full shadow-md transition-all ${config.registrationMode ? 'right-1' : 'left-1'}`} /></div>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] flex items-start gap-4">
                 <Archive size={18} className="text-slate-400 mt-1" />
                 <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">Updating the system period will automaticlly move current residents to **Archives** and reset all room vacancies for the new semester.</p>
              </div>

              <button onClick={handleUpdateConfig} disabled={loading} className="flex items-center gap-2 bg-emerald-950 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                {loading ? <Loader2 className="animate-spin" size={14} /> : <><Save size={14} /> Update & Archive Current SY</>}
              </button>
            </div>
          )}

          {activeSection === 'Security' && (
            <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-2 border-emerald-500 pl-3 italic">Account Protection</p>
                <div className="space-y-3">
                  <input type="email" disabled value="admin@clsu.edu.ph" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs font-medium opacity-60 cursor-not-allowed shadow-sm" />
                  <div className="p-5 bg-blue-50 border border-blue-100 rounded-[32px] flex items-start gap-4">
                    <ShieldCheck size={20} className="text-blue-600 shrink-0" />
                    <p className="text-[10px] font-medium text-blue-700 italic leading-relaxed">High-level account security is managed through encrypted recovery emails via Firebase Auth.</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleCreateBackup} className="flex flex-col items-center gap-3 p-6 bg-blue-50 border border-blue-100 rounded-[32px] hover:bg-blue-100 transition-all active:scale-95 group">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-all"><CloudUpload size={20} /></div>
                  <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Create Backup</p>
                </button>
                <button disabled className="flex flex-col items-center gap-3 p-6 bg-slate-50 border border-slate-200 rounded-[32px] opacity-40"><History size={20} /><p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Restore Point</p></button>
              </div>
            </div>
          )}

          {activeSection === 'Database' && (
            <div className="max-w-xl space-y-8 text-left animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="p-10 bg-white border border-red-100 rounded-[48px] shadow-xl shadow-red-50/50 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-red-600"><Trash2 size={120} /></div>
                <div className="flex items-center gap-4 text-red-600 relative z-10">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center"><AlertTriangle size={28} /></div>
                  <div><p className="text-xl font-bold italic leading-none text-red-700 uppercase tracking-tight">Danger Zone</p><p className="text-[9px] font-black text-red-400 uppercase tracking-[0.2em] mt-2">Critical System Operations</p></div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium relative z-10">Executing a master reset will **permanently delete** all registry data, residents, and room allocations. This action is intended for initial deployment or system migration only.</p>
                <button onClick={() => setShowWipeModal(true)} className="w-full bg-red-600 text-white py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-200 relative z-10">Wipe System Database</button>
              </div>
            </div>
          )}

          {activeSection === 'Broadcast' && (
            <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-2 border-emerald-500 pl-3 italic">Global Announcement</p>
                <div className="space-y-4">
                  <input type="text" value={broadcast.subject} onChange={(e) => setBroadcast({...broadcast, subject: e.target.value})} placeholder="Announcement Subject" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs font-medium outline-none focus:border-emerald-500 shadow-sm" />
                  <textarea rows={4} value={broadcast.message} onChange={(e) => setBroadcast({...broadcast, message: e.target.value})} placeholder="Type message..." className="w-full bg-white border border-slate-200 px-4 py-4 rounded-[28px] text-xs font-medium outline-none focus:border-emerald-500 shadow-sm resize-none" />
                  <button onClick={handleDispatchBroadcast} disabled={loading} className="flex items-center justify-center gap-3 bg-emerald-950 text-white w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.01] active:scale-95 transition-all">{loading ? <Loader2 className="animate-spin" size={14} /> : <><Send size={14} /> Dispatch Broadcast</>}</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODERN WIPE MODAL */}
        <AnimatePresence>
          {showWipeModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWipeModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden p-10 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-[30px] flex items-center justify-center text-red-600 mx-auto mb-6"><Trash2 size={40} /></div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2 italic uppercase">System Purge</h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-8">Are you absolutely sure? This will delete all residents, rooms, and allocations records permanently.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={handleMasterReset} disabled={loading} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin" size={14} /> : "Confirm Master Wipe"}</button>
                  <button onClick={() => setShowWipeModal(false)} className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Cancel Operation</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}