import { useState, useEffect } from "react";
import { Monitor, Printer, Building2, CheckCircle, Package, Clock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { PC, Printer as PrinterType, Department } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { api } from "@/lib/api";

const COLORS = ["hsl(173, 80%, 40%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)"];

export default function Dashboard() {
  const [pcs, setPcs] = useState<PC[]>([]);
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    api.get<PC[]>("/api/pcs")
      .then(data => setPcs(data))
      .catch(err => console.error("Failed to fetch PCs", err));

    api.get<PrinterType[]>("/api/printers")
      .then(data => setPrinters(data))
      .catch(err => console.error("Failed to fetch printers", err));

    api.get<Department[]>("/api/departments")
      .then(data => setDepartments(data))
      .catch(err => console.error("Failed to fetch departments", err));
  }, []);

  const assigned = pcs.filter((p) => p.status === "assigned").length;
  const available = pcs.filter((p) => p.status === "available").length;

  const departmentChartData = departments.map((d) => ({
    name: d.name,
    PCs: d.pcCount,
    Printers: d.printerCount,
  }));

  const statusData = [
    { name: "Assigned", value: pcs.filter((p) => p.status === "assigned").length },
    { name: "Available", value: pcs.filter((p) => p.status === "available").length },
    { name: "Maintenance", value: pcs.filter((p) => p.status === "maintenance").length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of IT asset inventory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total PCs" value={pcs.length} icon={Monitor} variant="primary" />
        <StatCard title="Total Printers" value={printers.length} icon={Printer} variant="info" />
        <StatCard title="Departments" value={departments.length} icon={Building2} variant="default" />
        <StatCard title="Assigned" value={assigned} icon={CheckCircle} variant="success" />
        <StatCard title="Available" value={available} icon={Package} variant="warning" />
        <StatCard title="Recent" value="3" icon={Clock} description="Last 30 days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Devices by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChartData} barGap={4}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="PCs" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Printers" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">PC Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-muted-foreground">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Recently Added Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pcs.slice(0, 4).map((pc) => (
              <div key={pc.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                    <Monitor className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{pc.manufacturer} {pc.model}</p>
                    <p className="text-xs text-muted-foreground font-mono">{pc.serialNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground hidden sm:inline">{pc.employeeName}</span>
                  <StatusBadge status={pc.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}