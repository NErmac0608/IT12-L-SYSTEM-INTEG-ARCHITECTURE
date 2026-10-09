import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ClipboardList, ShieldCheck, ArrowRight, Layers } from "lucide-react";
import QRScanner from "../../components/QRScanner";
import ErrorBoundary from "../../components/ErrorBoundary";
import { useEvents } from "../../context/EventContext";
import { formatEventDate } from "../../lib/utils";

export default function ScannerWorkspace() {
  const { events } = useEvents();

  // Filter only active events (open or ongoing) for scanning
  const activeEvents = useMemo(() => {
    return (events || []).filter(e => e.status === "open" || e.status === "ongoing");
  }, [events]);

  const [selectedEventId, setSelectedEventId] = useState("auto");

  // Derive current effective event ID: empty string when auto-detecting, otherwise selected event ID
  const currentEventId = useMemo(() => {
    if (selectedEventId === "auto") return "";
    if (selectedEventId && activeEvents.some(e => String(e.id) === String(selectedEventId))) {
      return selectedEventId;
    }
    return "";
  }, [activeEvents, selectedEventId]);

  const selectedEvent = useMemo(() => {
    if (!currentEventId) return null;
    return activeEvents.find(e => String(e.id) === String(currentEventId)) || null;
  }, [activeEvents, currentEventId]);

  return (
    <div className="space-y-6 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} /> Organizer Check-in Terminal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Attendance QR Scanner
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time digital ticket verification and attendance logging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/organizer/attendance"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors shadow-sm"
          >
            <ClipboardList size={16} />
            <span>Attendance Records</span>
          </Link>
          <Link 
            to="/organizer/events"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <span>Manage Events</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* EVENT MATCHING SELECTOR BAR */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#102a43] text-white flex items-center justify-center shrink-0">
            <CalendarDays size={20} />
          </div>
          <div>
            <label htmlFor="event-select" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Active Event Verification Target
            </label>
            <span className="text-xs text-slate-400">
              {selectedEventId === "auto"
                ? "⚡ Auto-Detect mode: Automatically identifies event and student pass upon scanning."
                : "Strict mode: Only QR passes registered for this event will be accepted."}
            </span>
          </div>
        </div>

        <div className="w-full md:w-80">
          <select
            id="event-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#102a43] transition-all cursor-pointer"
          >
            <option value="auto">⚡ Auto-Detect Event (All Active Events)</option>
            {activeEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} ({formatEventDate(event.event_date || event.date)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* EMBEDDED REAL-TIME SCANNER PROTECTED BY ERROR BOUNDARY */}
      <ErrorBoundary>
        <QRScanner 
          eventId={currentEventId || null} 
          eventTitle={selectedEvent ? selectedEvent.title : ""} 
        />
      </ErrorBoundary>

    </div>
  );
}
