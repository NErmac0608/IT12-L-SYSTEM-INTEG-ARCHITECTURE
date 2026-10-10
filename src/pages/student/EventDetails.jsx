import { ArrowLeft, CalendarDays, Clock3, MapPin, CheckCircle2, Ticket, Download, Check } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";
import { QRCodeCanvas } from "qrcode.react";
import { formatEventDate, getDepartmentStyle } from "../../lib/utils";
import { downloadQRCodePass } from "../../lib/qrExport";

function EventDetails() {
  const { id } = useParams(); 
  const { user } = useAuth(); 
  const { events, registrations, registerForEvent, isRegistered } = useEvents(); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  
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

  const handleDownload = () => {
    if (!registration?.qr_token) return;
    const success = downloadQRCodePass({
      canvasId: "qr-canvas-details",
      title: event.title,
      qrToken: registration.qr_token,
      studentName: user?.name || "Student",
      studentId: user?.studentId || "",
      date: formatEventDate(event.event_date || event.date),
      venue: event.location || event.venue || "UM Tagum Campus",
    });

    if (success) {
      setIsDownloaded(true);
      setTimeout(() => {
        setIsDownloaded(false);
      }, 2500);
    }
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
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-left sm:pr-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold mb-3">
                <CheckCircle2 size={14} />
                <span>Seat Reserved & Pass Issued</span>
              </div>

              <h4 className="text-lg font-bold text-slate-900 mb-1">
                Your Digital Admission Pass
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Present this verified QR code at the campus venue gate for instant check-in, or save it to your camera roll.
              </p>

              {registration?.qr_token && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl inline-block font-mono text-xs text-slate-600">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Pass Reference</span>
                  <code>{registration.qr_token}</code>
                </div>
              )}
            </div>

            {registration?.qr_token && (
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center w-full sm:w-[240px] shrink-0">
                <div className="bg-white p-2 border border-slate-100 rounded-xl mb-3">
                  <QRCodeCanvas 
                    id="qr-canvas-details"
                    value={registration.qr_token} 
                    size={180} 
                    bgColor="#ffffff" 
                    fgColor="#000000" 
                    level="Q" 
                    includeMargin={true}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer ${
                    isDownloaded
                      ? "bg-emerald-600 text-white"
                      : "bg-[#102a43] hover:bg-[#0a1c2e] text-white"
                  }`}
                >
                  {isDownloaded ? (
                    <>
                      <Check size={14} strokeWidth={2.5} />
                      <span>Pass Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} strokeWidth={2.5} className="text-[#f97316]" />
                      <span>Download QR Pass</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetails;
