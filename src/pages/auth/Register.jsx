import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Register() {
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [message, setMessage] = useState("");
	const { login } = useAuth();
	const navigate = useNavigate();
	const submit = (event) => { event.preventDefault(); if (username !== "student") return setMessage("This mock foundation accepts the demo username student."); const result = login("student", "demo"); if (result.success) navigate("/dashboard/student"); };
	return <main className="auth-page"><section className="auth-card"><p className="eyebrow">Student registration</p><h1>Create a demo profile</h1><p className="muted">The real account API can replace this local flow later.</p><form onSubmit={submit} className="form-stack"><label>Full name<input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Your name" /></label><label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} required placeholder="student" /></label>{message && <p className="form-error">{message}</p>}<button className="button button-dark" type="submit">Create profile</button></form><p className="form-note"><Link to="/login">Back to sign in</Link></p></section></main>;
}

export default Register;
