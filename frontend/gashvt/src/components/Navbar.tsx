'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Database, Layers, ScanBarcode, LogOut, Menu, X } from 'lucide-react';
import { ThemeToggle } from "@/components/ThemeToggle"

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(data?.role || null);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        checkUser();
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Close mobile menu on route change
  useEffect(() => { setIsMenuOpen(false); }, [pathname]);

  if (pathname === '/login') return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="border-b border-brand-border bg-brand-panel/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left Section: Logo & Desktop Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-black italic text-blue-500 tracking-tighter uppercase text-xl">
            GASHVT V1
          </Link>
          
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <NavLink href="/" label="Intel" icon={<Home size={14} />} active={pathname === '/'} />
              
              {userRole === 'Admin' && (
                <>
                  {/* These were previously missing from Desktop View */}
                  <NavLink href="/ingestion" label="Hub" icon={<Database size={14} />} active={pathname === '/ingestion'} />
                  <NavLink href="/bulk" label="Bulk" icon={<Layers size={14} />} active={pathname === '/bulk'} />
                  <NavLink href="/barcode-scan" label="Scan" icon={<ScanBarcode size={14} />} active={pathname === '/barcode-scan'} />
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Theme & Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {user && (
            <>
              <button 
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
              </button>
              
              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden text-slate-400"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && user && (
        <div className="md:hidden border-t border-brand-border bg-brand-panel p-4 flex flex-col gap-2">
          <MobileNavLink href="/" label="Intel" icon={<Home size={18} />} active={pathname === '/'} />
          {userRole === 'Admin' && (
            <>
              <MobileNavLink href="/ingestion" label="Ingestion Hub" icon={<Database size={18} />} active={pathname === '/ingestion'} />
              <MobileNavLink href="/bulk" label="Bulk Processing" icon={<Layers size={18} />} active={pathname === '/bulk'} />
              <MobileNavLink href="/barcode-scan" label="Barcode Scan" icon={<ScanBarcode size={18} />} active={pathname === '/barcode-scan'} />
            </>
          )}
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-4 px-4 py-4 mt-2 text-red-500 font-bold text-xs uppercase tracking-widest bg-red-500/5 rounded-xl"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, label, icon, active }: any) {
  return (
    <Link href={href} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}>
      {icon} {label}
    </Link>
  );
}

function MobileNavLink({ href, label, icon, active }: any) {
  return (
    <Link href={href} className={`flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${active ? 'bg-blue-500/10 text-blue-500' : 'text-slate-400 hover:bg-white/5'}`}>
      {icon} {label}
    </Link>
  );
}