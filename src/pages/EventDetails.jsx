import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Setup dynamic states for the single event lookup
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Fetch the specific event row from your Node API on mount
  useEffect(() => {
    fetch(`http://localhost:5000/api/events/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Event not found");
        }
        return response.json();
      })
      .then((data) => {
        // Safely extract the exact single event object if the API returns an array row
        const singleEvent = Array.isArray(data) ? data[0] : data;
        setEvent(singleEvent);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load event data:", error);
        setEvent(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg font-medium text-gray-600">
         Loading event details...
      </div>
    );
  }

  if (!event) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold text-red-600">
          Event Not Found
        </h1>
        <p className="mt-2 text-gray-600">
          The event you are looking for does not exist or has been removed.
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

      {/* Event Information Card */}
      <div className="rounded-2xl border bg-white p-8 shadow-sm">

        <p className="text-sm font-semibold text-gray-500">
          {event.department_name || event.department}
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          {event.event_name || event.title}
        </h1>

        <div className="mt-8 space-y-4 text-gray-700">

          <div>
            <p className="text-sm font-semibold text-gray-500">
              Date
            </p>
            <p className="mt-1 font-medium">
              {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'TBA'}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-500">
              Time
            </p>
            <p className="mt-1 font-medium">
              {event.start_time && event.end_time ? `${event.start_time} - ${event.end_time}` : 'TBA'}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-500">
              Venue
            </p>
            <p className="mt-1 font-medium">
              {event.venue || event.location}
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
            onClick={() => navigate(`/events/${event.event_id || event.id}/register`)}
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
