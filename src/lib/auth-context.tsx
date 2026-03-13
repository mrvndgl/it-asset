import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { employeeId: string; name: string } | null;
  login: (employeeId: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ employeeId: string; name: string } | null>(() => {
    const stored = localStorage.getItem("it-asset-user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (employeeId: string, password: string) => {
    // Mock authentication - in production connect to backend
    if (employeeId && password.length >= 4) {
      const u = { employeeId, name: "IT Administrator" };
      setUser(u);
      localStorage.setItem("it-asset-user", JSON.stringify(u));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("it-asset-user");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
