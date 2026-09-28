import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function ManageOrganizers() {
  const navigate = useNavigate();

  const [organizers, setOrganizers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department_id: "",
    password: ""
  });

  useEffect(() => {
    fetchOrganizers();
    fetchDepartments();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const data = await apiRequest("/admin/organizers");
      setOrganizers(data);
    } catch (err) {
      console.error("Failed to fetch organizers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await apiRequest("/departments");
      setDepartments(data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddOrganizer = async (e) => {
    e.preventDefault();

    try {
      await apiRequest("/admin/organizers", {
        method: "POST",
        body: JSON.stringify(form)
      });

      alert("Organizer added successfully!");
      setForm({ name: "", email: "", department_id: "", password: "" });
      setShowForm(false);
      fetchOrganizers(); // Refresh list
    } catch (err) {
      alert(err.message || "Failed to add organizer.");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await apiRequest(`/admin/organizers/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !currentStatus })
      });
      fetchOrganizers();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const deleteOrganizer = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this organizer?");
    if (!confirmed) return;

    try {
      await apiRequest(`/admin/organizers/${id}`, {
        method: "DELETE"
      });
      fetchOrganizers();
    } catch (err) {
      alert(err.message || "Failed to delete organizer.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        <button onClick={() => navigate("/admin")} className="mb-6 text-sm font-semibold text-gray-600 hover:text-black">
          ← Back to Dashboard
        </button>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-gray-500">ADMIN</p>
            <h1 className="mt-1 text-4xl font-bold">Manage Organizers</h1>
            <p className="mt-2 text-gray-600">Manage organizer accounts and access.</p>
          </div>

          <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800">
            {showForm ? "Cancel" : "+ Add Organizer"}
          </button>
        </div>

        {/* Add Organizer Form */}
        {showForm && (
          <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Add New Organizer</h2>
            <form onSubmit={handleAddOrganizer} className="mt-5 grid gap-5 md:grid-cols-2">
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Full Name" className="rounded-lg border px-4 py-3" />
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Institutional Email" className="rounded-lg border px-4 py-3" />
              
              <select name="department_id" value={form.department_id} onChange={handleChange} required className="rounded-lg border px-4 py-3">
                <option value="" disabled>Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password (Optional)" className="rounded-lg border px-4 py-3" />

              <button type="submit" className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 md:col-span-2">
                Create Organizer
              </button>
            </form>
          </div>
        )}

        {/* Organizer Table */}
        <div className="mt-8 overflow-x-auto rounded-xl border bg-white shadow-sm">
          {isLoading ? (
             <div className="p-8 text-center text-gray-500">Loading organizers...</div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Organizer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {organizers.map((organizer) => (
                  <tr key={organizer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{organizer.name}</td>
                    <td className="px-6 py-4 text-gray-600">{organizer.email}</td>
                    <td className="px-6 py-4 text-gray-600">{organizer.department}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${organizer.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {organizer.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => toggleStatus(organizer.id, organizer.is_active)} className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-gray-50">
                          {organizer.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => deleteOrganizer(organizer.id)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {organizers.length === 0 && (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">No organizers found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </main>
  );
}

export default ManageOrganizers;