import { Link, useNavigate } from "react-router-dom";
import logo from "../../logo.jpg";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("umtUser"));

  const handleLogout = () => {
    localStorage.removeItem("umtUser");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* LOGO */}

        <Link
          to="/"
          className="brand-lockup"
        >
          <img
            src={logo}
            alt="UM-TAP"
            className="brand-mark"
          />
        </Link>


        {/* NAVIGATION */}

        <div className="flex items-center gap-6">

          {/* PUBLIC */}

          <Link
            to="/"
            className="hidden text-sm font-medium hover:font-semibold md:block"
          >
            Home
          </Link>

          <Link
            to="/events"
            className="text-sm font-medium hover:font-semibold"
          >
            Events
          </Link>


          {/* STUDENT */}

          {user?.role === "student" && (
            <Link
              to="/my-events"
              className="hidden text-sm font-medium hover:font-semibold md:block"
            >
              My Events
            </Link>
          )}


          {/* ORGANIZER */}

          {user?.role === "organizer" && (
            <>
              <Link
                to="/organizer"
                className="text-sm font-medium"
              >
                Dashboard
              </Link>

              <Link
                to="/organizer/events"
                className="hidden text-sm font-medium md:block"
              >
                Manage Events
              </Link>

              <Link
                to="/organizer/students"
                className="hidden text-sm font-medium md:block"
              >
                Students
              </Link>

              <Link
                to="/organizer/scanner"
                className="hidden text-sm font-medium md:block"
              >
                QR Scanner
              </Link>
            </>
          )}


          {/* ADMIN */}

          {user?.role === "admin" && (
            <>
              <Link
                to="/admin"
                className="text-sm font-medium"
              >
                Dashboard
              </Link>

              <Link
                to="/admin/organizers"
                className="hidden text-sm font-medium md:block"
              >
                Organizers
              </Link>
            </>
          )}


          {/* LOGIN / LOGOUT */}

          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Login
            </Link>
          )}

        </div>

      </div>

    </nav>
  );
}

export default Navbar;