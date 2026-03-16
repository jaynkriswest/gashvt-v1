'use client'
import { useState } from 'react';
import FleetIntelView from '@/components/FleetIntelView';
import Scanner from '@/components/Scanner'; 
import RecentActivityView from '@/components/RecentActivityView'; // New Import

export default function Dashboard() {
  const [mode, setMode] = useState('view');

  return (
    <div className="space-y-8">
      {/* Sub-Navigation */}
      <div className="flex gap-2 bg-[#0d1117] p-1 rounded-xl border border-slate-800 w-fit">
        <button onClick={() => setMode('view')} className={mode === 'view' ? 'activeStyle' : 'inactiveStyle'}>
          📊 Intel
        </button>
        
        {/* CHANGED THIS BUTTON */}
        <button 
          onClick={() => setMode('recent')} 
          className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
            mode === 'recent' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          🕒 Recent
        </button>

        <button onClick={() => setMode('scan')} className={mode === 'scan' ? 'activeStyle' : 'inactiveStyle'}>
          📷 Scan
        </button>
      </div>

      {/* Dynamic Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        {mode === 'view' && <FleetIntelView />}
        
        {/* NEW RECENT ACTIVITY VIEW */}
        {mode === 'recent' && <RecentActivityView />}

        {mode === 'scan' && (
          <div className="max-w-2xl mx-auto">
             <Scanner />
          </div>
        )}
      </div>
    </div>
  );
}