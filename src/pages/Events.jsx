import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Events() {
  const navigate = useNavigate();

  // 1. Setup dynamic states instead of static variables
  const [events, setEvents] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [loading, setLoading] = useState(true);

  // 2. Fetch data from your backend API when the page mounts
  useEffect(() => {
    fetch("http://localhost:5000/api/events")
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Database connection failed:", error);
        setLoading(false);
      });
  }, []);

  const departments = [
    "All",
    "BSIT",
    "CCIS",
    "All Departments"
  ];

  // 3. Filter data dynamically using your database column names
  const filteredEvents =
    selectedDepartment === "All"
      ? events
      : events.filter(
          (event) => (event.department_name || event.department) === selectedDepartment
        );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg font-medium text-gray-600">
         Loading events...
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">

      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold">
          Upcoming Events
        </h1>

        <p className="mt-2 text-gray-600">
          Browse upcoming events from different departments.
        </p>
      </div>

      {/* Department Filter */}
      <div className="mt-8">
        <label
          htmlFor="department"
          className="block text-sm font-semibold text-gray-700"
        >
          Filter by Department
        </label>

        <select
          id="department"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="mt-2 rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
        >
          {departments.map((department) => (
            <option
              key={department}
              value={department}
            >
              {department === "All"
                ? "All Departments"
                : department}
            </option>
          ))}
        </select>
      </div>

      {/* Event Cards */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {filteredEvents.map((event) => (
          <div
            key={event.event_id || event.id}
            className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
          >

            <p className="text-sm font-medium text-gray-500">
              {event.department_name || event.department}
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {event.event_name || event.title}
            </h2>

            <div className="mt-4 space-y-2 text-gray-600">
              {/* Formats dates safely from database stamps */}
              <p>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString() : event.date}</p>
              <p>🕐 {event.start_time && event.end_time ? `${event.start_time} - ${event.end_time}` : event.time}</p>
              <p>📍 {event.venue || event.location}</p>
            </div>

            <button
              onClick={() => navigate(`/events/${event.event_id || event.id}`)}
              className="mt-6 w-full rounded-lg bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              View Event
            </button>

          </div>
        ))}

      </div>

      {/* No Events Match */}
      {filteredEvents.length === 0 && (
        <div className="mt-10 text-center text-gray-500">
          No events available for this department.
        </div>
      )}

    </main>
  );
}

export default Events;
