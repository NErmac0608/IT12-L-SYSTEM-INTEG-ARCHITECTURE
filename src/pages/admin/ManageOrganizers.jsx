import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Trash2 } from "lucide-react";
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

  const fetchOrganizers = useCallback(async () => {
    try {
      const data = await apiRequest("/admin/organizers");
      setOrganizers(data);
    } catch (err) {
      console.error("Failed to fetch organizers:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    apiRequest("/admin/organizers")
      .then((data) => {
        if (!ignore) setOrganizers(data);
      })
      .catch((err) => console.error("Failed to fetch organizers:", err))
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    apiRequest("/departments")
      .then((data) => {
        if (!ignore) setDepartments(data);
      })
      .catch((err) => console.error("Failed to fetch departments:", err));

    return () => {
      ignore = true;
    };
  }, []);

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

      alert("Organizer account provisioned successfully!");
      setForm({ name: "", email: "", department_id: "", password: "" });
      setShowForm(false);
      fetchOrganizers();
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
    } catch {
      alert("Failed to update account status.");
    }
  };

  const deleteOrganizer = async (id) => {
    const confirmed = window.confirm("Are you sure you want to remove this organizer account?");
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
    <div className="space-y-6 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button 
            type="button"
            onClick={() => navigate("/dashboard/admin")} 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Organizer Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Provision faculty accounts and manage departmental permissions.
          </p>
        </div>

        <button 
          type="button"
          onClick={() => setShowForm(!showForm)} 
          className="inline-flex items-center justify-center gap-2 bg-[#102a43] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#0a1c2e] transition-colors shadow-xs w-full sm:w-auto cursor-pointer"
        >
          {showForm ? "Close Form" : (
            <>
              <UserPlus size={16} />
              <span>Add Organizer</span>
            </>
          )}
        </button>
      </div>

      {/* ADD ORGANIZER DRAWER / FORM */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Provision New Organizer</h2>
            <span className="text-xs text-slate-400">Institutional Faculty Only</span>
          </div>

          <form onSubmit={handleAddOrganizer} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Full Name *</label>
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                required 
                placeholder="Prof. Maria Santos" 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#102a43]" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">School Email *</label>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                required 
                placeholder="msantos@umindanao.edu.ph" 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#102a43]" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Department *</label>
              <select 
                name="department_id" 
                value={form.department_id} 
                onChange={handleChange} 
                required 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#102a43] cursor-pointer"
              >
                <option value="" disabled>Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Initial Password</label>
              <input 
                type="password" 
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder="Defaults to organizer123" 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#102a43]" 
              />
            </div>

            <div className="sm:col-span-2 pt-2 flex justify-end">
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ORGANIZERS ROSTER (Responsive Card Grid on Mobile, Clean Table on Desktop) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading organizer accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Faculty Member</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {organizers.map((organizer) => (
                  <tr key={organizer.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <strong className="text-slate-900 block font-semibold">{organizer.name}</strong>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {organizer.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">{organizer.department}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        organizer.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}>
                        {organizer.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          type="button"
                          onClick={() => toggleStatus(organizer.id, organizer.is_active)} 
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          {organizer.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button 
                          type="button"
                          onClick={() => deleteOrganizer(organizer.id)} 
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {organizers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      No organizer accounts registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageOrganizers;