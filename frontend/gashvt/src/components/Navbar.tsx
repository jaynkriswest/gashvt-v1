'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Database, Layers, LogOut } from 'lucide-react';
import { ThemeToggle } from "@/components/ThemeToggle"

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setUserRole(data?.role || null);
      }
    };

    checkUser();

    // This listener catches the login event and updates the Navbar automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        checkUser(); // Re-fetch role
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Don't show Navbar on Login page
  if (pathname === '/login') return null;

  return (
    <nav className="border-b border-brand-border bg-brand-panel/50 backdrop-blur-md sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-black italic text-blue-500 tracking-tighter uppercase">GASHVT V1</Link>
          
          {user && (
            <div className="flex items-center gap-6">
              <NavLink href="/" label="Dashboard" icon={<Home size={14} />} active={pathname === '/'} />
              {userRole === 'Admin' && (
                <NavLink href="/bulk" label="Bulk Processing" icon={<Layers size={14} />} active={pathname === '/bulk'} />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && (
            <button 
              onClick={() => supabase.auth.signOut().then(() => window.location.href='/login')}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label, icon, active }: any) {
  return (
    <Link href={href} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${active ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}>
      {icon} {label}
    </Link>
  );
}