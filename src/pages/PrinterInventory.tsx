import { useState } from "react";
import { printers as initialPrinters, Printer } from "@/lib/mock-data";
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

export default function PrinterInventory() {
  const [list, setList] = useState<Printer[]>(initialPrinters);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Printer | null>(null);

  const empty: Omit<Printer, "id"> = {
    printerName: "", printerModel: "", tonerCartridge: "", drumUnit: "",
    department: "", ipAddress: "", password: "", location: "", status: "active",
  };
  const [form, setForm] = useState<Omit<Printer, "id">>(empty);

  const openAdd = () => { setEditing(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (p: Printer) => { setEditing(p); setForm({ ...p }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.printerName || !form.printerModel) { toast.error("Fill required fields"); return; }
    if (editing) {
      setList((prev) => prev.map((p) => (p.id === editing.id ? { ...form, id: editing.id } : p)));
      toast.success("Printer updated");
    } else {
      setList((prev) => [...prev, { ...form, id: String(Date.now()) }]);
      toast.success("Printer added");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => { setList((prev) => prev.filter((p) => p.id !== id)); toast.success("Deleted"); };

  const columns = [
    { key: "printerName" as keyof Printer, label: "Name", sortable: true },
    { key: "printerModel" as keyof Printer, label: "Model", sortable: true },
    { key: "tonerCartridge" as keyof Printer, label: "Toner" },
    { key: "department" as keyof Printer, label: "Department", sortable: true },
    { key: "ipAddress" as keyof Printer, label: "IP", render: (v: Printer[keyof Printer]) => <span className="font-mono text-xs">{String(v)}</span> },
    { key: "location" as keyof Printer, label: "Location", sortable: true },
    { key: "status" as keyof Printer, label: "Status", render: (v: Printer[keyof Printer]) => <StatusBadge status={String(v)} /> },
  ];

  const Field = ({ label, name, value }: { label: string; name: string; value: string }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))} />
    </div>
  );

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
              <Field label="Printer Name *" name="printerName" value={form.printerName} />
              <Field label="Model *" name="printerModel" value={form.printerModel} />
              <Field label="Toner Cartridge" name="tonerCartridge" value={form.tonerCartridge} />
              <Field label="Drum Unit" name="drumUnit" value={form.drumUnit} />
              <Field label="Department" name="department" value={form.department} />
              <Field label="IP Address" name="ipAddress" value={form.ipAddress} />
              <Field label="Password" name="password" value={form.password} />
              <Field label="Location" name="location" value={form.location} />
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
