import { Link } from "react-router-dom";
import EventCard from "../../components/EventCard";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";
import { ClipboardList, ArrowRight, QrCode } from "lucide-react";

function MyRegistrations() { 
  const { user } = useAuth(); 
  const { events, getRegistrations } = useEvents(); 
  const registeredEvents = getRegistrations(user.id)
    .map((registration) => events.find((event) => event.id === registration.event_id || event.id === registration.eventId))
    .filter(Boolean);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">
            Student Registrations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            My Enrolled Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your reserved event admissions and QR tickets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link 
            to="/student/qr"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#f97316] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:bg-[#ea580c] transition-colors"
          >
            <QrCode size={15} />
            <span>Open Wallet</span>
          </Link>
          <Link 
            to="/student/events" 
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:bg-slate-800 transition-colors"
          >
            <span>Browse More</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {registeredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registeredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white border border-slate-200 border-dashed rounded-2xl">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <ClipboardList size={22} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No event registrations found</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            You haven't reserved admission to any upcoming campus events yet.
          </p>
          <Link 
            to="/student/events"
            className="inline-flex items-center gap-1.5 bg-[#102a43] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0a1c2e] transition-colors"
          >
            Explore Event Calendar
          </Link>
        </div>
      )}
    </div>
  ); 
}

export default MyRegistrations;
