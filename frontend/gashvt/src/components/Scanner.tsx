'use client'
import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { createClient } from '@/utils/supabase/client';

export default function Scanner() {
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
      // Add this to help mobile browsers pick the right camera
      videoConstraints: {
        facingMode: { ideal: "environment" } 
      }
    },
    /* verbose= */ false
  );

    // 2. Define what happens on a successful scan
    const onScanSuccess = async (decodedText: string) => {
      setIsScanning(false);
      
      // Look up the scanned ID in Supabase
      const { data, error } = await supabase
        .from('cylinders')
        .select('*')
        .eq('Cylinder_ID', decodedText.trim())
        .single();

      if (data) {
        setScannedResult(data);
        setError(null);
      } else {
        setError(`Unit ${decodedText} not found in database.`);
        setScannedResult(null);
      }
    };

    const onScanFailure = (error: any) => {
      // Logic for failed scans (usually ignored to keep the loop running)
    };

    scanner.render(onScanSuccess, onScanFailure);

    // 3. Cleanup when component unmounts
    return () => {
      scanner.clear().catch(err => console.error("Scanner cleanup failed", err));
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="bg-[#0d1117] p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold tracking-tighter uppercase">Scanning Terminal</h2>
          <div className={`h-2 w-2 rounded-full animate-pulse ${isScanning ? 'bg-green-500' : 'bg-slate-700'}`} />
        </div>
        
        {/* Camera Feed Container */}
        <div id="reader" className="overflow-hidden rounded-2xl border border-slate-700 bg-black" />
        
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-6 text-center">
          Center the barcode inside the frame
        </p>
      </div>

      {/* Scanned Data Display */}
      {scannedResult && (
        <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-2xl shadow-xl animate-in slide-in-from-top-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">System Match Found</p>
              <h3 className="text-2xl font-mono font-bold text-white mt-1">{scannedResult.Cylinder_ID}</h3>
            </div>
            <button 
              onClick={() => { setScannedResult(null); setIsScanning(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md text-[9px] font-black uppercase"
            >
              Reset
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="space-y-1">
              <p className="text-slate-500 uppercase font-bold text-[9px] tracking-tighter">Current Status</p>
              <p className="text-slate-200 text-xs font-semibold">{scannedResult.Status || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 uppercase font-bold text-[9px] tracking-tighter">Assigned Customer</p>
              <p className="text-slate-200 text-xs font-semibold">{scannedResult.Customer || 'None'}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-center">
          <p className="text-red-500 text-[10px] font-black uppercase">{error}</p>
        </div>
      )}
    </div>
  );
}