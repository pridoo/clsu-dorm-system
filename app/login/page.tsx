'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Database, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { seedDatabase } from '@/lib/dbSeeder';

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

      // 2. Kuhanin ang Role at Data mula sa Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role; // 'admin' or 'dorm_manager'

        // 3. SET COOKIES PARA SA MIDDLEWARE
        // Nagse-set tayo ng cookies para maharang ng middleware.ts ang unauthorized access sa server level
        const maxAge = 60 * 60 * 24 * 7; // 1 week duration
        document.cookie = `session=${user.uid}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `user_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;

        // 4. Redirect depende sa role
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else if (role === 'dorm_manager') {
          router.push('/manager/dashboard');
        } else {
          alert("Unauthorized role detected.");
        }
      } else {
        alert("No user record found in database.");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      alert("Login Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-50 scale-105"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop')" }}
      />
      
      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#004d40]/40 to-black/60 backdrop-blur-[2px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-20 w-full max-w-md p-4"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="p-10">
            {/* Logo Section */}
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

            {/* Form Section */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative group leading-none">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#ffc107] transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full bg-white/5 border border-white/10 py-5 pl-14 pr-6 rounded-2xl text-white outline-none focus:border-[#ffc107]/50 focus:bg-white/10 transition-all placeholder:text-gray-500 leading-none"
                />
              </div>

              <div className="relative group leading-none">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#ffc107] transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full bg-white/5 border border-white/10 py-5 pl-14 pr-6 rounded-2xl text-white outline-none focus:border-[#ffc107]/50 focus:bg-white/10 transition-all placeholder:text-gray-500 leading-none"
                />
              </div>

              <motion.button 
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#ffc107] text-[#004d40] py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-[#ffc107]/10 mt-8 group disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    SIGN IN
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* DB Seeder Section */}
            <button 
              type="button"
              onClick={() => {
                if(confirm("Fill database with sample data?")) seedDatabase();
              }}
              className="mt-8 w-full flex items-center justify-center gap-2 text-white/20 hover:text-[#ffc107] transition-colors text-[9px] font-black uppercase tracking-[0.3em]"
            >
              <Database className="w-3 h-3" />
              Developer: Run DB Seeder
            </button>

            <div className="mt-8 text-center leading-none">
              <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] italic opacity-50">Authorized Personnel Only</p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-8 flex justify-center gap-8 text-white/30 text-[9px] font-black uppercase tracking-widest">
          <span>Security 2.0</span>
          <span>•</span>
          <span>Role-Based Access</span>
          <span>•</span>
          <span>Next.js Edge</span>
        </div>
      </motion.div>
    </div>
  );
}