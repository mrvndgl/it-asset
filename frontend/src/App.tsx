import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/DashboardLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import PCInventory from "@/pages/PCInventory";
import PrinterInventory from "@/pages/PrinterInventory";
import Departments from "@/pages/Departments";
import Reports from "@/pages/Reports";
import SettingsPage from "@/pages/SettingsPage";
import Ticketing from "@/pages/Ticketing";
import StaffManagement from "@/pages/StaffManagement";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Guard for admin-only routes
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/tickets" replace />;
  return <>{children}</>;
}

function ProtectedRoutes() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Staff lands on /tickets by default
  const defaultRoute = user?.role === "admin" ? "/" : "/tickets";

  return (
    <DashboardLayout>
      <Routes>
        {/* Admin only routes */}
        <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/pcs" element={<AdminRoute><PCInventory /></AdminRoute>} />
        <Route path="/printers" element={<AdminRoute><PrinterInventory /></AdminRoute>} />
        <Route path="/departments" element={<AdminRoute><Departments /></AdminRoute>} />
        <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />
        <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
        <Route path="/staff" element={<AdminRoute><StaffManagement /></AdminRoute>} />

        {/* All users */}
        <Route path="/tickets" element={<Ticketing />} />

        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </DashboardLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;