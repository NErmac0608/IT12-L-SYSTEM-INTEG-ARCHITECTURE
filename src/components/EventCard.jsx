import { CalendarDays, Clock3, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatEventDate, getDepartmentCode, getDepartmentStyle } from "../lib/utils";

function EventCard({ event }) {
  return (
    <article 
      className="group bg-white border border-[#EAEAEA] rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-[#102a43]/30 hover:shadow-sm transition-all"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span 
            title={event.department || "General"}
            className={`uppercase tracking-wider text-[10.5px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center shrink-0 ${getDepartmentStyle(event.department)}`}
          >
            {getDepartmentCode(event.department)}
          </span>
          <span className="text-[#787774] text-xs font-mono flex items-center gap-1 shrink-0">
            <CalendarDays size={13} className="text-[#787774]" /> 
            {formatEventDate(event.event_date || event.date)}
          </span>
        </div>
        
        <h3 className="text-base sm:text-lg font-bold text-[#111111] leading-snug mb-2 tracking-tight">
          {event.title}
        </h3>
        <p className="text-[#787774] text-xs sm:text-sm leading-relaxed line-clamp-2">
          {event.description || "Campus activity and student assembly."}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-[#EAEAEA] flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-[#787774] font-mono">
          <span className="flex items-center gap-1" title="Time">
            <Clock3 size={13} /> 
            {event.time || event.start_time || "TBA"}
          </span>
          <span className="flex items-center gap-1 truncate max-w-[120px]" title="Venue">
            <MapPin size={13} /> 
            {event.venue || event.location || "TBA"}
          </span>
        </div>
        
        <Link 
          to={`/student/events/${event.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#102a43] hover:text-[#f97316] transition-colors py-1 px-1.5"
        >
          <span>Details</span>
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      </div>
    </article>
  );
}

export default EventCard;
