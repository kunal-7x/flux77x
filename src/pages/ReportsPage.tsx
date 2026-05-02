import { motion } from "framer-motion";
import { useState } from "react";
import { TrendingUp, Users, Clock, CalendarDays, DollarSign, Target, CheckCircle2, AlertCircle } from "lucide-react";
import ExportMenu from "@/components/ui/ExportMenu";

const reportTypes = ["Overview", "Attendance", "Payroll", "Performance"] as const;

const overviewMetrics = [
  { label: "Total Headcount", value: "248", icon: Users, change: "+5.2%" },
  { label: "Avg Attendance", value: "94.2%", icon: Clock, change: "+1.8%" },
  { label: "Turnover Rate", value: "3.1%", icon: TrendingUp, change: "-0.4%" },
  { label: "Avg Tenure", value: "2.8 yrs", icon: CalendarDays, change: "+0.3" },
];

const monthlyData = [
  { month: "Sep", hires: 8, exits: 3 },
  { month: "Oct", hires: 12, exits: 2 },
  { month: "Nov", hires: 6, exits: 4 },
  { month: "Dec", hires: 4, exits: 5 },
  { month: "Jan", hires: 15, exits: 2 },
  { month: "Feb", hires: 10, exits: 1 },
];

const topPerformers = [
  { name: "Ava Collins", score: 95, dept: "Design" },
  { name: "Lucas Parker", score: 92, dept: "Design" },
  { name: "Oliver Reed", score: 89, dept: "Testing" },
  { name: "Emma Harper", score: 87, dept: "Design" },
  { name: "Henry Carter", score: 85, dept: "Design" },
];

const attendanceData = [
  { dept: "Designers", present: 94, late: 3, wfh: 12 },
  { dept: "Developers", present: 91, late: 5, wfh: 18 },
  { dept: "Testers", present: 96, late: 1, wfh: 8 },
  { dept: "Managers", present: 98, late: 0, wfh: 6 },
];

const payrollData = [
  { dept: "Designers", total: 78400, avg: 4600, headcount: 17 },
  { dept: "Developers", total: 145200, avg: 5800, headcount: 25 },
  { dept: "Testers", total: 32400, avg: 4050, headcount: 8 },
  { dept: "Managers", total: 28800, avg: 9600, headcount: 3 },
];

