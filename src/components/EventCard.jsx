import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

function EventCard({ event }) {
  return <article className="event-card"><div className="event-card-accent" /><div className="event-card-body"><span className="tag">{event.department}</span><h3>{event.title}</h3><p className="muted">{event.description}</p><div className="event-meta"><span><CalendarDays size={15} /> {new Date(event.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span><span><Clock3 size={15} /> {event.time}</span><span><MapPin size={15} /> {event.venue}</span><span><Users size={15} /> {event.capacity} seats</span></div><Link className="text-link" to={`/student/events/${event.id}`}>View details <span aria-hidden="true">-&gt;</span></Link></div></article>;
}

export default EventCard;
