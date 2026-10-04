import { useState } from "react";
import { Edit3, Plus, Trash2, Download, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "../../context/EventContext";
import { API_BASE_URL } from "../../services/api";
import { formatEventDate, getDepartmentCode, getDepartmentStyle } from "../../lib/utils";

function EventManagementWorkspace() { 
  const { events, deleteEvent } = useEvents(); 
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadRoster = async (eventId, eventTitle) => {
    try {
      setDownloadingId(eventId);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/export`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to download attendance roster.");
        return;
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("content-disposition");
      let filename = `attendance_${eventTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`;
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
    } catch (err) {
      console.error("Export error:", err);
      alert("Error downloading attendance file.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="page-heading flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <p className="eyebrow text-xs uppercase font-bold text-slate-500 tracking-wider">Organizer Workspace</p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Event Management</h1>
          <p className="muted text-sm text-slate-500 mt-1">Your active event catalogue, schedules, and report exports.</p>
        </div>
        <Link className="button button-dark inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm" to="/organizer/events/new">
          <Plus size={17} /> 
          <span>Create Event</span>
        </Link>
      </div>

      <div className="table-card bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="responsive-table overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Event & Venue</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <strong className="text-slate-900 block text-sm font-semibold">{event.title}</strong>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {event.location}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-700 flex items-center gap-1.5 font-medium text-xs" title={event.department}>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getDepartmentStyle(event.department)}`}>
                        {getDepartmentCode(event.department)}
                      </span>
                      <span className="text-slate-500 text-xs hidden sm:inline truncate max-w-[200px]">
                        {event.department}
                      </span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Calendar size={12} className="text-slate-400" />
                      {formatEventDate(event.event_date || event.date)}
                    </span>
                    <span className="text-slate-400 mt-0.5 block">
                      {event.start_time} - {event.end_time}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      event.status === "open"
                        ? "bg-emerald-100 text-emerald-800"
                        : event.status === "cancelled"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadRoster(event.id, event.title)}
                        disabled={downloadingId === event.id}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                        title="Download CSV Attendance Roster"
                      >
                        <Download size={15} className={downloadingId === event.id ? "animate-bounce text-emerald-600" : ""} />
                      </button>
                      <Link 
                        className="icon-button p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors inline-block" 
                        aria-label={`Edit ${event.title}`} 
                        to={`/organizer/events/${event.id}/edit`}
                        title="Edit Event"
                      >
                        <Edit3 size={15} />
                      </Link>
                      <button 
                        type="button"
                        aria-label={`Delete ${event.title}`} 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to cancel "${event.title}"? Historical attendee and registration records will be preserved.`)) {
                            deleteEvent(event.id);
                          }
                        }}
                        className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete / Cancel Event"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400">
                    No events registered yet.
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

export default EventManagementWorkspace;
