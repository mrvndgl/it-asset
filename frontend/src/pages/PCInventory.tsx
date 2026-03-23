import { useState, useEffect } from "react";
import { PC } from "@/lib/mock-data";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const API = "http://localhost:3000/api/pcs";

const Field = ({ label, name, value, placeholder, onChange, type = "text" }: {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  onChange: (name: string, value: string) => void;
  type?: string;
}) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}</Label>
    <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(name, e.target.value)} />
  </div>
);

const PasswordField = ({ label, name, value, onChange }: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="pr-9"
        />
        <button
          type="button"
          onClick={() => setShow(p => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
};

export default function PCInventory() {
  const [pcList, setPcList] = useState<PC[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPc, setEditingPc] = useState<PC | null>(null);
  const [viewPc, setViewPc] = useState<PC | null>(null);
  const [showViewPassword, setShowViewPassword] = useState(false);

  const emptyPc: Omit<PC, "id"> = {
    employeeName: "", employeeId: "", serialNumber: "", manufacturer: "",
    model: "", ipAddress: "", macAddress: "", ram: "", storage: "",
    dateOfIssue: "", location: "", assignedTo: "", password: "", status: "available",
  };
  const [form, setForm] = useState<Omit<PC, "id">>(emptyPc);

  const handleFieldChange = (name: string, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(data => setPcList(data))
      .catch(() => toast.error("Failed to fetch PCs from server"));
  }, []);

  const openAdd = () => { setEditingPc(null); setForm(emptyPc); setDialogOpen(true); };
  const openEdit = (pc: PC) => { setEditingPc(pc); setForm({ ...pc }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.serialNumber || !form.manufacturer || !form.model) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      if (editingPc) {
        const res = await fetch(`${API}/${editingPc.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated: PC = await res.json();
        setPcList(prev => prev.map(p => p.id === editingPc.id ? updated : p));
        toast.success("PC updated");
      } else {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const created: PC = await res.json();
        setPcList(prev => [...prev, created]);
        toast.success("PC added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save PC");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      setPcList(prev => prev.filter(p => p.id !== id));
      toast.success("PC deleted");
    } catch {
      toast.error("Failed to delete PC");
    }
  };

  const columns = [
    { key: "employeeName" as keyof PC, label: "Employee", sortable: true },
    { key: "serialNumber" as keyof PC, label: "Serial No.", sortable: true, render: (v: PC[keyof PC]) => <span className="font-mono text-xs">{String(v)}</span> },
    { key: "manufacturer" as keyof PC, label: "Make", sortable: true },
    { key: "model" as keyof PC, label: "Model", sortable: true },
    { key: "ipAddress" as keyof PC, label: "IP", render: (v: PC[keyof PC]) => <span className="font-mono text-xs">{String(v)}</span> },
    { key: "ram" as keyof PC, label: "RAM" },
    { key: "location" as keyof PC, label: "Location", sortable: true },
    { key: "status" as keyof PC, label: "Status", render: (v: PC[keyof PC]) => <StatusBadge status={String(v)} /> },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">PC Inventory</h1>
          <p className="text-sm text-muted-foreground">{pcList.length} devices registered</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />Add PC
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto rounded-xl">
            <DialogHeader>
              <DialogTitle>{editingPc ? "Edit PC" : "Add New PC"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Employee Name" name="employeeName" value={form.employeeName} onChange={handleFieldChange} />
              <Field label="Employee ID" name="employeeId" value={form.employeeId} onChange={handleFieldChange} />
              <Field label="Serial Number *" name="serialNumber" value={form.serialNumber} onChange={handleFieldChange} />
              <Field label="Manufacturer *" name="manufacturer" value={form.manufacturer} onChange={handleFieldChange} />
              <Field label="Model *" name="model" value={form.model} onChange={handleFieldChange} />
              <Field label="IP Address" name="ipAddress" value={form.ipAddress} placeholder="192.168.x.x" onChange={handleFieldChange} />
              <Field label="MAC Address" name="macAddress" value={form.macAddress} onChange={handleFieldChange} />
              <Field label="RAM" name="ram" value={form.ram} placeholder="16GB" onChange={handleFieldChange} />
              <Field label="Storage" name="storage" value={form.storage} placeholder="512GB SSD" onChange={handleFieldChange} />
              <Field label="Date of Issue" name="dateOfIssue" value={form.dateOfIssue} placeholder="YYYY-MM-DD" onChange={handleFieldChange} />
              <Field label="Location" name="location" value={form.location} onChange={handleFieldChange} />
              <Field label="Assigned To" name="assignedTo" value={form.assignedTo} onChange={handleFieldChange} />
              <PasswordField label="Password" name="password" value={form.password ?? ""} onChange={handleFieldChange} />
              <div className="space-y-1 col-span-1 sm:col-span-2">
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as PC["status"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full mt-2">{editingPc ? "Update" : "Add"} PC</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table — horizontally scrollable on mobile */}
      <div className="w-full overflow-x-auto rounded-lg">
        <DataTable
          data={pcList}
          columns={columns}
          searchKeys={["employeeName", "serialNumber", "ipAddress", "location", "manufacturer"]}
          actions={(row) => (
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setShowViewPassword(false); setViewPc(row); }}>
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(row.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        />
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewPc} onOpenChange={(o) => !o && setViewPc(null)}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader><DialogTitle>PC Details</DialogTitle></DialogHeader>
          {viewPc && (
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              {Object.entries(viewPc)
                .filter(([k]) => k !== "id" && k !== "password")
                .map(([key, val]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                    <p className="font-medium break-all">{key === "status" ? <StatusBadge status={String(val)} /> : String(val) || "—"}</p>
                  </div>
                ))}
              {/* Password row with toggle */}
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Password</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-medium font-mono text-sm">
                    {showViewPassword ? (viewPc.password || "—") : "••••••••"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowViewPassword(p => !p)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showViewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}