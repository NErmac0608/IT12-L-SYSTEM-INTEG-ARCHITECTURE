import { ArrowLeft, CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";
import QRCodeDisplay from "../../components/QRCodeDisplay";

function EventDetails() {
	const { id } = useParams(); 
	const navigate = useNavigate(); 
	const { user } = useAuth(); 
	const { events, registrations, registerForEvent, isRegistered } = useEvents(); 
	
	const event = events.find((item) => item.id === Number(id) || item.id === id);
	if (!event) return <div className="empty-state">Event not found.</div>;
	
	const registered = isRegistered(event.id, user.id); 
	const registration = registrations.find(item => (item.event_id === event.id || item.eventId === event.id) && (item.student_id_record === user.id || item.userId === user.id));

	const register = async () => { 
		await registerForEvent(event.id, user.id); 
		// State updates automatically, staying on page to show QR
	};
	
	return (
		<div className="detail-page">
			<Link className="back-link" to="/student/events"><ArrowLeft size={16} /> All events</Link>
			<section className="detail-card">
				<span className="tag">{event.department}</span>
				<h1>{event.title}</h1>
				<p className="detail-description">{event.description}</p>
				<div className="detail-meta">
					<span><CalendarDays /> {event.event_date || event.date}</span>
					<span><Clock3 /> {event.start_time || event.time}</span>
					<span><MapPin /> {event.location || event.venue}</span>
					{event.capacity && <span><Users /> Capacity {event.capacity}</span>}
				</div>
				
				{!registered ? (
					<Button onClick={register}>Register for this event</Button>
				) : (
					<div className="mt-8 flex flex-col items-center border-t border-gray-100 pt-8">
						<h3 className="mb-4 text-xl font-bold text-green-600">✓ You are registered!</h3>
						<p className="mb-6 text-center text-gray-500">Present this QR code ticket to the organizer at the venue.</p>
						{registration?.qr_token && (
							<QRCodeDisplay value={registration.qr_token} label={`${event.title} Ticket`} />
						)}
					</div>
				)}
			</section>
		</div>
	);
}

export default EventDetails;
