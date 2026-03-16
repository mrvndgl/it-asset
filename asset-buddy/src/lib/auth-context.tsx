import React, { createContext, useContext, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface User {
  id: string;
  employeeId: string;
  name: string;
  email?: string;
  role: "admin" | "user";
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (employeeId: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  logout: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("it-asset-user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (employeeId: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();

      // Persist token and user
      localStorage.setItem("it-asset-token", data.token);
      localStorage.setItem("it-asset-user", JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch (err) {
      console.error("Login request failed:", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("it-asset-user");
    localStorage.removeItem("it-asset-token");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper to get the stored token for authenticated API calls
export const getAuthToken = (): string | null =>
  localStorage.getItem("it-asset-token");

export const useAuth = () => useContext(AuthContext);