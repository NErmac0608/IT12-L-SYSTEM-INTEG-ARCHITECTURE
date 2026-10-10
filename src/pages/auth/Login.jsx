import { useState } from "react";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await loginStudent(email, password);
    setIsLoading(false);

    if (!result.success) {
      return setError(result.message);
    }

    navigate("/dashboard/student");
  };

  return (
    <main className="min-h-[calc(100dvh-64px)] flex items-center justify-center p-4 sm:p-6 bg-white font-sans relative overflow-hidden">
      
      {/* AMBIENT BACKGROUND GLOW */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#f97316]/10 via-[#102a43]/5 to-transparent blur-3xl pointer-events-none -z-10" 
      />

      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_20px_50px_-20px_rgba(16,42,67,0.12)] border border-[#EAEAEA] p-7 sm:p-9 relative overflow-hidden">
        
        {/* TOP BRAND ACCENT BAR */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#102a43] via-[#f97316] to-[#102a43]" />

        {/* CLEAN HEADING ONLY */}
        <div className="mb-6 pt-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#102a43]">
            Student <span className="text-[#f97316]">Login</span>
          </h1>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#102a43]">
              Student Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787774] pointer-events-none" />
              <input 
                type="email" 
                value={email} 
                onChange={(event) => setEmail(event.target.value)} 
                required 
                autoComplete="email"
                inputMode="email"
                placeholder="student@umindanao.edu.ph"
                className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl pl-10 pr-3.5 py-3 text-sm text-[#111111] placeholder:text-[#A09F9C] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 focus:bg-white transition-all shadow-2xs"
                style={{ paddingLeft: "2.6rem" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#102a43]">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787774] pointer-events-none" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(event) => setPassword(event.target.value)} 
                required 
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl pl-10 pr-11 py-3 text-sm text-[#111111] placeholder:text-[#A09F9C] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 focus:bg-white transition-all shadow-2xs"
                style={{ paddingLeft: "2.6rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787774] hover:text-[#102a43] focus:text-[#f97316] transition-colors p-1.5 rounded-lg cursor-pointer outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#102a43] hover:bg-[#0a1c2e] text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-[#102a43]/20 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none cursor-pointer group"
          >
            {isLoading ? "Signing in..." : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} strokeWidth={2.5} className="text-[#f97316] group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* REGISTRATION LINK (STUDENT ONLY) */}
        <div className="mt-6 pt-5 border-t border-[#EAEAEA] text-center">
          <p className="text-[#787774] text-xs">
            New student?{" "}
            <Link to="/register" className="font-bold text-[#f97316] hover:text-[#ea580c] transition-colors underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
