'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Database } from 'lucide-react';
import { auth, db } from '@/lib/firebase'; // Siguraduhing tama ang path sa lib/firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { seedDatabase } from '@/lib/dbSeeder'; // Import natin yung ginawa nating seeder

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Firebase Auth Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. I-check ang Role sa Firestore (users collection)
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Redirect depende sa role
        if (userData.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (userData.role === 'dorm_manager') {
          router.push('/manager/dashboard');
        }
      } else {
        alert("No user record found in database.");
      }
    } catch (error: any) {
      alert("Login Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-50 scale-105"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop')" }}
      />
      
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#004d40]/40 to-black/60 backdrop-blur-[2px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-20 w-full max-w-md p-4"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="p-10">
            <div className="text-center mb-10">
              <motion.div 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-[#ffc107] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-[#ffc107]/20 rotate-12"
              >
                <span className="text-[#004d40] font-black text-3xl -rotate-12">C</span>
              </motion.div>
              <h1 className="text-4xl font-black text-white tracking-tighter">
                CLSU<span className="text-[#ffc107]">#DORM</span>
              </h1>
              <p className="text-gray-300 text-sm font-light mt-2 tracking-widest uppercase">Housing Management</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#ffc107] transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full bg-white/5 border border-white/10 py-5 pl-14 pr-6 rounded-2xl text-white outline-none focus:border-[#ffc107]/50 focus:bg-white/10 transition-all placeholder:text-gray-500"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#ffc107] transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full bg-white/5 border border-white/10 py-5 pl-14 pr-6 rounded-2xl text-white outline-none focus:border-[#ffc107]/50 focus:bg-white/10 transition-all placeholder:text-gray-500"
                />
              </div>

              <motion.button 
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#ffc107] text-[#004d40] py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-[#ffc107]/10 mt-8 group disabled:opacity-50"
              >
                {loading ? "AUTHENTICATING..." : "SIGN IN"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </form>

            {/* SECRET SEEDER BUTTON - Alisin mo 'to pag production na */}
            <button 
              onClick={() => {
                if(confirm("Fill database with sample data?")) seedDatabase();
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 text-white/20 hover:text-[#ffc107] transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <Database className="w-3 h-3" />
              Run DB Seeder
            </button>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-[0.2em]">Authorized Personnel Only</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-8 text-white/30 text-xs font-bold uppercase tracking-widest">
          <span>Security 2.0</span>
          <span>•</span>
          <span>Next.js Framework</span>
        </div>
      </motion.div>
    </div>
  );
}