'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Database, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { auth, db } from '@/lib/firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { seedDatabase } from '@/lib/dbSeeder';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role; 
        const maxAge = 60 * 60 * 24 * 7; 
        document.cookie = `session=${user.uid}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `user_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;

        if (role === 'admin') router.push('/admin/dashboard');
        else if (role === 'dorm_manager') router.push('/manager/dashboard');
      }
    } catch (error: any) {
      alert("Access Denied: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-white overflow-hidden font-sans selection:bg-emerald-100 selection:text-emerald-900 relative">
      
      {/* --- LEFT SIDE: THE LOGIN WORKSPACE --- */}
      <section className="w-full lg:w-1/2 relative flex items-center justify-center p-8 overflow-hidden bg-[#fcfdfe]">
        {/* Ambient Glows */}
        <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-emerald-600/[0.08] blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-emerald-700/[0.06] blur-[120px] rounded-full pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm relative z-10 flex flex-col items-center"
        >
          {/* Logo Section */}
          <div className="mb-10 text-center flex flex-col items-center w-full">
            <motion.img 
                src="/img/clsu_logo.png" 
                alt="CLSU Logo" 
                className="w-32 h-32 object-contain mb-6 drop-shadow-[0_25px_50px_rgba(5,150,105,0.3)]"
                whileHover={{ scale: 1.1, rotate: 3 }}
            />
            
            <h1 className="text-6xl font-black text-slate-950 tracking-tighter leading-none uppercase italic">
                Dorm<span className="text-emerald-600 not-italic">Sync</span>
            </h1>
            <div className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] mt-5 italic flex items-center justify-center gap-3 w-full">
                <span className="h-[1.5px] w-8 bg-emerald-500 rounded-full" /> Administrative Terminal <span className="h-[1.5px] w-8 bg-emerald-500 rounded-full" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 w-full">
            <div className="group">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-emerald-600 transition-colors">Personnel Identity</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-600 transition-all" />
                <input 
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@clsu.edu.ph"
                  autoComplete="username"
                  className="w-full bg-white border-2 border-slate-100 py-4.5 pl-14 pr-6 rounded-2xl outline-none focus:border-emerald-500 focus:shadow-[0_10px_30px_rgba(16,185,129,0.1)] transition-all text-sm font-bold text-slate-800 tracking-tight"
                />
              </div>
            </div>

            <div className="group">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-emerald-600 transition-colors">Encrypted Key</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-600 transition-all" />
                <input 
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white border-2 border-slate-100 py-4.5 pl-14 pr-6 rounded-2xl outline-none focus:border-emerald-500 focus:shadow-[0_10px_30px_rgba(16,185,129,0.1)] transition-all text-sm font-bold text-slate-800 tracking-tight"
                />
              </div>
            </div>

            <motion.button 
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-emerald-950 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-emerald-900/30 mt-8 flex items-center justify-center gap-3 transition-all hover:bg-emerald-900"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : "Login"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-3 bg-emerald-50/50 px-4 py-2 rounded-xl border border-emerald-100 w-fit">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span className="text-[8px] font-black text-emerald-800 uppercase tracking-widest">CLSU ICT AUTHORIZED TERMINAL</span>
            </div>
            <button 
              type="button"
              onClick={() => { if(confirm("Re-sync Database?")) seedDatabase(); }}
              className="text-[8px] text-slate-300 hover:text-emerald-600 transition-all font-black uppercase tracking-widest flex items-center gap-2 italic"
            >
              <Database size={10} /> Developer: Database Re-sync
            </button>
          </div>
        </motion.div>
      </section>

      {/* --- RIGHT SIDE: IMMERSIVE CAMPUS PORTAL --- */}
      <section className="hidden lg:block w-1/2 h-full relative overflow-hidden bg-emerald-950">
        
        {/* GREEN BUBBLE LAYER - Increased count to 40 for "Marami" effect */}
        <div className="absolute inset-0 pointer-events-none z-[15]">
            {isMounted && [...Array(40)].map((_, i) => (
                <RightSideBubble key={i} delay={i * 0.4} />
            ))}
        </div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full relative"
        >
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] hover:scale-105"
                style={{ backgroundImage: "url('/img/clsu.jpg')" }}
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#fcfdfe] via-transparent to-transparent z-[2] opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-emerald-950/40 z-[1]" />
            
            {/* Text Content */}
            <div className="absolute bottom-20 left-20 right-20 text-white z-20 text-left">
                <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <p className="text-[18px] font-black italic tracking-tighter mb-6 text-[#ffc107] uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                    Science City of Muñoz
                  </p>
                  <h2 className="text-6xl font-extralight italic tracking-tighter leading-[0.85] mb-10 max-w-lg">
                      Providing <span className="font-black not-italic text-[#ffc107] uppercase underline decoration-[#ffc107]/30 underline-offset-[12px]">Premier Housing</span> for every Sielsyuans .
                  </h2>
                  <div className="flex items-center gap-5">
                     <div className="h-[2px] w-24 bg-[#ffc107] rounded-full shadow-[0_0_25px_rgba(255,193,7,0.8)]" />
                     <Sparkles className="text-[#ffc107]" size={24} />
                  </div>
                </motion.div>
            </div>
        </motion.div>
      </section>
    </div>
  );
}

// GREEN BUBBLE COMPONENT (Mix of Big and Small)
function RightSideBubble({ delay }: { delay: number }) {
    const [style, setStyle] = useState<{ left: string, size: number, drift: number, duration: number } | null>(null);

    useEffect(() => {
        // Randomizes size from 8px (small) to 70px (big)
        const randomSize = Math.random() > 0.8 ? Math.random() * 40 + 40 : Math.random() * 20 + 8;
        
        setStyle({
            left: `${Math.random() * 100}%`,
            size: randomSize,
            drift: Math.random() * 80 - 40,
            duration: 15 + Math.random() * 15 // Very slow (15-30 seconds)
        });
    }, []);

    if (!style) return null;

    return (
        <motion.div 
            initial={{ y: "115vh", opacity: 0 }}
            animate={{ 
                y: "-20vh", 
                opacity: [0, 0.6, 0.6, 0], 
                x: [0, style.drift, -style.drift, 0], 
                scale: [0.9, 1.1, 1]
            }}
            transition={{ 
                duration: style.duration, 
                repeat: Infinity, 
                ease: "linear", // Consistent slow speed
                delay 
            }}
            className="absolute rounded-full"
            style={{ 
                left: style.left, 
                width: style.size, 
                height: style.size,
                // Emerald Green Gradient with Glow
                background: 'radial-gradient(circle at 30% 30%, rgba(52, 211, 153, 0.6), rgba(5, 150, 105, 0.2))',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
                backdropFilter: 'blur(1px)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
        />
    );
}