import { useSearchParams, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import OrganizerLogin from "../auth/OrganizerLogin";
import AdminLogin from "../auth/AdminLogin";
import { 
  isOrganizerPortalAuthorized, 
  isAdminPortalAuthorized 
} from "../../lib/portalSecurity";

export default function SecurePortalGateway() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();

  const isOrganizerTarget = isOrganizerPortalAuthorized(searchParams, location.pathname);
  const isAdminTarget = isAdminPortalAuthorized(searchParams, location.pathname);
  const access = searchParams.get("access") || searchParams.get("scope") || searchParams.get("role");
  const isStudentTarget = access === "student";

  // 1. USER ALREADY LOGGED IN
  if (user) {
    if (user.role === "admin") return <Navigate to="/dashboard/admin" replace />;
    if (user.role === "organizer") return <Navigate to="/dashboard/organizer" replace />;
    if (user.role === "student") return <Navigate to="/dashboard/student" replace />;
  }

  // 2. STUDENT DIRECT / PORTAL TARGET
  if (isStudentTarget) {
    return <Navigate to="/login" replace />;
  }

  // 3. ADMIN ENCRYPTED ENDPOINT
  if (isAdminTarget) {
    return <AdminLogin />;
  }

  // 4. ORGANIZER ENCRYPTED ENDPOINT
  if (isOrganizerTarget) {
    return <OrganizerLogin />;
  }

  // 5. HIDDEN ENDPOINT (404 Obscurity for unauthorized searches or student discovery)
  return (
    <main className="min-h-[calc(100dvh-64px)] flex items-center justify-center p-6 bg-white font-sans">
      <div className="text-center max-w-sm w-full p-8 bg-white border border-[#EAEAEA] rounded-3xl shadow-sm">
        <h1 className="text-2xl font-extrabold text-[#102a43] mb-4">404 - Not Found</h1>
        <a
          href="/"
          className="inline-block px-5 py-2.5 bg-[#102a43] hover:bg-[#0a1c2e] text-white text-xs font-bold rounded-xl transition-colors"
        >
          Return Home
        </a>
      </div>
    </main>
  );
}
