import { Link } from "react-router-dom";

function Home() {
  const events = [
    {
      id: 1,
      title: "BSIT General Assembly",
      department: "BSIT",
      date: "September 15, 2026",
      time: "8:00 AM - 5:00 PM",
      venue: "UM Tagum Gymnasium",
      description:
        "A general assembly for BSIT students featuring announcements, activities, and important updates.",
    },
    {
      id: 2,
      title: "University Student Seminar",
      department: "All Departments",
      date: "September 20, 2026",
      time: "9:00 AM - 12:00 PM",
      venue: "University Auditorium",
      description:
        "An informative seminar designed to provide students with useful knowledge and insights.",
    },
    {
      id: 3,
      title: "Technology Week",
      department: "College of Computing Education",
      date: "September 25, 2026",
      time: "8:00 AM - 4:00 PM",
      venue: "UM Tagum Campus",
      description:
        "A week-long event featuring technology-related activities, competitions, and learning sessions.",
    },
  ];

  return (
    <main>

      {/* hero section */}

      <section className="border-b bg-gray-50">

        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="max-w-4xl">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">
              University of Mindanao Tagum College
            </p>

            <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Welcome to
              <br />
              <span className="text-gray-500">
                UM-TAP.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
              Your campus. Your events. Your experience.
              Discover seminars, assemblies, activities,
              and events happening around the university.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                to="/events"
                className="rounded-xl bg-black px-7 py-3.5 font-semibold text-white transition hover:bg-gray-800"
              >
                Explore Events →
              </Link>

              <Link
                to="/login"
                className="rounded-xl border border-gray-300 bg-white px-7 py-3.5 font-semibold transition hover:bg-gray-100"
              >
                Sign In
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* upcoming events section */}

      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

          <div>

            <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
              Don't miss out
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              Upcoming Events
            </h2>

            <p className="mt-2 text-gray-600">
              See what's happening around campus.
            </p>

          </div>

          <Link
            to="/events"
            className="font-semibold underline underline-offset-4"
          >
            View all events →
          </Link>

        </div>


        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {events.map((event) => (

            <article
              key={event.id}
              className="group overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >

              {/* Event header */}
              <div className="flex h-32 items-end bg-gray-100 p-6">

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm">
                  {event.department}
                </span>

              </div>


              {/* Event content */}
              <div className="p-6">

                <h3 className="text-2xl font-bold">
                  {event.title}
                </h3>

                <div className="mt-4 space-y-2 text-sm text-gray-600">

                  <p>
                    📅 {event.date}
                  </p>

                  <p>
                    🕐 {event.time}
                  </p>

                  <p>
                    📍 {event.venue}
                  </p>

                </div>

                <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-600">
                  {event.description}
                </p>

                <Link
                  to={`/events/${event.id}`}
                  className="mt-6 block font-semibold"
                >
                  View Event →
                </Link>

              </div>

            </article>

          ))}

        </div>

      </section>


      {/* how it works */}

      <section className="border-y bg-gray-50">

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="max-w-2xl">

            <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
              Simple and convenient
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              From discovery to attendance.
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              UM-TAP makes it easier for students to discover
              university events, register, and present their
              QR code when attending.
            </p>

          </div>


          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border bg-white p-7">

              <p className="text-4xl font-bold">
                01
              </p>

              <h3 className="mt-6 text-xl font-bold">
                Discover
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Browse upcoming events from different
                departments and find something you want to join.
              </p>

            </div>


            <div className="rounded-2xl border bg-white p-7">

              <p className="text-4xl font-bold">
                02
              </p>

              <h3 className="mt-6 text-xl font-bold">
                Register
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Choose an event and register using your
                student account.
              </p>

            </div>


            <div className="rounded-2xl border bg-white p-7">

              <p className="text-4xl font-bold">
                03
              </p>

              <h3 className="mt-6 text-xl font-bold">
                Tap & Attend
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Present your unique QR code and have your
                attendance verified quickly at the event.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/*cta*/}

      <section className="mx-auto max-w-7xl px-6 py-24">

        <div className="rounded-3xl bg-black px-8 py-16 text-center text-white md:px-16">

          <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Your next experience starts here
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            What's happening on campus?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-300">
            Explore upcoming events and never miss an opportunity
            to participate in your university community.
          </p>

          <Link
            to="/events"
            className="mt-8 inline-block rounded-xl bg-white px-7 py-3.5 font-semibold text-black transition hover:bg-gray-200"
          >
            Browse Upcoming Events →
          </Link>

        </div>

      </section>


      {/* footer ni dre */}

      <footer className="border-t">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">

          <p>
            © 2026 UM-TAP
          </p>

          <p>
            University Event & Attendance Management
          </p>

        </div>

      </footer>

    </main>
  );
}

export default Home;