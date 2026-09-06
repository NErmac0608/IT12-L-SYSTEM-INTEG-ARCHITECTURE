import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ManageOrganizers() {
  const navigate = useNavigate();

  const [organizers, setOrganizers] = useState([
    {
      id: 1,
      name: "Juan Dela Cruz",
      email: "juan@umindanao.edu.ph",
      department: "CCIS",
      status: "Active",
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@umindanao.edu.ph",
      department: "BSIT",
      status: "Active",
    },
    {
      id: 3,
      name: "Pedro Reyes",
      email: "pedro@umindanao.edu.ph",
      department: "Business",
      status: "Inactive",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddOrganizer = (e) => {
    e.preventDefault();

    const newOrganizer = {
      id: Date.now(),
      ...form,
      status: "Active",
    };

    setOrganizers([
      ...organizers,
      newOrganizer,
    ]);

    setForm({
      name: "",
      email: "",
      department: "",
    });

    setShowForm(false);
  };

  const toggleStatus = (id) => {
    setOrganizers(
      organizers.map((organizer) =>
        organizer.id === id
          ? {
              ...organizer,
              status:
                organizer.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : organizer
      )
    );
  };

  const deleteOrganizer = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this organizer?"
    );

    if (!confirmed) return;

    setOrganizers(
      organizers.filter(
        (organizer) => organizer.id !== id
      )
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        <button
          onClick={() => navigate("/admin")}
          className="mb-6 text-sm font-semibold text-gray-600 hover:text-black"
        >
          ← Back to Dashboard
        </button>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <p className="text-sm font-semibold text-gray-500">
              ADMIN
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Manage Organizers
            </h1>

            <p className="mt-2 text-gray-600">
              Manage organizer accounts and access.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
          >
            + Add Organizer
          </button>

        </div>

        {/* Add Organizer */}
        {showForm && (
          <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold">
              Add Organizer
            </h2>

            <form
              onSubmit={handleAddOrganizer}
              className="mt-5 grid gap-5 md:grid-cols-3"
            >

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Full Name"
                className="rounded-lg border px-4 py-3"
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Institutional Email"
                className="rounded-lg border px-4 py-3"
              />

              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                placeholder="Department"
                className="rounded-lg border px-4 py-3"
              />

              <button
                type="submit"
                className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 md:col-span-3"
              >
                Create Organizer
              </button>

            </form>

          </div>
        )}

        {/* Organizer Table */}
        <div className="mt-8 overflow-x-auto rounded-xl border bg-white shadow-sm">

          <table className="w-full min-w-[800px]">

            <thead className="border-b bg-gray-50">

              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Organizer
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Department
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody>

              {organizers.map((organizer) => (

                <tr
                  key={organizer.id}
                  className="border-b last:border-0"
                >

                  <td className="px-6 py-4 font-semibold">
                    {organizer.name}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {organizer.email}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {organizer.department}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        organizer.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {organizer.status}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          toggleStatus(organizer.id)
                        }
                        className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-gray-50"
                      >
                        {organizer.status === "Active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        onClick={() =>
                          deleteOrganizer(organizer.id)
                        }
                        className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
    </main>
  );
}

export default ManageOrganizers;