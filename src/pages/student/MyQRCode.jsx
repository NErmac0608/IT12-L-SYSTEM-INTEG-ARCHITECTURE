import { useState, useEffect } from "react";
import { QrCode, CalendarDays, Clock3, MapPin, Ticket, WifiOff, Wifi } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";
import { Link } from "react-router-dom";
import { formatEventDate } from "../../lib/utils";

function MyQRCode() { 
  const { user } = useAuth(); 
  const { events, getRegistrations } = useEvents(); 
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  
  const registeredEvents = getRegistrations(user.id).map((reg) => {
    const event = events.find(e => e.id === reg.event_id || e.id === reg.eventId);
    return event ? { ...event, qr_token: reg.qr_token } : null;
  }).filter(Boolean);

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-[#FBFBFA] flex flex-col items-center py-6 px-4 sm:px-6">
      
      <div className="text-center mb-6 max-w-sm">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-[#102a43] text-white rounded-xl mb-3 shadow-xs">
          <QrCode size={20} strokeWidth={2} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#102a43] mb-1">
          Active Passes
        </h1>
        <p className="text-[#787774] text-xs sm:text-sm">
          Keep tickets ready for check-in verification.
        </p>

        {/* Network & Offline Ready Status Indicator */}
        <div className="mt-2.5 flex items-center justify-center gap-2">
          {isOnline ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Wifi size={11} />
              <span>Offline Pass Cache Synced</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <WifiOff size={11} />
              <span>Offline Mode Active - Saved Passes Available</span>
            </span>
          )}
        </div>
      </div>
      
      <div className="w-full max-w-sm flex flex-col gap-6">
        {registeredEvents.map((event) => (
          <div 
            key={event.id}
            className="w-full relative shadow-sm rounded-2xl overflow-hidden bg-white border border-[#EAEAEA]"
          >
            {/* TICKET TOP: EVENT DETAILS */}
            <div className="bg-[#102a43] text-white p-5 relative">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-white/20 text-[#f97316]">
                <Ticket size={12} /> STUDENT PASS
              </span>
              <h3 className="text-lg font-bold leading-snug mb-3 text-white">{event.title}</h3>
              
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-white/80">
                <div>
                  <p className="text-white/50 uppercase text-[9px] tracking-wider">Date</p>
                  <p className="flex items-center gap-1 mt-0.5">
                    <CalendarDays size={12} className="text-white/60"/> 
                    {formatEventDate(event.event_date || event.date)}
                  </p>
                </div>
                <div>
                  <p className="text-white/50 uppercase text-[9px] tracking-wider">Time</p>
                  <p className="flex items-center gap-1 mt-0.5">
                    <Clock3 size={12} className="text-white/60"/> 
                    {event.time || event.start_time || "TBA"}
                  </p>
                </div>
                <div className="col-span-2 mt-1">
                  <p className="text-white/50 uppercase text-[9px] tracking-wider">Venue</p>
                  <p className="flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-white/60"/> 
                    {event.venue || event.location || "TBA"}
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

            {/* TICKET BOTTOM: QR CODE */}
            <div className="bg-white p-6 pt-3 flex flex-col items-center">
              {event.qr_token ? (
                <>
                  <div className="bg-white p-3 border border-[#EAEAEA] rounded-xl shadow-xs mb-3">
                    <QRCodeSVG 
                      value={event.qr_token} 
                      size={180} 
                      bgColor="#ffffff" 
                      fgColor="#102a43" 
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-[11px] font-mono text-[#787774] tracking-widest uppercase text-center w-full truncate">
                    TOKEN: {event.qr_token.split('-')[0]}
                  </p>
                </>
              ) : (
                <div className="h-[180px] w-[180px] flex items-center justify-center border-2 border-dashed border-[#EAEAEA] rounded-xl mb-3">
                  <p className="text-[#787774] text-xs text-center px-4">Pass pending generation</p>
                </div>
              )}
            </div>
            
          </div>
        ))}

        {registeredEvents.length === 0 && (
          <div className="w-full text-center p-8 border border-[#EAEAEA] border-dashed rounded-2xl bg-white">
            <div className="w-12 h-12 bg-[#F7F6F3] rounded-full flex items-center justify-center mx-auto mb-3 text-[#787774]">
              <Ticket size={20} />
            </div>
            <p className="text-[#111111] font-bold text-base mb-1">No Active Passes</p>
            <p className="text-[#787774] text-xs mb-4">You have not registered for any events yet.</p>
            <Link 
              to="/student/events"
              className="inline-flex items-center gap-1.5 bg-[#102a43] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0a1c2e] transition-colors"
            >
              Browse Events
            </Link>
          </div>
        )}
      </div>
      
    </div>
  ); 
}

export default MyQRCode;
