import { useState, useMemo } from "react";
import { Download, FileCheck2, Filter, Layers, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import Button from "../../components/Button";
import { useEvents } from "../../context/EventContext";
import { API_BASE_URL } from "../../services/api";

function AttendanceWorkspace() { 
  const { registrations, events, fetchRegistrations } = useEvents(); 
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  // Filter registrations based on selected event
  const filteredRegistrations = useMemo(() => {
    if (selectedEventId === "all") return registrations;
    return registrations.filter(r => String(r.event_id) === String(selectedEventId));
  }, [registrations, selectedEventId]);

  // Statistics calculation for the current filter
  const stats = useMemo(() => {
    const total = filteredRegistrations.length;
    const attended = filteredRegistrations.filter(r => r.status?.toLowerCase() === "attended").length;
    const registered = total - attended;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;
    return { total, attended, registered, rate };
  }, [filteredRegistrations]);

  // Trigger backend CSV export with token authentication
  const handleExport = async (eventId = null) => {
    setIsExporting(true);
    setExportError(null);
    try {
      const token = localStorage.getItem("token");
      const targetId = eventId || (selectedEventId !== "all" ? selectedEventId : null);

      if (targetId) {
        // Direct download from GET /api/events/:id/export
        const res = await fetch(`${API_BASE_URL}/events/${targetId}/export`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to generate CSV export from server.");
        }

        const blob = await res.blob();
        const contentDisposition = res.headers.get("content-disposition");
        let filename = `attendance_event_${targetId}.csv`;
        if (contentDisposition && contentDisposition.includes("filename=")) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) filename = match[1];
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } else {
        // Multi-event export from current workspace dataset
        const headers = ["Student Name", "Student ID", "Email", "Department", "Event Title", "Status", "Registered At", "Checked In At"];
        const rows = filteredRegistrations.map(r => [
          `"${(r.full_name || r.student_name || '').replace(/"/g, '""')}"`,
          `"${(r.student_id || 'N/A').replace(/"/g, '""')}"`,
          `"${(r.school_email || '').replace(/"/g, '""')}"`,
          `"${(r.department || 'N/A').replace(/"/g, '""')}"`,
          `"${(r.event_title || '').replace(/"/g, '""')}"`,
          `"${(r.status || '').replace(/"/g, '""')}"`,
          `"${r.registered_at ? new Date(r.registered_at).toLocaleString() : ''}"`,
          `"${r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : 'N/A'}"`
        ].join(","));

        const csvString = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `attendance_roster_all_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export error:", err);
      setExportError(err.message || "Failed to download export.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">
            Organizer Workspace
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Attendance Records & Exports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit live registration states, verify check-in logs, and generate official roster spreadsheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {fetchRegistrations && (
            <button
              type="button"
              onClick={() => fetchRegistrations()}
              className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors shadow-sm"
              title="Refresh ledger"
            >
              <RefreshCw size={16} />
            </button>
          )}

          <Button 
            onClick={() => handleExport()} 
            disabled={isExporting || filteredRegistrations.length === 0}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            <span>{isExporting ? "Generating CSV..." : "Export Attendance Roster"}</span>
          </Button>
        </div>
      </div>

      {exportError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {exportError}
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Enrolled</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={14} /> Attended
          </p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.attended}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
            <Clock size={14} /> Pending Check-in
          </p>
          <p className="text-2xl font-black text-amber-700 mt-1">{stats.registered}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Turnout Rate</p>
          <p className="text-2xl font-black text-indigo-700 mt-1">{stats.rate}%</p>
        </div>
      </div>

      {/* FILTER & EVENT SELECTOR TOOLBAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filter by Event:</span>
        </div>

        <div className="w-full sm:w-80">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#102a43] transition-all cursor-pointer"
          >
            <option value="all">All Managed Events ({registrations.length} Total)</option>
            {(events || []).map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ATTENDANCE ROSTER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Student ID / Dept</th>
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Check-in Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.map((row) => (
                <tr key={row.registration_id || row.qr_token || `${row.student_id_record}-${row.event_id}`} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <strong className="text-slate-900 block font-semibold">{row.full_name || row.student_name}</strong>
                    <span className="text-[11px] text-slate-400">{row.school_email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-slate-800 font-medium">{row.student_id || "N/A"}</span>
                    <span className="block text-[11px] text-slate-400">{row.department || "General"}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800">{row.event_title}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      row.status?.toLowerCase() === "attended" 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      <FileCheck2 size={12} />
                      <span>{row.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {row.checked_in_at ? (
                      <div>
                        <span className="text-slate-800 font-semibold">
                          {new Date(row.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {new Date(row.checked_in_at).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not checked in</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRegistrations.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">
                    <Layers size={32} className="mx-auto mb-2 text-slate-300" />
                    <span>No attendance records found for this selection.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ); 
}

export default AttendanceWorkspace;
