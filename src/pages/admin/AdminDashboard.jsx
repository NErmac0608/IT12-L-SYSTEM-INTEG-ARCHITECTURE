import { Link } from "react-router-dom";

function AdminDashboard() {
  const stats = [
    {
      title: "Total Organizers",
      value: "8",
      description: "Registered organizers",
    },
    {
      title: "Active Organizers",
      value: "6",
      description: "Currently active",
    },
    {
      title: "Total Events",
      value: "24",
      description: "Events created",
    },
    {
      title: "Students Registered",
      value: "1,245",
      description: "Total registrations",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <p className="text-sm font-semibold text-gray-500">
              ADMIN PANEL
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Manage UM-TAP organizers and monitor the system.
            </p>
          </div>

          <Link
            to="/admin/organizers"
            className="rounded-lg bg-black px-5 py-3 text-center font-semibold text-white hover:bg-gray-800"
          >
            Manage Organizers
          </Link>

        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500">
                {stat.title}
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {stat.value}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {stat.description}
              </p>
            </div>
          ))}

        </div>

        {/* System Overview */}
        <section className="mt-10">

          <h2 className="text-2xl font-bold">
            System Overview
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <Link
              to="/admin/organizers"
              className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md"
            >
              <h3 className="text-xl font-bold">
                Organizer Management
              </h3>

              <p className="mt-2 text-gray-600">
                Manage organizer accounts and their access to UM-TAP.
              </p>

              <span className="mt-5 inline-block text-sm font-semibold">
                Manage Organizers →
              </span>
            </Link>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">
                Event Monitoring
              </h3>

              <p className="mt-2 text-gray-600">
                Monitor events and registration activity across departments.
              </p>

              <span className="mt-5 inline-block text-sm font-semibold text-gray-400">
                Overview
              </span>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

export default AdminDashboard;