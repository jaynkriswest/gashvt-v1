'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Scanner from '@/components/Scanner';
import { calculateFleetMetrics } from '@/lib/logistics';

export default function Dashboard() {
  const [mode, setMode] = useState<'view' | 'bulk' | 'scan'>('view');
  const [cylinders, setCylinders] = useState([]);
  const supabase = createClient();

  // Fetching data like your st.cache_data logic
  const loadData = async () => {
    const { data } = await supabase.from('cylinders').select('*');
    if (data) setCylinders(data);
  };

  useEffect(() => { loadData(); }, []);

  const metrics = calculateFleetMetrics(cylinders);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sidebar Navigation */}
      <nav className="w-64 border-r border-slate-800 p-6 space-y-4">
        <button onClick={() => setMode('view')} className="w-full text-left p-2 hover:bg-slate-800 rounded">📊 Fleet Intel</button>
        <button onClick={() => setMode('bulk')} className="w-full text-left p-2 hover:bg-slate-800 rounded">📂 Bulk Processing</button>
        <button onClick={() => setMode('scan')} className="w-full text-left p-2 hover:bg-slate-800 rounded">📷 Barcode Scan</button>
      </nav>

      {/* Dynamic Content Area */}
      <main className="flex-1 p-10">
        {mode === 'view' && (
          <div>
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <p className="text-slate-400">Urgent Testing</p>
                <p className="text-3xl font-bold text-orange-500">{metrics.urgentTesting}</p>
              </div>
              {/* Other metric cards */}
            </div>
            {/* Inventory Table goes here */}
          </div>
        )}

        {mode === 'scan' && (
          <div className="bg-slate-900 p-10 rounded-xl text-center">
            <h2 className="text-xl font-bold mb-6">Point Camera at Barcode</h2>
            <Scanner onScan={(id) => alert(`Scanned: ${id}`)} />
          </div>
        )}
      </main>
    </div>
  );
}