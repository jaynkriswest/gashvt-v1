'use client'
import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { createClient } from '@/utils/supabase/client';

export default function Scanner({ userProfile }: { userProfile: any }) {
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string, label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        setCameras(devices);
        // MOBILE FIX: Try to auto-select the back camera (usually contains "back" or "0")
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
        setSelectedCameraId(backCamera.id);
      }
    }).catch(err => console.error("Camera fetch error:", err));

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCameraId) return;
    
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    try {
      setIsScanning(true);
      await html5QrCode.start(
        selectedCameraId,
        {
          fps: 20, // MOBILE FIX: Increased FPS for faster movement tracking
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // MOBILE FIX: Dynamic box size (80% of screen) to make it easier to line up
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const fontSize = Math.floor(minEdge * 0.7);
            return { width: fontSize, height: fontSize };
          },
          // MOBILE FIX: Force high-resolution if available
          videoConstraints: {
            focusMode: "continuous", // Tries to keep the barcode sharp
            whiteBalanceMode: "continuous"
          }
        },
        async (decodedText) => {
          // MOBILE FIX: Haptic Feedback (Vibrates phone on success)
          if (navigator.vibrate) navigator.vibrate(100);
          
          await handleLookup(decodedText);
          stopScanning();
        },
        () => {} 
      );
    } catch (err) {
      console.error("Start error:", err);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) { console.log("Stop error", e) }
      setIsScanning(false);
    }
  };

  const handleLookup = async (id: string) => {
    // MOBILE FIX: Trim AND Remove any hidden characters that QR codes often add
    const cleanId = id.trim().replace(/[\n\r\t]/g, ""); 
    
    let query = supabase.from('cylinders').select('*').eq('Cylinder_ID', cleanId);
    if (userProfile?.role !== 'Admin' && userProfile?.client_link) {
      query = query.eq('Customer_Name', userProfile.client_link);
    }
    const { data } = await query.single();
    if (data) setScannedResult(data);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-brand-panel p-6 rounded-3xl border border-brand-border shadow-2xl">
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
                isScanning ? 'bg-red-500 text-white' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              }`}
            >
              {isScanning ? 'Stop' : 'Launch'}
            </button>
          </div>
        </div>

        {/* CONTAINER FIX: aspect-square ensures the camera doesn't stretch on mobile */}
        <div id="reader" className="w-full rounded-2xl border border-brand-border bg-black overflow-hidden aspect-square" />
        
        {isScanning && (
           <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-4 text-center animate-pulse">
             System Active - Searching for code...
           </p>
        )}
      </div>

      {scannedResult && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Unit Verified</p>
            <h3 className="text-2xl font-mono font-bold text-text-main mt-1">{scannedResult.Cylinder_ID}</h3>
            <button onClick={() => setScannedResult(null)} className="mt-4 w-full bg-emerald-500 text-white py-2 rounded-xl text-[10px] font-black uppercase">Close Result</button>
        </div>
      )}
    </div>
  );
}