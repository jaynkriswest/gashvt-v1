'use client'
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function BulkProcessingView() {
  const [batchId, setBatchId] = useState('');
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<{[key: string]: string}>({});
  
  const supabase = createClient();

  const handleLoadBatch = async () => {
    if (!batchId) return;
    setLoading(true);
    const { data } = await supabase
      .from('cylinders')
      .select('*')
      .eq('batch_id', batchId.toUpperCase().trim());

    if (data) {
      setUnits(data);
      const initialMap: {[key: string]: string} = {};
      data.forEach(unit => {
        initialMap[unit.Cylinder_ID] = unit.Status || 'Empty';
      });
      setSelectedStatuses(initialMap);
    }
    setLoading(false);
  };

  // Helper to set every unit in the current batch to the same status
  const setAllToStatus = (status: string) => {
    const newMap = { ...selectedStatuses };
    units.forEach(u => {
      newMap[u.Cylinder_ID] = status;
    });
    setSelectedStatuses(newMap);
  };

  const handleUpdate = async (id: string) => {
    setUpdatingId(id);
    const newStatus = selectedStatuses[id];

    const { error } = await supabase
      .from('cylinders')
      .update({ Status: newStatus })
      .eq('Cylinder_ID', id);

    if (!error) {
      setUnits(units.map(u => u.Cylinder_ID === id ? { ...u, Status: newStatus } : u));
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* 1. TOP CONTROL BAR */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1117] p-6 rounded-2xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tighter uppercase">Batch Operation Hub</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Update status by Batch ID</p>
        </div>
        
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="ENTER BATCH ID..." 
            className="bg-[#010409] border border-slate-700 rounded-xl px-5 py-2 text-xs text-white font-mono focus:border-blue-500 outline-none w-48 transition-all"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
          />
          <button 
            onClick={handleLoadBatch}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
          >
            {loading ? 'Syncing...' : 'Load Records'}
          </button>
        </div>
      </div>

      {units.length > 0 ? (
        <div className="space-y-4">
          {/* 2. QUICK ACTIONS BAR */}
          <div className="flex items-center gap-4 bg-blue-600/5 p-4 rounded-xl border border-blue-500/20">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-2">Quick Set All:</span>
            <div className="flex gap-2">
              {['Full', 'Empty', 'In-Use'].map((s) => (
                <button
                  key={s}
                  onClick={() => setAllToStatus(s)}
                  className="bg-[#0d1117] hover:bg-slate-800 text-slate-300 text-[9px] font-bold px-3 py-1 rounded-md border border-slate-700 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 3. BATCH TABLE */}
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#161b22] text-slate-500 uppercase text-[10px] font-black border-b border-slate-800">
                <tr>
                  <th className="px-8 py-5">Cylinder Identity</th>
                  <th className="px-8 py-5">Current Status</th>
                  <th className="px-8 py-5">New Assignment</th>
                  <th className="px-8 py-5 text-right">Commit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {units.map((unit) => (
                  <tr key={unit.Cylinder_ID} className="hover:bg-blue-600/5 transition-all group">
                    <td className="px-8 py-5 font-mono text-blue-400 font-bold">{unit.Cylinder_ID}</td>
                    <td className="px-8 py-5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        unit.Status === 'Empty' ? 'bg-slate-800 text-slate-400' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {unit.Status || 'Empty'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <select 
                        value={selectedStatuses[unit.Cylinder_ID]}
                        onChange={(e) => setSelectedStatuses({
                          ...selectedStatuses,
                          [unit.Cylinder_ID]: e.target.value
                        })}
                        className="bg-[#010409] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none cursor-pointer focus:border-blue-500 transition-all"
                      >
                        <option value="Full">Full</option>
                        <option value="Empty">Empty</option>
                        <option value="Damaged">Damaged</option>
                        <option value="In-Use">In-Use</option>
                      </select>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleUpdate(unit.Cylinder_ID)}
                        disabled={updatingId === unit.Cylinder_ID}
                        className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                          updatingId === unit.Cylinder_ID 
                          ? 'bg-slate-800 text-slate-600' 
                          : 'bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white border border-slate-700 hover:border-blue-500'
                        }`}
                      >
                        {updatingId === unit.Cylinder_ID ? 'Saving...' : 'Update'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#0d1117] border-2 border-dashed border-slate-800 rounded-3xl h-64 flex flex-col items-center justify-center text-slate-600">
          <div className="text-4xl mb-4">📂</div>
          <p className="font-black uppercase text-[10px] tracking-[0.2em]">Awaiting Batch Input</p>
        </div>
      )}
    </div>
  );
}