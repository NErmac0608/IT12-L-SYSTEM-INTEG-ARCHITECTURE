import { createContext, useContext, useState } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("umtUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (username, password) => {
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: username, password }),
      });
      
      if (data.success) {
        localStorage.setItem("umtUser", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        setUser(data.user);
        return { success: true, user: data.user };
      }
    } catch (error) {
      return { success: false, message: error.message || "Invalid credentials." };
    }
  };

  const logout = () => {
    localStorage.removeItem("umtUser");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
