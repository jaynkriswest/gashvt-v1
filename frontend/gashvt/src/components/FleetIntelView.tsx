'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function FleetIntelView() {
  const [cylinders, setCylinders] = useState<any[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [filterCompany, setFilterCompany] = useState('All Companies');
  const [viewScope, setViewScope] = useState('Master Inventory'); // Toggle state
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data } = await supabase.from('cylinders').select('*');
    if (data) {
      setCylinders(data);
      const unique = Array.from(new Set(data.map(c => c.Customer_Name))).filter(Boolean) as string[];
      setCompanies(unique.sort());
    }
    setLoading(false);
  }

  // Filter logic based on the dropdown and toggle
  const getFilteredData = () => {
    let baseData = cylinders;
    
    // 1. Filter by Company
    if (filterCompany !== 'All Companies') {
      baseData = baseData.filter(c => c.Customer_Name === filterCompany);
    }

    // 2. Filter by View Scope (Toggle)
    if (viewScope === 'Compliance Alerts') {
      const today = new Date();
      const thirtyDays = new Date();
      thirtyDays.setDate(today.getDate() + 30);
      return baseData.filter(c => c.Next_Test_Due && new Date(c.Next_Test_Due) <= thirtyDays);
    }

    return baseData;
  };

  const currentData = getFilteredData();

  const handleExport = () => {
    const csv = currentData.map(c => Object.values(c).join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${viewScope.replace(' ', '_').toLowerCase()}_export.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* 1. CONTROL TOOLBAR */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1117] p-5 rounded-2xl border border-slate-800 gap-4">
        <div className="flex gap-2 p-1 bg-[#010409] rounded-xl border border-slate-800">
          {['Master Inventory', 'Compliance Alerts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setViewScope(tab)}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                viewScope === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <select 
            className="bg-[#010409] border border-slate-700 text-slate-400 text-[10px] font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-blue-500"
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
          >
            <option>All Companies</option>
            {companies.map(name => <option key={name} value={name}>{name}</option>)}
          </select>

          <button 
            onClick={handleExport}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700"
          >
            💾 Export CSV
          </button>
        </div>
      </div>

      {/* 2. CONCISE SCROLLABLE TABLE */}
      <div className="bg-[#0d1117] border border-slate-800 rounded-2xl flex flex-col h-[550px] overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-[#161b22] flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
            {viewScope} — Showing {currentData.length} Records
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0d1117] text-[9px] font-black text-slate-500 uppercase border-b border-slate-800">
              <tr>
                <th className="px-8 py-4">Serial Number</th>
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Batch ID</th>
                <th className="px-8 py-4 text-right">Next Test Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center text-slate-600 font-bold uppercase text-[10px] animate-pulse">Syncing Database...</td></tr>
              ) : currentData.map((unit) => (
                <tr key={unit.Cylinder_ID} className="hover:bg-blue-600/5 transition-colors">
                  <td className="px-8 py-5 font-mono text-blue-400 font-bold">{unit.Cylinder_ID}</td>
                  <td className="px-8 py-5 text-slate-400 text-xs">{unit.Customer_Name}</td>
                  <td className="px-8 py-5 text-slate-600 font-mono text-xs">{unit.batch_id || 'N/A'}</td>
                  <td className={`px-8 py-5 text-right font-mono text-xs ${viewScope === 'Compliance Alerts' ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                    {unit.Next_Test_Due}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}