import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisteredStudents() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const students = [
    {
      id: 1,
      name: "Juan Dela Cruz",
      studentId: "N.145242",
      email: "n.145242@umindanao.edu.ph",
      event: "BSIT General Assembly",
      status: "Registered",
    },
    {
      id: 2,
      name: "Maria Santos",
      studentId: "N.145243",
      email: "n.145243@umindanao.edu.ph",
      event: "BSIT General Assembly",
      status: "Attended",
    },
    {
      id: 3,
      name: "Pedro Reyes",
      studentId: "N.145244",
      email: "n.145244@umindanao.edu.ph",
      event: "University Student Seminar",
      status: "Registered",
    },
    {
      id: 4,
      name: "Ana Garcia",
      studentId: "N.145245",
      email: "n.145245@umindanao.edu.ph",
      event: "Technology Week",
      status: "Attended",
    },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId.toLowerCase().includes(search.toLowerCase()) ||
      student.event.toLowerCase().includes(search.toLowerCase())
  );

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

        {/* Search */}
        <div className="mt-8">
          <input
            type="text"
            placeholder="Search by name, student ID, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border bg-white px-5 py-4 outline-none focus:ring-2 md:max-w-xl"
          />
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border bg-white shadow-sm">

          <table className="w-full min-w-[800px]">

            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Student ID
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Event
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>

              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="border-b last:border-0"
                >
                  <td className="px-6 py-4 font-semibold">
                    {student.name}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {student.studentId}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {student.email}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {student.event}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        student.status === "Attended"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}

            </tbody>

          </table>

          {filteredStudents.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No students found.
            </div>
          )}

        </div>

      </div>
    </main>
  );
}

export default RegisteredStudents;