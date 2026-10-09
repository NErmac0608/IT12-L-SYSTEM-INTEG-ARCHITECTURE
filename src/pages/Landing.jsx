import { ArrowRight, QrCode, Ticket, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import ParticleBackground from "../components/ParticleBackground";

function Landing() {
  return (
    <main className="min-h-screen selection:bg-[#f97316]/20 selection:text-[#f97316] font-sans bg-[#FBFBFA]">
      
      {/* 1. MOBILE-FIRST HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-28 md:pb-24 overflow-hidden px-4 sm:px-6 lg:px-12 flex flex-col items-center text-center">

        <ParticleBackground />

        {/* Linear White Fade Mask */}
        <div className="absolute top-0 inset-x-0 h-[450px] md:h-[600px] bg-gradient-to-b from-[#FBFBFA] via-[#FBFBFA]/90 to-transparent z-0 pointer-events-none w-full" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center w-full">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EAEAEA] shadow-xs mb-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#102a43]">
            <span className="w-2 h-2 rounded-full bg-[#f97316]" />
            UM Tagum Event Portal
          </div>

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

        {/* 2. OPTIMIZED HERO TICKET CARD */}
        <div className="relative z-10 w-full max-w-sm mx-auto mt-20 md:mt-16">
          <div className="w-full bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(16,42,67,0.12)] border border-[#EAEAEA] flex flex-col overflow-hidden">
            <div className="bg-[#102a43] p-5 text-white text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#f97316] bg-white/10 px-2 py-0.5 rounded-full">
                  Sample Digital Pass
                </span>
                <span className="text-xs font-mono text-white/70">Verified</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">University Tech Summit</h4>
              <div className="flex justify-between text-xs font-mono text-white/80">
                <span>GYMNASIUM</span>
                <span>08:00 AM</span>
              </div>
            </div>
            
            {/* Ticket Perforation Notch */}
            <div className="h-6 bg-white relative flex items-center justify-between z-20">
              <div className="w-5 h-5 bg-[#FBFBFA] rounded-full -ml-2.5 absolute left-0 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.05)]" />
              <div className="flex-1 border-t-2 border-dashed border-[#EAEAEA] mx-4" />
              <div className="w-5 h-5 bg-[#FBFBFA] rounded-full -mr-2.5 absolute right-0 shadow-[inset_2px_0_4px_rgba(0,0,0,0.05)]" />
            </div>

            <div className="p-6 flex flex-col items-center bg-white">
              <div className="p-2 border border-[#EAEAEA] rounded-xl bg-white shadow-xs">
                <QrCode size={130} strokeWidth={1.5} className="text-[#102a43]" />
              </div>
              <p className="mt-3 text-[10px] font-mono text-[#787774] tracking-[0.2em] uppercase">
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
              className="inline-flex items-center justify-center gap-2 bg-[#f97316] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#ea580c] transition-colors shadow-sm text-sm"
            >
              Create student profile
            </Link>
            <Link 
              to="/login" 
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
            <Link to="/login" className="hover:text-white transition-colors">Student Portal</Link>
          </div>
        </footer>
      </section>

    </main>
  );
}

export default Landing;
