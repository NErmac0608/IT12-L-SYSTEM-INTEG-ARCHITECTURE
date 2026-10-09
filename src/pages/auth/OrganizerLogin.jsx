import { useState } from "react";
import { ArrowRight, QrCode, Shield, Lock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ORGANIZER_PORTAL_KEY } from "../../lib/portalSecurity";

function OrganizerLogin({ onAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginOrganizer } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await loginOrganizer(email, password);
    setIsLoading(false);

    if (!result.success) {
      return setError(result.message);
    }

    if (onAuthenticated) {
      onAuthenticated(result.user);
    } else {
      navigate("/dashboard/organizer");
    }
  };

  return (
    <main className="min-h-[calc(100dvh-64px)] flex items-center justify-center p-4 sm:p-6 bg-[#0f172a] text-slate-100 font-sans">
      <div className="w-full max-w-[440px] bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-6 sm:p-8">
        
        {/* Encrypted Endpoint Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20">
              <QrCode size={22} />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/70 border border-emerald-800/60 rounded-full text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
              <Lock size={11} /> Key: {ORGANIZER_PORTAL_KEY.slice(0, 7)}...
            </div>
          </div>

          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
            Restricted Staff Portal
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">
            Organizer Terminal
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Authentication terminal for authorized faculty and event coordinators.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Staff Email
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(event) => setEmail(event.target.value)} 
              required 
              autoComplete="email"
              inputMode="email"
              placeholder="organizer@umindanao.edu.ph"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Security Key / Password
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(event) => setPassword(event.target.value)} 
              required 
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-medium flex items-start gap-2">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none cursor-pointer shadow-lg shadow-emerald-950/50"
          >
            {isLoading ? "Verifying Credentials..." : (
              <>
                <span>Unlock Organizer Workspace</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-[11px] font-mono flex items-center justify-center gap-1.5">
            <Shield size={12} className="text-slate-400" />
            <span>Encrypted endpoint · Isolated authentication</span>
          </p>
        </div>
      </div>
    </main>
  );
}

export default OrganizerLogin;