const performanceData = [
  { metric: "Goal Completion", value: 78, target: 85 },
  { metric: "Review Completion", value: 92, target: 100 },
  { metric: "Training Hours", value: 64, target: 80 },
  { metric: "Engagement Score", value: 87, target: 90 },
];

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState<string>("Overview");

  const getExportData = () => {
    if (activeReport === "Overview") return overviewMetrics.map(m => ({ Metric: m.label, Value: m.value, Change: m.change }));
    if (activeReport === "Attendance") return attendanceData.map(d => ({ Department: d.dept, "Present %": d.present, "Late Arrivals": d.late, "WFH Days": d.wfh }));
    if (activeReport === "Payroll") return payrollData.map(d => ({ Department: d.dept, Total: d.total, Average: d.avg, Headcount: d.headcount }));
    return performanceData.map(d => ({ Metric: d.metric, Value: d.value, Target: d.target }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 pb-20 lg:pb-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Comprehensive insights across your organization.</p>
          </div>
          <ExportMenu data={getExportData()} filename={`${activeReport.toLowerCase()}_report_${new Date().toISOString().split("T")[0]}`} />
        </div>

        <div className="flex gap-1 bg-card/60 p-1 rounded-full w-fit backdrop-blur-sm border border-border/30 overflow-x-auto scrollbar-none">
          {reportTypes.map((type) => (
            <button key={type} onClick={() => setActiveReport(type)} className={`nav-pill relative whitespace-nowrap ${activeReport === type ? "" : "text-muted-foreground hover:text-foreground"}`}>
              {activeReport === type && <motion.div layoutId="reportTab" className="absolute inset-0 rounded-full" style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.25)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className={`relative z-10 ${activeReport === type ? "text-primary font-semibold" : ""}`}>{type}</span>
            </button>
          ))}
        </div>

        {activeReport === "Overview" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {overviewMetrics.map(({ label, value, icon: Icon, change }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card-hover p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center text-primary"><Icon size={18} /></div>
                    <span className="text-chart-green text-xs font-semibold">{change}</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{value}</span>
                  <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="glass-card p-5 md:col-span-3">
                <span className="section-title">Monthly Hires vs Exits</span>
                <div className="flex items-end gap-3 mt-6 h-40">
                  {monthlyData.map(({ month, hires, exits }, i) => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="flex gap-1 items-end w-full justify-center h-32">
                        <motion.div className="w-5 rounded-t-md bg-primary/80" initial={{ height: 0 }} animate={{ height: `${(hires / 16) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.08 }} />
                        <motion.div className="w-5 rounded-t-md bg-chart-orange/60" initial={{ height: 0 }} animate={{ height: `${(exits / 16) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.08 + 0.1 }} />
                      </div>
                      <span className="text-muted-foreground text-xs">{month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-6 mt-4">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-primary/80" /><span className="text-xs text-muted-foreground">Hires</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-chart-orange/60" /><span className="text-xs text-muted-foreground">Exits</span></div>
                </div>
              </div>
              <div className="glass-card p-5 md:col-span-2">
                <span className="section-title">Top Performers</span>
                <div className="space-y-3 mt-4">
                  {topPerformers.map(({ name, score, dept }, i) => (
                    <motion.div key={name} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-5 text-right">{i + 1}</span>
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">{name.split(" ").map(n => n[0]).join("")}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{name}</p>
                        <p className="text-xs text-muted-foreground">{dept}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 metric-bar"><motion.div className="metric-bar-fill bg-primary" initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.6, delay: i * 0.1 }} /></div>
                        <span className="text-sm font-bold text-foreground w-8 text-right">{score}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeReport === "Attendance" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Overall Rate", value: "94.2%", icon: CheckCircle2, color: "text-chart-green" },
                { label: "Late Arrivals", value: "9", icon: Clock, color: "text-chart-orange" },
                { label: "WFH Days", value: "44", icon: Users, color: "text-chart-blue" },
                { label: "Absent Days", value: "12", icon: AlertCircle, color: "text-chart-red" },
              ].map(({ label, value, icon: Icon, color }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card-hover p-4">
                  <div className={`w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center ${color} mb-3`}><Icon size={16} /></div>
                  <span className="text-xl font-bold text-foreground">{value}</span>
                  <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
                </motion.div>
              ))}
            </div>
            <div className="glass-card p-5">
              <span className="section-title">Attendance by Department</span>
              <div className="space-y-4 mt-4">
                {attendanceData.map(({ dept, present, late, wfh }, i) => (
                  <motion.div key={dept} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-foreground text-sm font-medium">{dept}</span>
                      <span className="text-foreground text-sm font-bold">{present}%</span>
                    </div>
                    <div className="metric-bar h-2">
                      <motion.div className="metric-bar-fill bg-chart-green" initial={{ width: 0 }} animate={{ width: `${present}%` }} transition={{ duration: 0.8 }} />
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Late: {late}</span><span>WFH: {wfh}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeReport === "Payroll" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Payroll", value: "$284.8k", icon: DollarSign, color: "text-primary" },
                { label: "Avg Salary", value: "$5,362", icon: TrendingUp, color: "text-chart-green" },
                { label: "Headcount", value: "53", icon: Users, color: "text-chart-blue" },
                { label: "Growth", value: "+4.2%", icon: TrendingUp, color: "text-chart-lime" },
              ].map(({ label, value, icon: Icon, color }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card-hover p-4">
                  <div className={`w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center ${color} mb-3`}><Icon size={16} /></div>
                  <span className="text-xl font-bold text-foreground">{value}</span>
                  <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
                </motion.div>
              ))}
            </div>
            <div className="glass-card p-5">
              <span className="section-title">Payroll by Department</span>
              <div className="overflow-x-auto mt-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left px-4 py-2 text-muted-foreground text-xs font-semibold">Department</th>
                      <th className="text-right px-4 py-2 text-muted-foreground text-xs font-semibold">Total</th>
                      <th className="text-right px-4 py-2 text-muted-foreground text-xs font-semibold">Avg Salary</th>
                      <th className="text-right px-4 py-2 text-muted-foreground text-xs font-semibold">Headcount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData.map((row, i) => (
                      <motion.tr key={row.dept} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border/10 hover:bg-secondary/20">
                        <td className="px-4 py-3 text-foreground text-sm font-medium">{row.dept}</td>
                        <td className="px-4 py-3 text-foreground text-sm text-right font-bold">${row.total.toLocaleString()}</td>
                        <td className="px-4 py-3 text-muted-foreground text-sm text-right">${row.avg.toLocaleString()}</td>
                        <td className="px-4 py-3 text-muted-foreground text-sm text-right">{row.headcount}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeReport === "Performance" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {performanceData.map(({ metric, value, target }, i) => (
                <motion.div key={metric} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card-hover p-4">
                  <div className={`w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center ${value >= target ? "text-chart-green" : "text-chart-orange"} mb-3`}><Target size={16} /></div>
                  <span className="text-xl font-bold text-foreground">{value}%</span>
                  <p className="text-muted-foreground text-xs mt-0.5">{metric}</p>
                  <p className="text-muted-foreground text-[10px]">Target: {target}%</p>
                </motion.div>
              ))}
            </div>
            <div className="glass-card p-5">
              <span className="section-title">Performance vs Target</span>
              <div className="space-y-4 mt-4">
                {performanceData.map(({ metric, value, target }, i) => (
                  <motion.div key={metric} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-foreground text-sm">{metric}</span>
                      <span className={`text-sm font-bold ${value >= target ? "text-chart-green" : "text-chart-orange"}`}>{value}% / {target}%</span>
                    </div>
                    <div className="metric-bar h-2 relative">
                      <motion.div className={`metric-bar-fill ${value >= target ? "bg-chart-green" : "bg-chart-orange"}`} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }} />
                      <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/30" style={{ left: `${target}%` }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ReportsPage;
