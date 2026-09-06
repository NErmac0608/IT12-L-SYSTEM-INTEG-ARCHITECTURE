import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function ManageEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([
    {
      id: 1,
      title: "BSIT General Assembly",
      department: "BSIT",
      date: "September 15, 2026",
      time: "8:00 AM - 5:00 PM",
      venue: "UM Tagum Gymnasium",
      status: "Upcoming",
    },
    {
      id: 2,
      title: "University Student Seminar",
      department: "All Departments",
      date: "September 20, 2026",
      time: "9:00 AM - 12:00 PM",
      venue: "University Auditorium",
      status: "Upcoming",
    },
    {
      id: 3,
      title: "Technology Week",
      department: "CCIS",
      date: "September 25, 2026",
      time: "8:00 AM - 4:00 PM",
      venue: "UM Tagum Campus",
      status: "Upcoming",
    },
  ]);

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    setEvents(events.filter((event) => event.id !== id));
  };

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
            className="rounded-lg bg-black px-5 py-3 text-center font-semibold text-white hover:bg-gray-800"
          >
            + Create Event
          </Link>

        </div>

        <div className="mt-8 space-y-5">

          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >

              <div className="flex flex-col justify-between gap-5 lg:flex-row">

                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    {event.department}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {event.title}
                  </h2>

                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <p>📅 {event.date}</p>
                    <p>🕐 {event.time}</p>
                    <p>📍 {event.venue}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {event.status}
                  </span>

                  <Link
                    to={`/organizer/events/${event.id}/edit`}
                    className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(event.id)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
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
          className="mt-8 text-sm font-semibold text-gray-600 hover:text-black"
        >
          ← Back to Dashboard
        </button>

      </div>
    </main>
  );
}

export default ManageEvents;