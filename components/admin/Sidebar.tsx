"use client";
import { LayoutGrid, Building2, UserCircle, Settings2, LogOut, Users2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmSignOut = async () => {
    setIsLoggingOut(true);
    try {
      // 1. Firebase Auth Sign Out
      await signOut(auth);

      // 2. COOKIE CLEANUP (For Middleware Security)
      // We expire the cookies immediately so the middleware will block re-entry
      document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      // 3. Force Redirect and clear history stack
      router.replace('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      alert("Hindi makapag-logout. Pakisubukan muli.");
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const menuItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: <LayoutGrid size={18} /> },
    { name: 'Buildings', path: '/admin/building', icon: <Building2 size={18} /> },
    { name: 'Management', path: '/admin/management', icon: <UserCircle size={18} /> },
    { name: 'Users', path: '/admin/users', icon: <Users2 size={18} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings2 size={18} /> },
  ];

  return (
    <>
      <aside className="w-64 h-full bg-white rounded-[40px] shadow-sm border border-white/50 flex flex-col overflow-hidden flex-shrink-0 text-left leading-none">
        <div className="pt-12 pb-10 flex flex-col items-center gap-3 text-center leading-none">
          <div className="w-10 h-10 bg-emerald-950 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3 leading-none">
            <span className="font-light italic text-lg leading-none">C</span>
          </div>
          <div className="text-center leading-none">
            <h1 className="text-[9px] font-bold tracking-[0.4em] text-slate-300 uppercase leading-none">System Hub</h1>
            <p className="text-xs font-semibold text-slate-800 tracking-tighter mt-1 leading-none">CLSU HMS</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 text-left leading-none">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name}
                href={item.path}
                className={`group relative flex items-center gap-4 px-6 py-4 w-full rounded-2xl transition-all duration-300 leading-none ${
                  isActive ? 'text-emerald-900 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {isActive && (
                  <motion.div layoutId="nav-bg" className="absolute inset-0 bg-emerald-50 border border-emerald-100/50 rounded-2xl -z-10" />
                )}
                <span className={isActive ? 'scale-110 leading-none' : 'opacity-70 group-hover:opacity-100 transition-all leading-none'}>
                  {item.icon}
                </span>
                <span className="text-[11px] uppercase tracking-wider font-bold leading-none">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-50 text-left leading-none">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-6 py-3 w-full rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all group leading-none"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform leading-none" />
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 text-left leading-none">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isLoggingOut && setShowLogoutModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden p-10 text-center border border-white/20 leading-none"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-[30px] flex items-center justify-center text-rose-500 mx-auto mb-6 shadow-inner leading-none">
                <AlertCircle size={40} />
              </div>
              
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2 italic leading-none text-center">Terminate Session?</h2>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-10 px-4 text-center leading-normal">
                You are about to sign out of the CLSU HMS Hub. Unsaved administrative changes might not be preserved.
              </p>

              <div className="space-y-3 leading-none">
                <button 
                  onClick={handleConfirmSignOut}
                  disabled={isLoggingOut}
                  className="w-full bg-slate-900 text-white py-4 rounded-[22px] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-900 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center leading-none"
                >
                  {isLoggingOut ? "PROCESSING..." : "CONFIRM SIGN OUT"}
                </button>
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="w-full py-4 text-[10px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors leading-none"
                >
                  STAY CONNECTED
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}