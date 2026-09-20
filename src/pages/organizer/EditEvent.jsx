import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    department: "",
    date: "",
    time: "",
    venue: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch the existing event record from the database to fill the form
  useEffect(() => {
    fetch(`http://localhost:5000/api/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Event not found");
        return res.json();
      })
      .then((data) => {
        // Safe check to match both database views or raw table schemas
        const eventData = Array.isArray(data) ? data : data;
        
        // Format the database date string safely to YYYY-MM-DD for the HTML input field
        const cleanDate = eventData.event_date ? new Date(eventData.event_date).toISOString().split('T') : "";

        setForm({
          title: eventData.event_name || eventData.title || "",
          department: eventData.department_id || eventData.department || "BSIT",
          date: cleanDate,
          time: eventData.start_time && eventData.end_time ? `${eventData.start_time} - ${eventData.end_time}` : "",
          venue: eventData.venue || eventData.location || "",
          description: eventData.description || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Database connection failure:", err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const timeParts = form.time.split("-");
    const startTimeParsed = timeParts ? timeParts.trim() : "08:00:00";
    const endTimeParsed = timeParts ? timeParts.trim() : "17:00:00";

    const payload = {
      event_name: form.title,
      description: form.description,
      venue: form.venue,
      event_date: form.date,
      start_time: startTimeParsed,
      end_time: endTimeParsed,
      department_id: form.department === "All Departments" ? "BSIT" : form.department,
    };

    // 2. Send the updated changes back to PostgreSQL
    fetch(`http://localhost:5000/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Database update rejected");
        return res.json();
      })
      .then(() => {
        alert(" Event updated successfully!");
        navigate("/organizer/events");
      })
      .catch((err) => {
        console.error("Database error:", err);
        alert("Failed to save changes. Verify server state.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg font-medium text-gray-600">
         Loading event details...
      </div>
    );
  }

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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
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
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
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
                disabled={isSubmitting}
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
                rows="5"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>

          </form>

        </div>
      </div>
    </main>
  );
}

export default EditEvent;
