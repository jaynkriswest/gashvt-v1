'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Papa from 'papaparse';

export default function IngestionPage({ userProfile }: { userProfile: any }) {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'csv'>('scan');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ msg: '', type: '' });
  
  const [formData, setFormData] = useState({ 
    Cylinder_ID: '', 
    batch_id: '', 
    Customer_Name: userProfile?.client_link || '',
    Status: 'EMPTY' 
  });

  const supabase = createClient();

  useEffect(() => {
    if (activeTab === 'scan') {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        videoConstraints: { facingMode: { ideal: "environment" } }
      }, false);

      scanner.render((text) => {
        setFormData(prev => ({ ...prev, Cylinder_ID: text }));
        setActiveTab('manual'); 
        scanner.clear();
      }, () => {});

      return () => { scanner.clear().catch(() => {}); };
    }
  }, [activeTab]);

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const processedData = results.data.map((row: any) => ({
          ...row,
          Customer_Name: userProfile?.role !== 'Admin' ? userProfile?.client_link : row.Customer_Name
        }));

        const { error } = await supabase.from('cylinders').upsert(processedData, { onConflict: 'Cylinder_ID' });
        if (error) setStatus({ msg: error.message, type: 'error' });
        else setStatus({ msg: `Successfully imported ${processedData.length} units`, type: 'success' });
        setLoading(false);
      }
    });
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('cylinders').upsert([formData], { onConflict: 'Cylinder_ID' });
    if (error) setStatus({ msg: error.message, type: 'error' });
    else {
      setStatus({ msg: `Unit ${formData.Cylinder_ID} registered.`, type: 'success' });
      setFormData({ Cylinder_ID: '', batch_id: '', Customer_Name: userProfile?.client_link || '', Status: 'EMPTY' });
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <header>
        <h1 className="text-xl md:text-2xl font-bold text-text-main mb-2 uppercase tracking-tighter">Ingestion Hub</h1>
        <p className="text-slate-500 text-[10px] md:text-sm italic uppercase font-mono">Asset Registration: {userProfile?.client_link || 'System Admin'}</p>
      </header>

      {/* Tabs - Now uses brand-panel and brand-border */}
      <div className="flex bg-brand-panel p-1 rounded-xl border border-brand-border w-fit overflow-x-auto transition-colors">
        {['scan', 'manual', 'csv'].map(t => (
          <button 
            key={t} 
            onClick={() => { setActiveTab(t as any); setStatus({ msg: '', type: '' }); }} 
            className={`px-4 md:px-6 py-2 text-[10px] font-bold rounded-lg uppercase transition-all whitespace-nowrap ${
              activeTab === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-blue-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {status.msg && (
        <div className={`p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${
          status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
        }`}>
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Portal Card */}
        <div className="bg-brand-panel p-6 rounded-2xl border border-brand-border shadow-xl transition-colors">
          <h2 className="text-blue-500 font-black text-[10px] uppercase tracking-widest mb-6">Entry Portal</h2>
          
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <input 
                className="w-full bg-brand-dark border border-brand-border p-3 text-text-main text-xs rounded-lg outline-none focus:border-blue-500 transition-colors" 
                placeholder="Cylinder ID" 
                value={formData.Cylinder_ID}
                onChange={e => setFormData({...formData, Cylinder_ID: e.target.value})} 
                required
              />
              <input 
                className="w-full bg-brand-dark border border-brand-border p-3 text-text-main text-xs rounded-lg outline-none focus:border-blue-500 transition-colors" 
                placeholder="Batch ID (Optional)" 
                value={formData.batch_id}
                onChange={e => setFormData({...formData, batch_id: e.target.value})} 
              />
              <button disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold text-white uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all disabled:opacity-50">
                {loading ? 'Processing...' : 'Register Asset'}
              </button>
            </form>
          )}

          {activeTab === 'csv' && (
            <div className="border-2 border-dashed border-brand-border p-8 md:p-12 text-center rounded-2xl hover:border-blue-500/50 transition-all relative">
              <input type="file" accept=".csv" onChange={handleCSV} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="text-3xl mb-4">📄</div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Upload Batch CSV</p>
            </div>
          )}

          {activeTab === 'scan' && (
            <div className="space-y-4">
              <div id="reader" className="bg-black rounded-xl overflow-hidden aspect-square border border-brand-border"></div>
              <p className="text-[9px] text-center text-slate-500 font-bold uppercase">Scanner Active</p>
            </div>
          )}
        </div>

        {/* Protocol Card */}
        <div className="lg:col-span-2 bg-brand-panel border border-brand-border rounded-2xl p-6 md:p-10 flex flex-col items-center justify-center text-center transition-colors">
          <div className="max-w-md">
            <h3 className="text-text-main font-bold mb-4 text-sm uppercase">Compliance Protocol</h3>
            <ul className="text-slate-500 text-[10px] space-y-3 text-left list-disc list-inside font-mono uppercase">
              <li>Manual entry requires unique <span className="text-blue-500">Cylinder ID</span>.</li>
              <li>CSV headers must match database schema.</li>
              <li>Scans auto-link to <span className="text-blue-500">{userProfile?.client_link || 'System Root'}</span>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}