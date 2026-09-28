import { Link } from "react-router-dom";
import { ShieldCheck, UserRound, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest } from "../../services/api";

function AdminWorkspace() { 
  const [stats, setStats] = useState({ totalUsers: 0, students: 0, organizers: 0 });

  useEffect(() => {
    apiRequest("/admin/stats")
      .then(data => setStats(data))
      .catch(err => console.error("Could not load stats", err));
  }, []);

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Admin workspace</p>
          <h1>Keep access orderly.</h1>
          <p className="muted">A calm overview of the people and roles in the system.</p>
        </div>
        <ShieldCheck size={36} />
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <span>Total users</span>
          <strong>{stats.totalUsers.toString().padStart(2, '0')}</strong>
          <Users />
        </div>
        <div className="stat-card">
          <span>Students</span>
          <strong>{stats.students.toString().padStart(2, '0')}</strong>
          <UserRound />
        </div>
        <div className="stat-card">
          <span>Organizers</span>
          <strong>{stats.organizers.toString().padStart(2, '0')}</strong>
          <ShieldCheck />
        </div>
      </div>
      
      <Link className="action-card wide" to="/admin/accounts">
        <Users />
        <strong>Manage accounts</strong>
        <span>Review users and manage organizer access.</span>
      </Link>
    </div>
  ); 
}

export default AdminWorkspace;
