'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Papa from 'papaparse';

// This MUST be "export default"
export default function IngestionPage() {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'csv'>('scan');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ msg: '', type: '' });
  const [formData, setFormData] = useState({ 
    Cylinder_ID: '', 
    batch_id: '', 
    Customer_Name: '',
    Status: 'EMPTY' 
  });

  const supabase = createClient();

  // Scanner Logic
  useEffect(() => {
    if (activeTab === 'scan') {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 150 } 
      }, false);

      scanner.render((text) => {
        // Handle successful scan
        setFormData(prev => ({ ...prev, Cylinder_ID: text }));
        setActiveTab('manual'); // Switch to manual to review the scanned ID
        scanner.clear();
      }, () => {});

      return () => { scanner.clear().catch(() => {}); };
    }
  }, [activeTab]);

  // CSV Batch Logic
  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const { error } = await supabase.from('cylinders').upsert(results.data, { onConflict: 'Cylinder_ID' });
        if (error) setStatus({ msg: error.message, type: 'error' });
        else setStatus({ msg: `Successfully imported ${results.data.length} units`, type: 'success' });
        setLoading(false);
      }
    });
  };

  // Manual Entry Logic
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('cylinders').upsert([formData], { onConflict: 'Cylinder_ID' });
    if (error) setStatus({ msg: error.message, type: 'error' });
    else {
      setStatus({ msg: `Unit ${formData.Cylinder_ID} saved.`, type: 'success' });
      setFormData({ Cylinder_ID: '', batch_id: '', Customer_Name: '', Status: 'EMPTY' });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-white mb-2">Ingestion Hub</h1>
        <p className="text-slate-500 text-sm italic">Register new assets via scan, manual entry, or bulk CSV.</p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex bg-[#0d1117] p-1 rounded-xl border border-slate-800 w-fit">
        {['scan', 'manual', 'csv'].map(t => (
          <button 
            key={t} 
            onClick={() => { setActiveTab(t as any); setStatus({ msg: '', type: '' }); }} 
            className={`px-6 py-2 text-xs font-bold rounded-lg uppercase transition-all ${
              activeTab === t ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {status.msg && (
        <div className={`p-4 rounded-xl border text-xs font-bold uppercase tracking-widest ${
          status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
        }`}>
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="bg-[#161b22] p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h2 className="text-blue-500 font-black text-[10px] uppercase tracking-widest mb-6">Entry Portal</h2>
          
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <input 
                className="w-full bg-[#010409] border border-slate-700 p-3 text-white rounded-lg outline-none focus:border-blue-500" 
                placeholder="Cylinder ID" 
                value={formData.Cylinder_ID}
                onChange={e => setFormData({...formData, Cylinder_ID: e.target.value})} 
                required
              />
              <input 
                className="w-full bg-[#010409] border border-slate-700 p-3 text-white rounded-lg outline-none focus:border-blue-500" 
                placeholder="Batch ID" 
                value={formData.batch_id}
                onChange={e => setFormData({...formData, batch_id: e.target.value})} 
              />
              <input 
                className="w-full bg-[#010409] border border-slate-700 p-3 text-white rounded-lg outline-none focus:border-blue-500" 
                placeholder="Customer Name" 
                value={formData.Customer_Name}
                onChange={e => setFormData({...formData, Customer_Name: e.target.value})} 
              />
              <button disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold text-white uppercase text-xs tracking-widest hover:bg-blue-500 transition-all">
                {loading ? 'Processing...' : 'Register Asset'}
              </button>
            </form>
          )}

          {activeTab === 'csv' && (
            <div className="border-2 border-dashed border-slate-800 p-12 text-center rounded-2xl hover:border-blue-500/50 transition-all relative">
              <input type="file" accept=".csv" onChange={handleCSV} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="text-4xl mb-4">📄</div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Click to Upload Batch CSV</p>
            </div>
          )}

          {activeTab === 'scan' && (
            <div className="space-y-4">
              <div id="reader" className="bg-black rounded-xl overflow-hidden aspect-square border border-slate-800"></div>
              <p className="text-[10px] text-center text-slate-500 font-bold uppercase">Center Barcode in Viewport</p>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-2 bg-[#161b22] border border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
          <div className="max-w-md">
            <h3 className="text-white font-bold mb-4">Standard Operating Procedure</h3>
            <ul className="text-slate-500 text-xs space-y-3 text-left list-disc list-inside">
              <li>Manual entry requires a unique <span className="text-blue-400">Cylinder ID</span>.</li>
              <li>CSV headers must exactly match database schema.</li>
              <li>Barcodes should be scanned in high-contrast lighting.</li>
              <li>All ingestions are logged for <span className="text-blue-400">Compliance Audit</span>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}