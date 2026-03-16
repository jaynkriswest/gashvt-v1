'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // 1. Hide if we are on the login page
  // 2. Hide if there is no active session (user is not logged in)
  if (pathname === '/login' || !session) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#0d1117] border-b border-slate-800 sticky top-0 z-50">
      {/* Branding / Logo */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-blue-500 font-black text-xl tracking-tighter hover:opacity-80 transition-opacity">
          GAS LOGISTICS
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link 
          href="/dashboard" 
          className={`text-[10px] font-black uppercase tracking-widest transition-colors ${pathname === '/dashboard' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          Fleet Intel
        </Link>
        <Link 
          href="/ingestion" 
          className={`text-[10px] font-black uppercase tracking-widest transition-colors ${pathname === '/ingestion' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          Ingestion Hub
        </Link>
        <Link 
          href="/bulk" 
          className={`text-[10px] font-black uppercase tracking-widest transition-colors ${pathname === '/bulk' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          Bulk Processing
        </Link>
        <Link 
          href="/barcode-scan" 
          className={`text-[10px] font-black uppercase tracking-widest transition-colors ${pathname === '/barcode-scan' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          Barcode Scan
        </Link>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <span className="text-slate-500 text-[9px] font-mono hidden lg:block">
          {session.user?.email}
        </span>
        <button 
          onClick={handleSignOut}
          className="bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-slate-700 transition-all"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}