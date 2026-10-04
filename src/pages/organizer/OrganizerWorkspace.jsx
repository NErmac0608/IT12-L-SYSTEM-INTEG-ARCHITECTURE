import { Link } from "react-router-dom";
import { CalendarDays, Plus, QrCode, Users, ArrowRight } from "lucide-react";
import { useEvents } from "../../context/EventContext";

function OrganizerWorkspace() { 
  const { events, registrations } = useEvents(); 
  
  return (
    <div className="space-y-6 pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#f97316] mb-1 block">
            Organizer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Event Management Station
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Coordinate campus events, verify attendance passes, and generate reports.
          </p>
        </div>

        <Link 
          to="/organizer/events/new" 
          className="inline-flex items-center justify-center gap-2 bg-[#102a43] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#0a1c2e] transition-colors shadow-xs w-full sm:w-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* STATS OVERVIEW TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Events</span>
            <CalendarDays size={16} className="text-[#102a43]" />
          </div>
          <strong className="text-2xl font-black text-slate-900">{events.length}</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Enrolled</span>
            <Users size={16} className="text-[#f97316]" />
          </div>
          <strong className="text-2xl font-black text-slate-900">{registrations.length}</strong>
        </div>

        <Link 
          to="/organizer/scanner"
          className="col-span-2 sm:col-span-1 bg-emerald-600 text-white p-4 rounded-2xl shadow-xs flex flex-col justify-between hover:bg-emerald-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">QR Station</span>
            <QrCode size={16} />
          </div>
          <div className="flex items-center justify-between">
            <strong className="text-base font-bold">Open Scanner</strong>
            <span className="text-xs font-mono">Launch →</span>
          </div>
        </Link>
      </div>

      {/* QUICK WORKSPACE ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
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
              Edit event titles, schedules, venues, and soft-cancel past assemblies.
            </p>
          </div>
          <span className="text-xs font-bold text-[#102a43] flex items-center gap-1 mt-4">
            View Catalogue <ArrowRight size={13} />
          </span>
        </Link>

        <Link 
          to="/organizer/scanner" 
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#102a43]/30 transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <QrCode size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Live Check-in Scanner</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify digital tickets at the gate with instant audio cues and double check-in rejection.
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
              Review turnout statistics and download official attendance rosters as Excel/CSV.
            </p>
          </div>
          <span className="text-xs font-bold text-[#f97316] flex items-center gap-1 mt-4">
            View & Export <ArrowRight size={13} />
          </span>
        </Link>
      </div>
    </div>
  ); 
}

export default OrganizerWorkspace;
