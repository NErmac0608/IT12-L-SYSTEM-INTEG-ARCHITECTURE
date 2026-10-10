import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import { UserPlus, ArrowRight, Lock, Eye, EyeOff } from "lucide-react";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    studentId: "",
    departmentId: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest("/departments")
      .then(data => setDepartments(data))
      .catch(err => console.error("Could not fetch departments:", err));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!formData.email.endsWith("@umindanao.edu.ph")) {
      return setMessage("Please use a valid @umindanao.edu.ph email address.");
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: formData.fullName,
          school_email: formData.email,
          password: formData.password,
          student_id: formData.studentId,
          department_id: formData.departmentId
        })
      });

      if (response.success) {
        alert("Account created successfully! You can now sign in.");
        navigate("/login");
      } else {
        setMessage(response.message || "Failed to create account.");
      }
    } catch (error) {
      setMessage(error.message || "Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-64px)] flex items-center justify-center p-4 sm:p-6 bg-white font-sans py-8 relative overflow-hidden">
      
      {/* AMBIENT BACKGROUND GLOW IN NAVY & ORANGE */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#f97316]/10 via-[#102a43]/5 to-transparent blur-3xl pointer-events-none -z-10" 
      />

      <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-[0_20px_50px_-20px_rgba(16,42,67,0.12)] border border-[#EAEAEA] p-7 sm:p-9 relative overflow-hidden">
        
        {/* SIGNATURE TOP BRAND ACCENT LINE (NAVY & ORANGE) */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#102a43] via-[#f97316] to-[#102a43]" />

        <div className="mb-6 pt-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#102a43]">
            Student <span className="text-[#f97316]">Registration</span>
          </h1>
        </div>
        
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#102a43]">
              Full Name
            </label>
            <input 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              required 
              autoComplete="name"
              placeholder="Juan Dela Cruz" 
              className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl px-3.5 py-3 text-sm text-[#111111] placeholder:text-[#A09F9C] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition-all shadow-2xs"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#102a43]">
                UM Email
              </label>
              <input 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                autoComplete="email"
                inputMode="email"
                placeholder="student@umindanao.edu.ph" 
                className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl px-3.5 py-3 text-sm text-[#111111] placeholder:text-[#A09F9C] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition-all shadow-2xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#102a43]">
                Student ID
              </label>
              <input 
                name="studentId" 
                value={formData.studentId} 
                onChange={handleChange} 
                required 
                placeholder="2026-00001" 
                className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl px-3.5 py-3 text-sm text-[#111111] placeholder:text-[#A09F9C] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#102a43]">
              Department
            </label>
            <div className="relative w-full">
              <select 
                name="departmentId" 
                value={formData.departmentId} 
                onChange={handleChange} 
                required 
                className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl pl-3.5 pr-8 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition-all cursor-pointer shadow-2xs"
              >
                <option value="" disabled>Select your department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#102a43]">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787774] pointer-events-none" />
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                value={formData.password} 
                onChange={handleChange} 
                required 
                autoComplete="new-password"
                placeholder="Create a secure password" 
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
          
          {message && (
            <p className="text-[#9A1C1C] bg-[#FDEBEC] border border-[#f5d2d4] px-3.5 py-2.5 rounded-xl text-xs font-semibold">
              {message}
            </p>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#102a43] hover:bg-[#0a1c2e] text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-[#102a43]/20 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none cursor-pointer group"
          >
            {isLoading ? "Creating profile..." : (
              <>
                <span>Create Student Profile</span>
                <ArrowRight size={16} strokeWidth={2.5} className="text-[#f97316] group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 pt-5 border-t border-[#EAEAEA] text-center">
          <p className="text-[#787774] text-xs">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#f97316] hover:text-[#ea580c] transition-colors underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;
