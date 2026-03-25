'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Scanner from '@/components/Scanner';
import { ScanLine, Keyboard, FileUp, Database, PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner'; // Optional: for notifications

export default function IngestionPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'bulk'>('scan');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time Stats State
  const [stats, setStats] = useState({ total: 0, avg: 0 });

  // 1. Fetch Profile and Initial Stats
  useEffect(() => {
    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
      await fetchLiveStats();
      setLoading(false);
    }
    initialize();
  }, []);

  // 2. Fetch Aggregated Stats (1499 cylinders)
  async function fetchLiveStats() {
    // Get Total Count
    const { count, error: countErr } = await supabase
      .from('cylinders')
      .select('*', { count: 'exact', head: true });

    // Get Average Capacity
    const { data: avgData, error: avgErr } = await supabase
      .from('cylinders')
      .select('capacity_kg');

    if (countErr || avgErr) return;

    const total = count || 0;
    const sum = avgData?.reduce((acc, curr) => acc + (curr.capacity_kg || 0), 0) || 0;
    const average = total > 0 ? sum / total : 0;

    setStats({ total, avg: parseFloat(average.toFixed(1)) });
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Data Ingestion Terminal</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select entry method for cylinders & batches</p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <TabButton active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} icon={<ScanLine size={14}/>} label="Scanner" />
        <TabButton active={activeTab === 'manual'} onClick={() => setActiveTab('manual')} icon={<Keyboard size={14}/>} label="Manual Entry" />
        <TabButton active={activeTab === 'bulk'} onClick={() => setActiveTab('bulk')} icon={<FileUp size={14}/>} label="CSV Upload" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          {activeTab === 'scan' && (
            <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm aspect-video">
              <Scanner 
                userProfile={profile} 
                onResult={async (data) => {
                  console.log("Scanned:", data);
                  await fetchLiveStats(); // Refresh stats after scan
                }} 
              />
            </div>
          )}

          {activeTab === 'manual' && <ManualEntryForm onRefresh={fetchLiveStats} />}
          
          {activeTab === 'bulk' && <BulkUploadZone />}
        </div>

        {/* Sidebar: Global Fleet Stats */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-blue-400" size={20} />
              <h2 className="font-black uppercase tracking-widest text-[11px]">Global Fleet Stats</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Total Cylinders" value={stats.total.toLocaleString()} />
              <StatCard label="Avg Capacity" value={`${stats.avg}kg`} />
            </div>
            <p className="mt-4 text-[8px] text-slate-500 uppercase font-bold tracking-widest text-center">
              Last Sync: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-Components ---

function ManualEntryForm({ onRefresh }: { onRefresh: () => void }) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('cylinders').insert([{
      cylinder_id: formData.get('cylinder_id'),
      capacity_kg: parseFloat(formData.get('capacity') as string),
      location_pin: formData.get('location'),
      customer_name: formData.get('customer') || 'Internal Stock',
      status: 'Available'
    }]);

    if (!error) {
      alert("Cylinder registered successfully!");
      onRefresh();
      (e.target as HTMLFormElement).reset();
    } else {
      alert("Error: " + error.message);
    }
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <InputGroup name="cylinder_id" label="Cylinder ID" placeholder="e.g. LGC-9901" required />
        <InputGroup name="capacity" label="Capacity (kg)" placeholder="14.2" type="number" step="0.1" required />
        <InputGroup name="location" label="Location PIN" placeholder="560001" required />
        <InputGroup name="customer" label="Customer Name" placeholder="Internal Stock" />
      </div>
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />} 
        Register Cylinder
      </button>
    </form>
  );
}

function BulkUploadZone() {
  return (
    <div className="border-4 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50/50">
      <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
        <FileUp size={32} className="text-blue-600" />
      </div>
      <p className="font-black uppercase text-[10px] tracking-widest text-slate-500">
        Drop your CSV here or <span className="text-blue-600">Browse Files</span>
      </p>
      <p className="text-[9px] text-slate-400 mt-2 uppercase">Supports .csv, .xlsx (Max 500 rows)</p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
    >
      {icon} {label}
    </button>
  );
}

function InputGroup({ label, name, ...props }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black uppercase text-slate-400 tracking-tighter ml-1">{label}</label>
      <input 
        name={name}
        {...props} 
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition-colors" 
      />
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
      <p className="text-[8px] font-black uppercase text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}