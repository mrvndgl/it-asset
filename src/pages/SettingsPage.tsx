import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, User, Shield } from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">System preferences</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{user?.name}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-border">
            <span className="text-muted-foreground">Employee ID</span>
            <span className="font-mono">{user?.employeeId}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-border">
            <span className="text-muted-foreground">Role</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-primary" />IT Administrator</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Appearance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Toggle dark/light theme</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
