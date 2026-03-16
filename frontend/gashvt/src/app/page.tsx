'use client'
import { useState } from 'react';
import FleetIntelView from '@/components/FleetIntelView';
import BulkProcessingView from '@/components/BulkProcessingView'; // 1. Import it here

export default function Dashboard() {
  const [mode, setMode] = useState('view');

  return (
    <div className="space-y-8">
      {/* Sub-Navigation */}
      <div className="flex gap-2 bg-[#0d1117] p-1 rounded-xl border border-slate-800 w-fit">
        <button 
          onClick={() => setMode('view')} 
          className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
            mode === 'view' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          📊 Intel
        </button>
        <button 
          onClick={() => setMode('bulk')} 
          className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
            mode === 'bulk' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          📂 Bulk
        </button>
      </div>

      {/* 2. Update this area to show the real component */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        {mode === 'view' && <FleetIntelView />}
        {mode === 'bulk' && <BulkProcessingView />} 
      </div>
    </div>
  );
}