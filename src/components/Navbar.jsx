import { Link, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Ticket } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../../um-tap-logo-transparent.png";

function Navbar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="topbar">

      <div className="topbar-inner">

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
          <span className="brand-title">UM-TAP</span>
        </Link>


        {/* NAVIGATION */}

        <div className="topbar-actions">

          {/* PUBLIC */}

          <Link to="/events" className="topbar-link"><Ticket size={17} /> Events</Link>


          {/* LOGIN / LOGOUT */}

          {user ? (
            <button
              onClick={handleLogout}
              className="button button-dark"
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="button button-dark"
            >
              <LogIn size={16} />
              Login
            </Link>
          )}

        </div>

      </div>

    </nav>
  );
}

export default Navbar;