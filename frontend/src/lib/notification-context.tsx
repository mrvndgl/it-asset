import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth, getAuthToken } from "@/lib/auth-context";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface NotificationContextType {
  unreadCount: number;
  clearNotifications: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  clearNotifications: () => {},
  refreshNotifications: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastChecked, setLastChecked] = useState<string>(() => {
    return (
      localStorage.getItem(`santrack-notif-checked-${user?.employeeId}`) ||
      new Date().toISOString()
    );
  });

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const tickets = await res.json();
      const checked =
        localStorage.getItem(`santrack-notif-checked-${user.employeeId}`) ||
        new Date().toISOString();

      let count = 0;
      if (user.role === "admin") {
        // Admin: count new tickets submitted after last checked
        count = tickets.filter(
          (t: any) => new Date(t.createdAt) > new Date(checked),
        ).length;
      } else {
        // Staff: count tickets whose status changed after last checked
        count = tickets.filter(
          (t: any) =>
            new Date(t.updatedAt) > new Date(checked) &&
            t.submittedBy === user.name,
        ).length;
      }
      setUnreadCount(count);
    } catch {
      // silent fail
    }
  }, [isAuthenticated, user]);

  // Poll every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, isAuthenticated]);

  const clearNotifications = useCallback(() => {
    if (!user) return;
    const now = new Date().toISOString();
    localStorage.setItem(`santrack-notif-checked-${user.employeeId}`, now);
    setLastChecked(now);
    setUnreadCount(0);
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        clearNotifications,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
