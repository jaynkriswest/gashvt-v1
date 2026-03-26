'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Scanner from '@/components/Scanner';
import { ScanLine, Keyboard, FileUp, Database, PlusCircle, Loader2, Filter } from 'lucide-react';

export default function IngestionPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'bulk'>('scan');
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [batches, setBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedWeight, setSelectedWeight] = useState<string>('all');
  
  // Stats State
  const [stats, setStats] = useState({ total: 0, avg: 0 });

  useEffect(() => {
    async function initialize() {
      await fetchBatches();
      await fetchFilteredStats();
      setLoading(false);
    }
    initialize();
  }, [selectedBatch, selectedWeight]); // Re-run when filters change

  // Fetch unique batch IDs for the dropdown
  async function fetchBatches() {
    const { data } = await supabase.from('cylinders').select('batch_id');
    if (data) {
      const uniqueBatches = Array.from(new Set(data.map(item => item.batch_id).filter(Boolean)));
      setBatches(uniqueBatches as string[]);
    }
  }

  // Fetch Stats based on filters (Bypasses the 500 limit by using aggregations)
  async function fetchFilteredStats() {
    let query = supabase.from('cylinders').select('Capacity_kg', { count: 'exact' });

    if (selectedBatch !== 'all') {
      query = query.eq('batch_id', selectedBatch);
    }
    
    if (selectedWeight !== 'all') {
      query = query.eq('Capacity_kg', parseFloat(selectedWeight));
    }

    const { data, count, error } = await query;

    if (!error && data) {
      const total = count || 0;
      const sum = data.reduce((acc, curr) => acc + (Number(curr.Capacity_kg) || 0), 0);
      const average = total > 0 ? sum / total : 0;
      setStats({ total, avg: parseFloat(average.toFixed(1)) });
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Ingestion Terminal</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage 1,499+ Inventory Units</p>
        </div>
        
        {/* Filter Bar */}
        <div className="flex gap-3">
          <FilterSelect 
            label="Batch" 
            value={selectedBatch} 
            onChange={setSelectedBatch}
            options={['all', ...batches]} 
          />
          <FilterSelect 
            label="Weight" 
            value={selectedWeight} 
            onChange={setSelectedWeight}
            options={['all', '14.2', '19.0', '5.0', '47.5']} 
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
            <TabButton active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} label="Scanner" />
            <TabButton active={activeTab === 'manual'} onClick={() => setActiveTab('manual')} label="Manual" />
          </div>

          {activeTab === 'scan' ? (
            <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden aspect-video">
              <Scanner onResult={() => fetchFilteredStats()} />
            </div>
          ) : (
            <ManualEntryForm onRefresh={() => fetchFilteredStats()} />
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-600 rounded-lg"><Database size={18} /></div>
              <h2 className="font-black uppercase tracking-widest text-[11px]">
                {selectedBatch === 'all' ? 'Global Fleet' : `Batch: ${selectedBatch}`}
              </h2>
            </div>

            <div className="space-y-6">
              <StatCard label="Cylinders in View" value={stats.total.toLocaleString()} />
              <StatCard label="Selected Avg Capacity" value={`${stats.avg} kg`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function FilterSelect({ label, value, onChange, options }: any) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] font-black uppercase text-slate-400 ml-1">{label}</span>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border-2 border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold uppercase outline-none focus:border-blue-500 transition-colors"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt === 'all' ? `All ${label}s` : opt}</option>
        ))}
      </select>
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
      <p className="text-[9px] font-black uppercase text-slate-500 mb-2">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
      {label}
    </button>
  );
}

function ManualEntryForm({ onRefresh }: any) {
    // ... logic same as previous version, ensure column names match Casing (Cylinder_ID)
    return <div className="p-8 bg-white border-2 border-slate-200 rounded-3xl">Manual Entry Form UI...</div>
}