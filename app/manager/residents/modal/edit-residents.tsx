"use client";
import { useState } from 'react';
import { X, Save, User, GraduationCap, Sparkles, Facebook, Phone, MapPin, Heart, ShieldCheck, VenetianMask, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function EditResidentModal({ student, onClose }: { student: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  
  // Initialize state with current student data
  const [formData, setFormData] = useState({
    first_name: student.first_name || '',
    middle_name: student.middle_name || '',
    last_name: student.last_name || '',
    course: student.course || '',
    year_level: student.year_level || '1st Year',
    gender: student.gender || 'Female',
    fb_link: student.fb_link || '',
    contact_number: student.contact_number || '',
    address_street: student.address_street || '',
    address_city: student.address_city || '',
    address_province: student.address_province || '',
    mother_first_name: student.mother_first_name || '',
    mother_middle_name: student.mother_middle_name || '',
    mother_last_name: student.mother_last_name || '',
    mother_contact: student.mother_contact || '',
    father_first_name: student.father_first_name || '',
    father_middle_name: student.father_middle_name || '',
    father_last_name: student.father_last_name || '',
    father_contact: student.father_contact || '',
    guardian_first_name: student.guardian_first_name || '',
    guardian_middle_name: student.guardian_middle_name || '',
    guardian_last_name: student.guardian_last_name || '',
    guardian_contact: student.guardian_contact || '',
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      // Gagamitin natin ang doc ID (student.id) para i-update ang record
      const residentRef = doc(db, "residents", student.id);
      await updateDoc(residentRef, formData);
      alert("Profile updated successfully! ✨");
      onClose();
    } catch (error: any) {
      console.error("Update Error:", error);
      alert("Failed to update: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 text-left"
      >
        {/* Header - Compact */}
        <div className="bg-[#022c22] p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-lg italic border border-emerald-500/20">
              {formData.first_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight italic leading-none">Modify Profile</h2>
              <p className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-1 opacity-70">Resident ID: {student.student_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-all"><X size={16}/></button>
        </div>

        {/* Scrollable Body - Optimized height */}
        <div className="p-6 bg-[#f8fafc]/50 overflow-y-auto max-h-[70vh] internal-scroll">
          <div className="space-y-6">
            
            {/* 1. Academic & Personal */}
            <section className="space-y-3">
              <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-emerald-500 italic">01. Identity & Academic</p>
              <div className="grid grid-cols-3 gap-3">
                <MiniInput label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} />
                <MiniInput label="Middle" name="middle_name" value={formData.middle_name} onChange={handleChange} />
                <MiniInput label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6"><MiniInput label="Course" name="course" value={formData.course} onChange={handleChange} /></div>
                <div className="col-span-3">
                  <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Year</label>
                  <select name="year_level" value={formData.year_level} onChange={handleChange} className="w-full bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:border-emerald-500 transition-all">
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:border-emerald-500 transition-all">
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 2. Connectivity */}
            <section className="space-y-3">
              <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-blue-500 italic">02. Connectivity</p>
              <div className="grid grid-cols-2 gap-3">
                <MiniInput label="Facebook Link" name="fb_link" value={formData.fb_link} onChange={handleChange} />
                <MiniInput label="Contact No." name="contact_number" value={formData.contact_number} onChange={handleChange} />
              </div>
            </section>

            {/* 3. Family Protocol */}
            <section className="space-y-4">
              <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-rose-500 italic">03. Emergency Protocol</p>
              
              <div className="space-y-2 bg-white/50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[8px] font-black text-rose-500 uppercase">Maternal Details</p>
                <div className="grid grid-cols-3 gap-2">
                  <MiniInput label="Mother First" name="mother_first_name" value={formData.mother_first_name} onChange={handleChange} />
                  <MiniInput label="Last Name" name="mother_last_name" value={formData.mother_last_name} onChange={handleChange} />
                  <MiniInput label="Contact" name="mother_contact" value={formData.mother_contact} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2 bg-white/50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[8px] font-black text-blue-500 uppercase">Paternal Details</p>
                <div className="grid grid-cols-3 gap-2">
                  <MiniInput label="Father First" name="father_first_name" value={formData.father_first_name} onChange={handleChange} />
                  <MiniInput label="Last Name" name="father_last_name" value={formData.father_last_name} onChange={handleChange} />
                  <MiniInput label="Contact" name="father_contact" value={formData.father_contact} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2 bg-white/50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[8px] font-black text-amber-500 uppercase">Guardian (Optional)</p>
                <div className="grid grid-cols-3 gap-2">
                  <MiniInput label="Guardian First" name="guardian_first_name" value={formData.guardian_first_name} onChange={handleChange} />
                  <MiniInput label="Last Name" name="guardian_last_name" value={formData.guardian_last_name} onChange={handleChange} />
                  <MiniInput label="Contact" name="guardian_contact" value={formData.guardian_contact} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* 4. Home Address */}
            <section className="space-y-3 pt-2">
              <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest pl-2 border-l-2 border-orange-500 italic">04. Home Address</p>
              <div className="grid grid-cols-3 gap-3">
                <MiniInput label="Street/Brgy" name="address_street" value={formData.address_street} onChange={handleChange} />
                <MiniInput label="City" name="address_city" value={formData.address_city} onChange={handleChange} />
                <MiniInput label="Province" name="address_province" value={formData.address_province} onChange={handleChange} />
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all italic">Cancel</button>
          <button 
            onClick={handleUpdate}
            disabled={loading}
            className="flex items-center gap-2 bg-[#022c22] text-white px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-900 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
            {loading ? "Saving..." : "Commit Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Sub-component for cleaner code
function MiniInput({ label, name, value, onChange }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[8px] font-black text-slate-400 uppercase ml-1">{label}</label>
      <input 
        type="text" 
        name={name}
        value={value}
        onChange={onChange}
        autoComplete="off"
        className="w-full bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all" 
      />
    </div>
  );
}