'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Database, Layers, ScanBarcode, LogOut, Menu, X } from 'lucide-react';
import { ThemeToggle } from "@/components/ThemeToggle"

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setUserRole(profile?.role || null);
      }
    };

    fetchUser();

    // Listen for auth changes (Login/Logout) to update UI instantly
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUser(); 
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Hide Navbar only on login page
  if (pathname === '/login') return null;
  // If no user yet, return a spacer to prevent layout shift but don't block rendering
  if (!user) return <div className="h-16" />; 

  return (
    <nav className="border-b border-brand-border bg-brand-panel/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-black italic text-blue-500 tracking-tighter uppercase">GASHVT V1</Link>
          <div className="hidden md:flex items-center gap-6">
            <NavLink href="/" label="Intel" icon={<Home size={14} />} active={pathname === '/'} />
            {userRole === 'Admin' && (
              <>
                <NavLink href="/ingestion" label="Hub" icon={<Database size={14} />} active={pathname === '/ingestion'} />
                <NavLink href="/bulk" label="Bulk" icon={<Layers size={14} />} active={pathname === '/bulk'} />
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href='/login')} className="text-slate-400 hover:text-red-500">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label, icon, active }: any) {
  return (
    <Link href={href} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${active ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}>
      {icon} {label}
    </Link>
  );
}