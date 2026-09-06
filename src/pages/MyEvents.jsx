import { useNavigate } from "react-router-dom";

function MyEvents() {
  const navigate = useNavigate();

  const registeredEvents =
    JSON.parse(
      localStorage.getItem("umtRegistrations")
    ) || [];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">

      <h1 className="text-4xl font-bold">
        My Events
      </h1>

      <p className="mt-2 text-gray-600">
        View the events you have registered for.
      </p>

      {registeredEvents.length === 0 ? (

        <div className="mt-10 rounded-xl border bg-white p-10 text-center">

          <h2 className="text-xl font-bold">
            No Registered Events
          </h2>

          <p className="mt-2 text-gray-500">
            You have not registered for any events yet.
          </p>

          <button
            onClick={() => navigate("/events")}
            className="mt-6 rounded-lg bg-black px-5 py-3 font-semibold text-white"
          >
            Browse Events
          </button>

        </div>

      ) : (

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {registeredEvents.map((event) => (

            <div
              key={event.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >

              <p className="text-sm font-medium text-gray-500">
                Registered
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {event.eventTitle}
              </h2>

              <div className="mt-4 space-y-2 text-gray-600">

                <p>
                  👤 {event.name}
                </p>

                <p>
                  🎓 {event.studentId}
                </p>

                <p>
                  ✉️ {event.email}
                </p>

              </div>

              <button
                onClick={() => {
                  localStorage.setItem(
                    "lastRegistration",
                    JSON.stringify(event)
                  );

                  navigate(
                    `/events/${event.eventId}/qr`
                  );
                }}
                className="mt-6 w-full rounded-lg bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800"
              >
                View QR Code
              </button>

            </div>

          ))}

        </div>

      )}

    </main>
  );
}

export default MyEvents;