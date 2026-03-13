'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Fleet Intel', href: '/', icon: '📊' },
  { name: 'Ingestion Hub', href: '/ingestion', icon: '📥' },
  { name: 'Bulk Processing', href: '/bulk', icon: '📁' },
  { name: 'Barcode Scan', href: '/barcode-scan', icon: '📷' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0d1117] border-r border-slate-800 flex flex-col">
      <div className="p-6">
        <h1 className="text-blue-500 font-black text-xl tracking-tighter">KRISWEST</h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Logistics Pro</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 bg-[#161b22] p-3 rounded-lg border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">System Online</span>
        </div>
      </div>
    </aside>
  );
}