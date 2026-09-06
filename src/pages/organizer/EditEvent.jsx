import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "BSIT General Assembly",
    department: "BSIT",
    date: "2026-09-15",
    time: "8:00 AM - 5:00 PM",
    venue: "UM Tagum Gymnasium",
    description:
      "A general assembly for BSIT students featuring announcements, activities, and important updates.",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Event updated successfully!");

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

          <p className="text-sm font-semibold text-gray-500">
            ORGANIZER
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Edit Event
          </h1>

          <p className="mt-2 text-gray-600">
            Update the information for this event.
          </p>

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
                className="mt-2 w-full rounded-lg border px-4 py-3"
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
                className="mt-2 w-full rounded-lg border px-4 py-3"
              >
                <option value="BSIT">BSIT</option>
                <option value="CCIS">CCIS</option>
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
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  Time
                </label>

                <input
                  name="time"
                  value={form.time}
                  onChange={handleChange}
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
                rows="5"
                className="mt-2 w-full rounded-lg border px-4 py-3"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Save Changes
            </button>

          </form>

        </div>
      </div>
    </main>
  );
}

export default EditEvent;