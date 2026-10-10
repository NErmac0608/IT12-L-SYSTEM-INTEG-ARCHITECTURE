import { ArrowRight, QrCode, Ticket, Activity, AlertCircle, LogOut, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import ParticleBackground from "../components/ParticleBackground";
import { useEvents } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";

function Landing() {
  const { events } = useEvents();
  const { user, logout } = useAuth();
  const [showLoggedInModal, setShowLoggedInModal] = useState(false);
  const navigate = useNavigate();

  const userName = user ? user.name || user.email || "Account" : "";

  const handleAuthClick = (e) => {
    if (user) {
      e.preventDefault();
      setShowLoggedInModal(true);
    }
  };

  const handleLogoutAndLogin = () => {
    setShowLoggedInModal(false);
    logout();
    navigate("/login");
  };

  // Find the single latest ongoing event (or latest active/open event as fallback)
  const latestOngoingEvent =
    events?.filter((e) => e.status === "ongoing").sort((a, b) => Number(b.id) - Number(a.id))[0] ||
    events?.filter((e) => e.status === "open").sort((a, b) => Number(b.id) - Number(a.id))[0] ||
    events?.[events.length - 1] ||
    null;

  const eventTitle = latestOngoingEvent?.title || "SITS General Assembly";

  return (
    <main className="min-h-screen selection:bg-[#f97316]/20 selection:text-[#f97316] font-sans bg-[#FBFBFA]">
      
      {/* 1. MOBILE-FIRST HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-28 md:pb-24 overflow-hidden px-4 sm:px-6 lg:px-12 flex flex-col items-center text-center">

        <ParticleBackground />

        {/* Linear White Fade Mask */}
        <div className="absolute top-0 inset-x-0 h-[450px] md:h-[600px] bg-gradient-to-b from-[#FBFBFA] via-[#FBFBFA]/90 to-transparent z-0 pointer-events-none w-full" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center w-full">
          
          <Link
            to={latestOngoingEvent && user ? `/student/events/${latestOngoingEvent.id}` : "/events"}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EAEAEA] shadow-xs mb-3 text-[11px] sm:text-xs font-bold tracking-wide text-[#102a43] hover:border-[#f97316]/50 hover:shadow-sm transition-all group max-w-[90vw] sm:max-w-md"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f97316] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f97316]"></span>
            </span>
            <span className="truncate">
              <span className="text-[#f97316] font-extrabold mr-1.5">Live now:</span>
              <span className="font-semibold text-slate-800 group-hover:text-[#102a43] transition-colors">
                {eventTitle}
              </span>
            </span>
          </Link>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#102a43] leading-[1.08] mb-4 sm:mb-6">
            Campus events, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#102a43] to-[#52667a]">without the </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] to-[#ea580c]">chaos.</span>
          </h1>
          
          <p className="text-base sm:text-lg text-[#787774] max-w-xl mb-8 leading-relaxed px-2">
            Discover upcoming seminars and student activities. Register online and tap in instantly with your verified digital pass.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto justify-center">
            <Link 
              to="/login" 
              onClick={handleAuthClick}
              className="inline-flex items-center justify-center gap-2 bg-[#102a43] text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-[#0a1c2e] active:scale-[0.98] transition-all text-sm sm:text-base shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
            <Link 
              to="/events" 
              className="inline-flex items-center justify-center gap-2 bg-white text-[#102a43] border border-[#EAEAEA] shadow-xs px-7 py-3.5 rounded-xl font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all text-sm sm:text-base"
            >
              Browse Events
            </Link>
          </div>
        </div>

        {/* 2. OPTIMIZED HERO TICKET CARD (FLEXED HORIZONTALLY ON SM+) */}
        <div className="relative z-10 w-full max-w-xl mx-auto mt-16">
          <div className="w-full bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(16,42,67,0.12)] border border-[#EAEAEA] flex flex-col sm:flex-row overflow-hidden transition-all hover:shadow-lg">
            
            {/* LEFT SIDE: TICKET DETAILS */}
            <div className="bg-[#102a43] p-6 text-white text-left flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#f97316] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                    Sample Digital Pass
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">✓ Verified</span>
                </div>
                <h4 className="text-xl font-extrabold mb-1.5 text-white">University Tech Summit</h4>
                <p className="text-xs text-white/70">Department of Computing Education</p>
              </div>

              <div className="flex justify-between text-xs font-mono text-white/80 pt-4 border-t border-white/15 mt-4">
                <span>GYMNASIUM</span>
                <span className="text-[#f97316]">08:00 AM</span>
              </div>
            </div>
            
            {/* TICKET PERFORATION NOTCH (VERTICAL ON SM+, HORIZONTAL ON MOBILE) */}
            <div className="relative sm:w-8 h-6 sm:h-auto bg-[#FBFBFA] flex sm:flex-col items-center justify-between z-20 shrink-0">
              <div className="w-5 h-5 bg-[#FBFBFA] rounded-full -ml-2.5 sm:hidden absolute left-0" />
              <div className="flex-1 border-t-2 sm:border-t-0 sm:border-r-2 border-dashed border-[#EAEAEA] mx-4 sm:mx-0 sm:my-4 sm:h-full w-full" />
              <div className="w-5 h-5 bg-[#FBFBFA] rounded-full -mr-2.5 sm:hidden absolute right-0" />
              <div className="hidden sm:block w-5 h-5 bg-[#FBFBFA] rounded-full -mt-2.5 absolute top-0" />
              <div className="hidden sm:block w-5 h-5 bg-[#FBFBFA] rounded-full -mb-2.5 absolute bottom-0" />
            </div>

            {/* RIGHT SIDE: QR CODE FLEXED */}
            <div className="p-6 flex flex-col items-center justify-center bg-white sm:w-[220px] shrink-0">
              <div className="p-2.5 border-2 border-[#EAEAEA] rounded-2xl bg-white shadow-xs">
                <QrCode size={135} strokeWidth={1.5} className="text-[#102a43]" />
              </div>
              <p className="mt-3 text-[10px] font-mono text-[#787774] tracking-[0.2em] uppercase font-bold">
                ID: TAP-2026-X8
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CLEAN FEATURE GRID */}
      <section className="bg-white relative z-20 border-t border-[#EAEAEA] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#102a43] mb-3">
              Fast, paperless campus operations.
            </h2>
            <p className="text-[#787774] text-sm sm:text-base leading-relaxed">
              Replacing clipboard sign-ins with instant digital check-ins, automated attendance rosters, and offline passes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Feature 1 */}
            <div className="bg-[#FBFBFA] border border-[#EAEAEA] rounded-2xl p-6 flex flex-col h-full hover:border-[#102a43]/20 transition-colors">
              <div className="w-15 h-15 bg-white rounded-xl shadow-xs border border-[#EAEAEA] flex items-center justify-center text-[#f97316] mb-4">
                <QrCode size={20} />
              </div>
              <h3 className="text-base font-bold text-[#111111] mb-2">Instant QR Passes</h3>
              <p className="text-xs sm:text-sm text-[#787774] leading-relaxed flex-1">
                Every student receives a unique, cryptographically verified ticket stored directly in their mobile wallet.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#102a43] rounded-2xl p-6 flex flex-col h-full text-white">
              <div className="w-15 h-15 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center text-white mb-4">
                <Activity size={20} />
              </div>
              <h3 className="text-base font-bold mb-2">Real-time Check-in Station</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed flex-1">
                Organizers scan tickets with rapid 14ms verification latency and instant double check-in rejection.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. SOLID DARK FOOTER CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 bg-[#102a43] text-center relative z-20">
        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
          <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-[#f97316] mb-6">
            <Ticket size={24} />
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Ready to tap in?
          </h2>
          <p className="text-white/70 text-xs sm:text-sm mb-8">
            Sign up with your institutional email and explore active campus activities today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
            <Link 
              to="/register" 
              onClick={handleAuthClick}
              className="inline-flex items-center justify-center gap-2 bg-[#f97316] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#ea580c] transition-colors shadow-sm text-sm"
            >
              Create student profile
            </Link>
            <Link 
              to="/login" 
              onClick={handleAuthClick}
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border border-white/20 px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors text-sm"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Global Footer Elements */}
        <footer className="relative z-10 max-w-5xl mx-auto mt-16 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-white/50 text-xs">
          <p>© 2026 UM-TAP. University of Mindanao Tagum College.</p>
          <div className="flex gap-4">
            <Link to="/events" className="hover:text-white transition-colors">Calendar</Link>
            <Link to="/login" onClick={handleAuthClick} className="hover:text-white transition-colors">Student Portal</Link>
          </div>
        </footer>
      </section>

      {/* ALREADY LOGGED IN WARNING MODAL */}
      {showLoggedInModal && user && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logged-in-title"
          onClick={() => setShowLoggedInModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowLoggedInModal(false)}
              aria-label="Close dialog"
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
              <AlertCircle size={28} />
            </div>

            <h3 id="logged-in-title" className="text-xl font-extrabold text-[#102a43] mb-2">
              Already Signed In
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              You are currently authenticated as{" "}
              <strong className="text-[#102a43]">{userName}</strong> (
              <span className="capitalize font-semibold text-[#f97316]">{user.role}</span>).
              You do not need to sign in again.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowLoggedInModal(false);
                navigate(`/dashboard/${user.role}`);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#102a43] hover:bg-[#0a1c2e] text-white py-3 px-5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-[0.98]"
            >
              <span>Go to Your Dashboard</span>
              <ArrowRight size={16} />
            </button>

            <div className="flex gap-2 w-full mt-2.5">
              <button
                type="button"
                onClick={handleLogoutAndLogin}
                className="flex-1 py-2.5 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut size={13} />
                <span>Switch Account</span>
              </button>
              <button
                type="button"
                onClick={() => setShowLoggedInModal(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                Stay Here
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

export default Landing;
