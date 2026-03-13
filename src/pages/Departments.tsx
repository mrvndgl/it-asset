import { useState, useEffect } from "react";
import { Department } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Monitor, Printer, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/departments")
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(() => toast.error("Failed to fetch departments"));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
        <p className="text-sm text-muted-foreground">Manage departments and device allocation</p>
      </div>
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
                      <MapPin className="h-3 w-3" />{dept.location}
                    </p>
                  </div>
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
    </div>
  );
}