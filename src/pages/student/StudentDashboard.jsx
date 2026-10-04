import { ArrowRight, CalendarDays, ClipboardList, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";
import { formatEventDate, getDepartmentCode, getDepartmentStyle } from "../../lib/utils";

function StudentDashboard() {
  const { user } = useAuth();
  const { events, getRegistrations } = useEvents();
  const registrations = getRegistrations(user.id);
  const firstName = user.name ? user.name.split(" ")[0] : "Student";

  return (
    <div className="space-y-6 pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#f97316] mb-1 block">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {firstName}.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your university events and digital admission passes at a glance.
          </p>
        </div>

        <Link 
          to="/student/events" 
          className="inline-flex items-center justify-center gap-2 bg-[#102a43] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#0a1c2e] transition-colors shadow-xs w-full sm:w-auto"
        >
          <span>Explore Events</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* STATS TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Events Open</span>
            <CalendarDays size={16} className="text-[#102a43]" />
          </div>
          <strong className="text-2xl font-black text-slate-900">{events.length}</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">My Passes</span>
            <ClipboardList size={16} className="text-[#f97316]" />
          </div>
          <strong className="text-2xl font-black text-slate-900">{registrations.length}</strong>
        </div>

        <Link 
          to="/student/qr"
          className="col-span-2 sm:col-span-1 bg-[#102a43] text-white p-4 rounded-2xl shadow-xs flex flex-col justify-between hover:bg-[#0a1c2e] transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">QR Wallet</span>
            <QrCode size={16} className="text-[#f97316]" />
          </div>
          <div className="flex items-center justify-between">
            <strong className="text-lg font-bold">
              {registrations.length > 0 ? "Passes Ready" : "No Passes"}
            </strong>
            <span className="text-xs font-mono text-[#f97316]">View →</span>
          </div>
        </Link>
      </div>

      {/* RECOMMENDED SECTION */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Recommended Activities</h2>
            <p className="text-xs text-slate-400">Upcoming seminars and department events</p>
          </div>
          <Link to="/student/events" className="text-xs font-bold text-[#f97316] hover:underline">
            See all events →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {events.slice(0, 3).map((event) => (
            <article 
              key={event.id} 
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#102a43]/30 transition-colors"
            >
              <div>
                <span 
                  title={event.department || "General"}
                  className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2 shrink-0 ${getDepartmentStyle(event.department)}`}
                >
                  {getDepartmentCode(event.department)}
                </span>
                <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                  {event.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1">
                  {event.location || event.venue || "Campus Venue"}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  {formatEventDate(event.event_date || event.date)}
                </span>
                <Link 
                  to={`/student/events/${event.id}`} 
                  className="text-xs font-bold text-[#102a43] hover:text-[#f97316] transition-colors"
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;
