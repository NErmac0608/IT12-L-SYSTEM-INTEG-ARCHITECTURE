import { ArrowLeft, CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";

function EventDetails() {
	const { id } = useParams(); const navigate = useNavigate(); const { user } = useAuth(); const { events, registerForEvent, isRegistered } = useEvents(); const event = events.find((item) => item.id === Number(id));
	if (!event) return <div className="empty-state">Event not found.</div>;
	const registered = isRegistered(event.id, user.id); const register = () => { registerForEvent(event.id, user.id); navigate("/student/registrations"); };
	return <div className="detail-page"><Link className="back-link" to="/student/events"><ArrowLeft size={16} /> All events</Link><section className="detail-card"><span className="tag">{event.department}</span><h1>{event.title}</h1><p className="detail-description">{event.description}</p><div className="detail-meta"><span><CalendarDays /> {event.date}</span><span><Clock3 /> {event.time}</span><span><MapPin /> {event.venue}</span><span><Users /> Capacity {event.capacity}</span></div><Button onClick={register} disabled={registered}>{registered ? "Already registered" : "Register for this event"}</Button></section></div>;
}

export default EventDetails;
