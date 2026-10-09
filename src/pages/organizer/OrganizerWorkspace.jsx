import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Plus, QrCode, Users, ArrowRight, RefreshCw, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import { useEvents } from "../../context/EventContext";
import { apiRequest } from "../../services/api";

function OrganizerWorkspace() { 
  const { events: fallbackEvents, registrations: fallbackRegistrations, refreshRegistrations } = useEvents(); 
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      setError(null);
      const data = await apiRequest("/organizer/dashboard");
      setDashboardData(data);
    } catch (err) {
      console.warn("Dedicated organizer dashboard fetch warning:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(false);
    // Polling every 4 seconds for live gate check-in counts
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  // Derived metrics with fallback to context
  const totalEvents = dashboardData?.totalEvents ?? fallbackEvents.length;
  const activeEvents = dashboardData?.activeEvents ?? fallbackEvents.filter(e => e.status === "open" || e.status === "ongoing").length;
  const totalEnrolled = dashboardData?.totalEnrolled ?? fallbackRegistrations.length;
  const totalAttended = dashboardData?.totalAttended ?? fallbackRegistrations.filter(r => r.status === "attended").length;
  const turnoutRate = dashboardData?.turnoutRate ?? (totalEnrolled > 0 ? Math.round((totalAttended / totalEnrolled) * 100) : 0);
  const recentCheckIns = dashboardData?.recentCheckIns ?? [];

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
              Organizer Portal
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Scanner Stream
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Event Management Station
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Coordinate campus events, verify attendance passes, and monitor real-time check-ins.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh dashboard data"
            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin text-[#102a43]" : ""} />
          </button>
          <Link 
            to="/organizer/events/new" 
            className="inline-flex items-center justify-center gap-2 bg-[#102a43] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#0a1c2e] transition-colors shadow-xs flex-1 sm:flex-initial cursor-pointer"
          >
            <Plus size={16} />
            <span>Create New Event</span>
          </Link>
        </div>
      </div>

      {error && !dashboardData && (
        <div className="p-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">
          Loaded from offline local cache: {error}
        </div>
      )}

      {/* STATS OVERVIEW TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Events</span>
            <CalendarDays size={16} className="text-[#102a43]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <strong className="text-2xl font-black text-slate-900">
              {isLoading ? "..." : activeEvents}
            </strong>
            <span className="text-xs text-slate-400 font-medium">/ {totalEvents} total</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Enrolled</span>
            <Users size={16} className="text-[#f97316]" />
          </div>
          <strong className="text-2xl font-black text-slate-900">
            {isLoading ? "..." : totalEnrolled}
          </strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Scanned Pass</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <strong className="text-2xl font-black text-slate-900">
            {isLoading ? "..." : totalAttended}
          </strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Turnout Rate</span>
            <TrendingUp size={16} className="text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <strong className="text-2xl font-black text-slate-900">
              {isLoading ? "..." : `${turnoutRate}%`}
            </strong>
          </div>
        </div>
      </div>

      {/* QUICK WORKSPACE ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link 
          to="/organizer/events" 
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#102a43]/30 transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#102a43] mb-3 group-hover:bg-[#102a43] group-hover:text-white transition-colors">
              <CalendarDays size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Manage Events</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Edit event titles, schedules, venues, and view the active catalogue.
            </p>
          </div>
          <span className="text-xs font-bold text-[#102a43] flex items-center gap-1 mt-4">
            View Catalogue <ArrowRight size={13} />
          </span>
        </Link>

        <Link 
          to="/organizer/scanner" 
          className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
              <QrCode size={18} />
            </div>
            <h3 className="text-sm font-bold text-emerald-950 mb-1">Live Check-in Scanner</h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Verify digital tickets at the venue gate with auto event detection and audio cues.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-4">
            Start Scanner <ArrowRight size={13} />
          </span>
        </Link>

        <Link 
          to="/organizer/attendance" 
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#102a43]/30 transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#f97316] mb-3 group-hover:bg-[#f97316] group-hover:text-white transition-colors">
              <Users size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Attendance Reports</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review turnout statistics and download official rosters as Excel / CSV.
            </p>
          </div>
          <span className="text-xs font-bold text-[#f97316] flex items-center gap-1 mt-4">
            View & Export <ArrowRight size={13} />
          </span>
        </Link>
      </div>

      {/* RECENT CHECK-IN STREAM */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Scanned Check-Ins</h2>
            <p className="text-xs text-slate-500">Live feed of verified student admissions</p>
          </div>
          <Link to="/organizer/attendance" className="text-xs font-bold text-[#102a43] hover:text-[#f97316] transition-colors">
            View full ledger →
          </Link>
        </div>

        {recentCheckIns.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentCheckIns.map((item, idx) => (
              <div key={item.registration_id || idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">{item.full_name || "Student"}</strong>
                    <span className="text-slate-500 text-[11px]">{item.event_title}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ATTENDED
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-end gap-1">
                    <Clock size={10} />
                    {item.checked_in_at ? new Date(item.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No check-in scans recorded yet. Launch the QR Scanner to begin admission check-in.
          </div>
        )}
      </div>
    </div>
  ); 
}

export default OrganizerWorkspace;
