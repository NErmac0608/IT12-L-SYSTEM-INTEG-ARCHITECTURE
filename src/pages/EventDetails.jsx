import { useNavigate, useParams } from "react-router-dom";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const event = events.find(
    (event) => event.id === Number(id)
  );

  if (!event) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold">
          Event Not Found
        </h1>

        <p className="mt-2 text-gray-600">
          The event you are looking for does not exist.
        </p>

        <button
          onClick={() => navigate("/events")}
          className="mt-6 rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
        >
          Back to Events
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">

      {/* Back Button */}
      <button
        onClick={() => navigate("/events")}
        className="mb-8 text-sm font-medium text-gray-600 hover:text-black"
      >
        ← Back to Events
      </button>

      {/* Event Information */}
      <div className="rounded-2xl border bg-white p-8 shadow-sm">

        <p className="text-sm font-semibold text-gray-500">
          {event.department}
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          {event.title}
        </h1>

        <div className="mt-8 space-y-4 text-gray-700">

          <div>
            <p className="text-sm font-semibold text-gray-500">
              Date
            </p>
            <p className="mt-1">
              {event.date}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-500">
              Time
            </p>
            <p className="mt-1">
              {event.time}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-500">
              Venue
            </p>
            <p className="mt-1">
              {event.venue}
            </p>
          </div>

        </div>

        <div className="mt-8 border-t pt-8">

          <h2 className="text-xl font-bold">
            About This Event
          </h2>

          <p className="mt-3 leading-7 text-gray-600">
            {event.description}
          </p>

        </div>

        {/* Registration */}
        <div className="mt-8 border-t pt-8">

          <button
            onClick={() => navigate(`/events/${event.id}/register`)}
            className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Register for This Event
          </button>

        </div>

      </div>

    </main>
  );
}

export default EventDetails;