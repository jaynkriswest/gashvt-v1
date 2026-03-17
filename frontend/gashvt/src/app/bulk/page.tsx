'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function BulkProcessingView({ userProfile }: { userProfile: any }) {
  const [cylinders, setCylinders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchCylinders() {
      // Fetching specifically the columns seen in your Supabase image
      let query = supabase.from('cylinders').select('Cylinder_ID, batch_id, Status, Customer_Name');
      
      if (userProfile?.role !== 'Admin' && userProfile?.client_link) {
        query = query.eq('Customer_Name', userProfile.client_link);
      }

      const { data, error } = await query.order('Cylinder_ID', { ascending: true });
      if (data) setCylinders(data);
      setLoading(false);
    }
    fetchCylinders();
  }, [userProfile, supabase]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setCylinders(prev => prev.map(c => 
      c.Cylinder_ID === id ? { ...c, Status: newStatus } : c
    ));
  };

  const handleUpdate = async (id: string) => {
    setUpdatingId(id);
    const target = cylinders.find(c => c.Cylinder_ID === id);
    
    // The .update keys must match Supabase column names exactly
    const { error } = await supabase
      .from('cylinders')
      .update({ Status: target.Status })
      .eq('Cylinder_ID', id);

    if (error) {
      console.error("Update Error:", error.message);
      alert("Failed to update: " + error.message);
    } else {
      console.log(`Cylinder ${id} successfully updated to ${target.Status}`);
    }
    setUpdatingId(null);
  };

  return (
    <div className="bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-4 bg-slate-900/50 p-4 border-b border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-500">
        <div>Cylinder Identity</div>
        <div>Batch</div>
        <div>Status</div>
        <div className="text-right">Action</div>
      </div>

      <div className="divide-y divide-slate-800">
        {loading ? (
          <div className="p-20 text-center text-slate-500 text-[10px] font-bold uppercase animate-pulse">Connecting to Supabase...</div>
        ) : cylinders.map((cylinder) => (
          <div key={cylinder.Cylinder_ID} className="grid grid-cols-4 items-center p-4 hover:bg-slate-800/30 transition-colors">
            <div className="text-blue-400 font-mono text-xs font-bold">{cylinder.Cylinder_ID}</div>
            <div className="text-slate-500 font-mono text-[10px] uppercase">{cylinder.batch_id || '---'}</div>
            
            <div>
              <select 
                value={cylinder.Status}
                onChange={(e) => handleStatusChange(cylinder.Cylinder_ID, e.target.value)}
                className="bg-[#161b22] border border-slate-700 text-[10px] font-black uppercase text-slate-300 rounded-lg px-2 py-1.5 outline-none focus:border-blue-500 cursor-pointer appearance-none text-center min-w-[100px]"
              >
                <option value="EMPTY">EMPTY</option>
                <option value="FULL">FULL</option>
                <option value="IN-USE">IN-USE</option>
                <option value="Damaged">DAMAGED</option> {/* Matches 'Damaged' case in Supabase */}
              </select>
            </div>

            <div className="text-right">
              <button 
                onClick={() => handleUpdate(cylinder.Cylinder_ID)}
                disabled={updatingId === cylinder.Cylinder_ID}
                className="text-[9px] font-black uppercase tracking-widest text-blue-500 border border-blue-500/30 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
              >
                {updatingId === cylinder.Cylinder_ID ? 'Syncing...' : 'Update'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}