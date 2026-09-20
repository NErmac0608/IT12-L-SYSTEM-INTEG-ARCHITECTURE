import { ArrowRight, CalendarDays, ClipboardList, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";

function StudentDashboard() {
  const { user } = useAuth();
  const { events, getRegistrations } = useEvents();
  const registrations = getRegistrations(user.id);
  return <div><div className="page-heading"><div><p className="eyebrow">Student workspace</p><h1>Good morning, {user.name.split(" ")[1] || user.name}.</h1><p className="muted">Your next campus experience is a few taps away.</p></div><Link className="button button-dark" to="/student/events">Explore events <ArrowRight size={16} /></Link></div><div className="stats-grid"><div className="stat-card"><span>Upcoming events</span><strong>{events.length}</strong><CalendarDays /></div><div className="stat-card"><span>My registrations</span><strong>{registrations.length}</strong><ClipboardList /></div><div className="stat-card"><span>Pass ready</span><strong>{registrations.length ? "Yes" : "No"}</strong><QrCode /></div></div><section className="section-block"><div className="section-title"><div><p className="eyebrow">Recommended</p><h2>Find your next room</h2></div><Link className="text-link" to="/student/events">See all -&gt;</Link></div><div className="event-grid">{events.slice(0, 3).map((event) => <article className="mini-event" key={event.id}><span className="tag">{event.department}</span><h3>{event.title}</h3><p>{event.venue}</p><Link className="text-link" to={`/student/events/${event.id}`}>View event</Link></article>)}</div></section></div>;
}

export default StudentDashboard;
