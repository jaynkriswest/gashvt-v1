'use client'
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function RecentActivityView() {
  const [recentData, setRecentData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Reusable fetch function that sorts by the new last_updated column
  const fetchRecent = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cylinders')
      .select('*')
      .order('last_updated', { ascending: false }) // This works now that you've run the SQL
      .limit(20);
    
    if (error) {
      console.error("Fetch error:", error.message);
    } else {
      setRecentData(data || []);
    }
    setLoading(false);
  }, [supabase]);

  // Initial fetch on mount
  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  // Search filter matching your specific Supabase column names
  const filteredData = recentData.filter((item) => 
    item.Cylinder_ID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batch_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.Status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header Section */}
      <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-[12px]">Latest Field Updates</h3>
            <p className="text-slate-500 text-[9px] mt-1 font-mono uppercase">Top 20 most recent scans</p>
          </div>
          
          <button 
            onClick={fetchRecent}
            disabled={loading}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-blue-500 text-xs border border-slate-800 disabled:opacity-50"
            title="Refresh Activity"
          >
            {loading ? '...' : '🔄'}
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <input 
            type="text"
            placeholder="Search Serial or Batch..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/50 text-slate-500 text-[9px] uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4 border-b border-slate-800">Identity</th>
              <th className="px-6 py-4 border-b border-slate-800">Status</th>
              <th className="px-6 py-4 border-b border-slate-800">Batch ID</th>
              <th className="px-6 py-4 border-b border-slate-800">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading && recentData.length === 0 ? (
               <tr><td colSpan={4} className="p-10 text-center text-slate-600 animate-pulse">Loading Activity...</td></tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.Cylinder_ID} className="hover:bg-blue-900/10 transition-colors group">
                  <td className="px-6 py-4 text-blue-400 font-mono text-xs font-bold">
                    {item.Cylinder_ID}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${
                      item.Status?.toLowerCase() === 'expired' 
                        ? 'bg-red-900/20 text-red-400 border border-red-900/50' 
                        : 'bg-blue-900/20 text-blue-400 border border-blue-900/50'
                    }`}>
                      {item.Status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {item.batch_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-[10px] font-mono">
                    {item.last_updated 
                      ? new Date(item.last_updated).toLocaleString([], { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      : '---'}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="p-10 text-center text-slate-700 italic text-xs">No recent activity matching your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}