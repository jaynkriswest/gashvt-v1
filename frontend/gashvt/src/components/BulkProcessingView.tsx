'use client'
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function BulkProcessingView() {
  const [batchId, setBatchId] = useState('');
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const supabase = createClient();

  // Fetches cylinders belonging to the entered Batch ID
  const handleLoadBatch = async () => {
    if (!batchId) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('cylinders')
      .select('*')
      .eq('batch_id', batchId.toUpperCase().trim()); // Standardizes Batch ID format

    if (error) {
      console.error("Fetch error:", error.message);
    } else {
      setUnits(data || []);
    }
    setLoading(false);
  };

  // Handles real-time status updates for workers
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    
    const { error } = await supabase
      .from('cylinders')
      .update({ Status: newStatus }) // Updates the Status column in Supabase
      .eq('Cylinder_ID', id);

    if (!error) {
      // Optimistically update the local UI state
      setUnits(units.map(u => u.Cylinder_ID === id ? { ...u, Status: newStatus } : u));
    } else {
      console.error("Update error:", error.message);
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Bulk Processing</h2>
          <p className="text-slate-400 text-sm">Update status for multiple units in a single batch.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="e.g. BATCH003" 
            className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoadBatch()}
          />
          <button 
            onClick={handleLoadBatch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {loading ? 'Searching...' : 'Load Batch'}
          </button>
        </div>
      </div>

      {/* Results Table Section */}
      {units.length > 0 ? (
        <div className="bg-[#1e2129] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Cylinder ID</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4 text-right">Confirmation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {units.map((unit) => (
                <tr key={unit.Cylinder_ID} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-400">{unit.Cylinder_ID}</td>
                  
                  {/* Status Dropdown - Editable by worker */}
                  <td className="px-6 py-4">
                    <select 
                      value={unit.Status || 'Empty'}
                      onChange={(e) => handleStatusUpdate(unit.Cylinder_ID, e.target.value)}
                      disabled={updatingId === unit.Cylinder_ID}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-blue-500 outline-none disabled:opacity-50 cursor-pointer hover:border-slate-500 transition-colors"
                    >
                      <option value="Full">Full</option>
                      <option value="Empty">Empty</option>
                      <option value="Damaged">Damaged</option>
                      <option value="In-Use">In-Use</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 text-right">
                    {updatingId === unit.Cylinder_ID ? (
                      <span className="text-[10px] text-blue-400 animate-pulse font-medium">Saving...</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Changes Auto-saved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#1e2129] border border-dashed border-slate-800 rounded-2xl h-64 flex flex-col items-center justify-center text-slate-500">
          <p>{loading ? 'Retrieving batch data...' : 'No batch selected.'}</p>
          <p className="text-xs mt-1 text-slate-600">Enter a valid Batch ID (e.g., BATCH001) to begin triage.</p>
        </div>
      )}
    </div>
  );
}