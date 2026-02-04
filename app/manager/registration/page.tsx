"use client";
import Sidebar from '@/components/managers/Sidebar';
import { 
  UserPlus, Facebook, Phone, Heart, 
  GraduationCap, Hash, UserCircle, Save, 
  Sparkles, MapPin, ShieldCheck, Mail, Baby
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegistrationPage() {
  const buildingName = "Ladies' Dorm 5";

  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] p-6 gap-6 overflow-hidden text-left font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden bg-white border border-slate-300 shadow-[0_0_50px_rgba(0,0,0,0.08)] rounded-[45px] relative">
        
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] blur-[120px] -z-10 rounded-full" />

        {/* Header Section */}
        <nav className="h-24 px-12 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md relative z-10">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-5 bg-emerald-600 rounded-full shadow-[0_0_15px_rgba(5,150,105,0.4)]" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none italic text-left">Resident Enrolment</p>
            </div>
            <h1 className="text-3xl font-extralight text-slate-900 tracking-tighter leading-none italic text-left">
              New Dormer <span className="font-bold text-emerald-950 not-italic tracking-tight text-4xl">Registry</span>
            </h1>
          </div>
          <div className="bg-slate-100/50 px-6 py-3 rounded-[20px] border border-slate-200">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-left">Facility Context</p>
             <p className="text-sm font-bold text-emerald-900 italic tracking-tight">{buildingName}</p>
          </div>
        </nav>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-12 bg-[#f8fafc]/30 internal-scroll">
          <div className="max-w-5xl mx-auto space-y-10">
            
            {/* GRID START: Identity and Connectivity */}
            <div className="grid grid-cols-12 gap-8">
              
              {/* LEFT: Identity Section (7 cols) */}
              <div className="col-span-7 space-y-8">
                <div className="bg-white border border-slate-300 p-8 rounded-[40px] shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em] italic text-left">01. Academic Profile</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <InputGroup label="Full Legal Name" placeholder="Althea Reyes" icon={<UserCircle size={14}/>} />
                    <InputGroup label="Student ID Number" placeholder="20-0123" icon={<Hash size={14}/>} />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <SelectGroup label="Degree Program" icon={<GraduationCap size={16}/>} options={['BSIT', 'BSA', 'BSED', 'BSME']} />
                    <SelectGroup label="Year Level" icon={<Sparkles size={16}/>} options={['1st Year', '2nd Year', '3rd Year', '4th Year']} />
                  </div>
                </div>

                <div className="bg-white border border-slate-300 p-8 rounded-[40px] shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em] italic text-left">02. Connectivity Channels</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <InputGroup label="Personal Facebook Link" placeholder="fb.com/username" icon={<Facebook size={14} className="text-blue-600"/>} />
                    <InputGroup label="Active Contact Number" placeholder="09XX XXX XXXX" icon={<Phone size={14} className="text-emerald-600"/>} />
                  </div>
                </div>
              </div>

              {/* RIGHT: Home Address (5 cols) */}
              <div className="col-span-5">
                <div className="bg-white border border-slate-300 p-8 rounded-[40px] shadow-sm h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                    <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em] italic text-left">03. Residence Log</h2>
                  </div>
                  <div className="space-y-4 flex-1">
                    <InputGroup label="House / St. / Brgy" placeholder="Unit 123, Brgy. Bantug" icon={<MapPin size={14}/>} />
                    <InputGroup label="City / Municipality" placeholder="Science City of Muñoz" icon={<MapPin size={14}/>} />
                    <InputGroup label="Province" placeholder="Nueva Ecija" icon={<MapPin size={14}/>} />
                    <div className="pt-4 mt-auto">
                       <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100 border-dashed text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed italic">
                             Ensure the address matches the official student records.
                          </p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FULL WIDTH: PARENTS INFORMATION SECTION */}
            <div className="bg-white border border-slate-300 p-10 rounded-[45px] shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-[0.03]"><Heart size={120}/></div>
               
               <div className="flex items-center gap-3 mb-10">
                  <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                  <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em] italic text-left">04. Family & Emergency Protocol</h2>
               </div>

               <div className="grid grid-cols-3 gap-10">
                  {/* Maternal */}
                  <div className="space-y-5 border-r border-slate-100 pr-4">
                     <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-emerald-500 text-left italic">Maternal Details</p>
                     <InputGroup label="Mother's Full Name" placeholder="Jane Doe" icon={<UserCircle size={14}/>} />
                     <InputGroup label="Contact Number" placeholder="09XX XXX XXXX" icon={<Phone size={14}/>} />
                  </div>

                  {/* Paternal */}
                  <div className="space-y-5 border-r border-slate-100 pr-4">
                     <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-blue-500 text-left italic">Paternal Details</p>
                     <InputGroup label="Father's Full Name" placeholder="John Doe" icon={<UserCircle size={14}/>} />
                     <InputGroup label="Contact Number" placeholder="09XX XXX XXXX" icon={<Phone size={14}/>} />
                  </div>

                  {/* Guardian / Proxy */}
                  <div className="space-y-5">
                     <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-orange-500 text-left italic">Guardian / Proxy</p>
                     <InputGroup label="Full Name" placeholder="Mary Smith" icon={<ShieldCheck size={14}/>} />
                     <InputGroup label="Contact Number" placeholder="09XX XXX XXXX" icon={<Phone size={14}/>} />
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* Fixed Action Footer */}
        <div className="p-8 border-t border-slate-200 bg-white/80 backdrop-blur-md flex justify-end items-center gap-8 relative z-10 px-14">
          <div className="flex items-center gap-3 text-emerald-600 mr-auto">
             <ShieldCheck size={18} />
             <p className="text-[10px] font-black uppercase tracking-widest leading-none text-left">Security Verified Enrollment</p>
          </div>
          <button className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Clear Form</button>
          <button className="flex items-center gap-3 bg-emerald-950 text-white px-14 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-emerald-900/40 hover:scale-[1.02] active:scale-95 transition-all">
            <Save size={16} /> Finalize Registry
          </button>
        </div>
      </main>
    </div>
  );
}

// Reusable Sub-components
function InputGroup({ label, placeholder, icon }: any) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">{label}</label>
      <div className="flex items-center gap-3 bg-white border-2 border-slate-200 px-5 py-3.5 rounded-2xl focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/[0.03] transition-all shadow-sm group">
        <span className="text-slate-300 group-focus-within:text-emerald-500 transition-colors">{icon}</span>
        <input 
          type="text" 
          placeholder={placeholder} 
          className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full placeholder:text-slate-200 placeholder:font-normal" 
        />
      </div>
    </div>
  );
}

function SelectGroup({ label, icon, options }: any) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">{label}</label>
      <div className="flex items-center gap-3 bg-white border-2 border-slate-200 px-5 py-3.5 rounded-2xl focus-within:border-emerald-500 transition-all shadow-sm group">
        <span className="text-slate-300 group-focus-within:text-emerald-500 transition-colors">{icon}</span>
        <select className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full appearance-none">
          {options.map((opt: string) => <option key={opt}>{opt}</option>)}
        </select>
      </div>
    </div>
  );
}