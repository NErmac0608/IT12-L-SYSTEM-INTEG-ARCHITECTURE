import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function Register() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Setup dynamic database event and loading states
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    studentId: "",
    email: "",
  });

  // 2. Fetch the target event details straight from the database view
  useEffect(() => {
    fetch(`http://localhost:5000/api/events/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("Event not found");
        return response.json();
      })
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Database connection failed:", error);
        setEvent(null);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 3. Submit registration record dynamically into your PostgreSQL table row
  const handleRegister = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: form.studentId,
        event_id: id,
        // Optional: Include name and email if your backend schema route requires them
        student_name: form.name,
        email: form.email
      })
    })
      .then((response) => {
        if (!response.ok) throw new Error("Database insertion rejected");
        return response.json();
      })
      .then((data) => {
        // Backwards compatibility fallback hook for subsequent pages checking state
        localStorage.setItem("lastRegistration", JSON.stringify(data.registration));
        
        alert("🎉 Registration successfully recorded in PostgreSQL database!");
        navigate(`/events/${id}/success`);
      })
      .catch((error) => {
        console.error("Error submitting registration to database:", error);
        alert("Failed to submit registration. Please verify database connection.");
      });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg font-medium text-gray-600">
         Loading events...
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
          The requested event record does not exist inside our system schemas.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">

      <button
        onClick={() => navigate(`/events/${id}`)}
        className="mb-8 text-sm font-medium text-gray-600 hover:text-black"
      >
        ← Back to Event
      </button>

      <div className="rounded-2xl border bg-white p-8 shadow-sm">

        <p className="text-sm font-semibold text-gray-500">
          {event.department_name || event.department}
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Register for {event.event_name || event.title}
        </h1>

        <div className="mt-6 rounded-lg bg-gray-50 p-4">

          <p className="text-sm text-gray-500">
            Event
          </p>

          <p className="font-semibold">
            {event.event_name || event.title}
          </p>

          <p className="mt-2 text-sm text-gray-600">
            {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'TBA'} • {event.start_time && event.end_time ? `${event.start_time} - ${event.end_time}` : 'TBA'}
          </p>

          <p className="text-sm text-gray-600">
            {event.venue || event.location}
          </p>

        </div>

        <form
          onSubmit={handleRegister}
          className="mt-8 space-y-5"
        >

          <div>
            <label className="block text-sm font-semibold">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">
              Student ID
            </label>

            <input
              type="text"
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              required
              placeholder="Enter your student ID"
              className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">
              Institutional Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Enter your institutional email"
              className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Confirm Registration
          </button>

        </form>

      </div>

    </main>
  );
}

export default Register;
