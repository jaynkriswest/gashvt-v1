'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function BulkProcessingView({ userProfile }: { userProfile: any }) {
  const [cylinders, setCylinders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const supabase = createClient();

  // 1. Fetch data based on user profile
  useEffect(() => {
    async function fetchCylinders() {
      let query = supabase.from('cylinders').select('*');
      
      // Security: Filter by client link if not an Admin
      if (userProfile?.role !== 'Admin' && userProfile?.client_link) {
        query = query.eq('Customer_Name', userProfile.client_link);
      }

      const { data, error } = await query.order('Cylinder_ID', { ascending: true });
      if (data) setCylinders(data);
      setLoading(false);
    }
    fetchCylinders();
  }, [userProfile, supabase]);

  // 2. Handle the dropdown selection change locally
  const handleStatusChange = (id: string, newStatus: string) => {
    setCylinders(prev => prev.map(c => 
      c.Cylinder_ID === id ? { ...c, Status: newStatus } : c
    ));
  };

  // 3. Save the update to Supabase
  const handleUpdate = async (id: string) => {
    setUpdatingId(id);
    const target = cylinders.find(c => c.Cylinder_ID === id);
    
    const { error } = await supabase
      .from('cylinders')
      .update({ Status: target.Status })
      .eq('Cylinder_ID', id);

    if (error) alert("Update failed: " + error.message);
    setUpdatingId(null);
  };

  const filteredCylinders = cylinders.filter(c => 
    c.Cylinder_ID.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.batch_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-white font-bold uppercase tracking-tighter">Batch Operation Hub</h2>
          <p className="text-slate-500 text-[10px] font-mono uppercase">Viewing {filteredCylinders.length} Units</p>
        </div>
        <input 
          type="text" 
          placeholder="Search Cylinder or Batch..." 
          className="bg-[#0d1117] border border-slate-800 p-3 rounded-xl text-xs text-white w-full md:w-80 outline-none focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-4 bg-slate-900/50 p-4 border-b border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-500">
          <div>Cylinder Identity</div>
          <div>Batch</div>
          <div>Status</div>
          <div className="text-right">Action</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-800">
          {loading ? (
            <div className="p-20 text-center text-slate-500 text-[10px] font-bold uppercase animate-pulse">Loading Fleet...</div>
          ) : filteredCylinders.map((cylinder) => (
            <div key={cylinder.Cylinder_ID} className="grid grid-cols-4 items-center p-4 hover:bg-slate-800/30 transition-colors">
              <div className="text-blue-400 font-mono text-xs font-bold">{cylinder.Cylinder_ID}</div>
              <div className="text-slate-500 font-mono text-[10px] uppercase">{cylinder.batch_id || 'N/A'}</div>
              
              {/* THE DROPDOWN FIX */}
              <div>
                <select 
                  value={cylinder.Status}
                  onChange={(e) => handleStatusChange(cylinder.Cylinder_ID, e.target.value)}
                  className="bg-[#161b22] border border-slate-700 text-[10px] font-black uppercase text-slate-300 rounded-lg px-2 py-1.5 outline-none focus:border-blue-500 cursor-pointer appearance-none text-center min-w-[90px]"
                >
                  <option value="EMPTY">EMPTY</option>
                  <option value="FULL">FULL</option>
                  <option value="IN-USE">IN-USE</option>
                  <option value="DAMAGED">DAMAGED</option>
                  <option value="TESTING">TESTING</option>
                </select>
              </div>

              <div className="text-right">
                <button 
                  onClick={() => handleUpdate(cylinder.Cylinder_ID)}
                  disabled={updatingId === cylinder.Cylinder_ID}
                  className="text-[9px] font-black uppercase tracking-widest text-blue-500 border border-blue-500/30 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                >
                  {updatingId === cylinder.Cylinder_ID ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-slate-900/30 text-center border-t border-slate-800">
          <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">End of Results — Use search to find specific units</p>
        </div>
      </div>
    </div>
  );
}