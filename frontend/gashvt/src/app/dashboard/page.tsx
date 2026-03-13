'use client'
import { useState } from 'react';
import FleetIntelView from '@/components/FleetIntelView';
// import Scanner from '@/components/Scanner'; // Uncomment if file exists
// import BulkProcessingView from '@/components/BulkProcessingView'; // Uncomment if file exists

export default function Dashboard() {
  const [mode, setMode] = useState('view');

  return (
    <div className="space-y-8">
      {/* Sub-Navigation (Since the Main Menu is now at the top) */}
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
        <button 
          onClick={() => setMode('scan')} 
          className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
            mode === 'scan' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          📷 Scan
        </button>
      </div>

      {/* Dynamic Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        {mode === 'view' && <FleetIntelView />}
        
        {/* Replace these once your components are ready */}
        {mode === 'bulk' && (
          <div className="p-20 text-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-600 font-bold uppercase tracking-tighter">
            Bulk Processing Module Ready
          </div>
        )}

        {mode === 'scan' && (
          <div className="max-w-2xl mx-auto bg-[#0d1117] p-10 rounded-2xl border border-slate-800 text-center">
            <h2 className="text-xl font-bold mb-4 text-white uppercase tracking-tighter">Point Camera at Barcode</h2>
            <div className="aspect-video bg-black rounded-xl border border-slate-800 flex items-center justify-center text-slate-700 italic">
               Camera feed initializing...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}