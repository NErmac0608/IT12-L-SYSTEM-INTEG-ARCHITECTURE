import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, LogOut, Settings, CalendarDays } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../../um-tap-logo-transparent.png";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (!isProfileMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
        profileButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  // Determine if we are on a dashboard to show specific quick links
  const isDashboard = location.pathname.includes("/dashboard");
  const userName = user.name || user.email || "Account";
  const userInitials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

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
              <div className="relative" ref={profileMenuRef}>
                <button
                  ref={profileButtonRef}
                  type="button"
                  onClick={() => setIsProfileMenuOpen((open) => !open)}
                  aria-label={`${userName} profile menu`}
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D8E0E8] bg-[#EAF0F5] text-sm font-bold text-[#102a43] transition-colors hover:bg-[#DCE6EF] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#102a43]"
                >
                  {userInitials}
                </button>

                {isProfileMenuOpen && (
                  <div
                    role="menu"
                    aria-label="User profile"
                    className="absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border border-[#EAEAEA] bg-white p-3 shadow-[0_12px_36px_rgba(16,42,67,0.14)]"
                  >
                    <div className="flex items-center gap-3 border-b border-[#EAEAEA] px-2 pb-3 pt-1">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF0F5] text-sm font-bold text-[#102a43]">
                        {userInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#102a43]">
                          {userName}
                        </p>
                        {user.email && (
                          <p className="truncate text-xs text-[#787774]">
                            {user.email}
                          </p>
                        )}
                        <p className="mt-0.5 text-[11px] capitalize text-[#787774]">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="mt-3 inline-flex w-full items-center justify-between rounded-full bg-[#102a43] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#0a1c2e] hover:shadow-md active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#102a43]"
                    >
                      <span>Log out</span>
                      <LogOut size={16} strokeWidth={2.25} />
                    </button>
                  </div>
                )}
              </div>
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
