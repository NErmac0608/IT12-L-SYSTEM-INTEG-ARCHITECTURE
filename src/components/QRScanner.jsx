import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  Camera, 
  FlipHorizontal, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Volume2, 
  VolumeX, 
  RefreshCw,
  Clock,
  UserCheck,
  ShieldAlert,
  Upload
} from "lucide-react";
import { apiRequest } from "../services/api";

// Web Audio API Sound Synthesizer (Zero external audio asset dependency)
function playAudioFeedback(type, soundEnabled = true) {
  if (!soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === "success") {
      // High, crisp, pleasant dual-tone chime (880Hz -> 1760Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "warning") {
      // Double warning pulse for duplicate check-ins (440Hz -> 330Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.setValueAtTime(330, now + 0.1);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.22);
    } else {
      // Low buzz for invalid/rejected passes (220Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {
    // AudioContext blocked by browser policy until user interaction
  }
}

export default function QRScanner({ eventId = null, eventTitle = "" }) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [cameraFacing, setCameraFacing] = useState("environment"); // 'environment' | 'user'
  const [cameraError, setCameraError] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastScannedTextRef = useRef("");
  const lastScannedTimeRef = useRef(0);

  // Stop camera safely and release hardware stream
  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.warn("Camera stop notice:", err);
      }
      setIsScanning(false);
    }
  }, []);

  // Handle incoming decoded QR text
  const handleDecodedText = useCallback(async (decodedText) => {
    const now = Date.now();
    // Scan Debounce & Throttling: Ignore identical scans within 2 seconds or while in-flight
    if (isProcessingRef.current) return;
    if (decodedText === lastScannedTextRef.current && (now - lastScannedTimeRef.current) < 2000) {
      return;
    }

    isProcessingRef.current = true;
    lastScannedTextRef.current = decodedText;
    lastScannedTimeRef.current = now;

    try {
      const payload = {
        qr_token_string: decodedText.trim(),
      };
      if (eventId) {
        payload.event_id = eventId;
      }

      const res = await apiRequest("/attendance/scan", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        playAudioFeedback("success", soundEnabled);
        const scanData = {
          type: "success",
          title: "Attendance Recorded",
          message: res.message || "Student check-in successfully recorded.",
          studentName: res.attendance?.studentName || "Attendee",
          timestamp: res.attendance?.checkedInAt || new Date().toISOString(),
          eventTitle: res.attendance?.eventTitle || eventTitle,
        };
        setScanResult(scanData);
        setRecentScans(prev => [scanData, ...prev.slice(0, 4)]);
      }
    } catch (err) {
      const errMsg = err.message || "Failed to process scan.";
      if (errMsg.includes("already been redeemed")) {
        playAudioFeedback("warning", soundEnabled);
        const scanData = {
          type: "warning",
          title: "Already Checked In",
          message: "This QR pass has already been used for attendance.",
          studentName: "Verified Attendee",
          timestamp: new Date().toISOString(),
          eventTitle: eventTitle,
        };
        setScanResult(scanData);
        setRecentScans(prev => [scanData, ...prev.slice(0, 4)]);
      } else {
        playAudioFeedback("error", soundEnabled);
        setScanResult({
          type: "error",
          title: "Check-in Rejected",
          message: errMsg,
          timestamp: new Date().toISOString(),
          eventTitle: eventTitle,
        });
      }
    } finally {
      // Re-enable processing after 1.5s lock
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1500);
    }
  }, [eventId, eventTitle, soundEnabled]);

  // Enumerate cameras safely after mounting
  useEffect(() => {
    let isMounted = true;
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (!isMounted) return;
          if (devices && devices.length > 0) {
            setCameraDevices(devices);
            const backCam = devices.find(d => 
              d.label.toLowerCase().includes("back") || 
              d.label.toLowerCase().includes("rear") || 
              d.label.toLowerCase().includes("environment")
            );
            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          }
        })
        .catch((err) => {
          console.warn("Camera device enumeration notice:", err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // Start or restart the camera with multiple progressive fallbacks
  const startCamera = useCallback(async (camIdOrFacing = null) => {
    setCameraError(null);
    await stopCamera();

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("scanner-reader-viewport");
      }

      const config = {
        fps: 15,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
      };

      const targetCamera = camIdOrFacing || selectedCameraId;

      // 1. Try target device ID if available
      if (targetCamera && typeof targetCamera === "string" && targetCamera.length > 15) {
        try {
          await scannerRef.current.start(
            targetCamera,
            config,
            handleDecodedText,
            () => {}
          );
          setIsScanning(true);
          return;
        } catch (idErr) {
          console.warn("Direct camera ID start failed, trying facingMode:", idErr);
        }
      }

      // 2. Try cameraFacing ('environment' or 'user')
      try {
        await scannerRef.current.start(
          { facingMode: cameraFacing },
          config,
          handleDecodedText,
          () => {}
        );
        setIsScanning(true);
        return;
      } catch (faceErr) {
        console.warn(`FacingMode '${cameraFacing}' start failed, trying alternate:`, faceErr);
      }

      // 3. Alternate facingMode
      const alternateFacing = cameraFacing === "environment" ? "user" : "environment";
      await scannerRef.current.start(
        { facingMode: alternateFacing },
        config,
        handleDecodedText,
        () => {}
      );
      setCameraFacing(alternateFacing);
      setIsScanning(true);
    } catch (err) {
      console.error("Camera startup failed across all attempts:", err);
      const isPermission = err?.message?.toLowerCase().includes("permission") || err?.name === "NotAllowedError";
      const isInUse = err?.name === "NotReadableError" || err?.message?.toLowerCase().includes("in use");

      if (isPermission) {
        setCameraError("Camera permission was denied. Please allow camera access in your browser settings (click the lock/camera icon in your URL bar).");
      } else if (isInUse) {
        setCameraError("Unable to connect to camera device. Please verify your camera is not in use by another app (e.g., Zoom, Teams, Discord) or browser tab.");
      } else {
        setCameraError(`Camera connection error: ${err.message || "Device unavailable"}. You can also upload a QR code image below.`);
      }
      setIsScanning(false);
    }
  }, [selectedCameraId, cameraFacing, handleDecodedText, stopCamera]);

  // Toggle Front / Rear camera
  const toggleCameraFacing = useCallback(async () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    if (isScanning) {
      await stopCamera();
      // Restart with new facingMode
      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode("scanner-reader-viewport");
        }
        await scannerRef.current.start(
          { facingMode: nextFacing },
          { fps: 15, qrbox: { width: 260, height: 260 }, aspectRatio: 1.0 },
          handleDecodedText,
          () => {}
        );
        setIsScanning(true);
      } catch (err) {
        console.warn("Toggle camera failed:", err);
      }
    }
  }, [cameraFacing, isScanning, stopCamera, handleDecodedText]);

  // Switch camera by ID
  const handleCameraChange = async (newId) => {
    setSelectedCameraId(newId);
    if (isScanning) {
      await startCamera(newId);
    }
  };

  // Handle image file upload for scanning without camera
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("scanner-reader-viewport");
      }
      const decoded = await scannerRef.current.scanFile(file, true);
      handleDecodedText(decoded);
    } catch {
      playAudioFeedback("error", soundEnabled);
      setScanResult({
        type: "error",
        title: "No QR Code Detected",
        message: "Could not detect a readable QR code in the uploaded image. Please try a clearer picture.",
        timestamp: new Date().toISOString(),
        eventTitle: eventTitle,
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleScanNext = () => {
    setScanResult(null);
    lastScannedTextRef.current = "";
  };

  // Guaranteed unmount cleanup
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {}).then(() => {
              scannerRef.current?.clear();
            });
          } else {
            scannerRef.current.clear();
          }
        } catch {
          // Ignore unmount cleanup noise
        }
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6">
      
      {/* SCANNER CONTAINER */}
      <div className="w-full bg-[#102a43] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
        
        {/* TOP BAR / CONTROLS */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-300 font-bold">Live Terminal</p>
            <h3 className="text-lg font-semibold text-white">
              {eventTitle ? `Scanning: ${eventTitle}` : "Attendance Scanner"}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {cameraDevices.length > 1 && (
              <select
                value={selectedCameraId}
                onChange={(e) => handleCameraChange(e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-white/10 text-white text-xs border border-white/20 focus:outline-none"
              >
                {cameraDevices.map((d, idx) => (
                  <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                    {d.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => setSoundEnabled(s => !s)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={soundEnabled ? "Mute audio cues" : "Enable audio cues"}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <button
              type="button"
              onClick={toggleCameraFacing}
              disabled={!isScanning}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-40 transition-colors flex items-center space-x-1 cursor-pointer"
              title="Switch camera (Front / Rear)"
            >
              <FlipHorizontal size={18} />
              <span className="text-xs font-mono hidden sm:inline">
                {cameraFacing === "environment" ? "Rear" : "Front"}
              </span>
            </button>
          </div>
        </div>

        {/* HIDDEN FILE INPUT FOR IMAGE SCANNING FALLBACK */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />

        {/* CAMERA VIEWPORT & VIEWFINDER */}
        <div className="relative my-6 aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-black/60 flex items-center justify-center border border-white/10">
          
          {/* HTML5-QRCODE TARGET DIV */}
          <div id="scanner-reader-viewport" className="w-full h-full overflow-hidden" />

          {/* VIEWFINDER OVERLAY BRACKETS (Visible when scanning) */}
          {isScanning && !scanResult && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 relative border-2 border-white/20 rounded-2xl">
                {/* Glowing Corner Brackets */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                
                {/* Sweeping Laser Scan Line */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce duration-1000 mt-28" />
              </div>
            </div>
          )}

          {/* IDLE / PERMISSION PROMPT */}
          {!isScanning && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0a1926]/90 backdrop-blur-sm z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-3 text-emerald-400">
                <Camera size={32} />
              </div>
              <p className="font-semibold text-base mb-1">Camera Standby</p>
              <p className="text-xs text-slate-400 mb-5 max-w-xs">
                Activate the lens or upload a saved ticket QR image.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs justify-center">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                >
                  Start Camera
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload size={14} />
                  <span>Scan Image File</span>
                </button>
              </div>
            </div>
          )}

          {/* CAMERA ERROR DISPLAY */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-red-950/90 backdrop-blur-sm z-10 text-red-200">
              <ShieldAlert size={36} className="text-red-400 mb-2" />
              <p className="font-bold text-sm mb-1 text-white">Camera Access Notice</p>
              <p className="text-xs mb-4 max-w-xs text-red-300 leading-relaxed">{cameraError}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Retry Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Upload size={13} />
                  <span>Upload QR Image</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="flex items-center justify-between pt-2">
          {isScanning ? (
            <button
              type="button"
              onClick={stopCamera}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              Stop Camera
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Upload size={13} />
              <span>Or choose image file</span>
            </button>
          )}

          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <span className={`inline-block w-2 h-2 rounded-full ${isScanning ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
            <span>{isScanning ? "Scanner Active" : "Offline"}</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC SCAN RESULT MODAL / BANNER */}
      {scanResult && (
        <div className={`w-full rounded-2xl p-6 border shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          scanResult.type === "success"
            ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
            : scanResult.type === "warning"
            ? "bg-amber-50/90 border-amber-200 text-amber-950"
            : "bg-rose-50/90 border-rose-200 text-rose-950"
        }`}>
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-2xl shrink-0 ${
              scanResult.type === "success"
                ? "bg-emerald-500 text-white"
                : scanResult.type === "warning"
                ? "bg-amber-500 text-white"
                : "bg-rose-500 text-white"
            }`}>
              {scanResult.type === "success" && <CheckCircle2 size={24} />}
              {scanResult.type === "warning" && <AlertTriangle size={24} />}
              {scanResult.type === "error" && <XCircle size={24} />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  scanResult.type === "success"
                    ? "bg-emerald-200/60 text-emerald-800"
                    : scanResult.type === "warning"
                    ? "bg-amber-200/60 text-amber-800"
                    : "bg-rose-200/60 text-rose-800"
                }`}>
                  {scanResult.title}
                </span>

                <button
                  type="button"
                  onClick={handleScanNext}
                  className="text-xs font-bold underline hover:opacity-80 transition-opacity cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

              {scanResult.studentName && (
                <h4 className="text-xl font-bold mt-1 text-slate-900">
                  {scanResult.studentName}
                </h4>
              )}

              <p className="text-xs mt-1 opacity-80">
                {scanResult.message}
              </p>

              <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-black/10 text-xs font-mono opacity-70">
                <span className="flex items-center space-x-1">
                  <Clock size={13} />
                  <span>{new Date(scanResult.timestamp).toLocaleTimeString()}</span>
                </span>
                {scanResult.eventTitle && (
                  <span className="truncate max-w-[200px]">
                    {scanResult.eventTitle}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 flex justify-end">
            <button
              type="button"
              onClick={handleScanNext}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer ${
                scanResult.type === "success"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : scanResult.type === "warning"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-rose-600 hover:bg-rose-700 text-white"
              }`}
            >
              Scan Next Ticket →
            </button>
          </div>
        </div>
      )}

      {/* RECENT SCANS LEDGER */}
      {recentScans.length > 0 && (
        <div className="w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-slate-700 font-semibold text-xs uppercase tracking-wider">
              <UserCheck size={16} className="text-emerald-600" />
              <span>Session Check-in Ledger</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">{recentScans.length} logged</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentScans.map((scan, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{scan.studentName}</p>
                  <p className="text-[11px] text-slate-400">{scan.eventTitle || "Event Admission"}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    scan.type === "success" 
                      ? "bg-emerald-100 text-emerald-800" 
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {scan.type === "success" ? "Attended" : "Duplicate"}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
