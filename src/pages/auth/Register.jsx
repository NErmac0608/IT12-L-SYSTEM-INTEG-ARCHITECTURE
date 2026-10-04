import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import { UserPlus, ArrowRight } from "lucide-react";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    studentId: "",
    departmentId: ""
  });
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
    <main className="min-h-[calc(100dvh-64px)] flex items-center justify-center p-4 sm:p-6 bg-[#FBFBFA] font-sans py-8">
      <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-sm border border-[#EAEAEA] p-6 sm:p-8">
        <div className="mb-6">
          <div className="w-10 h-10 bg-[#F7F6F3] rounded-xl flex items-center justify-center text-[#102a43] mb-4 border border-[#EAEAEA]">
            <UserPlus size={18} strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#102a43] mb-1">
            Create student profile
          </h1>
          <p className="text-[#787774] text-xs sm:text-sm">
            Join UM-TAP to register for university events and claim passes.
          </p>
        </div>
        
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#102a43]">
              Full Name
            </label>
            <input 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              required 
              autoComplete="name"
              placeholder="Juan Dela Cruz" 
              className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] placeholder:text-[#A09F9C] focus:outline-none focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] transition-colors"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#102a43]">
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
                className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] placeholder:text-[#A09F9C] focus:outline-none focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#102a43]">
                Student ID
              </label>
              <input 
                name="studentId" 
                value={formData.studentId} 
                onChange={handleChange} 
                required 
                placeholder="2026-00001" 
                className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] placeholder:text-[#A09F9C] focus:outline-none focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#102a43]">
              Department
            </label>
            <div className="relative w-full">
              <select 
                name="departmentId" 
                value={formData.departmentId} 
                onChange={handleChange} 
                required 
                className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl pl-3.5 pr-8 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] transition-colors cursor-pointer"
              >
                <option value="" disabled>Select your department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#102a43]">
              Password
            </label>
            <input 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              autoComplete="new-password"
              placeholder="Create a secure password" 
              className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] placeholder:text-[#A09F9C] focus:outline-none focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] transition-colors"
            />
          </div>
          
          {message && (
            <p className="text-[#9A1C1C] bg-[#FDEBEC] border border-[#f5d2d4] px-3.5 py-2.5 rounded-xl text-xs font-semibold">
              {message}
            </p>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#102a43] text-white px-5 py-3.5 rounded-xl font-bold text-sm hover:bg-[#0a1c2e] active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? "Creating profile..." : (
              <>
                <span>Create Student Profile</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 pt-5 border-t border-[#EAEAEA] text-center">
          <p className="text-[#787774] text-xs">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#102a43] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;
