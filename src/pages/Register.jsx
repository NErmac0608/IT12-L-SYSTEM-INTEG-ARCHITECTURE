import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

const events = [
  {
    id: 1,
    title: "BSIT General Assembly",
    department: "BSIT",
    date: "September 15, 2026",
    time: "8:00 AM - 5:00 PM",
    venue: "UM Tagum Gymnasium",
  },
  {
    id: 2,
    title: "University Student Seminar",
    department: "All Departments",
    date: "September 20, 2026",
    time: "9:00 AM - 12:00 PM",
    venue: "University Auditorium",
  },
  {
    id: 3,
    title: "Technology Week",
    department: "CCIS",
    date: "September 25, 2026",
    time: "8:00 AM - 4:00 PM",
    venue: "UM Tagum Campus",
  },
];

function Register() {
  const { id } = useParams();
  const navigate = useNavigate();

  const event = events.find(
    (event) => event.id === Number(id)
  );

  const [form, setForm] = useState({
    name: "",
    studentId: "",
    email: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();

    const registrations =
      JSON.parse(
        localStorage.getItem("umtRegistrations")
      ) || [];

    const registration = {
      id: Date.now(),
      eventId: event.id,
      eventTitle: event.title,
      name: form.name,
      studentId: form.studentId,
      email: form.email,
      qrToken: `UM-TAP-${event.id}-${Date.now()}`,
      status: "Registered",
    };

    localStorage.setItem(
      "umtRegistrations",
      JSON.stringify([
        ...registrations,
        registration,
      ])
    );

    localStorage.setItem(
      "lastRegistration",
      JSON.stringify(registration)
    );

    navigate(`/events/${id}/success`);
  };

  if (!event) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold">
          Event Not Found
        </h1>
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
          {event.department}
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Register for {event.title}
        </h1>

        <div className="mt-6 rounded-lg bg-gray-50 p-4">

          <p className="text-sm text-gray-500">
            Event
          </p>

          <p className="font-semibold">
            {event.title}
          </p>

          <p className="mt-2 text-sm text-gray-600">
            {event.date} • {event.time}
          </p>

          <p className="text-sm text-gray-600">
            {event.venue}
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
              className="mt-2 w-full rounded-lg border px-4 py-3"
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
              className="mt-2 w-full rounded-lg border px-4 py-3"
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
              className="mt-2 w-full rounded-lg border px-4 py-3"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
          >
            Confirm Registration
          </button>

        </form>

      </div>

    </main>
  );
}

export default Register;