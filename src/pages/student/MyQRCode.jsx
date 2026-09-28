import { QrCode } from "lucide-react";
import QRCodeDisplay from "../../components/QRCodeDisplay";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";
import { Link } from "react-router-dom";

function MyQRCode() { 
  const { user } = useAuth(); 
  const { events, getRegistrations } = useEvents(); 
  
  const registeredEvents = getRegistrations(user.id).map((reg) => {
    const event = events.find(e => e.id === reg.event_id || e.id === reg.eventId);
    return event ? { ...event, qr_token: reg.qr_token } : null;
  }).filter(Boolean);

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Student pass</p>
          <h1>Your Active Passes</h1>
          <p className="muted">Show these unique passes at the door to check in.</p>
        </div>
        <QrCode size={34} />
      </div>
      
      <div className="event-grid">
        {registeredEvents.map(event => (
          <div key={event.id} className="form-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '10px' }}>{event.title}</h3>
            <p className="muted" style={{ marginBottom: '20px' }}>{new Date(event.event_date).toLocaleDateString()} @ {event.location}</p>
            {event.qr_token ? (
              <QRCodeDisplay value={event.qr_token} label="Active Pass" />
            ) : (
              <p>QR Code not generated.</p>
            )}
          </div>
        ))}
        {registeredEvents.length === 0 && (
          <div className="empty-state">
            You don't have any active event passes yet. <Link to="/student/events">Register for an event</Link>.
          </div>
        )}
      </div>
    </div>
  ); 
}

export default MyQRCode;
