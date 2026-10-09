import { createContext, useContext, useState } from "react";
import { apiRequest } from "../services/api";
import { ORGANIZER_PORTAL_KEY, ADMIN_PORTAL_KEY } from "../lib/portalSecurity";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("umtUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Base handler to store session upon successful authentication
  const handleAuthSuccess = (data) => {
    if (data.success && data.user) {
      localStorage.setItem("umtUser", JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setUser(data.user);
      return { success: true, user: data.user };
    }
    return { success: false, message: data.message || "Authentication failed." };
  };

  // 1. One-way student authentication (direct, non-searchable access)
  const loginStudent = async (email, password) => {
    try {
      const data = await apiRequest("/auth/student/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return handleAuthSuccess(data);
    } catch (error) {
      return { success: false, message: error.message || "Invalid student credentials." };
    }
  };

  // 2. Encrypted organizer portal authentication
  const loginOrganizer = async (email, password) => {
    try {
      const data = await apiRequest("/portal/organizer/login", {
        method: "POST",
        headers: {
          "x-portal-key": ORGANIZER_PORTAL_KEY,
        },
        body: JSON.stringify({ email, password }),
      });
      return handleAuthSuccess(data);
    } catch (error) {
      return { success: false, message: error.message || "Invalid organizer credentials." };
    }
  };

  // 3. Encrypted administrative gateway authentication
  const loginAdmin = async (email, password) => {
    try {
      const data = await apiRequest("/portal/admin/login", {
        method: "POST",
        headers: {
          "x-portal-key": ADMIN_PORTAL_KEY,
        },
        body: JSON.stringify({ email, password }),
      });
      return handleAuthSuccess(data);
    } catch (error) {
      return { success: false, message: error.message || "Invalid administrator credentials." };
    }
  };

  // General login fallback for direct links
  const login = async (username, password) => {
    return loginStudent(username, password);
  };

  const logout = () => {
    localStorage.removeItem("umtUser");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginStudent, loginOrganizer, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
