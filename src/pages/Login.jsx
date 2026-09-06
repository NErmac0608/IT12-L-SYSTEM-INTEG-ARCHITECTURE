import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    /*
      FRONTEND-ONLY DEMO ACCOUNTS

      Student:
      student@umindanao.edu.ph
      student123

      Organizer:
      organizer@umindanao.edu.ph
      organizer123

      Admin:
      admin@umindanao.edu.ph
      admin123
    */

    const accounts = [
      {
        email: "student@umindanao.edu.ph",
        password: "student123",
        name: "Demo Student",
        role: "student",
      },
      {
        email: "organizer@umindanao.edu.ph",
        password: "organizer123",
        name: "Demo Organizer",
        role: "organizer",
      },
      {
        email: "admin@umindanao.edu.ph",
        password: "admin123",
        name: "System Administrator",
        role: "admin",
      },
    ];

    const account = accounts.find(
      (user) =>
        user.email === email &&
        user.password === password
    );

    if (!account) {
      alert("Invalid institutional email or password.");
      return;
    }

    // Save currently logged-in user
    localStorage.setItem(
      "umtUser",
      JSON.stringify({
        name: account.name,
        email: account.email,
        role: account.role,
      })
    );

    // Redirect according to role
    if (account.role === "student") {
      navigate("/events");
    }

    if (account.role === "organizer") {
      navigate("/organizer");
    }

    if (account.role === "admin") {
      navigate("/admin");
    }
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your institutional email"
              className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
          >
            Login
          </button>

        </form>

      </div>

    </main>
  );
}

export default Login;