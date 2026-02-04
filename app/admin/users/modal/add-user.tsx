"use client";
import { X, ShieldCheck, Lock, Mail, User, Building2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, onSnapshot } from 'firebase/firestore';

export default function AddUserModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [dormGroups, setDormGroups] = useState<{name: string, assignedTo: string | null}[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    assignedBuilding: "",
    password: ''
  });

  useEffect(() => {
    const unsubRooms = onSnapshot(collection(db, "rooms"), (roomSnap) => {
      const unsubUsers = onSnapshot(collection(db, "users"), (userSnap) => {
        const groups = Array.from(new Set(roomSnap.docs.map(doc => doc.data().dormGroup))).filter(Boolean);
        const managers = userSnap.docs.filter(doc => doc.data().role === "dorm_manager");

        const statusMap = groups.map(groupName => {
          const manager = managers.find(m => m.data().assigned_building === groupName);
          return {
            name: groupName as string,
            assignedTo: manager ? `${manager.data().first_name} ${manager.data().last_name}` : null
          };
        });

        setDormGroups(statusMap);
        if (statusMap.length > 0 && !formData.assignedBuilding) {
           const available = statusMap.find(d => !d.assignedTo) || statusMap[0];
           setFormData(prev => ({...prev, assignedBuilding: available.name}));
        }
        setFetching(false);
      });
      return () => unsubUsers();
    });
    return () => unsubRooms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assignedBuilding) return alert("Please select a building cluster.");
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        email: formData.email,
        assigned_building: formData.assignedBuilding,
        role: "dorm_manager",
        createdAt: serverTimestamp()
      });

      alert("Manager Provisioned Successfully! 🚀");
      onClose();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 font-sans text-left">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
      
      {/* COMPACT MODAL: Ginamit ko ang max-w-md at niliitan ang padding */}
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-white w-full max-w-md rounded-[35px] shadow-2xl overflow-hidden border border-white/20">
        
        <div className="bg-emerald-950 p-7 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={18} /></button>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center shadow-inner">
              <ShieldCheck className="text-emerald-400" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight italic">Provision Manager</h2>
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.3em] opacity-70">Authorized Access</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-4 bg-white">
          <div className="grid grid-cols-2 gap-3">
            <InputGroup label="First Name" icon={<User size={13}/>} value={formData.firstName} onChange={(v: string) => setFormData({...formData, firstName: v})} placeholder="Juan" />
            <InputGroup label="Middle Name" icon={<User size={13}/>} value={formData.middleName} onChange={(v: string) => setFormData({...formData, middleName: v})} placeholder="M." />
          </div>

          <InputGroup label="Last Name" icon={<User size={13}/>} value={formData.lastName} onChange={(v: string) => setFormData({...formData, lastName: v})} placeholder="Dela Cruz" />
          <InputGroup label="Work Email" icon={<Mail size={13}/>} type="email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} placeholder="username@clsu.edu.ph" />

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Building</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors"><Building2 size={14} /></div>
              <select 
                required 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-10 outline-none focus:bg-white focus:border-emerald-200 transition-all text-[13px] font-medium appearance-none cursor-pointer"
                value={formData.assignedBuilding}
                onChange={(e) => setFormData({...formData, assignedBuilding: e.target.value})}
                disabled={fetching}
              >
                {fetching ? <option>Loading clusters...</option> : dormGroups.map((g) => (
                  <option key={g.name} value={g.name} disabled={!!g.assignedTo} className={g.assignedTo ? 'text-slate-300' : 'text-slate-900'}>
                    {g.name} {g.assignedTo ? `(Taken)` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <InputGroup label="Initial Password" icon={<Lock size={13}/>} type="password" value={formData.password} onChange={(v: string) => setFormData({...formData, password: v})} placeholder="••••••••" />

          <button disabled={loading || dormGroups.length === 0} className="w-full bg-emerald-950 text-white py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.01] active:scale-95 transition-all mt-2 flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" size={14} /> : "Finalize Provision"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function InputGroup({ label, icon, value, onChange, placeholder, type = "text" }: { label: string, icon: any, value: string, onChange: (v: string) => void, placeholder: string, type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors">{icon}</div>
        <input 
          type={type} required value={value} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
          placeholder={placeholder} 
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-6 outline-none focus:bg-white focus:border-emerald-200 transition-all text-[13px] font-medium" 
        />
      </div>
    </div>
  );
}