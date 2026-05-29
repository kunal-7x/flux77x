import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Check, X, Clock } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { useAiActionFocus } from "@/hooks/useAiActionFocus";

type RequestStatus = "pending" | "approved" | "rejected";
type RequestFilter = "All" | "Pending" | "Approved" | "Rejected";

interface Request {
  id: string; name: string; type: string; date: string; duration: string; reason: string; status: RequestStatus;
}

const requests: Request[] = [
  { id: "1", name: "Henry Carter", type: "Vacation Leave", date: "Mar 5 - Mar 10", duration: "5 days", reason: "Family vacation", status: "pending" },
  { id: "2", name: "Ava Collins", type: "Sick Leave", date: "Feb 25", duration: "1 day", reason: "Medical appointment", status: "pending" },
  { id: "3", name: "Ethan Brooks", type: "Work From Home", date: "Mar 1 - Mar 3", duration: "3 days", reason: "Personal reasons", status: "pending" },
  { id: "4", name: "Emma Harper", type: "Vacation Leave", date: "Mar 15 - Mar 20", duration: "5 days", reason: "Travel plans", status: "approved" },
  { id: "5", name: "Lucas Parker", type: "Training Leave", date: "Feb 28", duration: "1 day", reason: "AWS certification", status: "approved" },
  { id: "6", name: "Oliver Reed", type: "Sick Leave", date: "Feb 20", duration: "1 day", reason: "Not feeling well", status: "rejected" },
  { id: "7", name: "James Sullivan", type: "Vacation Leave", date: "Mar 8 - Mar 12", duration: "4 days", reason: "Wedding attendance", status: "pending" },
];

const filters: RequestFilter[] = ["All", "Pending", "Approved", "Rejected"];

const statusConfig: Record<RequestStatus, { label: string; bg: string; text: string; icon: typeof Clock }> = {
  pending: { label: "Pending", bg: "bg-primary/10", text: "text-primary", icon: Clock },
  approved: { label: "Approved", bg: "bg-chart-green/10", text: "text-chart-green", icon: Check },
  rejected: { label: "Rejected", bg: "bg-chart-red/10", text: "text-chart-red", icon: X },
};

const formatDate = (value: string) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const getDuration = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const days = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
  return `${days} ${days === 1 ? "day" : "days"}`;
};

const mapLeaveRequest = (row: any): Request => {
  const employee = Array.isArray(row.employees) ? row.employees[0] : row.employees;
  const employeeName = employee ? `${employee.first_name || ""} ${employee.last_name || ""}`.trim() : "";
  return {
    id: row.id,
    name: employeeName || row.employee_id || "Employee",
    type: row.leave_type || "Leave",
    date: `${formatDate(row.start_date)} - ${formatDate(row.end_date)}`,
    duration: getDuration(row.start_date, row.end_date),
    reason: row.reason || "No reason provided",
    status: (row.status || "pending") as RequestStatus,
  };
};

const RequestsPage = () => {
  const [filter, setFilter] = useState<RequestFilter>("All");
  const [localRequests, setLocalRequests] = useState(requests);
  const { canApproveLeave } = usePermissions();

  const fetchRequests = useCallback(async () => {
    const { data } = await supabase
      .from("leave_requests")
      .select("*, employees!leave_requests_employee_id_fkey(first_name,last_name)")
      .order("created_at", { ascending: false });
    if (data && data.length > 0) setLocalRequests(data.map(mapLeaveRequest));
  }, []);
  const aiFocus = useAiActionFocus("leave_requests", fetchRequests);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { if (aiFocus.id) setFilter("All"); }, [aiFocus.id]);

  const filtered = filter === "All" ? localRequests : localRequests.filter((r) => r.status === filter.toLowerCase());

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    setLocalRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: action } : r));
    await supabase.from("leave_requests").update({ status: action }).eq("id", id);
  };

  const pendingCount = localRequests.filter((r) => r.status === "pending").length;
  const approvedCount = localRequests.filter((r) => r.status === "approved").length;
  const rejectedCount = localRequests.filter((r) => r.status === "rejected").length;

  return (
    <div className="flex-1 overflow-y-auto p-2 pb-20 lg:pb-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Requests</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage leave requests and approvals.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Pending", count: pendingCount, icon: Clock, color: "text-primary" },
            { label: "Approved", count: approvedCount, icon: Check, color: "text-chart-green" },
            { label: "Rejected", count: rejectedCount, icon: X, color: "text-chart-red" },
          ].map(({ label, count, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card-hover p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-secondary/60 flex items-center justify-center ${color}`}><Icon size={20} /></div>
              <div>
                <span className="text-2xl font-bold text-foreground">{count}</span>
                <p className="text-muted-foreground text-xs">{label} Requests</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fixed tab styling — uses primary highlight instead of white bg */}
        <div className="flex gap-1 bg-card/60 p-1 rounded-full w-fit backdrop-blur-sm border border-border/30">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`nav-pill relative ${filter === f ? "" : "text-muted-foreground hover:text-foreground"}`}>
              {filter === f && (
                <motion.div layoutId="requestFilter" className="absolute inset-0 rounded-full" style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.25)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <span className={`relative z-10 ${filter === f ? "text-primary font-semibold" : ""}`}>{f}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((req, i) => {
            const config = statusConfig[req.status];
            const StatusIcon = config.icon;
            return (
              <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.25 }} className={`glass-card-hover p-5 flex items-center gap-4 ${aiFocus.focusClass(req.id)}`}>
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                  {req.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-foreground font-semibold text-sm">{req.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>{config.label}</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5">{req.type} · {req.date} · {req.duration}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{req.reason}</p>
                </div>
                {req.status === "pending" && canApproveLeave && (
                  <div className="flex gap-2 flex-shrink-0">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAction(req.id, "approved")}
                      className="w-9 h-9 rounded-xl bg-chart-green/10 flex items-center justify-center text-chart-green hover:bg-chart-green/20 transition-colors"><Check size={16} /></motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAction(req.id, "rejected")}
                      className="w-9 h-9 rounded-xl bg-chart-red/10 flex items-center justify-center text-chart-red hover:bg-chart-red/20 transition-colors"><X size={16} /></motion.button>
                  </div>
                )}
                {(req.status !== "pending" || !canApproveLeave) && req.status !== "pending" && (
                  <StatusIcon size={16} className={`${config.text} flex-shrink-0`} />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default RequestsPage;
