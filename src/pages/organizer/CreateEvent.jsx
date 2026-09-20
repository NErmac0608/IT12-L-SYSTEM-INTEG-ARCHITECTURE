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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Splits common single layout string formats like '8:00 AM - 5:00 PM' safely into structural table fields
    const timeParts = form.time.split("-");
    const startTimeParsed = timeParts[0] ? timeParts[0].trim() : "08:00:00";
    const endTimeParsed = timeParts[1] ? timeParts[1].trim() : "17:00:00";

    // Maps form input strings to match your exact PostgreSQL table schema criteria
    const payload = {
      event_name: form.title,
      description: form.description,
      venue: form.venue,
      event_date: form.date,
      start_time: startTimeParsed,
      end_time: endTimeParsed,
      organizer_id: 1, // Anchor placeholder linked to default root organizer login profiles
      department_id: form.department === "All Departments" ? "BSIT" : form.department, // Normalizes values
    };

    fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Database rejected event entry insertion profile");
        return res.json();
      })
      .then(() => {
        alert(" Event successfully created!");
        navigate("/organizer/events");
      })
      .catch((err) => {
        console.error("Database connection failure:", err);
        alert("Error connecting to server. Please verify your Express backend app status.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
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
                disabled={isSubmitting}
                placeholder="e.g. BSIT General Assembly"
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
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
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
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
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
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
                  disabled={isSubmitting}
                  placeholder="8:00 AM - 5:00 PM"
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
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
                disabled={isSubmitting}
                placeholder="Event venue"
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
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
                disabled={isSubmitting}
                placeholder="Describe the event..."
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? "Saving to Database..." : "Create Event"}
            </button>

          </form>

        </div>
      </div>
    </main>
  );
}

export default CreateEvent;
