import { useState, useEffect, useCallback } from "react";
import { ArrowRight, CalendarDays, ClipboardList, QrCode, RefreshCw, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";
import { apiRequest } from "../../services/api";
import { formatEventDate, getDepartmentCode, getDepartmentStyle } from "../../lib/utils";

function StudentDashboard() {
  const { user } = useAuth();
  const { events: contextEvents, getRegistrations, refreshRegistrations } = useEvents();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      setError(null);
      const data = await apiRequest("/student/dashboard");
      setDashboardData(data);
    } catch (err) {
      console.warn("Dedicated student dashboard fetch warning:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(false);
    // Refresh student data every 5 seconds for live attendance status updates
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const firstName = user?.name ? user.name.split(" ")[0] : "Student";
  const contextRegistrations = user ? getRegistrations(user.id) : [];

  // Fallback to context data if network is offline
  const totalOpenEvents = dashboardData?.totalEventsOpen ?? contextEvents.length;
  const totalMyPasses = dashboardData?.totalRegistrations ?? contextRegistrations.length;
  const totalAttended = dashboardData?.totalAttended ?? contextRegistrations.filter(r => r.status === "attended").length;
  const recommended = dashboardData?.recommendedEvents ?? contextEvents.slice(0, 3);

  const handleManualRefresh = async () => {
    await Promise.all([fetchDashboard(false), refreshRegistrations()]);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#f97316] block">
              Student Portal
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Connected
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {firstName}.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your university events and digital admission passes fetched in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh student dashboard"
            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin text-[#102a43]" : ""} />
          </button>
          <Link 
            to="/student/events" 
            className="inline-flex items-center justify-center gap-2 bg-[#102a43] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#0a1c2e] transition-colors shadow-xs flex-1 sm:flex-initial"
          >
            <span>Explore Events</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {error && !dashboardData && (
        <div className="p-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">
          Loaded from offline local cache: {error}
        </div>
      )}

      {/* STATS TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Events Open</span>
            <CalendarDays size={16} className="text-[#102a43]" />
          </div>
          <strong className="text-2xl font-black text-slate-900">
            {isLoading ? "..." : totalOpenEvents}
          </strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">My Passes</span>
            <ClipboardList size={16} className="text-[#f97316]" />
          </div>
          <strong className="text-2xl font-black text-slate-900">
            {isLoading ? "..." : totalMyPasses}
          </strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Attended</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <strong className="text-2xl font-black text-slate-900">
            {isLoading ? "..." : totalAttended}
          </strong>
        </div>

        <Link 
          to="/student/qr"
          className="bg-[#102a43] text-white p-4 rounded-2xl shadow-xs flex flex-col justify-between hover:bg-[#0a1c2e] transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">QR Wallet</span>
            <QrCode size={16} className="text-[#f97316]" />
          </div>
          <div className="flex items-center justify-between">
            <strong className="text-sm sm:text-base font-bold">
              {totalMyPasses > 0 ? "Passes Ready" : "No Passes"}
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
          {recommended.map((event) => (
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
          {recommended.length === 0 && !isLoading && (
            <div className="col-span-full py-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              No recommended events currently scheduled.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;
