import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Ticket,
  Clock,
  CheckCircle2,
  CircleDot,
  XCircle,
  Loader2,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, getAuthToken } from "@/lib/auth-context";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "Low" | "Medium" | "High" | "Critical";
type Status = "Open" | "In Progress" | "Resolved" | "Closed";
type Category = "Hardware" | "Software" | "Network" | "Account" | "Other";

interface Comment {
  _id: string;
  comment: string;
  postedBy: string;
  role: "admin" | "user";
  createdAt: string;
}

interface TicketItem {
  _id: string;
  ticketId: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  department: string;
  submittedBy: string;
  createdAt: string;
  comments: Comment[];
}

interface AuthUser {
  role: "admin" | "user";
  department?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "IT",
  "Sales",
  "Accounts",
  "HR",
  "Logistics",
  "Procurement",
  "Store",
  "Safety and Security",
];
const CATEGORIES: Category[] = [
  "Hardware",
  "Software",
  "Network",
  "Account",
  "Other",
];
const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];
const STATUSES: Status[] = ["Open", "In Progress", "Resolved", "Closed"];

// ─── Badge Helpers ────────────────────────────────────────────────────────────

const priorityVariant: Record<Priority, string> = {
  Low: "bg-secondary text-secondary-foreground",
  Medium: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  High: "bg-warning/10 text-warning",
  Critical: "bg-destructive/10 text-destructive",
};

const statusConfig: Record<
  Status,
  { className: string; icon: React.ReactNode }
