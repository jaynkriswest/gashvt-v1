'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Zap, CreditCard } from 'lucide-react';

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        const { data: sData } = await supabase.from('services').select('*');
        setProfile(pData);
        setServices(sData || []);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Safe calculation to prevent null errors
  const totalCost = selectedService ? (selectedService.base_price + (profile?.service_markup || 0)) : 0;

  if (loading) return <div className="p-20 text-blue-500 animate-pulse font-black uppercase">Syncing Ledger...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Real Balance Card */}
          <div className="bg-brand-panel border border-brand-border p-6 rounded-2xl mb-8">
            <p className="text-slate-500 text-[10px] font-bold uppercase">Current Balance</p>
            <h2 className="text-4xl font-black text-blue-500">${profile?.balance?.toFixed(2) || "0.00"}</h2>
          </div>
          
          {/* ... Transaction table goes here ... */}
        </div>

        {/* Dynamic Price Calculator */}
        <div className="bg-brand-panel border border-blue-500/30 p-6 rounded-2xl h-fit">
          <h3 className="text-[10px] font-black uppercase text-blue-500 mb-6 flex items-center gap-2">
            <Zap size={14} /> Settlement Calculator
          </h3>
          <select 
            onChange={(e) => setSelectedService(services.find(s => s.id === e.target.value))}
            className="w-full bg-brand-dark border border-brand-border p-3 rounded-xl text-xs mb-6 text-white"
          >
            <option value="">Select Service...</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
          </select>

          {selectedService && (
            <div className="space-y-3 pt-4 border-t border-brand-border">
              <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                <span>Total Due:</span>
                <span className="text-white text-xl">${totalCost.toFixed(2)}</span>
              </div>
              <button className="w-full bg-blue-600 p-4 rounded-xl font-black text-[10px] uppercase">
                Authorize Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}