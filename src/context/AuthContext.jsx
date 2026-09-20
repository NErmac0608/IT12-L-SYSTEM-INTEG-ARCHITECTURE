import { createContext, useContext, useState } from "react";
import { DEMO_PASSWORD, demoUsers } from "../data/mockData";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("umtUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (username, password) => {
    const nextUser = demoUsers.find((demoUser) => demoUser.username === username && password === DEMO_PASSWORD);
    if (!nextUser) return { success: false, message: `Use ${DEMO_PASSWORD} as the demo password.` };
    localStorage.setItem("umtUser", JSON.stringify(nextUser));
    setUser(nextUser);
    return { success: true, user: nextUser };
  };

  const logout = () => {
    localStorage.removeItem("umtUser");
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
