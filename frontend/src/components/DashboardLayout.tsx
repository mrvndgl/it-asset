import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Search, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-context";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const isPCPage = location.pathname === "/pcs";

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    navigate({ pathname: "/pcs", search: params.toString() }, { replace: true });
  };

  if (!isPCPage && search) {
    setSearch("");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 bg-card">
            <SidebarTrigger className="shrink-0" />
            <div className="flex-1 flex items-center gap-3 max-w-xl">
              {isPCPage && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees, serial numbers, IPs..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 bg-secondary border-0 h-9"
                  />
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="shrink-0">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}