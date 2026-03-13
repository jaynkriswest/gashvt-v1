'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function IngestionHub() {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'csv'>('scan');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const supabase = createClient();

  // 1. Scanner Logic (Supports Barcodes & QR)
  useEffect(() => {
    if (activeTab === 'scan') {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 280, height: 150 }, // Wider box for horizontal barcodes
        aspectRatio: 1.777778 
      }, false);

      scanner.render((text) => {
        setQuery(text);
        handleLookup(text);
        scanner.clear();
      }, () => {});

      return () => { scanner.clear().catch(() => {}); };
    }
  }, [activeTab]);

  // 2. Lookup Logic (Manual or Scan)
  const handleLookup = async (id: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('cylinders')
      .select('*')
      .or(`Cylinder_ID.eq.${id},batch_id.eq.${id}`)
      .single();
    setResult(data || null);
    setLoading(false);
  };

  // 3. CSV Upload Logic
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    // You'll use a library like 'papaparse' here eventually
    console.log("Processing CSV:", file.name);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Navigation Tabs */}
      <div className="flex bg-[#0d1117] p-1 rounded-xl border border-slate-800 w-fit">
        {['scan', 'manual', 'csv'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 text-xs font-bold rounded-lg uppercase transition-all ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 bg-[#161b22] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-blue-500 font-black text-[10px] uppercase tracking-widest">Entry Method</h2>
          
          {activeTab === 'scan' && (
            <div id="reader" className="overflow-hidden rounded-xl border border-slate-800 bg-black aspect-video"></div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Enter Cylinder or Batch ID..."
                className="w-full bg-[#010409] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                onClick={() => handleLookup(query)}
                className="w-full bg-blue-600 py-3 rounded-xl font-bold text-sm text-white"
              >
                {loading ? 'Processing...' : 'Search Inventory'}
              </button>
            </div>
          )}

          {activeTab === 'csv' && (
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer relative">
              <input type="file" accept=".csv" onChange={handleCSVUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              <p className="text-slate-400 text-xs font-medium">Click to upload Batch CSV</p>
              <p className="text-slate-600 text-[10px] mt-2 italic">Expected: Cylinder_ID, Batch, Status...</p>
            </div>
          )}
        </div>

        {/* Display Section */}
        <div className="lg:col-span-2 bg-[#161b22] border border-slate-800 rounded-2xl overflow-hidden min-h-[400px]">
          {result ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-slate-900/50 p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Live Asset Data</p>
                  <h3 className="text-2xl text-blue-400 font-mono font-bold">{result.Cylinder_ID}</h3>
                </div>
                <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] px-3 py-1 rounded-full font-black uppercase">
                  {result.Status}
                </span>
              </div>
              <div className="p-8 grid grid-cols-2 gap-8">
                <InfoBlock label="Batch" value={result.batch_id} />
                <InfoBlock label="Client" value={result.Customer_Name} />
                <InfoBlock label="Next Compliance Test" value={result.Next_Test_Due} urgent={new Date(result.Next_Test_Due) < new Date()} />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-700">
              <span className="text-4xl mb-4">🔍</span>
              <p className="text-xs font-bold uppercase tracking-widest">Awaiting Input...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value, urgent = false }: { label: string, value: string, urgent?: boolean }) {
  return (
    <div className="border-l border-slate-800 pl-4">
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-tighter mb-1">{label}</p>
      <p className={`text-sm font-bold ${urgent ? 'text-red-500' : 'text-slate-200'}`}>{value || '---'}</p>
    </div>
  );
}