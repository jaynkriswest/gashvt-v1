'use client'
import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode'; // Changed to the core library for better control
import { createClient } from '@/utils/supabase/client';

export default function Scanner({ userProfile }: { userProfile: any }) {
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string, label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  const supabase = createClient();

  // 1. Fetch available cameras on mount
  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        setCameras(devices);
        setSelectedCameraId(devices[0].id);
      }
    }).catch(err => console.error("Camera fetch error:", err));

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // 2. Start/Stop Scanner logic
  const startScanning = async () => {
    if (!selectedCameraId) return;
    
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    try {
      setIsScanning(true);
      await html5QrCode.start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Handle Success
          await handleLookup(decodedText);
          stopScanning();
        },
        () => {} // Silent error (ignore frame misses)
      );
    } catch (err) {
      console.error("Start error:", err);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  };

  const handleLookup = async (id: string) => {
    let query = supabase.from('cylinders').select('*').eq('Cylinder_ID', id.trim());
    if (userProfile?.role !== 'Admin' && userProfile?.client_link) {
      query = query.eq('Customer_Name', userProfile.client_link);
    }
    const { data } = await query.single();
    if (data) setScannedResult(data);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-brand-panel p-6 rounded-3xl border border-brand-border shadow-2xl">
        
        {/* CAMERA SELECTION DROPDOWN */}
        <div className="mb-6 space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Video Source</label>
          <div className="flex gap-2">
            <select 
              className="flex-1 bg-brand-dark border border-brand-border text-text-main text-xs p-3 rounded-xl outline-none"
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              disabled={isScanning}
            >
              {cameras.map(camera => (
                <option key={camera.id} value={camera.id}>{camera.label}</option>
              ))}
            </select>
            
            <button 
              onClick={isScanning ? stopScanning : startScanning}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                isScanning ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
              }`}
            >
              {isScanning ? 'Stop' : 'Launch'}
            </button>
          </div>
        </div>

        <div id="reader" className="w-full rounded-2xl border border-brand-border bg-black overflow-hidden aspect-square" />
        
        {!isScanning && !scannedResult && (
          <div className="mt-8 text-center p-10 border-2 border-dashed border-brand-border rounded-2xl">
            <p className="text-slate-500 text-[10px] font-black uppercase">Camera Offline</p>
            <p className="text-slate-400 text-[9px] mt-1">Select your camera above and click Launch</p>
          </div>
        )}
      </div>

      {scannedResult && (
        <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-2xl animate-in slide-in-from-top-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Match Found</p>
              <h3 className="text-2xl font-mono font-bold text-text-main mt-1">{scannedResult.Cylinder_ID}</h3>
            </div>
            <button 
              onClick={() => setScannedResult(null)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}