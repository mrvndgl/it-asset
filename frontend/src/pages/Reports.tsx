import { useState, useEffect } from "react";
import { PC, Printer } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, Monitor, Printer as PrinterIcon, Ticket, CheckCircle2, Clock, CircleDot } from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "Low" | "Medium" | "High" | "Critical";
type Status = "Open" | "In Progress" | "Resolved" | "Closed";

interface TicketRecord {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  status: Status;
  department: string;
  submittedBy: string;
  createdAt: string;
}

// ─── Mock tickets (replace with API call later) ───────────────────────────────

const MOCK_TICKETS: TicketRecord[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function exportToCsv(data: Record<string, unknown>[], filename: string) {
  if (!data.length) { toast.error("No data to export"); return; }
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

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7); // "2026-05"
}

function getMonthLabel() {
  return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Reports() {
  const [pcs, setPcs] = useState<PC[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [tickets] = useState<TicketRecord[]>(MOCK_TICKETS);

  useEffect(() => {
    fetch("http://localhost:3000/api/pcs")
      .then(res => res.json())
      .then(data => setPcs(data))
      .catch(() => toast.error("Failed to fetch PCs"));

    fetch("http://localhost:3000/api/printers")
      .then(res => res.json())
      .then(data => setPrinters(data))
      .catch(() => toast.error("Failed to fetch printers"));
  }, []);

  // Filter tickets for current month
  const currentMonth = getCurrentMonth();
  const monthlyTickets = tickets.filter(t => t.createdAt.startsWith(currentMonth));

  const ticketStats = {
    total: monthlyTickets.length,
    open: monthlyTickets.filter(t => t.status === "Open").length,
    inProgress: monthlyTickets.filter(t => t.status === "In Progress").length,
    resolved: monthlyTickets.filter(t => t.status === "Resolved").length,
    closed: monthlyTickets.filter(t => t.status === "Closed").length,
  };

  const inventoryReports = [
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
      icon: PrinterIcon,
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Export inventory data and view ticket summaries</p>
      </div>

      {/* ── Ticketing Report Section ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Ticketing Report</h2>
          <p className="text-sm text-muted-foreground">{getMonthLabel()} — monthly summary</p>
        </div>

        {/* Ticket Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total", value: ticketStats.total, icon: Ticket, color: "text-primary" },
            { label: "Open", value: ticketStats.open, icon: CircleDot, color: "text-blue-600" },
            { label: "In Progress", value: ticketStats.inProgress, icon: Clock, color: "text-warning" },
            { label: "Resolved", value: ticketStats.resolved + ticketStats.closed, icon: CheckCircle2, color: "text-success" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">{label}</span>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className="text-2xl font-semibold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ticket Export Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Ticket className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base font-medium">Monthly Ticket Report</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">All tickets raised this month across departments</p>
              <p className="text-xs text-muted-foreground">{monthlyTickets.length} records</p>
              <Button variant="outline" size="sm" className="w-full"
                onClick={() => exportToCsv(monthlyTickets as unknown as Record<string, unknown>[], `tickets-${currentMonth}.csv`)}>
                <Download className="mr-2 h-4 w-4" />Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <CardTitle className="text-base font-medium">Resolved Tickets</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Tickets resolved or closed this month</p>
              <p className="text-xs text-muted-foreground">{ticketStats.resolved + ticketStats.closed} records</p>
              <Button variant="outline" size="sm" className="w-full"
                onClick={() => exportToCsv(
                  monthlyTickets.filter(t => t.status === "Resolved" || t.status === "Closed") as unknown as Record<string, unknown>[],
                  `resolved-tickets-${currentMonth}.csv`
                )}>
                <Download className="mr-2 h-4 w-4" />Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <CircleDot className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-base font-medium">Open Tickets</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Tickets still pending or in progress</p>
              <p className="text-xs text-muted-foreground">{ticketStats.open + ticketStats.inProgress} records</p>
              <Button variant="outline" size="sm" className="w-full"
                onClick={() => exportToCsv(
                  monthlyTickets.filter(t => t.status === "Open" || t.status === "In Progress") as unknown as Record<string, unknown>[],
                  `open-tickets-${currentMonth}.csv`
                )}>
                <Download className="mr-2 h-4 w-4" />Export CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Inventory Report Section ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Inventory Reports</h2>
          <p className="text-sm text-muted-foreground">Export asset and device data</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {inventoryReports.map((r) => (
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
    </div>
  );
}