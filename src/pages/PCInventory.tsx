import { useState } from "react";
import { pcs as initialPcs, PC } from "@/lib/mock-data";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function PCInventory() {
  const [pcList, setPcList] = useState<PC[]>(initialPcs);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPc, setEditingPc] = useState<PC | null>(null);
  const [viewPc, setViewPc] = useState<PC | null>(null);

  const emptyPc: Omit<PC, "id"> = {
    employeeName: "", employeeId: "", serialNumber: "", manufacturer: "", model: "",
    ipAddress: "", macAddress: "", ram: "", storage: "", dateOfIssue: "", location: "", assignedTo: "", status: "available",
  };
  const [form, setForm] = useState<Omit<PC, "id">>(emptyPc);

  const openAdd = () => { setEditingPc(null); setForm(emptyPc); setDialogOpen(true); };
  const openEdit = (pc: PC) => { setEditingPc(pc); setForm({ ...pc }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.serialNumber || !form.manufacturer || !form.model) {
      toast.error("Please fill required fields");
      return;
    }
    if (editingPc) {
      setPcList((prev) => prev.map((p) => (p.id === editingPc.id ? { ...form, id: editingPc.id } : p)));
      toast.success("PC updated");
    } else {
      setPcList((prev) => [...prev, { ...form, id: String(Date.now()) }]);
      toast.success("PC added");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setPcList((prev) => prev.filter((p) => p.id !== id));
    toast.success("PC deleted");
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

  const Field = ({ label, name, value, placeholder }: { label: string; name: string; value: string; placeholder?: string }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input value={value} placeholder={placeholder} onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">PC Inventory</h1>
          <p className="text-sm text-muted-foreground">{pcList.length} devices registered</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add PC</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPc ? "Edit PC" : "Add New PC"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Employee Name" name="employeeName" value={form.employeeName} />
              <Field label="Employee ID" name="employeeId" value={form.employeeId} />
              <Field label="Serial Number *" name="serialNumber" value={form.serialNumber} />
              <Field label="Manufacturer *" name="manufacturer" value={form.manufacturer} />
              <Field label="Model *" name="model" value={form.model} />
              <Field label="IP Address" name="ipAddress" value={form.ipAddress} placeholder="192.168.x.x" />
              <Field label="MAC Address" name="macAddress" value={form.macAddress} />
              <Field label="RAM" name="ram" value={form.ram} placeholder="16GB" />
              <Field label="Storage" name="storage" value={form.storage} placeholder="512GB SSD" />
              <Field label="Date of Issue" name="dateOfIssue" value={form.dateOfIssue} placeholder="YYYY-MM-DD" />
              <Field label="Location" name="location" value={form.location} />
              <Field label="Assigned To" name="assignedTo" value={form.assignedTo} />
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as PC["status"] }))}>
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

      <DataTable
        data={pcList}
        columns={columns}
        searchKeys={["employeeName", "serialNumber", "ipAddress", "location", "manufacturer"]}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewPc(row)}>
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

      <Dialog open={!!viewPc} onOpenChange={(o) => !o && setViewPc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>PC Details</DialogTitle>
          </DialogHeader>
          {viewPc && (
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              {Object.entries(viewPc).filter(([k]) => k !== "id").map(([key, val]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                  <p className="font-medium">{key === "status" ? <StatusBadge status={String(val)} /> : String(val)}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
