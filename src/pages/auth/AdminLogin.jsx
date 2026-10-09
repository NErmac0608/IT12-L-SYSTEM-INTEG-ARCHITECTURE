import { useState } from "react";
import { ArrowRight, ShieldAlert, Lock, AlertCircle, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ADMIN_PORTAL_KEY } from "../../lib/portalSecurity";

function AdminLogin({ onAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await loginAdmin(email, password);
    setIsLoading(false);

    if (!result.success) {
      return setError(result.message);
    }

    if (onAuthenticated) {
      onAuthenticated(result.user);
    } else {
      navigate("/dashboard/admin");
    }
  };

  return (
    <main className="min-h-[calc(100dvh-64px)] flex items-center justify-center p-4 sm:p-6 bg-[#090d16] text-slate-100 font-sans">
      <div className="w-full max-w-[440px] bg-[#101726] rounded-3xl shadow-2xl border border-red-950/60 p-6 sm:p-8">
        
        {/* Encrypted Administrative Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center border border-rose-500/20">
              <ShieldAlert size={22} />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 border border-rose-900/60 rounded-full text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest">
              <Lock size={11} /> Gateway: {ADMIN_PORTAL_KEY.slice(0, 7)}...
            </div>
          </div>

          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold block mb-1">
            Root Administrative Gateway
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">
            System Administration
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Strict clearance required. Administrative credential access is audited.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Administrator Email
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(event) => setEmail(event.target.value)} 
              required 
              autoComplete="email"
              inputMode="email"
              placeholder="admin@umindanao.edu.ph"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Master Password
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(event) => setPassword(event.target.value)} 
              required 
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium flex items-start gap-2">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none cursor-pointer shadow-lg shadow-rose-950/50"
          >
            {isLoading ? "Authenticating Administrator..." : (
              <>
                <span>Authenticate Privileges</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <p className="text-slate-500 text-[11px] font-mono flex items-center justify-center gap-1.5">
            <Key size={12} className="text-rose-400" />
            <span>Encrypted endpoint · Cryptographically isolated</span>
          </p>
        </div>
      </div>
    </main>
  );
}

export default AdminLogin;
