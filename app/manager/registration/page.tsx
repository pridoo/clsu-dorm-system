"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/managers/Sidebar';
import { 
  Facebook, Phone, Heart, GraduationCap, Hash, 
  UserCircle, Save, Sparkles, MapPin, ShieldCheck,
  VenetianMask, Loader2, Search, X, History, ChevronRight
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, serverTimestamp, doc, getDoc, query, where, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegistrationPage() {
  const [assignedBuilding, setAssignedBuilding] = useState("Loading...");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  
  const [activeYear, setActiveYear] = useState<any>(null);
  const [activeSem, setActiveSem] = useState<any>(null);

  const [archivedResidents, setArchivedResidents] = useState<any[]>([]);
  const [archiveSearchTerm, setArchiveSearchTerm] = useState("");

  const initialFormState = {
    student_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    course: '', 
    year_level: '1st Year',
    gender: 'Female',
    fb_link: '',
    contact_number: '',
    address_street: '',
    address_city: '',
    address_province: '',
    mother_first_name: '',
    mother_middle_name: '',
    mother_last_name: '',
    mother_contact: '',
    father_first_name: '',
    father_middle_name: '',
    father_last_name: '',
    father_contact: '',
    guardian_first_name: '',
    guardian_middle_name: '',
    guardian_last_name: '',
    guardian_contact: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  // 1. FETCH CONTEXT & SECURITY FIX
  useEffect(() => {
    // Ginamit natin ang onAuthStateChanged para siguradong may user bago mag-query
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // A. Fetch Manager Profile
          const userSnap = await getDoc(doc(db, "users", user.uid));
          if (userSnap.exists()) {
            const building = userSnap.data().assigned_building;
            setAssignedBuilding(building);

            // B. Fetch Archived Residents (One-time fetch with error handling)
            const archQ = query(
              collection(db, "residents"), 
              where("assigned_building", "==", building),
              where("isArchived", "==", true)
            );
            const archSnap = await getDocs(archQ);
            setArchivedResidents(archSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          }

          // C. Fetch System Config (Global read usually allowed)
          const configSnap = await getDoc(doc(db, "system", "config"));
          if (configSnap.exists()) {
            const config = configSnap.data();
            setActiveYear({ id: config.academicYear, label: config.academicYear });
            setActiveSem({ id: config.semester, label: config.semester });
          }
        } catch (error: any) {
          console.error("Firestore Permission Error:", error.message);
        }
      }
    });

    return () => unsubAuth();
  }, []);

  const handleSelectArchived = (student: any) => {
    setFormData({ ...formData, ...student });
    setShowRestoreModal(false);
    alert(`Data for ${student.first_name} has been restored. ✨`);
  };

  const handleIdLookup = async () => {
    if (!formData.student_id) return;
    setSearching(true);
    try {
      const q = query(collection(db, "residents"), where("student_id", "==", formData.student_id));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        setFormData({ ...formData, ...querySnap.docs[0].data() });
        alert("Record found and auto-filled!");
      } else {
        alert("No record found for this ID.");
      }
    } catch (error) { console.error(error); }
    finally { setSearching(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.student_id) {
      alert("⚠️ Mandatory fields missing.");
      return;
    }
    if (!activeYear || !activeSem) {
      alert("❌ No active academic period detected in system settings.");
      return;
    }

    setLoading(true);
    try {
      const residentRef = doc(db, "residents", formData.student_id);
      await setDoc(residentRef, {
        ...formData,
        isArchived: false,
        assigned_building: assignedBuilding,
        registered_academic_year_label: activeYear.label,
        registered_semester_label: activeSem.label,
        last_updated: serverTimestamp(),
      }, { merge: true });
      
      alert(`Enrollment confirmed for ${activeYear.label}! 🎉`);
      setFormData(initialFormState);
    } catch (error: any) {
      alert("❌ Security Error: " + error.message);
    } finally { setLoading(false); }
  };

  const filteredArchives = archivedResidents.filter(r => 
    `${r.first_name} ${r.last_name}`.toLowerCase().includes(archiveSearchTerm.toLowerCase()) ||
    r.student_id.includes(archiveSearchTerm)
  );

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] p-6 gap-6 overflow-hidden text-left font-sans text-slate-900 leading-none">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden bg-white border border-slate-300 shadow-[0_0_50px_rgba(0,0,0,0.08)] rounded-[45px] relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] blur-[120px] -z-10 rounded-full" />

        <nav className="h-24 px-12 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md relative z-10 flex-shrink-0">
          <div className="space-y-0.5 text-left leading-none">
            <div className="flex items-center gap-2 leading-none">
               <div className="h-1.5 w-5 bg-emerald-600 rounded-full" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none italic">Registry Hub</p>
            </div>
            <h1 className="text-3xl font-extralight tracking-tighter italic leading-none">
              New Dormer <span className="font-bold text-emerald-950 not-italic tracking-tight text-4xl">Registry</span>
            </h1>
          </div>

          <div className="flex gap-4 leading-none">
             <div className="bg-emerald-50 px-6 py-3 rounded-[20px] border border-emerald-100 text-right leading-none">
                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1 italic">Active Period</p>
                <p className="text-xs font-black text-emerald-950 uppercase">{activeYear?.label || '---'} | {activeSem?.label || '---'}</p>
             </div>
             <button 
              onClick={() => setShowRestoreModal(true)}
              className="flex items-center gap-3 bg-white border-2 border-slate-200 px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all leading-none"
             >
                <History size={16} /> Restore Records
             </button>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-12 bg-[#f8fafc]/30 internal-scroll text-left leading-none">
          <div className="max-w-[1400px] mx-auto space-y-10 text-left leading-none">
            <div className="grid grid-cols-12 gap-8 items-stretch text-left leading-none">
              <div className="col-span-8 space-y-8 flex flex-col text-left leading-none">
                <div className="bg-white border border-slate-300 p-8 rounded-[40px] shadow-sm relative overflow-hidden flex-1 text-left leading-none">
                  <div className="flex items-center justify-between mb-8 leading-none">
                    <div className="flex items-center gap-3 text-left leading-none">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                      <h2 className="text-[11px] font-black uppercase tracking-[0.3em] italic leading-none">01. Academic Identity</h2>
                    </div>
                    <button onClick={handleIdLookup} disabled={searching} className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1 uppercase tracking-widest leading-none">
                       {searching ? <Loader2 size={10} className="animate-spin"/> : <Search size={10}/>} Manual Search
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-6 mb-10 text-left leading-none">
                    <InputGroup name="first_name" value={formData.first_name} onChange={handleChange} label="First Name" icon={<UserCircle size={14}/>} />
                    <InputGroup name="middle_name" value={formData.middle_name} onChange={handleChange} label="Middle Name" icon={<UserCircle size={14}/>} />
                    <InputGroup name="last_name" value={formData.last_name} onChange={handleChange} label="Last Name" icon={<UserCircle size={14}/>} />
                  </div>
                  <div className="grid grid-cols-10 gap-6 text-left leading-none">
                    <div className="col-span-2"><InputGroup name="student_id" value={formData.student_id} onChange={handleChange} label="Student ID" icon={<Hash size={14}/>} /></div>
                    <div className="col-span-4"><InputGroup name="course" value={formData.course} onChange={handleChange} label="Degree Program" icon={<GraduationCap size={14}/>} /></div>
                    <div className="col-span-2"><SelectGroup name="year_level" value={formData.year_level} onChange={handleChange} label="Year Level" options={['1st Year', '2nd Year', '3rd Year', '4th Year']} /></div>
                    <div className="col-span-2"><SelectGroup name="gender" value={formData.gender} onChange={handleChange} label="Gender" options={['Female', 'Male']} /></div>
                  </div>
                </div>
                <div className="bg-white border border-slate-300 p-8 rounded-[40px] shadow-sm text-left leading-none">
                  <div className="flex items-center gap-3 mb-8 leading-none">
                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] italic leading-none">02. Connectivity Hub</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-left leading-none">
                    <InputGroup name="fb_link" value={formData.fb_link} onChange={handleChange} label="Facebook Profile" icon={<Facebook size={14} className="text-blue-600"/>} />
                    <InputGroup name="contact_number" value={formData.contact_number} onChange={handleChange} label="Mobile Number" icon={<Phone size={14} className="text-emerald-600"/>} />
                  </div>
                </div>
              </div>

              <div className="col-span-4 text-left leading-none">
                <div className="bg-white border border-slate-300 p-8 rounded-[40px] shadow-sm h-full flex flex-col text-left leading-none">
                  <div className="flex items-center gap-3 mb-8 text-left leading-none">
                    <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] italic leading-none">03. Residence Log</h2>
                  </div>
                  <div className="space-y-6 flex-1 flex flex-col justify-center text-left leading-none">
                    <InputGroup name="address_street" value={formData.address_street} onChange={handleChange} label="Street / Brgy" icon={<MapPin size={14}/>} />
                    <InputGroup name="address_city" value={formData.address_city} onChange={handleChange} label="Municipality" icon={<MapPin size={14}/>} />
                    <InputGroup name="address_province" value={formData.address_province} onChange={handleChange} label="Province" icon={<MapPin size={14}/>} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-300 p-10 rounded-[45px] shadow-sm relative overflow-hidden text-left leading-none">
               <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none"><Heart size={120}/></div>
               <div className="flex items-center gap-3 mb-10 text-left leading-none">
                  <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                  <h2 className="text-[11px] font-black uppercase tracking-[0.3em] italic leading-none">04. Family & Emergency Protocol</h2>
               </div>
               <div className="grid grid-cols-3 gap-12 text-left leading-none">
                  <div className="space-y-4 border-r border-slate-100 pr-8 text-left leading-none">
                     <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-emerald-500 italic leading-none">Maternal</p>
                     <InputGroup name="mother_first_name" value={formData.mother_first_name} onChange={handleChange} label="First Name" />
                     <InputGroup name="mother_last_name" value={formData.mother_last_name} onChange={handleChange} label="Last Name" />
                     <InputGroup name="mother_contact" value={formData.mother_contact} onChange={handleChange} label="Mobile" />
                  </div>
                  <div className="space-y-4 border-r border-slate-100 pr-8 text-left leading-none">
                     <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-blue-500 italic leading-none">Paternal</p>
                     <InputGroup name="father_first_name" value={formData.father_first_name} onChange={handleChange} label="First Name" />
                     <InputGroup name="father_last_name" value={formData.father_last_name} onChange={handleChange} label="Last Name" />
                     <InputGroup name="father_contact" value={formData.father_contact} onChange={handleChange} label="Mobile" />
                  </div>
                  <div className="space-y-4 text-left leading-none">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 border-l-2 border-slate-300 italic leading-none">Guardian</p>
                     <InputGroup name="guardian_first_name" value={formData.guardian_first_name} onChange={handleChange} label="First Name" />
                     <InputGroup name="guardian_last_name" value={formData.guardian_last_name} onChange={handleChange} label="Last Name" />
                     <InputGroup name="guardian_contact" value={formData.guardian_contact} onChange={handleChange} label="Mobile" />
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-200 bg-white/80 backdrop-blur-md flex justify-end items-center gap-8 relative z-10 px-14 flex-shrink-0 leading-none">
          <button type="button" onClick={() => setFormData(initialFormState)} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-all leading-none">Clear Form</button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="flex items-center gap-3 bg-emerald-950 text-white px-14 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all leading-none">
            {loading ? <Loader2 className="animate-spin" size={16}/> : <><Save size={16} /> Finalize Enrollment</>}
          </button>
        </div>

        <AnimatePresence>
          {showRestoreModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-left leading-none">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRestoreModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#f8fafc] w-full max-w-2xl rounded-[45px] shadow-2xl overflow-hidden border border-white flex flex-col max-h-[80vh]">
                <div className="p-8 border-b border-slate-200 bg-white flex justify-between items-center text-left leading-none">
                  <div>
                    <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900 leading-none">Archive Retrieval</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-none">Previous residents of this building</p>
                  </div>
                  <button onClick={() => setShowRestoreModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"><X size={20}/></button>
                </div>
                
                <div className="p-6 bg-white border-b border-slate-100 leading-none text-left">
                  <div className="flex items-center gap-3 bg-slate-50 px-5 py-3.5 rounded-[20px] border border-slate-200 focus-within:bg-white focus-within:border-emerald-500 transition-all text-left leading-none">
                    <Search size={16} className="text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search name or student ID..." 
                      value={archiveSearchTerm}
                      onChange={(e) => setArchiveSearchTerm(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full leading-none" 
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 internal-scroll text-left leading-none">
                  {filteredArchives.length === 0 ? (
                    <div className="py-20 text-center text-slate-300 uppercase text-[10px] font-black italic tracking-widest leading-none">No archived records match</div>
                  ) : (
                    filteredArchives.map((res) => (
                      <button 
                        key={res.id} 
                        onClick={() => handleSelectArchived(res)}
                        className="w-full bg-white border border-slate-200 p-5 rounded-[30px] flex items-center justify-between group hover:border-emerald-500 hover:shadow-lg transition-all text-left leading-none"
                      >
                        <div className="flex items-center gap-4 text-left leading-none">
                          <div className="w-12 h-12 rounded-[18px] bg-slate-50 flex items-center justify-center text-sm font-black text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all uppercase italic">
                            {res.first_name[0]}
                          </div>
                          <div className="text-left leading-none">
                            <p className="text-[14px] font-black text-slate-800 uppercase italic leading-none">{res.first_name} {res.last_name}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 leading-none">{res.student_id} • {res.course}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300 group-hover:text-emerald-500 transition-all">
                          <span className="text-[9px] font-black uppercase tracking-widest italic opacity-0 group-hover:opacity-100 transition-all">Select Profile</span>
                          <ChevronRight size={20} />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function InputGroup({ label, value, onChange, name, icon, placeholder }: any) {
  return (
    <div className="space-y-2 text-left leading-none">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic leading-none">{label}</label>
      <div className="flex items-center gap-3 bg-white border-2 border-slate-200 px-5 py-3.5 rounded-2xl focus-within:border-emerald-500 transition-all shadow-sm group leading-none">
        {icon && <span className="text-slate-300 group-focus-within:text-emerald-500 transition-colors shrink-0 leading-none">{icon}</span>}
        <input autoComplete="off" name={name} value={value} onChange={onChange} type="text" placeholder={placeholder} className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full placeholder:text-slate-200 uppercase leading-none" />
      </div>
    </div>
  );
}

function SelectGroup({ label, value, onChange, name, options }: any) {
  return (
    <div className="space-y-2 text-left leading-none">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic leading-none">{label}</label>
      <div className="flex items-center gap-3 bg-white border-2 border-slate-200 px-5 py-3.5 rounded-2xl focus-within:border-emerald-500 transition-all shadow-sm leading-none">
        <select name={name} value={value} onChange={onChange} className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full appearance-none cursor-pointer leading-none">
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    </div>
  );
}