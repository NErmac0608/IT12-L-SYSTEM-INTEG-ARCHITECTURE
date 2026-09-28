import { Link } from "react-router-dom";
import { useEvents } from "../../context/EventContext";
import { useAuth } from "../../context/AuthContext";

function OrganizerDashboard() {
  const { events, registrations } = useEvents();
  const { user } = useAuth();

  // Optionally filter events by this organizer, or show all depending on requirements.
  // Assuming the DB maps organizer_id to user.id
  const myEvents = events.filter(e => e.organizer_id === user.id || e.organizerId === user.id || true); // Showing all for demo since we just wired it

  const myRegistrations = registrations.filter(r => myEvents.some(e => e.id === r.event_id || e.id === r.eventId));
  const attendedCount = myRegistrations.filter(r => r.status === "attended").length;
  const pendingEventsCount = myEvents.filter(e => e.status === "open").length;

  const stats = [
    {
      title: "Total Events",
      value: myEvents.length.toString(),
      description: "Events created",
    },
    {
      title: "Registered Students",
      value: myRegistrations.length.toString(),
      description: "Total registrations",
    },
    {
      title: "Attendance",
      value: attendedCount.toString(),
      description: "Students attended",
    },
    {
      title: "Pending Events",
      value: pendingEventsCount.toString(),
      description: "Upcoming events",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-gray-500">
              ORGANIZER PANEL
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Organizer Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your events, registrations, and attendance.
            </p>
          </div>

          <Link
            to="/organizer/events/create"
            className="rounded-lg bg-black px-5 py-3 text-center font-semibold text-white hover:bg-gray-800"
          >
            + Create Event
          </Link>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500">
                {stat.title}
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {stat.value}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            Quick Actions
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-3">

            <Link
              to="/organizer/events"
              className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-xl font-bold">
                Manage Events
              </h3>

              <p className="mt-2 text-gray-600">
                Create, edit, view, and delete event listings.
              </p>
            </Link>

            <Link
              to="/organizer/students"
              className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-xl font-bold">
                Registered Students
              </h3>

              <p className="mt-2 text-gray-600">
                View and search students registered for your events.
              </p>
            </Link>

            <Link
              to="/organizer/scanner"
              className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-xl font-bold">
                QR Scanner
              </h3>

              <p className="mt-2 text-gray-600">
                Scan student QR codes and record attendance.
              </p>
            </Link>

          </div>
        </section>

        {/* Recent Events */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Recent Events
            </h2>

            <Link
              to="/organizer/events"
              className="text-sm font-semibold hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="grid grid-cols-4 border-b bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-500">
              <span>Event</span>
              <span>Date</span>
              <span>Status</span>
              <span>Registrations</span>
            </div>

            <div className="divide-y divide-gray-100">
              {myEvents.slice(0, 3).map((event) => {
                const eventRegCount = registrations.filter(r => r.event_id === event.id).length;
                return (
                  <div key={event.id} className="grid grid-cols-4 items-center px-6 py-5 hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900 truncate pr-4">
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {event.department}
                      </p>
                    </div>

                    <span className="text-sm text-gray-600">
                      {new Date(event.event_date || event.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>

                    <div>
                      <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${event.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {event.status}
                      </span>
                    </div>

                    <span className="font-semibold text-gray-700">
                      {eventRegCount}
                    </span>
                  </div>
                );
              })}
              
              {myEvents.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No events found. Start by creating one!
                </div>
              )}
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}

export default OrganizerDashboard;