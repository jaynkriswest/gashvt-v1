'use client'
import { useState } from 'react';
import FleetIntelView from '@/components/FleetIntelView';
import Scanner from '@/components/Scanner';
import BulkProcessingView from '@/components/BulkProcessingView'; // This is key!

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
          className={`w-full text-left p-3 rounded-lg transition ${mode === 'view' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400'}`}
        >
          📊 Fleet Intel
        </button>
        <button 
          onClick={() => setMode('bulk')} 
          className={`w-full text-left p-3 rounded-lg transition ${mode === 'bulk' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400'}`}
        >
          📂 Bulk Processing
        </button>
        <button 
          onClick={() => setMode('scan')} 
          className={`w-full text-left p-3 rounded-lg transition ${mode === 'scan' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400'}`}
        >
          📷 Barcode Scan
        </button>
      </nav>

      {/* Dynamic Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        {mode === 'view' && <FleetIntelView />}

        {/* This replaces the "loading" text with your actual component */}
        {mode === 'bulk' && <BulkProcessingView />}

        {mode === 'scan' && (
          <div className="max-w-2xl mx-auto bg-slate-900 p-10 rounded-2xl border border-slate-800 text-center">
            <h2 className="text-xl font-bold mb-2 text-white">Point Camera at Barcode</h2>
            <Scanner onScan={(id) => alert(`Scanned: ${id}`)} />
          </div>
        )}
      </main>
    </div>
  );
}