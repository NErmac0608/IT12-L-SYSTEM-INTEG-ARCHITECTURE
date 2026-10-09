import { Link } from "react-router-dom";
import { ShieldCheck, UserRound, Users, ArrowRight, RefreshCw, CalendarDays, ClipboardList, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../../services/api";
import { formatEventDate, getDepartmentCode, getDepartmentStyle } from "../../lib/utils";

function AdminWorkspace() { 
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    organizers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    totalAttended: 0,
    recentOrganizers: [],
    recentEvents: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      setError(null);
      const data = await apiRequest("/admin/stats");
      setStats(data);
    } catch (err) {
      console.error("Could not load admin stats:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(false);
    // Polling every 5 seconds for live administrative metrics
    const interval = setInterval(() => {
      fetchStats(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <div className="space-y-6 pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#f97316] block">
              System Administration
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Connected
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            System-wide user accounts, permissions, campus events, and institution metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => fetchStats(false)}
            disabled={isRefreshing}
            title="Refresh statistics"
            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin text-[#102a43]" : ""} />
          </button>
          <Link 
            to="/admin/accounts"
            className="inline-flex items-center justify-center gap-2 bg-[#102a43] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#0a1c2e] transition-colors shadow-xs flex-1 sm:flex-initial"
          >
            <Users size={16} />
            <span>Manage Accounts</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
          Failed to fetch live admin metrics: {error}
        </div>
      )}

      {/* STATS TILES ROW 1: USER METRICS */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">User Accounts</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registered Accounts</span>
              <Users size={16} className="text-[#102a43]" />
            </div>
            <strong className="text-2xl font-black text-slate-900">
              {isLoading ? "..." : stats.totalUsers}
            </strong>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Students</span>
              <UserRound size={16} className="text-emerald-600" />
            </div>
            <strong className="text-2xl font-black text-slate-900">
              {isLoading ? "..." : stats.students}
            </strong>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Event Organizers</span>
              <ShieldCheck size={16} className="text-[#f97316]" />
            </div>
            <strong className="text-2xl font-black text-slate-900">
              {isLoading ? "..." : stats.organizers}
            </strong>
          </div>
        </div>
      </div>

      {/* STATS TILES ROW 2: EVENT & ATTENDANCE METRICS */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Campus Events & Attendance</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Events</span>
              <CalendarDays size={16} className="text-[#102a43]" />
            </div>
            <strong className="text-2xl font-black text-slate-900">
              {isLoading ? "..." : stats.totalEvents}
            </strong>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registrations</span>
              <ClipboardList size={16} className="text-[#f97316]" />
            </div>
            <strong className="text-2xl font-black text-slate-900">
              {isLoading ? "..." : stats.totalRegistrations}
            </strong>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Verified Check-Ins</span>
              <CheckCircle2 size={16} className="text-emerald-600" />
            </div>
            <strong className="text-2xl font-black text-slate-900">
              {isLoading ? "..." : stats.totalAttended}
            </strong>
          </div>
        </div>
      </div>

      {/* MANAGEMENT ACTION CARD */}
      <div>
        <Link 
          to="/admin/accounts" 
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#102a43]/30 transition-all flex items-center justify-between group block"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#102a43] group-hover:bg-[#102a43] group-hover:text-white transition-colors">
              <Users size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-0.5">Organizer & Account Management</h3>
              <p className="text-xs text-slate-500">Provision new organizers, configure departments, and manage access privileges.</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-slate-400 group-hover:text-[#102a43] group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* RECENT ACTIVITY GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RECENT EVENTS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Campus Events</h2>
              <p className="text-xs text-slate-500">Latest scheduled activities across departments</p>
            </div>
          </div>

          {stats.recentEvents && stats.recentEvents.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.recentEvents.map((evt) => (
                <div key={evt.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-3">
                    <strong className="text-slate-900 block font-semibold truncate">{evt.title}</strong>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {evt.department || "General"} · {evt.organizer_name || "Faculty"}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      evt.status === "open" ? "bg-emerald-50 text-emerald-700" :
                      evt.status === "cancelled" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {evt.status}
                    </span>
                    <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                      {formatEventDate(evt.event_date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No recent campus events found.
            </div>
          )}
        </div>

        {/* RECENT ORGANIZERS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Provisioned Organizers</h2>
              <p className="text-xs text-slate-500">Event coordinators and active accounts</p>
            </div>
            <Link to="/admin/accounts" className="text-xs font-bold text-[#102a43] hover:text-[#f97316] transition-colors">
              Manage all →
            </Link>
          </div>

          {stats.recentOrganizers && stats.recentOrganizers.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.recentOrganizers.map((org) => (
                <div key={org.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-3">
                    <strong className="text-slate-900 block font-semibold truncate">{org.full_name}</strong>
                    <span className="text-[11px] text-slate-400 block truncate font-mono">
                      {org.school_email}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      org.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {org.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">
                      {getDepartmentCode(org.department)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No organizers provisioned yet.
            </div>
          )}
        </div>
      </div>
    </div>
  ); 
}

export default AdminWorkspace;
