import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function MyEvents() {
  const navigate = useNavigate();

  // 1. Setup dynamic data management states
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Identify the active logged-in student (Fallback placeholder '12345' if empty)
  const storedUser = JSON.parse(localStorage.getItem("umtUser")) || {};
  const activeStudentId = storedUser.studentId || "12345"; 

  useEffect(() => {
    // Fetch all attendance and registration view listings
    fetch("http://localhost:5000/api/attendance")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to pull backend attendance logs");
        return res.json();
      })
      .then((data) => {
        // Filter out records matching only our active logged-in student ID
        const studentRecords = data.filter(
          (record) => String(record.student_id) === String(activeStudentId)
        );
        setRegisteredEvents(studentRecords);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Database connection failed:", err);
        setLoading(false);
      });
  }, [activeStudentId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg font-medium text-gray-600">
        Fetching your registered events...
      </div>
    );
  }

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
            className="mt-6 rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Browse Events
          </button>

        </div>

      ) : (

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {registeredEvents.map((event) => (

            <div
              key={event.registration_id || event.id}
              className="rounded-xl border bg-white p-6 shadow-sm border-gray-200"
            >

              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">
                  Registered
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  event.attendance_status === "Attended" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {event.attendance_status || "Absent"}
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {event.event_name}
              </h2>

              <div className="mt-4 space-y-2 text-gray-600 border-t pt-4">

                <p className="text-sm">
                   <strong className="text-gray-700">Name:</strong> {event.student_name}
                </p>

                <p className="text-sm">
                   <strong className="text-gray-700">ID:</strong> {event.student_id}
                </p>

                <p className="text-sm">
                   <strong className="text-gray-700">Venue:</strong> {event.venue || "Campus Venue"}
                </p>

              </div>

              <button
                onClick={() => {
                  // Cache single active item block for QR code rendering pathways
                  localStorage.setItem(
                    "lastRegistration",
                    JSON.stringify(event)
                  );

                  navigate(
                    `/events/${event.event_id}/qr`
                  );
                }}
                className="mt-6 w-full rounded-lg bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800 transition-colors"
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
