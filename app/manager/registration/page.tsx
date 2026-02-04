"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/components/managers/Sidebar';
import { 
  Facebook, Phone, Heart, GraduationCap, Hash, 
  UserCircle, Save, Sparkles, MapPin, ShieldCheck,
  VenetianMask
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function RegistrationPage() {
  const [assignedBuilding, setAssignedBuilding] = useState("Loading...");
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const fetchManagerContext = async () => {
      setAssignedBuilding("Men's Dorm 4 & 5"); 
    };
    fetchManagerContext();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.student_id) {
      alert("⚠️ Required: First Name, Last Name, and Student ID are mandatory.");
      return;
    }

    const hasMother = formData.mother_first_name && formData.mother_last_name;
    const hasFather = formData.father_first_name && formData.father_last_name;
    const hasGuardian = formData.guardian_first_name && formData.guardian_last_name;

    if (!hasMother && !hasFather && !hasGuardian) {
      alert("⚠️ Emergency Protocol: Please provide at least ONE complete name (Mother, Father, or Guardian).");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "residents"), {
        ...formData,
        isArchived: false,
        createdAt: serverTimestamp(),
        assigned_building: assignedBuilding
      });
      
      alert("Resident Enrolled Successfully! 🎉");
      setFormData(initialFormState);
    } catch (error: any) {
      console.error("Firebase Error: ", error);
      alert("❌ Critical Error: " + (error.message || "Failed to save data."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] p-6 gap-6 overflow-hidden text-left font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden bg-white border border-slate-300 shadow-[0_0_50px_rgba(0,0,0,0.08)] rounded-[45px] relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] blur-[120px] -z-10 rounded-full" />

        <nav className="h-24 px-12 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md relative z-10">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-5 bg-emerald-600 rounded-full" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Resident Enrolment</p>
            </div>
            <h1 className="text-3xl font-extralight tracking-tighter italic leading-none">
              New Dormer <span className="font-bold text-emerald-950 not-italic tracking-tight text-4xl">Registry</span>
            </h1>
          </div>
          <div className="bg-slate-100/50 px-6 py-3 rounded-[20px] border border-slate-200">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Facility Context</p>
             <p className="text-sm font-bold text-emerald-900 italic tracking-tight">{assignedBuilding}</p>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-12 bg-[#f8fafc]/30 internal-scroll">
          <div className="max-w-[1400px] mx-auto space-y-10">
            
            <div className="grid grid-cols-12 gap-8 items-stretch">
              {/* 01 ACADEMIC PROFILE - HABAAN NATIN (8 cols) */}
              <div className="col-span-8 space-y-8 flex flex-col">
                <div className="bg-white border border-slate-300 p-8 rounded-[40px] shadow-sm relative overflow-hidden flex-1">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] italic">01. Academic Profile</h2>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 mb-10">
                    <InputGroup name="first_name" value={formData.first_name} onChange={handleChange} label="First Name" placeholder="Alfred" icon={<UserCircle size={14}/>} />
                    <InputGroup name="middle_name" value={formData.middle_name} onChange={handleChange} label="Middle Name" placeholder="Pogi" icon={<UserCircle size={14}/>} />
                    <InputGroup name="last_name" value={formData.last_name} onChange={handleChange} label="Last Name" placeholder="Cabato" icon={<UserCircle size={14}/>} />
                  </div>

                  <div className="grid grid-cols-10 gap-6">
                    <div className="col-span-2">
                      <InputGroup name="student_id" value={formData.student_id} onChange={handleChange} label="Student ID" placeholder="21-1622" icon={<Hash size={14}/>} />
                    </div>
                    <div className="col-span-4">
                      <InputGroup name="course" value={formData.course} onChange={handleChange} label="Degree Program" placeholder="BS In Information Technology" icon={<GraduationCap size={14}/>} />
                    </div>
                    <div className="col-span-2">
                      <SelectGroup name="year_level" value={formData.year_level} onChange={handleChange} label="Year Level" icon={<Sparkles size={16}/>} options={['1st Year', '2nd Year', '3rd Year', '4th Year']} />
                    </div>
                    <div className="col-span-2">
                      <SelectGroup name="gender" value={formData.gender} onChange={handleChange} label="Gender" icon={<VenetianMask size={16}/>} options={['Female', 'Male']} />
                    </div>
                  </div>
                </div>

                {/* 02 CONNECTIVITY */}
                <div className="bg-white border border-slate-300 p-8 rounded-[40px] shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] italic">02. Connectivity Channels</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <InputGroup name="fb_link" value={formData.fb_link} onChange={handleChange} label="Facebook Link" placeholder="fb.com/alfred" icon={<Facebook size={14} className="text-blue-600"/>} />
                    <InputGroup name="contact_number" value={formData.contact_number} onChange={handleChange} label="Mobile Number" placeholder="0995 XXX XXXX" icon={<Phone size={14} className="text-emerald-600"/>} />
                  </div>
                </div>
              </div>

              {/* 03 RESIDENCE LOG - LIITAN NATIN (4 cols) */}
              <div className="col-span-4">
                <div className="bg-white border border-slate-300 p-8 rounded-[40px] shadow-sm h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] italic">03. Residence Log</h2>
                  </div>
                  <div className="space-y-6 flex-1 flex flex-col justify-center">
                    <InputGroup name="address_street" value={formData.address_street} onChange={handleChange} label="Brgy / Street" placeholder="Brgy. Lagasit" icon={<MapPin size={14}/>} />
                    <InputGroup name="address_city" value={formData.address_city} onChange={handleChange} label="City / Municipality" placeholder="San Quintin" icon={<MapPin size={14}/>} />
                    <InputGroup name="address_province" value={formData.address_province} onChange={handleChange} label="Province" placeholder="Pangasinan" icon={<MapPin size={14}/>} />
                  </div>
                </div>
              </div>
            </div>

            {/* 04 FAMILY & EMERGENCY */}
            <div className="bg-white border border-slate-300 p-10 rounded-[45px] shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-[0.03]"><Heart size={120}/></div>
               <div className="flex items-center gap-3 mb-10">
                  <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                  <h2 className="text-[11px] font-black uppercase tracking-[0.3em] italic">04. Family & Emergency Protocol</h2>
               </div>

               <div className="grid grid-cols-3 gap-12">
                  <div className="space-y-4 border-r border-slate-100 pr-8">
                     <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-emerald-500 italic">Maternal Details</p>
                     <InputGroup name="mother_first_name" value={formData.mother_first_name} onChange={handleChange} label="First Name" placeholder="Amari" icon={<UserCircle size={14}/>} />
                     <InputGroup name="mother_middle_name" value={formData.mother_middle_name} onChange={handleChange} label="Middle Name" placeholder="" icon={<UserCircle size={14}/>} />
                     <InputGroup name="mother_last_name" value={formData.mother_last_name} onChange={handleChange} label="Last Name" placeholder="Sloane" icon={<UserCircle size={14}/>} />
                     <InputGroup name="mother_contact" value={formData.mother_contact} onChange={handleChange} label="Contact Number" placeholder="09XX XXX XXXX" icon={<Phone size={14}/>} />
                  </div>
                  <div className="space-y-4 border-r border-slate-100 pr-8">
                     <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-blue-500 italic">Paternal Details</p>
                     <InputGroup name="father_first_name" value={formData.father_first_name} onChange={handleChange} label="First Name" placeholder="Leon Ysmael" icon={<UserCircle size={14}/>} />
                     <InputGroup name="father_middle_name" value={formData.father_middle_name} onChange={handleChange} label="Middle Name" placeholder="Riego" icon={<UserCircle size={14}/>} />
                     <InputGroup name="father_last_name" value={formData.father_last_name} onChange={handleChange} label="Last Name" placeholder="Zamora" icon={<UserCircle size={14}/>} />
                     <InputGroup name="father_contact" value={formData.father_contact} onChange={handleChange} label="Contact Number" placeholder="09XX XXX XXXX" icon={<Phone size={14}/>} />
                  </div>
                  <div className="space-y-4 opacity-80">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 border-l-2 border-slate-300 italic">Guardian (Alternative)</p>
                     <InputGroup name="guardian_first_name" value={formData.guardian_first_name} onChange={handleChange} label="First Name" placeholder="Optional" icon={<ShieldCheck size={14}/>} />
                     <InputGroup name="guardian_middle_name" value={formData.guardian_middle_name} onChange={handleChange} label="Middle Name" placeholder="Optional" icon={<ShieldCheck size={14}/>} />
                     <InputGroup name="guardian_last_name" value={formData.guardian_last_name} onChange={handleChange} label="Last Name" placeholder="Optional" icon={<ShieldCheck size={14}/>} />
                     <InputGroup name="guardian_contact" value={formData.guardian_contact} onChange={handleChange} label="Contact Number" placeholder="Optional" icon={<Phone size={14}/>} />
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-200 bg-white/80 backdrop-blur-md flex justify-end items-center gap-8 relative z-10 px-14">
          <button 
            type="button"
            onClick={() => setFormData(initialFormState)} 
            className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-all">
            Reset Form
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-3 bg-emerald-950 text-white px-14 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-emerald-900/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
            {loading ? 'Submitting Data...' : <><Save size={16} /> Finalize Registry</>}
          </button>
        </div>
      </main>
    </div>
  );
}

function InputGroup({ label, placeholder, icon, name, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">{label}</label>
      <div className="flex items-center gap-3 bg-white border-2 border-slate-200 px-5 py-3.5 rounded-2xl focus-within:border-emerald-500 transition-all shadow-sm group">
        <span className="text-slate-300 group-focus-within:text-emerald-500 transition-colors">{icon}</span>
        <input 
          autoComplete="off"
          name={name}
          value={value}
          onChange={onChange}
          type="text" 
          placeholder={placeholder} 
          className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full placeholder:text-slate-200" 
        />
      </div>
    </div>
  );
}

function SelectGroup({ label, icon, options, name, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">{label}</label>
      <div className="flex items-center gap-3 bg-white border-2 border-slate-200 px-5 py-3.5 rounded-2xl focus-within:border-emerald-500 transition-all shadow-sm group">
        <span className="text-slate-300 group-focus-within:text-emerald-500 transition-colors">{icon}</span>
        <select 
          name={name}
          value={value}
          onChange={onChange}
          className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full appearance-none">
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    </div>
  );
}