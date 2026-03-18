'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Database, Layers, ScanBarcode, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getSessionAndRole() {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentSession.user.id)
          .single();
        setUserRole(data?.role);
      }
      setLoading(false);
    }
    getSessionAndRole();
  }, [supabase]);

  // Close menu automatically when user clicks a link
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  if (pathname === '/login') return null;
  // Placeholder to prevent "jumping" UI during load
  if (loading) return <div className="h-[73px] bg-[#0d1117] border-b border-slate-800" />;
  if (!session) return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="bg-[#0d1117] border-b border-slate-800 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        {/* LOGO SECTION */}
        <Link href="/dashboard" className="text-blue-500 font-black text-lg md:text-xl tracking-tighter whitespace-nowrap">
          GAS LOGISTICS
        </Link>

        {/* DESKTOP LINKS: Hidden on mobile */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/dashboard" label="Fleet Intel" icon={<Home size={14} />} active={pathname === '/dashboard'} />
          {userRole === 'Admin' && (
            <>
              <NavLink href="/ingestion" label="Ingestion Hub" icon={<Database size={14} />} active={pathname === '/ingestion'} />
              <NavLink href="/bulk" label="Bulk Processing" icon={<Layers size={14} />} active={pathname === '/bulk'} />
              <NavLink href="/barcode-scan" label="Barcode Scan" icon={<ScanBarcode size={14} />} active={pathname === '/barcode-scan'} />
            </>
          )}
          <button onClick={handleSignOut} className="flex items-center gap-2 text-[10px] font-black uppercase text-white bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">
            <LogOut size={12} /> Sign Out
          </button>
        </div>

        {/* MOBILE MENU BUTTON: Only visible on mobile */}
        <button className="md:hidden text-slate-400 p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0d1117] p-4 flex flex-col gap-2 animate-in slide-in-from-top duration-200">
          <MobileNavLink href="/dashboard" label="Fleet Intel" icon={<Home size={18} />} active={pathname === '/dashboard'} />
          {userRole === 'Admin' && (
            <>
              <MobileNavLink href="/ingestion" label="Ingestion Hub" icon={<Database size={18} />} active={pathname === '/ingestion'} />
              <MobileNavLink href="/bulk" label="Bulk Processing" icon={<Layers size={18} />} active={pathname === '/bulk'} />
              <MobileNavLink href="/barcode-scan" label="Barcode Scan" icon={<ScanBarcode size={18} />} active={pathname === '/barcode-scan'} />
            </>
          )}
          <div className="h-px bg-slate-800 my-2" />
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-4 px-4 py-4 text-red-500 font-black uppercase tracking-widest text-[11px]"
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
    <Link href={href} className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}>
      {icon} <span>{label}</span>
    </Link>
  );
}

function MobileNavLink({ href, label, icon, active }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-4 px-4 py-4 rounded-xl font-black uppercase text-[11px] transition-all ${
        active ? 'bg-blue-500/10 text-blue-500' : 'text-slate-400 hover:bg-slate-800/50'
      }`}
    >
      {icon} <span>{label}</span>
    </Link>
  );
}