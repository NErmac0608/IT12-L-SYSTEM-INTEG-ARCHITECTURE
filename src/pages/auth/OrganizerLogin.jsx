import { useState, useEffect } from "react";
import { ArrowRight, Mail, Lock, User, Building2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";

function OrganizerLogin({ onAuthenticated }) {
  const [action, setAction] = useState("signin"); // "signin" or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { loginOrganizer, registerOrganizer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest("/departments")
      .then((data) => setDepartments(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Could not fetch departments:", err));
  }, []);

  const handleActionChange = (newAction) => {
    setAction(newAction);
    setError("");
    setSuccessMessage("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      if (action === "signin") {
        const result = await loginOrganizer(email, password);
        if (!result.success) {
          setError(result.message || "Invalid credentials.");
          setIsLoading(false);
          return;
        }
        if (onAuthenticated) onAuthenticated(result.user);
        else navigate("/dashboard/organizer");
      } else {
        if (!departmentId) {
          setError("Please select a department.");
          setIsLoading(false);
          return;
        }
        const result = await registerOrganizer({
          fullName,
          email,
          password,
          departmentId: parseInt(departmentId, 10),
        });
        if (!result.success) {
          setError(result.message || "Failed to register.");
          setIsLoading(false);
          return;
        }
        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => {
          if (onAuthenticated) onAuthenticated(result.user);
          else navigate("/dashboard/organizer");
        }, 500);
      }
    } catch (err) {
      setError(err.message || "Authentication error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-64px)] flex items-center justify-center p-4 sm:p-6 bg-white font-sans relative overflow-hidden">
      
      {/* AMBIENT BACKGROUND GLOW */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#f97316]/10 via-[#102a43]/5 to-transparent blur-3xl pointer-events-none -z-10" 
      />

      <div className="w-full max-w-[430px] bg-white rounded-3xl shadow-[0_20px_50px_-20px_rgba(16,42,67,0.12)] border border-[#EAEAEA] p-7 sm:p-9 relative overflow-hidden">
        
        {/* TOP BRAND ACCENT BAR */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#102a43] via-[#f97316] to-[#102a43]" />

        {/* CLEAN HEADING ONLY */}
        <div className="mb-5 pt-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#102a43]">
            Organizer <span className="text-[#f97316]">{action === "signin" ? "Login" : "Register"}</span>
          </h1>
        </div>

        {/* ACTION SWITCHER: SIGN IN vs REGISTER */}
        <div className="mb-5">
          <div className="grid grid-cols-2 p-1 bg-[#F1F3F5] rounded-xl border border-[#EAEAEA]">
            <button
              type="button"
              onClick={() => handleActionChange("signin")}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                action === "signin"
                  ? "bg-white text-[#102a43] shadow-xs border border-[#EAEAEA]"
                  : "text-[#787774] hover:text-[#102a43]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleActionChange("register")}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                action === "register"
                  ? "bg-white text-[#102a43] shadow-xs border border-[#EAEAEA]"
                  : "text-[#787774] hover:text-[#102a43]"
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={submit} className="flex flex-col gap-4">
          
          {action === "register" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#102a43]">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787774] pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Full Name"
                  className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl pl-10 pr-3.5 py-3 text-sm text-[#111111] placeholder:text-[#A09F9C] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 focus:bg-white transition-all shadow-2xs"
                  style={{ paddingLeft: "2.6rem" }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#102a43]">
              Staff Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787774] pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
                placeholder="organizer@umindanao.edu.ph"
                className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl pl-10 pr-3.5 py-3 text-sm text-[#111111] placeholder:text-[#A09F9C] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 focus:bg-white transition-all shadow-2xs"
                style={{ paddingLeft: "2.6rem" }}
              />
            </div>
          </div>

          {action === "register" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#102a43]">
                Department
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787774] pointer-events-none" />
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                  className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl pl-10 pr-8 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 focus:bg-white transition-all cursor-pointer shadow-2xs"
                  style={{ paddingLeft: "2.6rem" }}
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#102a43]">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787774] pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={action === "signin" ? "current-password" : "new-password"}
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
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold leading-relaxed flex items-start gap-2">
              <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold leading-relaxed flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#102a43] hover:bg-[#0a1c2e] text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-[#102a43]/20 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none cursor-pointer group"
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{action === "signin" ? "Sign In" : "Register"}</span>
                <ArrowRight size={16} strokeWidth={2.5} className="text-[#f97316] group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

      </div>
    </main>
  );
}

export default OrganizerLogin;
