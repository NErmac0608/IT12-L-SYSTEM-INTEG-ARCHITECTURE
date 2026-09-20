import { Link } from "react-router-dom";
import EventCard from "../../components/EventCard";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";

function MyRegistrations() { const { user } = useAuth(); const { events, getRegistrations } = useEvents(); const registeredEvents = getRegistrations(user.id).map((registration) => events.find((event) => event.id === registration.eventId)).filter(Boolean); return <div><div className="page-heading"><div><p className="eyebrow">Student workspace</p><h1>My registrations</h1><p className="muted">Your reserved seats and event passes live here.</p></div><Link className="button button-dark" to="/student/events">Find an event</Link></div>{registeredEvents.length ? <div className="event-grid">{registeredEvents.map((event) => <EventCard key={event.id} event={event} />)}</div> : <div className="empty-state">You have no registrations yet. <Link to="/student/events">Browse events</Link>.</div>}</div>; }

export default MyRegistrations;
