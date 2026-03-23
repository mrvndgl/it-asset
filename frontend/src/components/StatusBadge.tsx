import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  assigned: "bg-primary/15 text-primary border-primary/20",
  available: "bg-success/15 text-success border-success/20",
  maintenance: "bg-warning/15 text-warning border-warning/20",
  active: "bg-success/15 text-success border-success/20",
  inactive: "bg-destructive/15 text-destructive border-destructive/20",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`text-xs font-medium capitalize ${statusStyles[status] || ""}`}>
      {status}
    </Badge>
  );
}
