'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Scanner from '@/components/Scanner';
import { ScanLine, Keyboard, FileUp, Database, PlusCircle, Loader2 } from 'lucide-react';

export default function IngestionPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'bulk'>('scan');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time stats state
  const [stats, setStats] = useState({ total: 0, avg: 0 });

  useEffect(() => {
    async function initialize() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          setProfile(data);
        }
        await fetchLiveStats();
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    }
    initialize();
  }, [supabase]);

  async function fetchLiveStats() {
    // MATCHING YOUR SCREENSHOT: Using 'Capacity_kg' instead of 'capacity_kg'
    const { data, count, error } = await supabase
      .from('cylinders')
      .select('Capacity_kg', { count: 'exact' });

    if (error) {
      console.error("Supabase Query Error:", error.message);
      return;
    }

    if (data) {
      const totalCount = count || 0;
      // MATCHING YOUR SCREENSHOT: Note the Capital 'C' in Capacity_kg
      const sum = data.reduce((acc, curr) => acc + (Number(curr.Capacity_kg) || 0), 0);
      const average = totalCount > 0 ? sum / totalCount : 0;

      setStats({
        total: totalCount,
        avg: parseFloat(average.toFixed(1))
      });
    }
  }

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Fleet Data...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Data Ingestion Terminal</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select entry method for cylinders & batches</p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit shadow-inner">
        <TabButton active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} icon={<ScanLine size={14}/>} label="Scanner" />
        <TabButton active={activeTab === 'manual'} onClick={() => setActiveTab('manual')} icon={<Keyboard size={14}/>} label="Manual Entry" />
        <TabButton active={activeTab === 'bulk'} onClick={() => setActiveTab('bulk')} icon={<FileUp size={14}/>} label="CSV Upload" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          {activeTab === 'scan' && (
            <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm aspect-video flex items-center justify-center">
              <Scanner 
                userProfile={profile} 
                onResult={async (data: any) => {
                  console.log("Scan Success:", data);
                  await fetchLiveStats();
                }} 
              />
            </div>
          )}

          {activeTab === 'manual' && <ManualEntryForm onRefresh={fetchLiveStats} />}
          {activeTab === 'bulk' && <BulkUploadZone />}
        </div>

        {/* Sidebar: Stats Display */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Database size={120} />
            </div>
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Database className="text-white" size={18} />
              </div>
              <h2 className="font-black uppercase tracking-widest text-[11px]">Global Fleet Stats</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 relative z-10">
              <StatCard label="Total Inventory Units" value={stats.total.toLocaleString()} />
              <StatCard label="Average Unit Capacity" value={`${stats.avg} kg`} />
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center relative z-10">
                <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Live Status</span>
                <span className="text-[8px] font-bold text-blue-400 uppercase bg-blue-400/10 px-2 py-1 rounded">
                    Synced: {new Date().toLocaleTimeString()}
                </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Internal Components ---

function ManualEntryForm({ onRefresh }: { onRefresh: () => void }) {
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    // MATCHING YOUR SCREENSHOT: Column names are Capitalized
    const { error } = await supabase.from('cylinders').insert([{
      Cylinder_ID: formData.get('Cylinder_ID'),
      Capacity_kg: parseFloat(formData.get('Capacity_kg') as string),
      Location_PIN: formData.get('Location_PIN'),
      Customer_Name: formData.get('Customer_Name') || 'Internal Stock',
      batch_id: 'MANUAL_ENTRY' // Or handle batch selection
    }]);

    if (error) {
      alert("Database Error: " + error.message);
    } else {
      onRefresh();
      (e.target as HTMLFormElement).reset();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <InputGroup name="Cylinder_ID" label="Cylinder ID" placeholder="TEST-2000" required />
        <InputGroup name="Capacity_kg" label="Capacity (kg)" type="number" step="0.1" placeholder="14.2" required />
        <InputGroup name="Location_PIN" label="Current PIN" placeholder="500001" required />
        <InputGroup name="Customer_Name" label="Customer / Brand" placeholder="e.g. Indane" />
      </div>
      <button disabled={submitting} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
        {submitting ? <Loader2 className="animate-spin" size={16}/> : <PlusCircle size={16} />}
        Register to Database
      </button>
    </form>
  );
}

function BulkUploadZone() {
  return (
    <div className="border-4 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all group cursor-pointer">
      <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
        <FileUp size={32} className="text-blue-600" />
      </div>
      <p className="font-black uppercase text-[10px] tracking-widest text-slate-500">Drop CSV to Ingest Batch</p>
      <p className="text-[8px] text-slate-400 mt-2 uppercase font-bold">Max 1000 rows per upload</p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}>
      {icon} {label}
    </button>
  );
}

function InputGroup({ label, name, ...props }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black uppercase text-slate-400 tracking-tighter ml-1">{label}</label>
      <input name={name} {...props} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition-colors" />
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
      <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">{label}</p>
      <p className="text-2xl font-black tracking-tighter">{value}</p>
    </div>
  );
}