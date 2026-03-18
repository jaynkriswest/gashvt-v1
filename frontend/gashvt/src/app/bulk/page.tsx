'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function BulkProcessingView({ userProfile }: { userProfile: any }) {
  const [cylinders, setCylinders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingBatch, setUpdatingBatch] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchCylinders() {
      // Use 'owner_company' to align with RLS policy
      let query = supabase.from('cylinders').select('Cylinder_ID, batch_id, Status, owner_company');
      
      if (userProfile?.role !== 'Admin' && userProfile?.client_link) {
        query = query.eq('owner_company', userProfile.client_link);
      }

      const { data } = await query.order('batch_id', { ascending: true });
      if (data) setCylinders(data);
      setLoading(false);
    }
    fetchCylinders();
  }, [userProfile, supabase]);

  // Grouping logic for conciseness
  const batches = cylinders.reduce((acc: any, curr) => {
    const batchId = curr.batch_id || 'UNBATCHED';
    if (!acc[batchId]) acc[batchId] = [];
    acc[batchId].push(curr);
    return acc;
  }, {});

  // Update EVERY cylinder in a specific batch
  const handleBatchUpdate = async (batchId: string, newStatus: string) => {
    setUpdatingBatch(batchId);
    const { error } = await supabase
      .from('cylinders')
      .update({ Status: newStatus })
      .eq('batch_id', batchId);

    if (!error) {
      setCylinders(prev => prev.map(c => 
        c.batch_id === batchId ? { ...c, Status: newStatus } : c
      ));
    }
    setUpdatingBatch(null);
  };

  // Update just one cylinder (the outlier)
  const handleSingleUpdate = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('cylinders')
      .update({ Status: newStatus })
      .eq('Cylinder_ID', id);

    if (!error) {
      setCylinders(prev => prev.map(c => 
        c.Cylinder_ID === id ? { ...c, Status: newStatus } : c
      ));
    }
  };

  return (
    <div className="space-y-8">
      {Object.keys(batches).map(batchId => (
        <div key={batchId} className="bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* BATCH HEADER - CONCISE VIEW */}
          <div className="bg-slate-900/80 p-4 flex justify-between items-center border-b border-slate-800">
            <div>
              <h3 className="text-blue-400 font-black text-xs uppercase tracking-widest">{batchId}</h3>
              <p className="text-slate-500 text-[9px] font-mono">{batches[batchId].length} UNITS DETECTED</p>
            </div>
            
            {/* MASS UPDATE OPTIONS */}
            <div className="flex gap-2">
              <span className="text-[9px] text-slate-500 font-bold self-center mr-2">BATCH ACTION:</span>
              <button 
                onClick={() => handleBatchUpdate(batchId, 'FULL')}
                className="bg-blue-600/10 border border-blue-500/30 text-blue-500 text-[9px] px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition-all"
              >
                MARK ALL FULL
              </button>
              <button 
                onClick={() => handleBatchUpdate(batchId, 'EMPTY')}
                className="bg-slate-800 border border-slate-700 text-slate-400 text-[9px] px-3 py-1 rounded hover:bg-slate-700 transition-all"
              >
                RESET TO EMPTY
              </button>
            </div>
          </div>

          {/* INDIVIDUAL UNIT OVERRIDES (Scrollable list) */}
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/50">
            {batches[batchId].map((unit: any) => (
              <div key={unit.Cylinder_ID} className="grid grid-cols-3 p-3 items-center hover:bg-slate-800/20">
                <span className="text-white font-mono text-[10px]">{unit.Cylinder_ID}</span>
                
                {/* Status Dropdown for outliers like DAMAGED */}
                <select 
                  value={unit.Status}
                  onChange={(e) => handleSingleUpdate(unit.Cylinder_ID, e.target.value)}
                  className="bg-transparent text-slate-400 text-[10px] uppercase font-bold outline-none cursor-pointer"
                >
                  <option value="EMPTY">EMPTY</option>
                  <option value="FULL">FULL</option>
                  <option value="Damaged">DAMAGED</option> {/* Case-sensitive to DB */}
                  <option value="TESTING">TESTING</option>
                </select>

                <div className="text-right">
                   {unit.Status === 'Damaged' && <span className="text-red-500 text-[8px] font-black border border-red-500/30 px-2 py-0.5 rounded">FLAGGED</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}