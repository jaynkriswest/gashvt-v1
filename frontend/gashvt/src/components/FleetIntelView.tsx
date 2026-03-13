'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { calculateFleetMetrics } from '@/lib/logistics';
import MetricsCard from './MetricsCard';

export default function FleetIntelView() {
  const [cylinders, setCylinders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Fetching both batches and cylinders to replicate the 'Unified Data' logic
      const { data, error } = await supabase
        .from('cylinders')
        .select('*')
        .order('Cylinder_ID', { ascending: true });
      
      if (data) setCylinders(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const metrics = calculateFleetMetrics(cylinders);

  if (loading) return <div className="p-10 text-slate-500 animate-pulse">Syncing fleet data...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricsCard label="Total Inventory" value={metrics.total} />
        <MetricsCard 
          label="Urgent Testing (10d)" 
          value={metrics.urgentTesting} 
          colorClass="text-orange-500" 
        />
        <MetricsCard 
          label="Damaged Units" 
          value={metrics.damaged} 
          colorClass="text-red-500" 
        />
      </div>

      {/* Inventory Table Section */}
      <div className="bg-[#1e2129] rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-semibold text-slate-200">Master Inventory List</h3>
          <span className="text-xs text-slate-500">{cylinders.length} Records found</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Cylinder ID</th>
                <th className="px-6 py-4">Batch ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Next Test Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {cylinders.map((c) => (
                <tr key={c.Cylinder_ID} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-400">{c.Cylinder_ID}</td>
                  <td className="px-6 py-4 text-slate-300">{c.batch_id}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      c.Status === 'Damaged' 
                        ? 'bg-red-900/20 text-red-400 border border-red-900/50' 
                        : 'bg-green-900/20 text-green-400 border border-green-900/50'
                    }`}>
                      {c.Status || 'Empty'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{c.Next_Test_Due || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}