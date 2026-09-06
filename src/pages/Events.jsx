import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Events() {
  const navigate = useNavigate();

  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const events = [
    {
      id: 1,
      title: "BSIT General Assembly",
      department: "BSIT",
      date: "September 15, 2026",
      time: "8:00 AM - 5:00 PM",
      venue: "UM Tagum Gymnasium",
      description:
        "A general assembly for BSIT students featuring announcements, activities, and important updates."
    },
    {
      id: 2,
      title: "University Student Seminar",
      department: "All Departments",
      date: "September 20, 2026",
      time: "9:00 AM - 12:00 PM",
      venue: "University Auditorium",
      description:
        "An informative seminar designed to provide students with useful knowledge and insights."
    },
    {
      id: 3,
      title: "Technology Week",
      department: "CCIS",
      date: "September 25, 2026",
      time: "8:00 AM - 4:00 PM",
      venue: "UM Tagum Campus",
      description:
        "A week-long event featuring technology-related activities, competitions, and learning sessions."
    }
  ];

  const departments = [
    "All",
    "BSIT",
    "CCIS",
    "All Departments"
  ];

  const filteredEvents =
    selectedDepartment === "All"
      ? events
      : events.filter(
          (event) => event.department === selectedDepartment
        );

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
          className="mt-2 rounded-lg border px-4 py-3 outline-none focus:ring-2"
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
            key={event.id}
            className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
          >

            <p className="text-sm font-medium text-gray-500">
              {event.department}
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {event.title}
            </h2>

            <div className="mt-4 space-y-2 text-gray-600">
              <p>📅 {event.date}</p>
              <p>🕐 {event.time}</p>
              <p>📍 {event.venue}</p>
            </div>

            <button
              onClick={() => navigate(`/events/${event.id}`)}
              className="mt-6 w-full rounded-lg bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              View Event
            </button>

          </div>
        ))}

      </div>

      {/* No Events */}
      {filteredEvents.length === 0 && (
        <div className="mt-10 text-center text-gray-500">
          No events available for this department.
        </div>
      )}

    </main>
  );
}

export default Events;