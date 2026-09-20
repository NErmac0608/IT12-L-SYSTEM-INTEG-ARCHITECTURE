import { Edit3, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import { useEvents } from "../../context/EventContext";

function EventManagementWorkspace() { const { events, deleteEvent } = useEvents(); return <div><div className="page-heading"><div><p className="eyebrow">Organizer workspace</p><h1>Event management</h1><p className="muted">Your mock event catalogue is stored locally in this browser.</p></div><Link className="button button-dark" to="/organizer/events/new"><Plus size={17} /> Create event</Link></div><div className="table-card"><div className="responsive-table"><table><thead><tr><th>Event</th><th>Department</th><th>Date</th><th>Capacity</th><th>Actions</th></tr></thead><tbody>{events.map((event) => <tr key={event.id}><td><strong>{event.title}</strong><small>{event.venue}</small></td><td>{event.department}</td><td>{event.date}</td><td>{event.capacity}</td><td className="table-actions"><Link className="icon-button" aria-label={`Edit ${event.title}`} to={`/organizer/events/${event.id}/edit`}><Edit3 size={16} /></Link><Button variant="danger" aria-label={`Delete ${event.title}`} onClick={() => deleteEvent(event.id)}><Trash2 size={16} /></Button></td></tr>)}</tbody></table></div></div></div>; }
export default EventManagementWorkspace;
