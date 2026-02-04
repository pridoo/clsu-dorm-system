"use client";
import { X, Save, User, GraduationCap, Sparkles, Facebook, Phone, MapPin, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditResidentModal({ student, onClose }: { student: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[35px] shadow-2xl overflow-hidden border border-slate-200 text-left"
      >
        {/* Compact Header */}
        <div className="bg-[#022c22] p-6 text-white relative flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xl italic border border-emerald-500/20">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight italic leading-none">Edit Resident</h2>
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] mt-1.5 opacity-80">ID: {student.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={18}/></button>
        </div>

        {/* Compact Form Content */}
        <div className="p-6 bg-[#f8fafc]/50 overflow-y-auto max-h-[65vh] custom-scrollbar">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            
            {/* Academic Info */}
            <div className="col-span-2 space-y-3">
               <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-emerald-500 italic">Academic Profile</p>
               <EditInput label="Full Legal Name" defaultValue={student.name} icon={<User size={14}/>} />
               <div className="grid grid-cols-2 gap-3">
                  <EditInput label="Program" defaultValue={student.program} icon={<GraduationCap size={14}/>} />
                  <EditInput label="Year Level" defaultValue={student.year} icon={<Sparkles size={14}/>} />
               </div>
            </div>

            {/* Connectivity */}
            <div className="space-y-3">
               <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-blue-500 italic">Connectivity</p>
               <EditInput label="Facebook Link" defaultValue={student.fb} icon={<Facebook size={14}/>} />
               <EditInput label="Contact No." defaultValue={student.contact} icon={<Phone size={14}/>} />
            </div>

            {/* Emergency Info */}
            <div className="space-y-3">
               <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-rose-500 italic">Emergency (Mother)</p>
               <EditInput label="Mother's Name" defaultValue={student.mother} icon={<Heart size={14}/>} />
               <EditInput label="Parent Contact" defaultValue={student.motherContact} icon={<Phone size={14}/>} />
            </div>

            {/* Permanent Address - Full Width */}
            <div className="col-span-2 space-y-3 pt-2">
               <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-orange-500 italic">Permanent Address</p>
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Full Address</label>
                  <div className="flex items-start gap-3 bg-white border-2 border-slate-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-emerald-500 transition-all">
                    <MapPin size={14} className="text-slate-300 mt-0.5" />
                    <textarea defaultValue={student.address} rows={2} className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full resize-none" />
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* Compact Footer Actions */}
        <div className="p-5 border-t border-slate-200 flex justify-end gap-3 bg-white">
           <button onClick={onClose} className="px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all italic">Discard</button>
           <button className="flex items-center gap-2 bg-[#022c22] text-white px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
             <Save size={14} /> Update Profile
           </button>
        </div>
      </motion.div>
    </div>
  );
}

function EditInput({ label, defaultValue, icon }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">{label}</label>
      <div className="flex items-center gap-3 bg-white border-2 border-slate-200 px-4 py-2.5 rounded-xl focus-within:border-emerald-500 transition-all shadow-sm">
        <span className="text-slate-300">{icon}</span>
        <input type="text" defaultValue={defaultValue} className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full" />
      </div>
    </div>
  );
}