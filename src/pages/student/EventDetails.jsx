import { ArrowLeft, CalendarDays, Clock3, MapPin, CheckCircle2, Ticket } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";
import { QRCodeSVG } from "qrcode.react";
import { formatEventDate, getDepartmentStyle } from "../../lib/utils";

function EventDetails() {
  const { id } = useParams(); 
  const { user } = useAuth(); 
  const { events, registrations, registerForEvent, isRegistered } = useEvents(); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const event = events.find((item) => String(item.id) === String(id));
  if (!event) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800">Event Not Found</h2>
        <Link to="/student/events" className="text-xs text-[#f97316] font-bold mt-2 inline-block">
          ← Back to Events Calendar
        </Link>
      </div>
    );
  }
  
  const registered = isRegistered(event.id, user.id); 
  const registration = registrations.find(item => 
    (String(item.event_id) === String(event.id) || String(item.eventId) === String(event.id)) && 
    (String(item.student_id_record) === String(user.id) || String(item.userId) === String(user.id))
  );

  const handleRegister = async () => { 
    setIsSubmitting(true);
    await registerForEvent(event.id, user.id); 
    setIsSubmitting(false);
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Link 
        to="/student/events" 
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Events</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <span 
          title={event.department}
          className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 ${getDepartmentStyle(event.department)}`}
        >
          {event.department || "University Event"}
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          {event.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          {event.description || "Official campus activity for University of Mindanao students."}
        </p>

        {/* METADATA TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-[#102a43] shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Date</p>
              <p className="font-semibold text-slate-800">
                {formatEventDate(event.event_date || event.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock3 size={16} className="text-[#102a43] shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Time</p>
              <p className="font-semibold text-slate-800">
                {event.start_time || event.time || "08:00 AM"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#102a43] shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Venue</p>
              <p className="font-semibold text-slate-800 truncate">
                {event.location || event.venue || "Campus Hall"}
              </p>
            </div>
          </div>
        </div>
        
        {/* REGISTRATION ACTION / DIGITAL PASS */}
        {!registered ? (
          <button 
            type="button"
            onClick={handleRegister}
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#102a43] hover:bg-[#0a1c2e] text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <Ticket size={16} />
            <span>{isSubmitting ? "Registering..." : "Register for Event Pass"}</span>
          </button>
        ) : (
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold mb-3">
              <CheckCircle2 size={14} />
              <span>Seat Reserved & Pass Issued</span>
            </div>

            <p className="text-xs text-slate-500 mb-4 max-w-xs">
              Present this verified QR code at the venue gate for check-in.
            </p>

            {registration?.qr_token && (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center">
                <QRCodeSVG 
                  value={registration.qr_token} 
                  size={190} 
                  level="M" 
                  fgColor="#102a43" 
                />
                <span className="mt-3 font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                  TOKEN: {registration.qr_token.split('-')[0]}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetails;
