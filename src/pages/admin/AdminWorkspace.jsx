import { Link } from "react-router-dom";
import { ShieldCheck, UserRound, Users } from "lucide-react";

function AdminWorkspace() { return <div><div className="page-heading"><div><p className="eyebrow">Admin workspace</p><h1>Keep access orderly.</h1><p className="muted">A calm overview of the people and roles in the system.</p></div><ShieldCheck size={36} /></div><div className="stats-grid"><div className="stat-card"><span>Total users</span><strong>03</strong><Users /></div><div className="stat-card"><span>Students</span><strong>01</strong><UserRound /></div><div className="stat-card"><span>Organizers</span><strong>01</strong><ShieldCheck /></div></div><Link className="action-card wide" to="/admin/accounts"><Users /><strong>Manage accounts</strong><span>Review mock users and role access.</span></Link></div>; }
export default AdminWorkspace;
