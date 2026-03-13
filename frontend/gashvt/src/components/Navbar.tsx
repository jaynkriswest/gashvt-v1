'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const navItems = [
    { name: 'Fleet Intel', href: '/' },
    { name: 'Ingestion Hub', href: '/ingestion' },
    { name: 'Bulk Processing', href: '/bulk' },
    { name: 'Barcode Scan', href: '/barcode-scan' },
  ];

  return (
    <nav className="bg-[#0d1117] border-b border-slate-800 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-10">
        <h1 className="text-blue-500 font-black text-xl tracking-tighter">KRISWEST</h1>
        <div className="flex gap-2">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md ${
                pathname === item.href ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}