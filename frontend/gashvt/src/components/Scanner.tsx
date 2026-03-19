'use client'
import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { createClient } from '@/utils/supabase/client';

export default function Scanner({ userProfile }: { userProfile: any }) {
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        videoConstraints: { facingMode: { ideal: "environment" } }
      },
      false
    );

    const onScanSuccess = async (decodedText: string) => {
      setIsScanning(false);
      let query = supabase.from('cylinders').select('*').eq('Cylinder_ID', decodedText.trim());

      if (userProfile?.role !== 'Admin' && userProfile?.client_link) {
        query = query.eq('Customer_Name', userProfile.client_link);
      }

      const { data } = await query.single();
      if (data) {
        setScannedResult(data);
        setError(null);
      } else {
        const errorMessage = userProfile?.role !== 'Admin' 
          ? `Unit ${decodedText} not found or belongs to another fleet.` 
          : `Unit ${decodedText} not found.`;
        setError(errorMessage);
        setScannedResult(null);
      }
    };

    scanner.render(onScanSuccess, () => {});
    return () => { scanner.clear().catch(() => {}); };
  }, [userProfile, supabase]);

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-700">
      {/* 1. FIXED: Swapped bg-[#0d1117] for bg-brand-panel and text-white for text-text-main */}
      <div className="bg-brand-panel p-6 rounded-3xl border border-brand-border shadow-2xl transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold tracking-tighter uppercase text-text-main">Scanning Terminal</h2>
          <div className={`h-2 w-2 rounded-full animate-pulse ${isScanning ? 'bg-green-500' : 'bg-slate-700'}`} />
        </div>
        
        {/* We keep the camera background black for contrast, but update the border */}
        <div id="reader" className="overflow-hidden rounded-2xl border border-brand-border bg-black" />
        
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-6 text-center">
          Center the barcode inside the frame
        </p>
      </div>

      {scannedResult && (
        <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-2xl shadow-xl animate-in slide-in-from-top-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">System Match Found</p>
              {/* FIXED: Changed text-white to text-text-main */}
              <h3 className="text-2xl font-mono font-bold text-text-main mt-1">{scannedResult.Cylinder_ID}</h3>
            </div>
            <button 
              onClick={() => { setScannedResult(null); setIsScanning(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all"
            >
              Reset
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="space-y-1">
              <p className="text-slate-500 uppercase font-bold text-[9px] tracking-tighter">Current Status</p>
              <p className="text-text-main text-xs font-semibold">{scannedResult.Status || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 uppercase font-bold text-[9px] tracking-tighter">Fleet Link</p>
              <p className="text-text-main text-xs font-semibold">{scannedResult.Customer_Name || 'None'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}