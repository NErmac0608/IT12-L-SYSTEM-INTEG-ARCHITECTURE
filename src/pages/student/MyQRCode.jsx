import { useState, useEffect, useCallback } from "react";
import { QrCode, CalendarDays, Clock3, MapPin, Ticket, Copy, Check, Download, RefreshCw, ArrowRight, User } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api";
import { formatEventDate } from "../../lib/utils";
import { downloadQRCodePass } from "../../lib/qrExport";

function MyQRCode() { 
  const { user } = useAuth(); 
  const { events: contextEvents, getRegistrations } = useEvents(); 
  const [directRegistrations, setDirectRegistrations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);
  const [downloadedEventId, setDownloadedEventId] = useState(null);

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

  const handleDownloadQR = (event) => {
    const success = downloadQRCodePass({
      canvasId: `qr-canvas-${event.id}`,
      title: event.title,
      qrToken: event.qr_token,
      studentName: user?.name || "Student",
      studentId: user?.studentId || "",
      date: formatEventDate(event.event_date),
      venue: event.venue || "UM Tagum Campus",
    });

    if (success) {
      setDownloadedEventId(event.id);
      setTimeout(() => {
        setDownloadedEventId(null);
      }, 2500);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-[#FBFBFA] flex flex-col items-center py-6 px-4 sm:px-6">
      
      {/* HEADER SECTION */}
      <div className="text-center mb-8 max-w-xl w-full">
        <div className="inline-flex items-center justify-center w-11 h-11 bg-[#102a43] text-white rounded-2xl mb-3 shadow-xs">
          <QrCode size={22} strokeWidth={2} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#102a43]">
            Digital Passes
          </h1>
          <button 
            type="button" 
            onClick={() => fetchStudentPasses(false)} 
            disabled={isRefreshing}
            title="Refresh passes"
            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 bg-white transition-colors cursor-pointer disabled:opacity-40"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin text-[#102a43]" : ""} />
          </button>
        </div>
        <p className="text-[#787774] text-xs sm:text-sm mt-1 max-w-md mx-auto">
          Present or download your verified digital admission pass for instant gate check-in.
        </p>
      </div>
      
      {/* PASSES CONTAINER: RESPONSIVE FLEX LAYOUT */}
      <div className="w-full max-w-4xl flex flex-col gap-6 items-center">
        {registeredEvents.map((event) => (
          <div 
            key={event.registration_id || event.id}
            className="w-full relative shadow-sm rounded-3xl overflow-hidden bg-white border border-[#EAEAEA] flex flex-col md:flex-row transition-all hover:shadow-md"
          >
            {/* LEFT / MAIN PASS DETAILS (FLEX 1) */}
            <div className="bg-[#102a43] text-white p-6 sm:p-8 flex-1 flex flex-col justify-between relative">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20 text-[#f97316]">
                    <Ticket size={12} /> STUDENT PASS
                  </span>
                  {event.attendance_status === "attended" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      ✓ ATTENDED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      READY TO SCAN
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold leading-snug text-white mb-2">
                  {event.title}
                </h3>
                
                {event.department && (
                  <p className="text-xs text-white/70 font-semibold mb-4">
                    {event.department}
                  </p>
                )}
              </div>
              
              {/* METADATA TILES */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono text-white/90 pt-4 border-t border-white/15 my-4">
                <div>
                  <p className="text-white/50 uppercase text-[9px] tracking-wider">Event Date</p>
                  <p className="flex items-center gap-1.5 mt-0.5 font-bold">
                    <CalendarDays size={13} className="text-[#f97316] shrink-0" /> 
                    <span>{formatEventDate(event.event_date)}</span>
                  </p>
                </div>

                <div>
                  <p className="text-white/50 uppercase text-[9px] tracking-wider">Start Time</p>
                  <p className="flex items-center gap-1.5 mt-0.5 font-bold">
                    <Clock3 size={13} className="text-[#f97316] shrink-0" /> 
                    <span>{event.time || "08:00 AM"}</span>
                  </p>
                </div>

                <div className="col-span-2 pt-1">
                  <p className="text-white/50 uppercase text-[9px] tracking-wider">Venue Location</p>
                  <p className="flex items-center gap-1.5 mt-0.5 font-bold">
                    <MapPin size={13} className="text-[#f97316] shrink-0" /> 
                    <span className="truncate">{event.venue || "UM Tagum Campus"}</span>
                  </p>
                </div>
              </div>

              {/* ATTENDEE FOOTER */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
                <span className="flex items-center gap-1.5">
                  <User size={13} className="text-[#f97316]" />
                  <span>Pass Holder: <strong className="text-white">{user?.name || "Student"}</strong></span>
                </span>
                {user?.studentId && (
                  <span className="font-mono text-[11px] text-[#f97316] font-bold">
                    ID: {user.studentId}
                  </span>
                )}
              </div>
            </div>

            {/* TICKET PERFORATION DIVIDER: FLEX VERTICAL ON MD+, HORIZONTAL ON MOBILE */}
            <div className="relative md:w-8 h-6 md:h-auto bg-[#FBFBFA] flex md:flex-col items-center justify-between z-20 shrink-0">
              {/* Mobile horizontal notches */}
              <div className="w-5 h-5 bg-[#FBFBFA] rounded-full -ml-2.5 md:hidden absolute left-0 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.05)]" />
              <div className="flex-1 border-t-2 md:border-t-0 md:border-r-2 border-dashed border-[#EAEAEA] mx-4 md:mx-0 md:my-4 md:h-full w-full" />
              <div className="w-5 h-5 bg-[#FBFBFA] rounded-full -mr-2.5 md:hidden absolute right-0 shadow-[inset_2px_0_4px_rgba(0,0,0,0.05)]" />
              
              {/* Tablet/Desktop vertical notches */}
              <div className="hidden md:block w-6 h-6 bg-[#FBFBFA] rounded-full -mt-3 absolute top-0 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.05)]" />
              <div className="hidden md:block w-6 h-6 bg-[#FBFBFA] rounded-full -mb-3 absolute bottom-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]" />
            </div>

            {/* RIGHT SIDE: QR CODE & DOWNLOAD ACTION (FLEXED SIDE-BY-SIDE ON MD+) */}
            <div className="bg-white p-6 sm:p-8 md:w-[320px] shrink-0 flex flex-col items-center justify-between">
              
              {/* QR CODE CANVAS CONTAINER */}
              <div className="bg-white p-3 border-2 border-slate-100 rounded-2xl shadow-xs mb-3 flex items-center justify-center">
                <QRCodeCanvas 
                  id={`qr-canvas-${event.id}`}
                  value={event.qr_token} 
                  size={200} 
                  bgColor="#ffffff" 
                  fgColor="#000000" 
                  level="Q"
                  includeMargin={true}
                />
              </div>

              {event.attendance_status === "attended" ? (
                <div className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center mb-3">
                  <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                    <span>✓ Attendance Recorded</span>
                  </p>
                  {event.checked_in_at && (
                    <p className="text-[10px] text-emerald-600 mt-0.5 font-mono">
                      Timestamp: {new Date(event.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-full p-2 bg-amber-50/70 border border-amber-200/60 rounded-xl text-center mb-3">
                  <p className="text-[11px] font-semibold text-amber-900">
                    Hold QR steady in front of scanner
                  </p>
                </div>
              )}

              {/* PROMINENT DOWNLOAD QR CODE PASS BUTTON */}
              <button
                type="button"
                onClick={() => handleDownloadQR(event)}
                className={`w-full mb-3 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                  downloadedEventId === event.id
                    ? "bg-emerald-600 text-white shadow-emerald-600/20"
                    : "bg-[#102a43] hover:bg-[#0a1c2e] text-white shadow-[#102a43]/15"
                }`}
              >
                {downloadedEventId === event.id ? (
                  <>
                    <Check size={16} strokeWidth={2.5} className="text-white" />
                    <span>Pass Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download size={16} strokeWidth={2.5} className="text-[#f97316]" />
                    <span>Download QR Code Pass</span>
                  </>
                )}
              </button>

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
                    onClick={() => handleDownloadQR(event)}
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
          <div className="w-full max-w-md text-center p-8 border border-[#EAEAEA] border-dashed rounded-3xl bg-white">
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
