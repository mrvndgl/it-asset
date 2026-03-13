import { pcs, printers } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, Monitor, Printer } from "lucide-react";
import { toast } from "sonner";

function exportToCsv(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename} exported`);
}

const reports = [
  {
    title: "PC Inventory Report",
    description: "Export all PC records with device specs and assignments",
    icon: Monitor,
    count: pcs.length,
    action: () => exportToCsv(pcs as unknown as Record<string, unknown>[], "pc-inventory.csv"),
  },
  {
    title: "Printer Inventory Report",
    description: "Export all printer records with department info",
    icon: Printer,
    count: printers.length,
    action: () => exportToCsv(printers as unknown as Record<string, unknown>[], "printer-inventory.csv"),
  },
  {
    title: "Device Assignment Report",
    description: "Assigned devices with employee details",
    icon: FileSpreadsheet,
    count: pcs.filter((p) => p.status === "assigned").length,
    action: () =>
      exportToCsv(
        pcs.filter((p) => p.status === "assigned") as unknown as Record<string, unknown>[],
        "assignments.csv"
      ),
  },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Export inventory data</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map((r) => (
          <Card key={r.title} className="animate-fade-in">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <r.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base font-medium">{r.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{r.description}</p>
              <p className="text-xs text-muted-foreground">{r.count} records</p>
              <Button variant="outline" size="sm" onClick={r.action} className="w-full">
                <Download className="mr-2 h-4 w-4" />Export CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
