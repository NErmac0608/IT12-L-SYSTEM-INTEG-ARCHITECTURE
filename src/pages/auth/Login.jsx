import { useState } from "react";
import { ArrowRight, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
	const [username, setUsername] = useState("student");
	const [password, setPassword] = useState("demo");
	const [error, setError] = useState("");
	const { login } = useAuth();
	const navigate = useNavigate();

	const submit = (event) => {
		event.preventDefault();
		const result = login(username, password);
		if (!result.success) return setError(result.message);
		navigate(`/dashboard/${result.user.role}`);
	};

	return <main className="auth-page"><section className="auth-card"><p className="eyebrow">Demo access</p><h1>Sign in to EventLink</h1><p className="muted">Use student, organizer, or admin with the password demo.</p><form onSubmit={submit} className="form-stack"><label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark" type="submit"><LogIn size={17} /> Sign in <ArrowRight size={17} /></button></form><p className="form-note">Need an account? <a href="/register">Register a student profile</a></p></section></main>;
}

export default Login;
