import { useState, useEffect, useCallback } from "react";
import { QrCode, CalendarDays, Clock3, MapPin, Ticket, Copy, Check, Download, RefreshCw, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api";
import { formatEventDate } from "../../lib/utils";

function MyQRCode() { 
  const { user } = useAuth(); 
  const { events: contextEvents, getRegistrations } = useEvents(); 
  const [directRegistrations, setDirectRegistrations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  const fetchStudentPasses = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      const data = await apiRequest("/student/registrations");
      if (Array.isArray(data)) {
        setDirectRegistrations(data);
      }
    } catch (err) {
      console.warn("Direct student passes fetch notice:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentPasses(false);
    const interval = setInterval(() => {
      fetchStudentPasses(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchStudentPasses]);

  // Combine direct fetched passes with events list, fallback to context
  const rawRegistrations = directRegistrations ?? (user ? getRegistrations(user.id) : []);

  const registeredEvents = rawRegistrations.map((reg) => {
    const event = contextEvents.find(e => String(e.id) === String(reg.event_id || reg.eventId));
    return {
      id: reg.event_id || reg.eventId,
      title: reg.event_title || event?.title || `Event #${reg.event_id}`,
      event_date: reg.event_date || event?.event_date || event?.date,
      time: reg.time || event?.time || event?.start_time,
      venue: reg.location || event?.venue || event?.location,
      department: reg.department || event?.department,
      registration_id: reg.registration_id || reg.id,
      qr_token: reg.qr_token,
      attendance_status: reg.status,
      checked_in_at: reg.checked_in_at
    };
  }).filter(item => Boolean(item.qr_token));

  const handleCopy = (token) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => {
      setCopiedToken(null);
    }, 2000);
  };

  const downloadQR = (eventId, eventTitle) => {
    try {
      const svg = document.getElementById(`qr-svg-${eventId}`);
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width + 40;
        canvas.height = img.height + 40;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `ticket-${(eventTitle || "pass").replace(/[^a-zA-Z0-9]/g, "_")}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (e) {
      console.warn("Could not export QR png:", e);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-[#FBFBFA] flex flex-col items-center py-6 px-4 sm:px-6">
      
      {/* HEADER SECTION */}
      <div className="text-center mb-6 max-w-sm w-full">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-[#102a43] text-white rounded-xl mb-3 shadow-xs">
          <QrCode size={20} strokeWidth={2} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#102a43]">
            Digital Passes
          </h1>
          <button 
            type="button" 
            onClick={() => fetchStudentPasses(false)} 
            disabled={isRefreshing}
            title="Refresh passes"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 bg-white transition-colors cursor-pointer disabled:opacity-40"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#102a43]" : ""} />
          </button>
        </div>
        <p className="text-[#787774] text-xs sm:text-sm mt-1">
          Present QR ticket at the gate for instant attendance check-in.
        </p>
      </div>
      
      {/* PASSES CONTAINER */}
      <div className="w-full max-w-sm flex flex-col gap-6">
        {registeredEvents.map((event) => (
          <div 
            key={event.registration_id || event.id}
            className="w-full relative shadow-sm rounded-2xl overflow-hidden bg-white border border-[#EAEAEA]"
          >
            {/* TICKET TOP: EVENT DETAILS */}
            <div className="bg-[#102a43] text-white p-5 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20 text-[#f97316]">
                  <Ticket size={12} /> STUDENT PASS
                </span>
                {event.attendance_status === "attended" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    ✓ ATTENDED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    READY TO SCAN
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold leading-snug mb-3 text-white">{event.title}</h3>
              
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-white/80">
                <div>
                  <p className="text-white/50 uppercase text-[9px] tracking-wider">Date</p>
                  <p className="flex items-center gap-1 mt-0.5">
                    <CalendarDays size={12} className="text-white/60"/> 
                    {formatEventDate(event.event_date)}
                  </p>
                </div>
                <div>
                  <p className="text-white/50 uppercase text-[9px] tracking-wider">Time</p>
                  <p className="flex items-center gap-1 mt-0.5">
                    <Clock3 size={12} className="text-white/60"/> 
                    {event.time || "TBA"}
                  </p>
                </div>
                <div className="col-span-2 mt-1">
                  <p className="text-white/50 uppercase text-[9px] tracking-wider">Venue</p>
                  <p className="flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-white/60"/> 
                    {event.venue || "Campus Venue"}
                  </p>
                </div>
              </div>
            </div>

            {/* TICKET PERFORATION DIVIDER */}
            <div className="relative h-6 bg-white flex items-center justify-between z-20">
              <div className="w-5 h-5 bg-[#FBFBFA] rounded-full -ml-2.5 absolute left-0 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.05)]" />
              <div className="flex-1 border-t-2 border-dashed border-[#EAEAEA] mx-4" />
              <div className="w-5 h-5 bg-[#FBFBFA] rounded-full -mr-2.5 absolute right-0 shadow-[inset_2px_0_4px_rgba(0,0,0,0.05)]" />
            </div>

            {/* TICKET BOTTOM: HIGH-CONTRAST QR CODE */}
            <div className="bg-white p-6 pt-2 flex flex-col items-center">
              <div className="bg-white p-3 border-2 border-slate-100 rounded-2xl shadow-xs mb-3 flex items-center justify-center">
                <QRCodeSVG 
                  id={`qr-svg-${event.id}`}
                  value={event.qr_token} 
                  size={220} 
                  bgColor="#ffffff" 
                  fgColor="#000000" 
                  level="Q"
                  includeMargin={true}
                />
              </div>

              {event.attendance_status === "attended" ? (
                <div className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center mb-3">
                  <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                    <span>✓ Verified & Attendance Recorded</span>
                  </p>
                  {event.checked_in_at && (
                    <p className="text-[10px] text-emerald-600 mt-0.5 font-mono">
                      Timestamp: {new Date(event.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-full p-2 bg-amber-50/70 border border-amber-200/60 rounded-xl text-center mb-3">
                  <p className="text-[11px] font-semibold text-amber-900">
                    Hold QR code steady in front of organizer camera
                  </p>
                </div>
              )}

              {/* TOKEN DISPLAY & BACKUP COPY/DOWNLOAD ACTIONS */}
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Pass Token ID</p>
                  <code className="text-[11px] font-mono text-slate-700 block truncate select-all">
                    {event.qr_token}
                  </code>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(event.qr_token)}
                    title="Copy token ID"
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  >
                    {copiedToken === event.qr_token ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadQR(event.id, event.title)}
                    title="Download ticket image"
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        ))}

        {registeredEvents.length === 0 && !isLoading && (
          <div className="w-full text-center p-8 border border-[#EAEAEA] border-dashed rounded-2xl bg-white">
            <div className="w-12 h-12 bg-[#F7F6F3] rounded-full flex items-center justify-center mx-auto mb-3 text-[#787774]">
              <Ticket size={20} />
            </div>
            <p className="text-[#111111] font-bold text-base mb-1">No Active Passes Found</p>
            <p className="text-[#787774] text-xs mb-4">You have not registered for any upcoming events yet.</p>
            <Link 
              to="/student/events"
              className="inline-flex items-center gap-1.5 bg-[#102a43] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0a1c2e] transition-colors"
            >
              <span>Browse Events</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
      
    </div>
  ); 
}

export default MyQRCode;
