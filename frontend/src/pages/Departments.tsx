import { useState, useEffect } from "react";
import { Department } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Monitor, Printer, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

const API = "http://localhost:3000/api/departments";

const empty = { name: "", location: "", pcCount: 0, printerCount: 0 };

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(() => toast.error("Failed to fetch departments"));
  }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (d: Department) => { setEditing(d); setForm({ name: d.name, location: d.location, pcCount: d.pcCount, printerCount: d.printerCount }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Department name is required"); return; }
    try {
      if (editing) {
        const res = await fetch(`${API}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated: Department = await res.json();
        setDepartments(prev => prev.map(d => d.id === editing.id ? updated : d));
        toast.success("Department updated");
      } else {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const created: Department = await res.json();
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
      await fetch(`${API}/${id}`, { method: "DELETE" });
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
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Finance" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Location</Label>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Floor 2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">PC Count</Label>
                  <Input type="number" min={0} value={form.pcCount} onChange={e => setForm(f => ({ ...f, pcCount: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Printer Count</Label>
                  <Input type="number" min={0} value={form.printerCount} onChange={e => setForm(f => ({ ...f, printerCount: Number(e.target.value) }))} />
                </div>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full mt-2">{editing ? "Update" : "Add"} Department</Button>
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
          {departments.map((dept) => (
            <Card key={dept.id} className="animate-fade-in hover:border-primary/30 transition-colors">
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
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(dept)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(dept.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{dept.pcCount}</span>
                    <span className="text-muted-foreground text-xs">PCs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Printer className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{dept.printerCount}</span>
                    <span className="text-muted-foreground text-xs">Printers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}