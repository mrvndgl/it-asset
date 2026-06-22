import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  UserCheck,
  UserX,
  Shield,
  User,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import { getAuthToken } from "@/lib/auth-context";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "admin" | "user";

interface StaffMember {
  _id: string;
  name: string;
  employeeId: string;
  department: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Accounts",
  "HR",
  "IT",
  "Logistics",
  "Procurement",
  "Safety & Security",
  "Sales",
  "Store",
];
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── Staff Form Modal ─────────────────────────────────────────────────────────

function StaffFormModal({
  open,
  onClose,
  onSuccess,
  editData,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: StaffMember | null;
}) {
  const [form, setForm] = useState({
    name: editData?.name ?? "",
    employeeId: editData?.employeeId ?? "",
    department: editData?.department ?? "IT",
    role: editData?.role ?? ("user" as Role),
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({
      name: editData?.name ?? "",
      employeeId: editData?.employeeId ?? "",
      department: editData?.department ?? "IT",
      role: editData?.role ?? "user",
      password: "",
    });
  }, [editData, open]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = !!editData;

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.employeeId.trim()) return;
    if (!isEdit && !form.password.trim()) return;

    setLoading(true);
    try {
      const token = getAuthToken();
      const url = isEdit
        ? `${API_BASE}/api/auth/users/${editData._id}`
        : `${API_BASE}/api/auth/users`;
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit
        ? { name: form.name, department: form.department, role: form.role }
        : {
            name: form.name,
            employeeId: form.employeeId,
            password: form.password,
            department: form.department,
            role: form.role,
          };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
        return;
      }

      toast.success(isEdit ? "Staff updated!" : "Staff added!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Request failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Staff" : "Add New Staff"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Juan"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Employee ID</Label>
            <Input
              placeholder="e.g. SLS001"
              value={form.employeeId}
              onChange={(e) => set("employeeId", e.target.value.toUpperCase())}
              className="font-mono"
              disabled={isEdit}
            />
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={form.department}
              onValueChange={(v) => set("department", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["user", "admin"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set("role", r)}
                  className={`py-2 rounded-md text-sm font-medium border transition-colors capitalize ${
                    form.role === r
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {r === "admin" ? "Admin" : "Staff"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              loading ||
              !form.name.trim() ||
              !form.employeeId.trim() ||
              (!isEdit && !form.password.trim())
            }
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Add Staff"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StaffManagement() {
  const { user } = useAuth();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [resetTarget, setResetTarget] = useState<StaffMember | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6 || !resetTarget) return;
    setResetting(true);
    try {
      const token = getAuthToken();
      const res = await fetch(
        `${API_BASE}/api/auth/users/${resetTarget._id}/reset-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to reset password");
        return;
      }
      toast.success(`Password reset for ${resetTarget.name}!`);
      setResetTarget(null);
      setNewPassword("");
      setShowNewPassword(false);
    } catch {
      toast.error("Request failed.");
    } finally {
      setResetting(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setStaff(data);
    } catch {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  if (user?.role !== "admin") return <Navigate to="/" replace />;

  const handleToggleActive = async (member: StaffMember) => {
    try {
      const token = getAuthToken();
      const res = await fetch(
        `${API_BASE}/api/auth/users/${member._id}/toggle-active`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        toast.success(
          `${member.name} ${member.isActive ? "deactivated" : "activated"}`,
        );
        fetchStaff();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/auth/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Staff removed");
        fetchStaff();
      }
    } catch {
      toast.error("Failed to delete staff");
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = staff.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "All" || s.department === filterDept;
    return matchSearch && matchDept;
  });

  const activeCount = staff.filter((s) => s.isActive).length;
  const adminCount = staff.filter((s) => s.role === "admin").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Staff Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage employee accounts and access
          </p>
        </div>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => {
            setEditData(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Staff
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Staff",
            value: staff.length,
            icon: User,
            color: "text-primary",
          },
          {
            label: "Active",
            value: activeCount,
            icon: UserCheck,
            color: "text-success",
          },
          {
            label: "Inactive",
            value: staff.length - activeCount,
            icon: UserX,
            color: "text-muted-foreground",
          },
          {
            label: "Admins",
            value: adminCount,
            icon: Shield,
            color: "text-warning",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {label}
                </span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            {filtered.length} Staff Member{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Loading staff...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <User className="h-8 w-8 opacity-30" />
              <p className="text-sm">No staff found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{member.name}</p>
                        {member.role === "admin" && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-warning/10 text-warning font-medium">
                            <Shield className="h-2.5 w-2.5" /> Admin
                          </span>
                        )}
                        {!member.isActive && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-secondary text-muted-foreground font-medium">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {member.employeeId} · {member.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setEditData(member);
                        setShowForm(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => {
                        setResetTarget(member);
                        setNewPassword("");
                        setShowNewPassword(false);
                      }}
                      disabled={member.employeeId === user?.employeeId}
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 text-xs px-2 ${member.isActive ? "text-muted-foreground" : "text-success"}`}
                      onClick={() => handleToggleActive(member)}
                      disabled={member.employeeId === user?.employeeId}
                    >
                      {member.isActive ? (
                        <UserX className="h-3.5 w-3.5" />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(member)}
                      disabled={member.employeeId === user?.employeeId}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <StaffFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditData(null);
        }}
        onSuccess={fetchStaff}
        editData={editData}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{deleteTarget?.name}</strong> ({deleteTarget?.employeeId}
              )? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget._id)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog
        open={!!resetTarget}
        onOpenChange={() => {
          setResetTarget(null);
          setNewPassword("");
          setShowNewPassword(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              Set a new password for <strong>{resetTarget?.name}</strong> (
              {resetTarget?.employeeId}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 pb-2">
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {newPassword.length > 0 && newPassword.length < 6 && (
              <p className="text-xs text-destructive mt-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={handleResetPassword}
              disabled={newPassword.length < 6 || resetting}
              className="gap-2"
            >
              {resetting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
