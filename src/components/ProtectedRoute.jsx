import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // No logged-in user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User has a role but it is not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return children;
}

export default ProtectedRoute;