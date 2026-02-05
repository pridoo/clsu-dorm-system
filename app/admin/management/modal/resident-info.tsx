"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, Heart, User, Phone, MapPin, 
  Facebook, GraduationCap, ShieldAlert, Activity,
  Users, Map as MapIcon, Mail
} from 'lucide-react';

export default function ResidentInfoModal({ resident, dorm, onClose }: any) {
  if (!resident) return null;

  // Formatting helpers base sa database fields
  const fullName = `${resident.first_name} ${resident.last_name}`;
  const fullAddress = `${resident.address_street}, ${resident.address_city}, ${resident.address_province}`;
  const motherName = `${resident.mother_first_name} ${resident.mother_last_name}`;
  const fatherName = `${resident.father_first_name} ${resident.father_last_name}`;
  const guardianName = resident.guardian_first_name 
    ? `${resident.guardian_first_name} ${resident.guardian_last_name}` 
    : "Not Specified";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-left">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 20 }} 
        className="relative bg-white w-full max-w-3xl rounded-[56px] shadow-2xl overflow-hidden border border-white h-[90vh] flex flex-col font-sans"
      >
        {/* HEADER SECTION */}
        <div className="bg-emerald-950 p-12 text-white relative flex-shrink-0">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <User size={150} strokeWidth={1} />
          </div>
          <button onClick={onClose} className="absolute top-10 right-10 p-3 hover:bg-white/10 rounded-2xl transition-colors z-20">
            <X size={24} />
          </button>
          <div className="flex items-center gap-10 relative z-10">
            <div className="w-24 h-24 rounded-[35px] bg-white text-emerald-900 flex items-center justify-center text-5xl font-black shadow-2xl italic">
              {resident.first_name?.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em] mb-3 leading-none italic">Verified Resident Profile</p>
              <h2 className="text-4xl font-light tracking-tighter uppercase leading-none italic mb-2">
                {resident.first_name} <span className="font-black not-italic text-white tracking-tight">{resident.last_name}</span>
              </h2>
              <div className="flex items-center gap-4 mt-4">
                <span className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">{resident.studentID}</span>
                <span className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400">{dorm} • {resident.room}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-12 space-y-12 internal-scroll bg-[#F8FAFC]">
          
          {/* 1. ACADEMIC & IDENTIFICATION */}
          <section className="space-y-5">
             <div className="flex items-center gap-3 px-2">
                <div className="h-4 w-1.5 bg-emerald-500 rounded-full" />
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] italic">Campus Record</p>
             </div>
             <div className="grid grid-cols-3 gap-5">
                <InfoBlock icon={<GraduationCap size={16}/>} label="Program" value={resident.course} />
                <InfoBlock icon={<Activity size={16}/>} label="Year Level" value={` ${resident.year_level}`} />
                <InfoBlock icon={<User size={16}/>} label="Gender" value={resident.gender} />
             </div>
          </section>

          {/* 2. CONTACT CHANNELS */}
          <section className="space-y-5">
             <div className="flex items-center gap-3 px-2">
                <div className="h-4 w-1.5 bg-blue-500 rounded-full" />
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] italic">Personal Connectivity</p>
             </div>
             <div className="bg-white border border-slate-200/60 rounded-[40px] p-8 shadow-sm grid grid-cols-2 gap-10">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner"><Phone size={20} /></div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile Access</p>
                      <p className="text-sm font-black text-slate-800 tracking-widest">{resident.contact_number}</p>
                   </div>
                </div>
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner"><Facebook size={20} /></div>
                   <div className="overflow-hidden">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Digital Identity</p>
                      <p className="text-sm font-black text-slate-800 truncate italic">{resident.fb_link || 'N/A'}</p>
                   </div>
                </div>
             </div>
             <div className="bg-white border border-slate-200/60 rounded-[40px] p-8 shadow-sm flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner flex-shrink-0"><MapPin size={20} /></div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Geographic Origin</p>
                   <p className="text-sm font-black text-slate-800 uppercase italic leading-relaxed">{fullAddress}</p>
                </div>
             </div>
          </section>

          {/* 3. FAMILY & EMERGENCY PROTOCOL */}
          <section className="space-y-5">
             <div className="flex items-center gap-3 px-2">
                <div className="h-4 w-1.5 bg-rose-500 rounded-full" />
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] italic">Family & Emergency Intel</p>
             </div>
             <div className="grid grid-cols-2 gap-5">
                <FamilyCard label="Maternal" name={motherName} contact={resident.mother_contact} />
                <FamilyCard label="Paternal" name={fatherName} contact={resident.father_contact} />
             </div>
          </section>


        </div>
      </motion.div>
    </div>
  );
}

// Reusable Internal Components
function InfoBlock({ icon, label, value }: any) {
   return (
      <div className="bg-white border border-slate-200/60 rounded-[35px] p-7 shadow-sm hover:shadow-md transition-all group text-left">
         <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-5 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shadow-inner">
            {icon}
         </div>
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
         <p className="text-[13px] font-black text-slate-800 uppercase italic tracking-tight truncate">{value}</p>
      </div>
   );
}

function FamilyCard({ label, name, contact }: any) {
   return (
      <div className="bg-white border border-slate-200/60 rounded-[35px] p-7 shadow-sm text-left relative overflow-hidden group">
         <div className="relative z-10">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 italic">{label} Baseline</p>
            <h4 className="text-sm font-black text-slate-800 uppercase italic tracking-tight mb-1">{name}</h4>
            <p className="text-[11px] font-black text-emerald-600 tracking-widest">{contact}</p>
         </div>
         <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:scale-110 transition-transform">
            <Users size={60} />
         </div>
      </div>
   );
}