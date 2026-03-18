import {
  LayoutDashboard,
  Monitor,
  Printer,
  Building2,
  FileBarChart,
  Settings,
  LogOut,
  Server,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // ✅ added
import { Button } from "@/components/ui/button"; // ✅ added
import { useState } from "react"; // ✅ added

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "PC Inventory", url: "/pcs", icon: Monitor },
  { title: "Printer Inventory", url: "/printers", icon: Printer },
  { title: "Departments", url: "/departments", icon: Building2 },
  { title: "Reports", url: "/reports", icon: FileBarChart },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { logout, user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false); // ✅ added

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Server className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-sidebar-foreground">IT Assets</span>
                <span className="text-xs text-muted-foreground">Inventory System</span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-3">
          {!collapsed && user && (
            <div className="mb-2 px-2">
              <p className="text-xs font-medium text-sidebar-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.employeeId}</p>
            </div>
          )}
          <SidebarMenu>
            <SidebarMenuItem>
              {/* Logging out confirmation */}
              <SidebarMenuButton onClick={() => setConfirmOpen(true)} className="text-destructive hover:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                {!collapsed && <span>Logout</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* ✅ Logout Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You will need to sign in again to access the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => { setConfirmOpen(false); logout(); }}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}