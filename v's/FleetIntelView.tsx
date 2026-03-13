'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function FleetIntelView() {
  const [cylinders, setCylinders] = useState<any[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [filterCompany, setFilterCompany] = useState('All Companies');
  const [viewScope, setViewScope] = useState('Master Inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [filterCompany, viewScope, searchQuery]);

  async function fetchData() {
    setLoading(true);
    const { data: allData } = await supabase.from('cylinders').select('*');

    if (allData) {
      const uniqueCompanies = Array.from(new Set(allData.map(c => c.Customer_Name))).filter(Boolean) as string[];
      setCompanies(uniqueCompanies.sort());

      let filtered = allData;
      
      if (filterCompany !== 'All Companies') {
        filtered = filtered.filter(c => c.Customer_Name === filterCompany);
      }

      if (viewScope === 'Compliance Only') {
        filtered = filtered.filter(c => {
          const dueDate = new Date(c.Next_Test_Due);
          const today = new Date();
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(today.getDate() + 30);
          return dueDate <= thirtyDaysFromNow;
        });
      }

      if (searchQuery) {
        filtered = filtered.filter(c => 
          c.Cylinder_ID.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.batch_id.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setCylinders(filtered);
    }
    setLoading(false);
  }

  // --- THIS FUNCTION MUST BE INSIDE THE COMPONENT ---
  const handleExport = () => {
    if (cylinders.length === 0) return;

    const fileName = viewScope === 'Compliance Only' ? 'compliance_report.csv' : 'master_inventory.csv';
    const headers = "Cylinder_ID,Batch,Status,Customer,Due_Date\n";
    const rows = cylinders.map(c => 
      `${c.Cylinder_ID},${c.batch_id || ''},${c.Status || ''},${c.Customer_Name || ''},${c.Next_Test_Due || ''}`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const urgentCount = cylinders.filter(c => {
    const dueDate = new Date(c.Next_Test_Due);
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    return dueDate <= sevenDaysFromNow;
  }).length;

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex justify-between items-center bg-[#0d1117] p-4 rounded-xl border border-slate-800">
        <div className="flex gap-4 flex-1 max-w-2xl">
          <div className="flex bg-[#010409] border border-slate-800 rounded-lg p-1">
            {['Master Inventory', 'Compliance Only'].map((opt) => (
              <button 
                key={opt}
                onClick={() => setViewScope(opt)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${viewScope === opt ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
              >
                {opt}
              </button>
            ))}
          </div>

          <input 
            type="text"
            placeholder="Search ID or Batch..."
            className="bg-[#010409] border border-slate-800 text-white text-xs rounded-lg px-4 py-1.5 outline-none focus:border-blue-500 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select 
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="bg-[#010409] border border-slate-800 text-white text-xs rounded-lg px-3 outline-none"
          >
            <option>All Companies</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        
        {/* The button that calls handleExport */}
        <button 
          onClick={handleExport} 
          className="bg-[#161b22] hover:bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2"
        >
          💾 Export {viewScope === 'Compliance Only' ? 'Compliance' : 'Inventory'}
        </button>
      </div>

      {/* Hero Section */}
      <div className="flex gap-6 items-stretch">
        <div className="w-1/4 bg-[#161b22] border border-slate-800 p-6 rounded-xl flex flex-col justify-center">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            {viewScope === 'Compliance Only' ? 'Compliance Scope' : 'Total Inventory'}
          </p>
          <p className="text-4xl font-bold mt-1 text-white">{cylinders.length}</p>
        </div>
        
        <div className="flex-1 bg-red-950/20 border border-red-900/40 text-red-500 p-6 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl">⚠️</span>
            <span className="text-lg font-bold uppercase tracking-tight">{urgentCount} Units require immediate action</span>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30 uppercase tracking-tighter">Priority: High</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="max-h-[600px] overflow-y-auto scrollbar-hide">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="sticky top-0 bg-[#0d1117] z-10 text-slate-500 uppercase text-[10px] font-black border-b border-slate-800">
              <tr>
                <th className="px-6 py-5">Cylinder ID</th>
                {viewScope === 'Master Inventory' && <th className="px-6 py-5">Customer</th>}
                <th className="px-6 py-5">Batch</th>
                <th className="px-6 py-5 text-right">Status</th>
                <th className="px-6 py-5 text-right">Next Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-600 animate-pulse font-medium">Syncing Fleet Intelligence...</td></tr>
              ) : (
                cylinders.map((unit) => (
                  <tr key={unit.Cylinder_ID} className="hover:bg-blue-600/5 transition-all group">
                    <td className="px-6 py-4 font-mono text-blue-400 font-bold">{unit.Cylinder_ID}</td>
                    {viewScope === 'Master Inventory' && <td className="px-6 py-4 text-slate-300 font-medium">{unit.Customer_Name}</td>}
                    <td className="px-6 py-4 text-slate-500 text-xs tracking-tight">{unit.batch_id}</td>
                    <td className="px-6 py-4 text-right">
                       <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${unit.Status === 'Damaged' ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-500'}`}>
                        {unit.Status}
                       </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold ${new Date(unit.Next_Test_Due) < new Date() ? 'text-red-500' : 'text-slate-500'}`}>
                      {unit.Next_Test_Due}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}