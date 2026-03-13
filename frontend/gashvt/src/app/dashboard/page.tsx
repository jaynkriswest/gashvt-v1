'use client'
import { useState } from 'react';
import FleetIntelView from '@/components/FleetIntelView';
import Scanner from '@/components/Scanner';

export default function Dashboard() {
  const [mode, setMode] = useState('view');

  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-64 border-r border-slate-800 p-6 space-y-4 bg-slate-950/50">
        <div className="mb-10 px-2">
          <h1 className="text-xl font-bold tracking-tight text-blue-500">KRISWEST</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Logistics Pro</p>
        </div>
        
        <button 
          onClick={() => setMode('view')} 
          className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition ${mode === 'view' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'hover:bg-slate-800 text-slate-400'}`}
        >
          📊 Fleet Intel
        </button>
        <button 
          onClick={() => setMode('bulk')} 
          className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition ${mode === 'bulk' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'hover:bg-slate-800 text-slate-400'}`}
        >
          📂 Bulk Processing
        </button>
        <button 
          onClick={() => setMode('scan')} 
          className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition ${mode === 'scan' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'hover:bg-slate-800 text-slate-400'}`}
        >
          📷 Barcode Scan
        </button>
      </nav>

      {/* Dynamic Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        {/* Render View Mode */}
        {mode === 'view' && <FleetIntelView />}

        {/* Render Scan Mode */}
        {mode === 'scan' && (
          <div className="max-w-2xl mx-auto bg-slate-900 p-10 rounded-2xl border border-slate-800 text-center shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Point Camera at Barcode</h2>
            <p className="text-slate-400 mb-8 text-sm">Ensure the barcode is well-lit and centered.</p>
            <Scanner onScan={(id) => alert(`Scanned: ${id}`)} />
          </div>
        )}

        {/* Render Bulk Mode (Placeholder for now) */}
        {mode === 'bulk' && (
          <div className="text-slate-500 italic">Bulk processing module loading...</div>
        )}
      </main>
    </div>
  );
}