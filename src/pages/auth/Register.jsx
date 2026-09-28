import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

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
    // Fetch departments for the dropdown
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
    <main className="auth-page">
      <section className="auth-card" style={{ maxWidth: "450px" }}>
        <p className="eyebrow">UM-TAP</p>
        <h1>Create your profile</h1>
        <p className="muted">Join UM-TAP to register for university events.</p>
        
        <form onSubmit={submit} className="form-stack">
          <label>Full Name
            <input name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Juan Dela Cruz" />
          </label>
          
          <label>UM Email
            <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="student@umindanao.edu.ph" />
          </label>

          <label>Student ID
            <input name="studentId" value={formData.studentId} onChange={handleChange} required placeholder="2026-00001" />
          </label>

          <label>Department
            <select name="departmentId" value={formData.departmentId} onChange={handleChange} required className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black">
              <option value="" disabled>Select your department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </label>
          
          <label>Password
            <input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Create a password" />
          </label>
          
          {message && <p className="form-error">{message}</p>}
          
          <button className="button button-dark" type="submit" disabled={isLoading}>
            {isLoading ? "Creating profile..." : "Create profile"}
          </button>
        </form>
        
        <p className="form-note">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
