import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RegisteredStudents() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  
  // 1. Setup dynamic array state for real database records
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Pull dynamic ledger view lines straight from the backend on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/attendance")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to pull backend tracking data");
        return res.json();
      })
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Database view connection warning:", err);
        setLoading(false);
      });
  }, []);

  // 3. Map search queries safely against column values from your view schema
  const filteredStudents = students.filter(
    (student) =>
      (student.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (student.student_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (student.event_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg font-medium text-gray-600">
         Loading registered students...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        <button
          onClick={() => navigate("/organizer")}
          className="mb-6 text-sm font-semibold text-gray-600 hover:text-black"
        >
          ← Back to Dashboard
        </button>

        <div>
          <p className="text-sm font-semibold text-gray-500">
            ORGANIZER
          </p>

          <h1 className="mt-1 text-4xl font-bold">
            Registered Students
          </h1>

          <p className="mt-2 text-gray-600">
            View and search students registered for your events.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="mt-8">
          <input
            type="text"
            placeholder="Search by name, student ID, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border bg-white px-5 py-4 outline-none focus:ring-2 focus:ring-black md:max-w-xl"
          />
        </div>

        {/* Dynamic Spreadsheet Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border bg-white shadow-sm border-gray-200">

          <table className="w-full min-w-[800px]">

            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Student ID
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Event
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredStudents.map((student) => (
                <tr
                  key={student.registration_id || student.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    {student.student_name}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {student.student_id}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {student.email || `${student.student_id}@umindanao.edu.ph`}
                  </td>

                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {student.event_name}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        student.attendance_status === "Attended"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {student.attendance_status || "Absent"}
                    </span>
                  </td>
                </tr>
              ))}

            </tbody>

          </table>

          {filteredStudents.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No matching records found in database query.
            </div>
          )}

        </div>

      </div>
    </main>
  );
}

export default RegisteredStudents;
