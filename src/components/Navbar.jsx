import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, LogOut, Settings, CalendarDays } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../../um-tap-logo-transparent.png";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Determine if we are on a dashboard to show specific quick links
  const isDashboard = location.pathname.includes("/dashboard");

  return (
    <div className="sticky top-0 inset-x-0 z-40 flex justify-center py-2.5 px-3 md:pt-4 md:px-4 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-slate-200/60 md:border-b-0">
      {/* Sleek, Hardware-Accelerated Responsive Navbar */}
      <header className="w-full max-w-4xl bg-white/90 md:border md:border-[#EAEAEA] rounded-2xl md:rounded-full h-12 md:h-14 flex items-center justify-between px-4 md:px-6 shadow-sm md:shadow-[0_8px_32px_rgba(16,42,67,0.06)]">
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-3 group outline-none focus-visible:ring-2 focus-visible:ring-[#102a43] rounded-full px-2 py-1"
        >
          <div className="w-8 h-8 rounded-full bg-[#FBFBFA] border border-[#EAEAEA] flex items-center justify-center shadow-sm overflow-hidden group-hover:border-[#f97316]/50 transition-colors">
            <img
              src={logo}
              alt="UM-TAP Logo"
              className="w-6 h-6 object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <span className="varsity-wordmark group-hover:text-[#f97316] transition-colors">
            UM-TAP
          </span>
        </Link>

        {/* NAVIGATION & ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-6">
          <Link
            to="/events"
            className="text-[14px] font-semibold text-[#787774] hover:text-[#102a43] flex items-center gap-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#102a43] rounded-full px-3 py-2"
          >
            <CalendarDays size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Events</span>
          </Link>

          {/* DIVIDER */}
          <div className="w-px h-5 bg-[#EAEAEA] hidden sm:block"></div>

          {user ? (
            <div className="flex items-center gap-3">
              {!isDashboard && (
                <Link
                  to={`/dashboard/${user.role}`}
                  className="hidden md:flex items-center gap-2 text-[14px] font-semibold text-[#787774] hover:text-[#102a43] transition-colors px-2 py-2"
                >
                  <Settings size={16} strokeWidth={2.5} />
                  Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider bg-[#FBFBFA] text-[#102a43] border border-[#EAEAEA] px-5 py-2.5 rounded-full hover:bg-white hover:border-[#102a43]/20 hover:shadow-sm active:scale-[0.98] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#102a43]"
              >
                <span className="hidden sm:inline">Logout</span>
                <LogOut size={15} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider bg-[#102a43] text-white px-6 py-2.5 rounded-full hover:bg-[#0a1c2e] hover:shadow-md active:scale-[0.98] transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#102a43]"
            >
              <span>Sign in</span>
              <LogIn size={15} strokeWidth={2.5} />
            </Link>
          )}
        </div>
      </header>
    </div>
  );
}

export default Navbar;
