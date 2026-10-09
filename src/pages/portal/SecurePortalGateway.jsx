import { useSearchParams, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import OrganizerLogin from "../auth/OrganizerLogin";
import AdminLogin from "../auth/AdminLogin";
import { 
  isOrganizerPortalAuthorized, 
  isAdminPortalAuthorized 
} from "../../lib/portalSecurity";
import { ShieldX } from "lucide-react";

export default function SecurePortalGateway() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();

  const isOrganizerTarget = isOrganizerPortalAuthorized(searchParams, location.pathname);
  const isAdminTarget = isAdminPortalAuthorized(searchParams, location.pathname);
  const access = searchParams.get("access") || searchParams.get("scope") || searchParams.get("role");
  const isStudentTarget = access === "student";

  // 1. ORGANIZER ENCRYPTED ENDPOINT
  if (isOrganizerTarget) {
    if (user && (user.role === "organizer" || user.role === "admin")) {
      return <Navigate to="/dashboard/organizer" replace />;
    }
    return <OrganizerLogin />;
  }

  // 2. ADMIN ENCRYPTED ENDPOINT
  if (isAdminTarget) {
    if (user && user.role === "admin") {
      return <Navigate to="/dashboard/admin" replace />;
    }
    return <AdminLogin />;
  }

  // 3. STUDENT DIRECT / PORTAL TARGET
  if (isStudentTarget) {
    if (user && user.role === "student") {
      return <Navigate to="/dashboard/student" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // 4. USER ALREADY LOGGED IN ACCESSING GENERIC /portal
  if (user) {
    if (user.role === "admin") return <Navigate to="/dashboard/admin" replace />;
    if (user.role === "organizer") return <Navigate to="/dashboard/organizer" replace />;
    if (user.role === "student") return <Navigate to="/dashboard/student" replace />;
  }

  // 5. OBSCURE 404 NOT FOUND (Hides the endpoint from unauthorized searches or student discovery)
  return (
    <main className="min-h-[calc(100dvh-64px)] flex items-center justify-center p-6 bg-[#FBFBFA]">
      <div className="text-center max-w-md p-8 bg-white border border-slate-200 rounded-3xl shadow-xs">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ShieldX size={24} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-1">404 - Endpoint Not Found</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          The requested endpoint does not exist or requires an authorized cryptographic key identifier.
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
        >
          Return to UM-Tap Home
        </a>
      </div>
    </main>
  );
}
