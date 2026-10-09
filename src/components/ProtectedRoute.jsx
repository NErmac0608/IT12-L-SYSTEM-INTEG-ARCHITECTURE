import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ORGANIZER_SEARCH_ENDPOINT, ADMIN_SEARCH_ENDPOINT } from "../lib/portalSecurity";

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // No logged-in user: redirect strictly to that role's dedicated portal endpoint
  if (!user) {
    if (allowedRoles.includes("admin")) {
      return <Navigate to={ADMIN_SEARCH_ENDPOINT} replace />;
    }
    if (allowedRoles.includes("organizer")) {
      return <Navigate to={ORGANIZER_SEARCH_ENDPOINT} replace />;
    }
    // Direct, one-way student login
    return <Navigate to="/login" replace />;
  }

  // User has a role but it is not authorized for this view
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "student") {
      return <Navigate to="/dashboard/student" replace />;
    }
    if (user.role === "organizer") {
      return <Navigate to="/dashboard/organizer" replace />;
    }
    if (user.role === "admin") {
      return <Navigate to="/dashboard/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;