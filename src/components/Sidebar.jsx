import { CalendarDays, ClipboardList, Gauge, QrCode, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const roleLinks = {
  student: [["Dashboard", "/dashboard/student", Gauge], ["Browse Events", "/student/events", CalendarDays], ["My Registrations", "/student/registrations", ClipboardList], ["My QR Code", "/student/qr", QrCode]],
  organizer: [["Dashboard", "/dashboard/organizer", Gauge], ["Event Management", "/organizer/events", CalendarDays], ["QR Scanner", "/organizer/scanner", QrCode], ["Attendance", "/organizer/attendance", ClipboardList]],
  admin: [["Dashboard", "/dashboard/admin", Gauge], ["Manage Accounts", "/admin/accounts", Users]],
};

function Sidebar({ role }) {
  return (
    <aside className="sidebar">
      <p className="eyebrow">{role} workspace</p>
      <nav>
        {roleLinks[role].map(([label, path, Icon]) => (
          <NavLink 
            key={path} 
            to={path} 
            className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
