import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import EventCard from "../../components/EventCard";
import { departments } from "../../data/mockData";
import { useEvents } from "../../context/EventContext";

function Events() {
	const { events } = useEvents(); const [query, setQuery] = useState(""); const [department, setDepartment] = useState(departments[0]);
	const filtered = useMemo(() => events.filter((event) => `${event.title} ${event.description}`.toLowerCase().includes(query.toLowerCase()) && (department === departments[0] || event.department === department)), [events, query, department]);
	return <div><div className="page-heading"><div><p className="eyebrow">Student events</p><h1>What is happening next?</h1><p className="muted">Search by name or narrow the list by department.</p></div></div><div className="filter-bar"><label className="search-input"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events" /></label><select value={department} onChange={(event) => setDepartment(event.target.value)}>{departments.map((item) => <option key={item}>{item}</option>)}</select></div><div className="event-grid">{filtered.map((event) => <EventCard key={event.id} event={event} />)}</div>{!filtered.length && <div className="empty-state">No events match that search.</div>}</div>;
}

export default Events;
