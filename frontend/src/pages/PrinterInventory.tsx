import { useState, useEffect } from "react";
import { Printer } from "@/lib/mock-data";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";

const Field = ({ label, name, value, onChange }: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
}) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}</Label>
    <Input value={value} onChange={(e) => onChange(name, e.target.value)} />
  </div>
);

export default function PrinterInventory() {
  const [list, setList] = useState<Printer[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Printer | null>(null);

  const empty: Omit<Printer, "id"> = {
    printerName: "", printerModel: "", tonerCartridge: "", drumUnit: "",
    department: "", ipAddress: "", password: "", location: "", status: "active",
  };
  const [form, setForm] = useState<Omit<Printer, "id">>(empty);

  useEffect(() => {
    api.get<Printer[]>("/api/printers")
      .then(data => setList(data))
      .catch(() => toast.error("Failed to fetch printers"));
  }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (p: Printer) => { setEditing(p); setForm({ ...p }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.printerName || !form.printerModel) { toast.error("Fill required fields"); return; }
    try {
      if (editing) {
        const updated = await api.put<Printer>(`/api/printers/${editing.id}`, form);
        setList(prev => prev.map(p => p.id === editing.id ? updated : p));
        toast.success("Printer updated");
      } else {
        const created = await api.post<Printer>("/api/printers", form);
        setList(prev => [...prev, created]);
        toast.success("Printer added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save printer");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/printers/${id}`);
      setList(prev => prev.filter(p => p.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Network error — could not reach server");
    }
  };

  const columns = [
    { key: "printerName" as keyof Printer, label: "Name", sortable: true },
    { key: "printerModel" as keyof Printer, label: "Model", sortable: true },
    { key: "tonerCartridge" as keyof Printer, label: "Toner" },
    { key: "department" as keyof Printer, label: "Department", sortable: true },
    { key: "ipAddress" as keyof Printer, label: "IP", render: (v: Printer[keyof Printer]) => <span className="font-mono text-xs">{String(v)}</span> },
    { key: "location" as keyof Printer, label: "Location", sortable: true },
    { key: "status" as keyof Printer, label: "Status", render: (v: Printer[keyof Printer]) => <StatusBadge status={String(v)} /> },
  ];

  const handleFieldChange = (name: string, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Printer Inventory</h1>
          <p className="text-sm text-muted-foreground">{list.length} printers registered</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add Printer</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Printer</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Printer Name *" name="printerName" value={form.printerName} onChange={handleFieldChange} />
              <Field label="Model *" name="printerModel" value={form.printerModel} onChange={handleFieldChange} />
              <Field label="Toner Cartridge" name="tonerCartridge" value={form.tonerCartridge} onChange={handleFieldChange} />
              <Field label="Drum Unit" name="drumUnit" value={form.drumUnit} onChange={handleFieldChange} />
              <Field label="Department" name="department" value={form.department} onChange={handleFieldChange} />
              <Field label="IP Address" name="ipAddress" value={form.ipAddress} onChange={handleFieldChange} />
              <Field label="Password" name="password" value={form.password} onChange={handleFieldChange} />
              <Field label="Location" name="location" value={form.location} onChange={handleFieldChange} />
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Printer["status"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full mt-2">{editing ? "Update" : "Add"} Printer</Button>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={list}
        columns={columns}
        searchKeys={["printerName", "printerModel", "department", "ipAddress", "location"]}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
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
  );
}