import { useNavigate } from "react-router-dom";
import { useState } from "react";

function CreateEvent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    department: "",
    date: "",
    time: "",
    venue: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const existingEvents =
      JSON.parse(localStorage.getItem("umtEvents")) || [];

    const newEvent = {
      id: Date.now(),
      ...form,
      status: "Upcoming",
    };

    localStorage.setItem(
      "umtEvents",
      JSON.stringify([...existingEvents, newEvent])
    );

    alert("Event created successfully!");

    navigate("/organizer/events");
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">

        <button
          onClick={() => navigate("/organizer/events")}
          className="mb-6 text-sm font-semibold text-gray-600 hover:text-black"
        >
          ← Back to Events
        </button>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">

          <div>
            <p className="text-sm font-semibold text-gray-500">
              ORGANIZER
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Create New Event
            </h1>

            <p className="mt-2 text-gray-600">
              Provide the details for your upcoming event.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >

            <div>
              <label className="block text-sm font-semibold">
                Event Title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. BSIT General Assembly"
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Department
              </label>

              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
              >
                <option value="">
                  Select Department
                </option>

                <option value="BSIT">
                  BSIT
                </option>

                <option value="CCIS">
                  CCIS
                </option>

                <option value="All Departments">
                  All Departments
                </option>
              </select>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="block text-sm font-semibold">
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  Time
                </label>

                <input
                  type="text"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  placeholder="8:00 AM - 5:00 PM"
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>

            </div>

            <div>
              <label className="block text-sm font-semibold">
                Venue
              </label>

              <input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                required
                placeholder="Event venue"
                className="mt-2 w-full rounded-lg border px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Describe the event..."
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Create Event
            </button>

          </form>

        </div>
      </div>
    </main>
  );
}

export default CreateEvent;