> = {
  Open: {
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    icon: <CircleDot className="h-3 w-3" />,
  },
  "In Progress": {
    className: "bg-warning/10 text-warning",
    icon: <Clock className="h-3 w-3" />,
  },
  Resolved: {
    className: "bg-success/10 text-success",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  Closed: {
    className: "bg-secondary text-muted-foreground",
    icon: <XCircle className="h-3 w-3" />,
  },
};

const statCards = [
  {
    label: "Open",
    status: "Open" as Status,
    icon: CircleDot,
    color: "text-blue-600",
  },
  {
    label: "In Progress",
    status: "In Progress" as Status,
    icon: Clock,
    color: "text-warning",
  },
  {
    label: "Resolved",
    status: "Resolved" as Status,
    icon: CheckCircle2,
    color: "text-success",
  },
  {
    label: "Closed",
    status: "Closed" as Status,
    icon: XCircle,
    color: "text-muted-foreground",
  },
];

// ─── Submit Modal ─────────────────────────────────────────────────────────────

function SubmitTicketModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const authUser = user as AuthUser | null;
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Hardware" as Category,
    priority: "Medium" as Priority,
    department: !isAdmin ? (authUser?.department ?? "IT") : "IT",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to submit ticket");
        return;
      }
      toast.success("Ticket submitted!");
      onSuccess();
      onClose();
      setForm({
        title: "",
        description: "",
        category: "Hardware",
        priority: "Medium",
        department: !isAdmin ? (authUser?.department ?? "IT") : "IT",
      });
    } catch {
      toast.error("Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit New Ticket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Brief summary of the issue"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the issue in detail..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="resize-none h-20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Department</Label>
              {isAdmin ? (
                <Select
                  value={form.department}
                  onValueChange={(v) => set("department", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={form.department} disabled className="bg-muted" />
              )}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set("priority", p)}
                  className={`py-1.5 rounded-md text-xs font-medium border transition-colors ${form.priority === p ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/50"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.title.trim() || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Ticket"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function TicketDetailModal({
  ticket,
  open,
  onClose,
  onStatusChange,
  onCommentAdded,
}: {
  ticket: TicketItem | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: Status) => void;
  onCommentAdded: () => void;
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!ticket) return null;
  const sc = statusConfig[ticket.status];

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const token = getAuthToken();
      const res = await fetch(
        `${API_BASE}/api/tickets/${ticket._id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ comment }),
        },
      );
      if (!res.ok) {
        toast.error("Failed to add comment");
        return;
      }
      toast.success("Comment added!");
      setComment("");
      onCommentAdded();
    } catch {
      toast.error("Request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.className}`}
            >
              {sc.icon}
              {ticket.status}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityVariant[ticket.priority]}`}
            >
              {ticket.priority}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {ticket.ticketId}
          </p>
          <DialogTitle className="text-base leading-snug">
            {ticket.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {ticket.description || "No description provided."}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["Department", ticket.department],
              ["Category", ticket.category],
              ["Submitted By", ticket.submittedBy],
              ["Date", new Date(ticket.createdAt).toLocaleDateString()],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Admin — update status */}
          {isAdmin && ticket.status !== "Closed" && (
            <div className="space-y-2">
              <Label className="text-xs">Update Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.filter((s) => s !== ticket.status).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onStatusChange(ticket._id, s);
                      onClose();
                    }}
                    className="py-1.5 px-3 rounded-md text-xs font-medium border border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors text-left"
                  >
                    → {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="space-y-3">
            <Label className="text-xs">
              Comments{" "}
              {ticket.comments?.length > 0 && (
                <span className="text-muted-foreground">
                  ({ticket.comments.length})
                </span>
              )}
            </Label>

            {/* Comment List */}
            {ticket.comments?.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                No comments yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {ticket.comments.map((c) => (
                  <div
                    key={c._id}
                    className={`rounded-lg px-3 py-2 text-sm ${c.role === "admin" ? "bg-primary/5 border border-primary/10" : "bg-muted/50"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">
                        {c.postedBy}
                      </span>
                      {c.role === "admin" && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                          IT
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {c.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            <div className="flex gap-2">
              <Input
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleAddComment()
                }
                className="flex-1 text-sm"
              />
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!comment.trim() || submitting}
                className="shrink-0"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Staff View ───────────────────────────────────────────────────────────────

function StaffTicketingView({
  tickets,
  loading,
  onNewTicket,
  onSelectTicket,
}: {
  tickets: TicketItem[];
  loading: boolean;
  onNewTicket: () => void;
  onSelectTicket: (t: TicketItem) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Tickets</h1>
          <p className="text-sm text-muted-foreground">
            Submit and track your IT support requests
          </p>
        </div>
        <Button onClick={onNewTicket} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> New Ticket
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            {tickets.length} Ticket{tickets.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Ticket className="h-8 w-8 opacity-30" />
              <p className="text-sm">No tickets yet</p>
              <p className="text-xs">Click "New Ticket" to submit a request</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tickets.map((ticket) => {
                const sc = statusConfig[ticket.status];
                return (
                  <div
                    key={ticket._id}
                    onClick={() => onSelectTicket(ticket)}
                    className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          {ticket.ticketId}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {ticket.category}
                        </span>
                        {ticket.comments?.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            · 💬 {ticket.comments.length}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.className}`}
                    >
                      {sc.icon}
                      {ticket.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Admin View ───────────────────────────────────────────────────────────────

function AdminTicketingView({
  tickets,
  loading,
  onNewTicket,
  onSelectTicket,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  search,
  setSearch,
}: {
  tickets: TicketItem[];
  loading: boolean;
  onNewTicket: () => void;
  onSelectTicket: (t: TicketItem) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  filterPriority: string;
  setFilterPriority: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  const counts = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: tickets.filter((t) => t.status === s).length }),
    {} as Record<Status, number>,
  );
  const filtered = tickets.filter((t) => {
    const matchStatus = filterStatus === "All" || t.status === filterStatus;
    const matchPriority =
      filterPriority === "All" || t.priority === filterPriority;
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      t.submittedBy.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ticketing</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track IT support requests
          </p>
        </div>
        <Button onClick={onNewTicket} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, status, icon: Icon, color }) => (
          <Card
            key={status}
            className={`cursor-pointer transition-colors ${filterStatus === status ? "border-primary" : ""}`}
            onClick={() =>
              setFilterStatus(filterStatus === status ? "All" : status)
            }
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {label}
                </span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-2xl font-semibold">{counts[status]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Priority</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            {filtered.length} Ticket{filtered.length !== 1 ? "s" : ""}
            {filterStatus !== "All" && (
              <span className="text-muted-foreground font-normal">
                {" "}
                · {filterStatus}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Loading tickets...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Ticket className="h-8 w-8 opacity-30" />
              <p className="text-sm">No tickets found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((ticket) => {
                const sc = statusConfig[ticket.status];
                return (
                  <div
                    key={ticket._id}
                    onClick={() => onSelectTicket(ticket)}
                    className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          {ticket.ticketId}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {ticket.department}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {ticket.category}
                        </span>
                        {ticket.comments?.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            · 💬 {ticket.comments.length}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        by {ticket.submittedBy} ·{" "}
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${priorityVariant[ticket.priority]}`}
                      >
                        {ticket.priority}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.className}`}
                      >
                        {sc.icon}
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Ticketing() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const selectedTicketRef = useRef<TicketItem | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data);
        const current = selectedTicketRef.current;
        if (current) {
          const updated = data.find((t: TicketItem) => t._id === current._id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, []); // stable now — no deps needed

  // keep the ref in sync whenever selection changes
  useEffect(() => {
    selectedTicketRef.current = selectedTicket;
  }, [selectedTicket]);

  // single polling effect
  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 15000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const handleStatusChange = async (id: string, status: Status) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/tickets/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success("Status updated!");
        fetchTickets();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <>
      {isAdmin ? (
        <AdminTicketingView
          tickets={tickets}
          loading={loading}
          onNewTicket={() => setShowSubmit(true)}
          onSelectTicket={(t) => {
            setSelectedTicket(t);
            setShowDetail(true);
          }}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          search={search}
          setSearch={setSearch}
        />
      ) : (
        <StaffTicketingView
          tickets={tickets}
          loading={loading}
          onNewTicket={() => setShowSubmit(true)}
          onSelectTicket={(t) => {
            setSelectedTicket(t);
            setShowDetail(true);
          }}
        />
      )}
      <SubmitTicketModal
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        onSuccess={fetchTickets}
      />
      <TicketDetailModal
        ticket={selectedTicket}
        open={showDetail}
        onClose={() => setShowDetail(false)}
        onStatusChange={handleStatusChange}
        onCommentAdded={fetchTickets}
      />
    </>
  );
}
