import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEvents } from "../../context/EventContext";
import { apiRequest } from "../../services/api";

const blank = { title: "", description: "", department_id: "", date: "", start_time: "", end_time: "", venue: "" };

function EventFormWorkspace() { 
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const { events, createEvent, updateEvent } = useEvents(); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [departments, setDepartments] = useState([]);
  
  const existing = events.find((event) => String(event.id) === String(id)); 
  
  const [form, setForm] = useState(() => existing ? {
    title: existing.title || "",
    description: existing.description || "",
    department_id: existing.department_id || "",
    date: existing.event_date ? existing.event_date.split("T")[0] : (existing.date || ""),
    start_time: existing.start_time || "",
    end_time: existing.end_time || "",
    venue: existing.location || existing.venue || ""
  } : blank);

  // Fetch individual event if direct URL access and not in cache
  useEffect(() => {
    let isMounted = true;
    if (id && !existing) {
      apiRequest(`/events/${id}`)
        .then((data) => {
          if (isMounted && data) {
            setForm({
              title: data.title || "",
              description: data.description || "",
              department_id: data.department_id || "",
              date: data.event_date ? data.event_date.split("T")[0] : (data.date || ""),
              start_time: data.start_time || "",
              end_time: data.end_time || "",
              venue: data.location || data.venue || ""
            });
          }
        })
        .catch((err) => console.error("Could not fetch event details:", err));
    }
    return () => {
      isMounted = false;
    };
  }, [existing, id]);

  useEffect(() => {
    apiRequest("/departments")
      .then((data) => setDepartments(data))
      .catch((err) => console.error("Could not fetch departments:", err));
  }, []);

  const change = (key, value) => {
    setFormError("");
    setForm((current) => ({ ...current, [key]: value }));
  }; 
  
  const submit = async (e) => { 
    e.preventDefault(); 
    setFormError("");

    // Form validation guardrails
    if (form.start_time && form.end_time && form.start_time >= form.end_time) {
      setFormError("Event end time must be after the start time.");
      return;
    }
    
    setIsSubmitting(true);
    const success = id ? await updateEvent(Number(id), form) : await createEvent(form);
    setIsSubmitting(false);
    
    if (success) {
      navigate("/organizer/events"); 
    }
  }; 
  
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* BACK NAVIGATION */}
      <Link 
        to="/organizer/events"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Events Catalogue</span>
      </Link>

      {/* HEADER */}
      <div className="pb-4 border-b border-slate-200">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#f97316] mb-1 block">
          Event Creator
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {id ? "Edit Event Details" : "Publish New Event"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure schedule, target department, and venue information for student registration.
        </p>
      </div>

      {formError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
          {formError}
        </div>
      )}

      {/* FORM CARD */}
      <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        
        {/* Title */}
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Event Title *
          </label>
          <input 
            required 
            value={form.title} 
            onChange={(e) => change("title", e.target.value)}
            placeholder="e.g. 2026 Campus IT Symposium & Hackathon" 
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#102a43] focus:bg-white transition-all"
          />
        </div>

        {/* Department & Venue Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Department *
            </label>
            <div className="relative">
              <select 
                required 
                value={form.department_id} 
                onChange={(e) => change("department_id", Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#102a43] focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Venue / Location *
            </label>
            <input 
              required 
              value={form.venue} 
              onChange={(e) => change("venue", e.target.value)}
              placeholder="e.g. UMTC Gymnasium, Room 302" 
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#102a43] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Date, Start Time, End Time Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Event Date *
            </label>
            <input 
              required 
              type="date"
              value={form.date} 
              onChange={(e) => change("date", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#102a43] focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Start Time *
            </label>
            <input 
              required 
              type="time"
              value={form.start_time} 
              onChange={(e) => change("start_time", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#102a43] focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              End Time *
            </label>
            <input 
              required 
              type="time"
              value={form.end_time} 
              onChange={(e) => change("end_time", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#102a43] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Event Description
          </label>
          <textarea 
            rows="4" 
            value={form.description} 
            onChange={(e) => change("description", e.target.value)} 
            placeholder="Outline agenda, attire, and guidelines for students attending this activity..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#102a43] focus:bg-white transition-all resize-y"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/organizer/events")}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#102a43] hover:bg-[#0a1c2e] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Saving..." : id ? "Save Changes" : "Publish Event"}
          </button>
        </div>

      </form>
    </div>
  ); 
}

export default EventFormWorkspace;
