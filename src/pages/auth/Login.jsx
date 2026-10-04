import { useState } from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);
    if (!result.success) return setError(result.message);
    navigate(`/dashboard/${result.user.role}`);
  };

  return (
    <main className="min-h-[calc(100dvh-64px)] flex items-center justify-center p-4 sm:p-6 bg-[#FBFBFA] font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-sm border border-[#EAEAEA] p-6 sm:p-8">
        <div className="mb-6">
          <div className="w-10 h-10 bg-[#F7F6F3] rounded-xl flex items-center justify-center text-[#102a43] mb-4 border border-[#EAEAEA]">
            <KeyRound size={18} strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#102a43] mb-1">
            Welcome back
          </h1>
          <p className="text-[#787774] text-xs sm:text-sm">
            Enter your institutional email to sign in.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#102a43]">
              Email Address
            </label>
            <input 
              type="email" 
              value={username} 
              onChange={(event) => setUsername(event.target.value)} 
              required 
              autoComplete="email"
              inputMode="email"
              placeholder="student@umindanao.edu.ph"
              className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl px-3.5 py-3 text-sm text-[#111111] placeholder:text-[#A09F9C] focus:outline-none focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#102a43]">
              Password
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(event) => setPassword(event.target.value)} 
              required 
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl px-3.5 py-3 text-sm text-[#111111] placeholder:text-[#A09F9C] focus:outline-none focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] transition-colors"
            />
          </div>

          {error && (
            <p className="text-[#9A1C1C] bg-[#FDEBEC] border border-[#f5d2d4] px-3.5 py-2.5 rounded-xl text-xs font-semibold">
              {error}
            </p>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#102a43] text-white px-5 py-3.5 rounded-xl font-bold text-sm hover:bg-[#0a1c2e] active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? "Signing in..." : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#EAEAEA] text-center">
          <p className="text-[#787774] text-xs">
            Need an account?{" "}
            <Link to="/register" className="font-bold text-[#102a43] hover:underline">
              Register a student profile
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
