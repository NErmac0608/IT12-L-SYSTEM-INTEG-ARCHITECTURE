import { CalendarDays, ClipboardList, Gauge, QrCode, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const roleTabs = {
  student: [
    { label: "Home", path: "/dashboard/student", icon: Gauge },
    { label: "Events", path: "/student/events", icon: CalendarDays },
    { label: "Registered", path: "/student/registrations", icon: ClipboardList },
    { label: "My Passes", path: "/student/qr", icon: QrCode },
  ],
  organizer: [
    { label: "Dashboard", path: "/dashboard/organizer", icon: Gauge },
    { label: "Events", path: "/organizer/events", icon: CalendarDays },
    { label: "Scanner", path: "/organizer/scanner", icon: QrCode },
    { label: "Attendance", path: "/organizer/attendance", icon: ClipboardList },
  ],
  admin: [
    { label: "Overview", path: "/dashboard/admin", icon: Gauge },
    { label: "Accounts", path: "/admin/accounts", icon: Users },
  ],
};

export default function MobileBottomNav({ role }) {
  const tabs = roleTabs[role] || [];
  if (tabs.length === 0) return null;

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center min-w-[60px] py-1 px-1.5 rounded-xl transition-colors
              ${isActive 
                ? "text-[#102a43] font-bold" 
                : "text-slate-400 hover:text-slate-600 font-medium"
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-lg transition-transform ${isActive ? "scale-110 text-[#f97316]" : ""}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-[70px]">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
