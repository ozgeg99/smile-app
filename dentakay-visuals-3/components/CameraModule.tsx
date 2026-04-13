import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Camera, Upload, RefreshCw } from 'lucide-react';

interface CameraModuleProps {
  onCapture: (imgData: string) => void;
}

const CameraModule: React.FC<CameraModuleProps> = ({ onCapture }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user'); 
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCamera = async (overrideMode?: 'user' | 'environment') => {
    const modeToUse = overrideMode || facingMode;
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser does not support camera access");
      }

      const constraints = { 
        video: { 
          facingMode: modeToUse 
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.error("Video play error:", playErr);
        }
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera. Please check permissions or use Upload.");
    }
  };

  const toggleCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    stopCamera();
    onCapture(dataUrl);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col animate-fade-in overflow-hidden">
      {/* Video Preview Area - Flex Grow to take available space */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-0">
        {stream ? (
          <video 
            ref={videoRef} 
            playsInline 
            muted 
            className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 flex-col space-y-4 p-4 text-center">
             <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-slate-700">
               <Camera className="w-8 h-8" />
             </div>
             <p className="max-w-xs text-sm">Camera inactive. Click "Enable Camera" or upload a photo.</p>
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute inset-0 bg-black/50" 
                style={{ 
                  maskImage: 'radial-gradient(ellipse 70% 65% at center, transparent 1%, black 100%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at center, transparent 1%, black 100%)' 
                }}>
           </div>
           
           <div className="absolute inset-0 flex items-center justify-center">
             {/* Responsive Overlay Box */}
             <div className="w-[75%] max-w-[320px] aspect-[3/4] border-2 border-white/30 rounded-[50%] relative">
                {stream && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan"></div>
                )}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/90 font-medium text-xs drop-shadow-md whitespace-nowrap">
                   Center your smile
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* Control Bar - Fixed Height */}
      <div className="bg-black/90 px-6 py-8 flex items-center justify-between space-x-4 flex-none">
         <button 
           onClick={() => fileInputRef.current?.click()}
           className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
           aria-label="Upload Photo"
         >
           <Upload className="w-6 h-6" />
         </button>
         <input 
           type="file" 
           ref={fileInputRef} 
           className="hidden" 
           accept="image/*" 
           onChange={handleFileUpload}
         />

         {stream ? (
           <button 
             onClick={takePhoto}
             className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group active:scale-95 transition-transform"
             aria-label="Take Photo"
           >
             <div className="w-16 h-16 bg-white rounded-full group-hover:scale-90 transition-transform" />
           </button>
         ) : (
           <button 
             onClick={() => startCamera()}
             className="px-6 py-3 bg-blue-600 rounded-full text-white font-bold whitespace-nowrap active:scale-95 transition-transform"
           >
             Enable Camera
           </button>
         )}

         {stream ? (
           <button 
             onClick={toggleCamera}
             className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
             aria-label="Switch Camera"
           >
             <RefreshCw className="w-6 h-6" />
           </button>
         ) : (
           <div className="w-14" />
         )}
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CameraModule;