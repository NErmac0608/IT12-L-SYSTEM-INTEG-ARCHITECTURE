import { Link } from "react-router-dom";
import { ShieldCheck, UserRound, Users, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest } from "../../services/api";

function AdminWorkspace() { 
  const [stats, setStats] = useState({ totalUsers: 0, students: 0, organizers: 0 });

  useEffect(() => {
    apiRequest("/admin/stats")
      .then(data => setStats(data))
      .catch(err => console.error("Could not load stats", err));
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#f97316] mb-1 block">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            System-wide user accounts, permissions, and institution metrics.
          </p>
        </div>

        <Link 
          to="/admin/accounts"
          className="inline-flex items-center justify-center gap-2 bg-[#102a43] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#0a1c2e] transition-colors shadow-xs w-full sm:w-auto"
        >
          <Users size={16} />
          <span>Manage Accounts</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registered Accounts</span>
            <Users size={16} className="text-[#102a43]" />
          </div>
          <strong className="text-2xl font-black text-slate-900">{stats.totalUsers}</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Students</span>
            <UserRound size={16} className="text-emerald-600" />
          </div>
          <strong className="text-2xl font-black text-slate-900">{stats.students}</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Event Organizers</span>
            <ShieldCheck size={16} className="text-[#f97316]" />
          </div>
          <strong className="text-2xl font-black text-slate-900">{stats.organizers}</strong>
        </div>
      </div>

      <div className="mt-6">
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
              <p className="text-xs text-slate-500">Provision new organizers, configure departments, and manage access.</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-slate-400 group-hover:text-[#102a43] group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  ); 
}

export default AdminWorkspace;
