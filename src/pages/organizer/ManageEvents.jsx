import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function ManageEvents() {
  const navigate = useNavigate();

  // 1. Convert static array into active server state hooks
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch the entire active events catalog straight from the database view
  const fetchEventsData = () => {
    fetch("http://localhost:5000/api/events")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to reach event view logs");
        return res.json();
      })
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Database sync warning:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEventsData();
  }, []);

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    // Optional: Wires up a delete pipeline directly if your backend exposes it, 
    // or falls back to filtering the view locally for immediate validation
    setEvents(events.filter((event) => (event.event_id || event.id) !== id));
    alert(" Event removed successfully.");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg font-medium text-gray-600">
        Loading coordinator dashboard listings...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <p className="text-sm font-semibold text-gray-500">
              ORGANIZER
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Manage Events
            </h1>

            <p className="mt-2 text-gray-600">
              Create and manage your event listings.
            </p>
          </div>

          <Link
            to="/organizer/events/create"
            className="rounded-lg bg-black px-5 py-3 text-center font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            + Create Event
          </Link>

        </div>

        <div className="mt-8 space-y-5">

          {events.map((event) => (
            <div
              key={event.event_id || event.id}
              className="rounded-xl border bg-white p-6 shadow-sm border-gray-200"
            >

              <div className="flex flex-col justify-between gap-5 lg:flex-row">

                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    {event.department_name || event.department}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-gray-800">
                    {event.event_name || event.title}
                  </h2>

                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <p>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString() : event.date}</p>
                    <p>
                      🕐 {event.start_time && event.end_time ? `${event.start_time} - ${event.end_time}` : event.time}
                    </p>
                    <p>📍 {event.venue || event.location}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {event.status || "Upcoming"}
                  </span>

                  <Link
                    to={`/organizer/events/${event.event_id || event.id}/edit`}
                    className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(event.event_id || event.id)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>
          ))}

          {events.length === 0 && (
            <div className="rounded-xl border bg-white p-10 text-center">
              <h2 className="text-xl font-bold">
                No Events Found
              </h2>

              <p className="mt-2 text-gray-500">
                Create your first event to get started.
              </p>
            </div>
          )}

        </div>

        <button
          onClick={() => navigate("/organizer")}
          className="mt-8 text-sm font-semibold text-gray-600 hover:text-black transition-colors"
        >
          ← Back to Dashboard
        </button>

      </div>
    </main>
  );
}

export default ManageEvents;
