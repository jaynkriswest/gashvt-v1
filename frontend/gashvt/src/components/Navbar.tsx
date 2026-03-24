'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  Database, 
  Layers, 
  ScanBarcode, 
  CreditCard, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
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

  // Auto-close mobile menu on navigation
  useEffect(() => { setIsMenuOpen(false); }, [pathname]);

  if (pathname === '/login') return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="border-b border-brand-border bg-brand-panel/50 backdrop-blur-md sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Left: Brand & Desktop Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-black italic text-blue-500 tracking-tighter uppercase text-xl">
            GASHVT V1
          </Link>
          
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <NavLink href="/" label="Intel" icon={<Home size={14} />} active={pathname === '/'} />
              
              {userRole === 'Admin' && (
                <>
                  <NavLink href="/ingestion" label="Hub" icon={<Database size={14} />} active={pathname === '/ingestion'} />
                  <NavLink href="/bulk" label="Bulk" icon={<Layers size={14} />} active={pathname === '/bulk'} />
                  <NavLink href="/billing" label="Financial" icon={<CreditCard size={14} />} active={pathname === '/billing'} />
                  <NavLink href="/barcode-scan" label="Scan" icon={<ScanBarcode size={14} />} active={pathname === '/barcode-scan'} />
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {user && (
            <>
              <button 
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors p-2"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
              
              <button 
                className="md:hidden text-slate-400 p-2"
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
        <div className="md:hidden border-t border-brand-border bg-brand-panel p-4 flex flex-col gap-2 animate-in slide-in-from-top duration-300">
          <MobileNavLink href="/" label="Intel Dashboard" icon={<Home size={18} />} active={pathname === '/'} />
          
          {userRole === 'Admin' && (
            <>
              <MobileNavLink href="/ingestion" label="Ingestion Hub" icon={<Database size={18} />} active={pathname === '/ingestion'} />
              <MobileNavLink href="/bulk" label="Bulk Processing" icon={<Layers size={18} />} active={pathname === '/bulk'} />
              <MobileNavLink href="/billing" label="Financial Terminal" icon={<CreditCard size={18} />} active={pathname === '/billing'} />
              <MobileNavLink href="/barcode-scan" label="Barcode Scan" icon={<ScanBarcode size={18} />} active={pathname === '/barcode-scan'} />
            </>
          )}

          <button 
            onClick={handleSignOut}
            className="flex items-center gap-4 px-4 py-4 mt-4 text-red-500 font-bold text-xs uppercase tracking-widest bg-red-500/5 rounded-xl border border-red-500/10"
          >
            <LogOut size={18} /> Authorize Log Out
          </button>
        </div>
      )}
    </nav>
  );
}

// Helper Components for Styling
function NavLink({ href, label, icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'text-blue-500' : 'text-slate-400 hover:text-white'
      }`}
    >
      {icon} {label}
    </Link>
  );
}

function MobileNavLink({ href, label, icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
        active ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'text-slate-400 hover:bg-white/5'
      }`}
    >
      {icon} {label}
    </Link>
  );
}