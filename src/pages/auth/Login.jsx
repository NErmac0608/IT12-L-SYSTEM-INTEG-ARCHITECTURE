import { useState } from "react";
import { ArrowRight, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

	return <main className="auth-page"><section className="auth-card"><p className="eyebrow">UM-TAP</p><h1>Sign in</h1><p className="muted">Enter your institutional email and password.</p><form onSubmit={submit} className="form-stack"><label>Email<input type="email" value={username} onChange={(event) => setUsername(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark" type="submit" disabled={isLoading}>{isLoading ? "Signing in..." : <><LogIn size={17} /> Sign in <ArrowRight size={17} /></>}</button></form><p className="form-note">Need an account? <a href="/register">Register a student profile</a></p></section></main>;
}

export default Login;
