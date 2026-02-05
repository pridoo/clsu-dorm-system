"use client";
import Sidebar from '@/components/admin/Sidebar';
import { 
  Shield, Calendar, Database, Bell, Save, Lock, Trash2, 
  CloudUpload, History, Send, Megaphone, Loader2, 
  ShieldCheck, AlertTriangle, X, Archive, Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { 
  doc, getDoc, setDoc, serverTimestamp, 
  collection, addDoc, getDocs, writeBatch, query, where, orderBy 
} from 'firebase/firestore';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('General');
  const [loading, setLoading] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // States para sa configuration
  const [config, setConfig] = useState({
    academicYear: '2025 - 2026',
    semester: '2nd Semester',
    registrationMode: true
  });

  // State para sa listahan ng available years galing DB
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [newYearInput, setNewYearInput] = useState("");
  const [showAddYear, setShowAddYear] = useState(false);

  const [broadcast, setBroadcast] = useState({ subject: '', message: '' });

  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  // FETCH CONFIG AND YEAR LIST
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get current active config
        const configSnap = await getDoc(doc(db, "system", "config"));
        if (configSnap.exists()) setConfig(configSnap.data() as any);

        // 2. Get list of academic years
        const yearsSnap = await getDocs(query(collection(db, "academic_years"), orderBy("label", "desc")));
        if (!yearsSnap.empty) {
          setAvailableYears(yearsSnap.docs.map(d => d.data().label));
        }
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, []);

  // 1. ACTION: ADD NEW ACADEMIC YEAR TO LIST
  const handleAddYear = async () => {
    if (!newYearInput.includes("-")) return alert("Format: YYYY - YYYY");
    setLoading(true);
    try {
      const yearId = newYearInput.replace(/\s+/g, '');
      await setDoc(doc(db, "academic_years", yearId), {
        label: newYearInput,
        status: "inactive",
        createdAt: serverTimestamp()
      });
      setAvailableYears(prev => [newYearInput, ...prev]);
      setNewYearInput("");
      setShowAddYear(false);
      setStatusMsg({ type: 'success', text: 'New Academic Year Added!' });
    } catch (error) {
      setStatusMsg({ type: 'error', text: 'Failed to add year.' });
    } finally { setLoading(false); }
  };

  // 2. ACTION: UPDATE SYSTEM, ARCHIVE & SET SEMESTER LOGIC
  const handleUpdateConfig = async () => {
    if (!confirm(`Are you sure you want to activate ${config.academicYear} ${config.semester}? All current residents will be archived.`)) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      // A. Archive lahat ng current allocations
      const allocSnap = await getDocs(collection(db, "allocations"));
      allocSnap.forEach((d) => {
        const data = d.data();
        const archiveRef = doc(collection(db, "archived_allocations"));
        batch.set(archiveRef, { 
          ...data, 
          archivedAt: serverTimestamp(),
          archivedInPeriod: `${config.academicYear} | ${config.semester}`
        });
        batch.delete(d.ref);

        // B. Mark resident as Archived in main residents table
        const residentRef = doc(db, "residents", data.studentID);
        batch.update(residentRef, { isArchived: true });
      });

      // C. Reset Room counts
      const roomsSnap = await getDocs(collection(db, "rooms"));
      roomsSnap.forEach((d) => {
        batch.update(d.ref, { occupied_beds: 0 });
      });

      // D. Update academic_years collection status
      const yearsSnap = await getDocs(collection(db, "academic_years"));
      yearsSnap.forEach((yDoc) => {
        batch.update(yDoc.ref, { 
          status: yDoc.data().label === config.academicYear ? "active" : "inactive" 
        });
      });

      // E. SEMESTER LOGIC: Create/Update Semester Document for THIS specific year
      // Format ID: 20252026-1stSem
      const yearShortId = config.academicYear.replace(/\s+/g, '');
      const semShortId = config.semester.replace(/\s+/g, '');
      const semesterDocId = `${yearShortId}-${semShortId}`;
      
      // I-inactive muna lahat ng semesters sa collection
      const allSemestersSnap = await getDocs(collection(db, "semesters"));
      allSemestersSnap.forEach((sDoc) => {
        batch.update(sDoc.ref, { status: "inactive" });
      });

      // Gawan o i-update yung specific semester para sa school year na ito
      const semesterRef = doc(db, "semesters", semesterDocId);
      batch.set(semesterRef, {
        label: config.semester,
        academic_year: config.academicYear, // Link to active year
        academic_year_id: yearShortId,
        status: "active",
        updatedAt: serverTimestamp()
      }, { merge: true });

      // F. Update Main Global System Config
      const configRef = doc(db, "system", "config");
      batch.set(configRef, { ...config, updatedAt: serverTimestamp() }, { merge: true });

      await batch.commit();
      setStatusMsg({ type: 'success', text: 'New Period Active & Data Archived! 🚀' });
    } catch (error: any) {
      console.error(error);
      setStatusMsg({ type: 'error', text: 'Update failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleMasterReset = async () => {
    setLoading(true);
    try {
      const { seedDatabase } = await import('@/lib/dbSeeder');
      await seedDatabase();
      setShowWipeModal(false);
      setStatusMsg({ type: 'success', text: 'Database Fully Reset!' });
    } catch (err) { setStatusMsg({ type: 'error', text: 'Reset Failure.' }); }
    finally { setLoading(false); }
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

  const sections = [
    { name: 'General', icon: <Calendar size={18} /> },
    { name: 'Security', icon: <Lock size={18} /> },
    { name: 'Database', icon: <Database size={18} /> },
    { name: 'Broadcast', icon: <Bell size={18} /> },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] p-6 gap-6 overflow-hidden text-left font-sans text-slate-900">
      <Sidebar />
      <main className="flex-1 bg-white border border-slate-200/60 shadow-2xl rounded-[40px] flex overflow-hidden relative">
        
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

        <div className="flex-1 p-12 overflow-y-auto bg-[#fbfcfd] internal-scroll scrollbar-hide">
          <header className="mb-10"><h1 className="text-2xl font-semibold text-slate-900 italic tracking-tight uppercase">{activeSection} <span className="font-light not-italic text-slate-400">Configuration</span></h1></header>

          {activeSection === 'General' && (
            <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-2 border-emerald-500 pl-3 italic text-left">Active Academic Period</p>
                  <button onClick={() => setShowAddYear(true)} className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors">
                    <Plus size={12}/> Add New Year
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-left leading-none">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                    <select value={config.academicYear} onChange={(e) => setConfig({...config, academicYear: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs font-medium outline-none focus:border-emerald-500 appearance-none shadow-sm cursor-pointer italic">
                      {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1 text-left leading-none">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                    <select value={config.semester} onChange={(e) => setConfig({...config, semester: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs font-medium outline-none focus:border-emerald-500 appearance-none shadow-sm cursor-pointer italic">
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                      <option value="Summer Class">Summer Class</option>
                    </select>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showAddYear && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] space-y-4 overflow-hidden">
                    <div className="flex justify-between items-center text-left leading-none">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none italic text-left">Period Designation</p>
                      <button onClick={() => setShowAddYear(false)} className="text-slate-400 hover:text-slate-600"><X size={14}/></button>
                    </div>
                    <div className="flex gap-3">
                      <input type="text" value={newYearInput} onChange={(e) => setNewYearInput(e.target.value)} placeholder="2026 - 2027" className="flex-1 bg-white border border-slate-200 px-4 py-3 rounded-xl text-xs font-medium outline-none focus:border-emerald-500 shadow-inner" />
                      <button onClick={handleAddYear} disabled={loading} className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all leading-none">Add Year</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-[32px] flex items-center justify-between">
                <div className="flex items-center gap-4 text-left leading-none">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner"><Shield size={20}/></div>
                  <div><p className="text-xs font-bold text-amber-900 mb-1 leading-none uppercase italic text-left">Registration Gate</p><p className="text-[10px] text-amber-700 opacity-70 italic font-medium leading-none text-left">Enable enrollment for managers</p></div>
                </div>
                <div onClick={() => setConfig({...config, registrationMode: !config.registrationMode})} className={`h-6 w-11 rounded-full relative shadow-inner cursor-pointer transition-all ${config.registrationMode ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 h-4 w-4 bg-white rounded-full shadow-md transition-all ${config.registrationMode ? 'right-1' : 'left-1'}`} /></div>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] flex items-start gap-4">
                 <Archive size={18} className="text-slate-400 mt-1 shrink-0" />
                 <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic text-left leading-none">Switching periods will create a unique Semester record linked to the Academic Year and reset active occupancy.</p>
              </div>

              <button onClick={handleUpdateConfig} disabled={loading} className="flex items-center gap-2 bg-emerald-950 text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all w-full justify-center">
                {loading ? <Loader2 className="animate-spin" size={14} /> : <><Save size={14} /> Commit Changes & Sync Period</>}
              </button>
            </div>
          )}

          {activeSection === 'Security' && (
            <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
              <div className="space-y-4 text-left">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-2 border-emerald-500 pl-3 italic">Account Protection</p>
                <div className="space-y-3">
                  <input type="email" disabled value="admin@clsu.edu.ph" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs font-medium opacity-60 cursor-not-allowed shadow-sm" />
                  <div className="p-5 bg-blue-50 border border-blue-100 rounded-[32px] flex items-start gap-4 text-left">
                    <ShieldCheck size={20} className="text-blue-600 shrink-0" />
                    <p className="text-[10px] font-medium text-blue-700 italic leading-relaxed text-left leading-none">System security is bound to the institutional administrative profile.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'Database' && (
            <div className="max-w-xl space-y-8 text-left animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="p-10 bg-white border border-red-100 rounded-[48px] shadow-xl space-y-6 relative overflow-hidden">
                <div className="flex items-center gap-4 text-red-600">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center shadow-inner"><AlertTriangle size={28} /></div>
                  <div className="text-left leading-none">
                    <p className="text-xl font-bold italic text-red-700 uppercase leading-none">System Wipe</p>
                    <p className="text-[9px] font-black text-red-400 uppercase mt-2 leading-none italic">Danger Zone Operations</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic text-left leading-none px-2">This will permanently clear all registries to restore the hub to its baseline state.</p>
                <button onClick={() => setShowWipeModal(true)} className="w-full bg-red-600 text-white py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-700 transition-all shadow-xl shadow-red-200">Execute Purge</button>
              </div>
            </div>
          )}
        </div>

        {/* MODERN WIPE MODAL */}
        <AnimatePresence>
          {showWipeModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWipeModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden p-10 text-center border border-white/20">
                <div className="w-20 h-20 bg-red-50 rounded-[30px] flex items-center justify-center text-red-600 mx-auto mb-6 shadow-inner"><Trash2 size={40} /></div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2 italic uppercase">Final Purge</h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-8">This action cannot be undone. Proceed?</p>
                <div className="flex flex-col gap-3">
                  <button onClick={handleMasterReset} disabled={loading} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-200">{loading ? <Loader2 className="animate-spin" size={14} /> : "Destroy Hub Data"}</button>
                  <button onClick={() => setShowWipeModal(false)} className="w-full py-4 text-[10px] font-black text-slate-300 hover:text-slate-600 uppercase tracking-widest transition-colors leading-none">Abort</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}