import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Send payload variables straight to your database auth channel
    fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
      .then((response) => response.json())
      .then((data) => {
        setIsSubmitting(false);
        
        if (!data.success) {
          alert(data.message || "Invalid credentials.");
          return;
        }

        const account = data.user;

        // Securely capture user row attributes for active contextual views
        localStorage.setItem(
          "umtUser",
          JSON.stringify({
            id: account.id,
            name: account.name,
            email: account.email,
            role: account.role,
            studentId: account.studentId // Saved for contextual queries inside MyEvents hooks
          })
        );

        // Dynamic multi-role workspace routing redirect logic
        if (account.role === "student") {
          navigate("/events");
        } else if (account.role === "organizer") {
          navigate("/organizer");
        } else if (account.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/events"); // Safe standard option fallback
        }
      })
      .catch((error) => {
        console.error("Database authorization failed:", error);
        setIsSubmitting(false);
        alert("Server communication failure. Make sure your Node.js backend application is live.");
      });
  };

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-10">

      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">

        <div className="text-center">

          <h1 className="text-3xl font-bold">
            Welcome to UM-TAP
          </h1>

          <p className="mt-2 text-gray-600">
            Sign in to manage your event registrations.
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >

          {/* Institutional Email */}
          <div>
            <label className="block text-sm font-semibold">
              Institutional Email
            </label>

            <input
              type="email"
              required
              value={email}
              disabled={isSubmitting}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your institutional email"
              className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              disabled={isSubmitting}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? "Verifying Profile..." : "Login"}
          </button>

        </form>

      </div>

    </main>
  );
}

export default Login;
