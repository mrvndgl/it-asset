import { useState, useEffect } from "react";
import { Department, PC, Printer } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Monitor, Printer as PrinterIcon, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";

const empty = { name: "", location: "" };

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allPCs, setAllPCs] = useState<PC[]>([]);
  const [allPrinters, setAllPrinters] = useState<Printer[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState(empty);

  const [viewDept, setViewDept] = useState<Department | null>(null);
  const [deptPCs, setDeptPCs] = useState<PC[]>([]);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    api.get<Department[]>("/api/departments")
      .then(data => setDepartments(data))
      .catch(() => toast.error("Failed to fetch departments"));

    api.get<PC[]>("/api/pcs")
      .then(data => setAllPCs(data))
      .catch(() => toast.error("Failed to fetch PCs"));

    api.get<Printer[]>("/api/printers")
      .then(data => setAllPrinters(data))
      .catch(() => toast.error("Failed to fetch printers"));
  }, []);

  const getPCCount = (deptName: string) =>
    allPCs.filter(pc => (pc.department ?? "").toLowerCase() === deptName.toLowerCase()).length;

  const getPrinterCount = (deptName: string) =>
    allPrinters.filter(p => p.department.toLowerCase() === deptName.toLowerCase()).length;

  const openAdd = () => { setEditing(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (d: Department) => {
    setEditing(d);
    setForm({ name: d.name, location: d.location });
    setDialogOpen(true);
  };

  const openView = (dept: Department) => {
    setViewDept(dept);
    setDeptPCs(
      allPCs.filter(pc => (pc.department ?? "").toLowerCase() === dept.name.toLowerCase())
    );
    setViewOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Department name is required"); return; }
    try {
      if (editing) {
        const updated = await api.put<Department>(`/api/departments/${editing.id}`, {
          ...form, pcCount: 0, printerCount: 0,
        });
        setDepartments(prev => prev.map(d => d.id === editing.id ? updated : d));
        toast.success("Department updated");
      } else {
        const created = await api.post<Department>("/api/departments", {
          ...form, pcCount: 0, printerCount: 0,
        });
        setDepartments(prev => [...prev, created]);
        toast.success("Department added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save department");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/departments/${id}`);
      setDepartments(prev => prev.filter(d => d.id !== id));
      toast.success("Department deleted");
    } catch {
      toast.error("Failed to delete department");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
          <p className="text-sm text-muted-foreground">{departments.length} departments registered</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Department" : "Add Department"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Department Name *</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Finance"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Location</Label>
                <Input
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Floor 2"
                />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full mt-2">
              {editing ? "Update" : "Add"} Department
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Building2 className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">No departments yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const pcCount = getPCCount(dept.name);
            const printerCount = getPrinterCount(dept.name);
            return (
              <Card
                key={dept.id}
                className="animate-fade-in hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => openView(dept)}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{dept.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{dept.location || "No location"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); openEdit(dept); }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(dept.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{pcCount}</span>
                      <span className="text-muted-foreground text-xs">PCs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <PrinterIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{printerCount}</span>
                      <span className="text-muted-foreground text-xs">Printers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* PC Viewer Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="w-[95vw] max-w-2xl rounded-xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              {viewDept?.name} — PCs
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                ({deptPCs.length} {deptPCs.length === 1 ? "device" : "devices"})
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-1">
            {deptPCs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Monitor className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">No PCs assigned to this department yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {deptPCs.map((pc) => (
                  <div
                    key={pc.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        <Monitor className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{pc.manufacturer} {pc.model}</p>
                        <p className="text-xs text-muted-foreground font-mono">{pc.serialNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium">{pc.employeeName || "—"}</p>
                        <p className="text-xs text-muted-foreground">{pc.employeeId || "—"}</p>
                      </div>
                      <StatusBadge status={pc.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}