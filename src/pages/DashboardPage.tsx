import { motion } from "framer-motion";
import { Users, UserCheck, Calendar, Clock, TrendingUp, ArrowUpRight, ArrowDownRight, Briefcase, Target, ChevronRight, AlertCircle, CheckCircle2, Zap, Award, BarChart3 } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { NavItem } from "@/data/mockData";

interface DashboardPageProps {
  onNavigate?: (nav: NavItem) => void;
}

const DashboardPage = ({ onNavigate }: DashboardPageProps) => {
  const { employees } = useEmployees();
  const activeCount = employees.filter(e => e.status === "active").length;
  const onLeaveCount = employees.filter(e => e.status === "on-leave").length;
  const avgHours = employees.length > 0 ? (employees.reduce((a, b) => a + b.avgWorkTime, 0) / employees.length).toFixed(1) : "0";
  const avgPerformance = employees.length > 0 ? Math.round(employees.reduce((a, b) => a + b.performanceScore, 0) / employees.length) : 0;
  const totalSalary = employees.reduce((a, b) => a + b.salary, 0);

  const stats = [
    { label: "Total Employees", value: String(employees.length), change: "+12", trend: "up" as const, icon: Users, color: "text-primary" },
    { label: "Active Today", value: String(activeCount), change: "+8", trend: "up" as const, icon: UserCheck, color: "text-chart-green" },
    { label: "On Leave", value: String(onLeaveCount), change: "-3", trend: "down" as const, icon: Calendar, color: "text-chart-orange" },
    { label: "Avg. Hours", value: `${avgHours}h`, change: "+0.2", trend: "up" as const, icon: Clock, color: "text-chart-blue" },
    { label: "Performance", value: `${avgPerformance}%`, change: "+4", trend: "up" as const, icon: TrendingUp, color: "text-primary" },
    { label: "Monthly Payroll", value: `$${(totalSalary / 1000).toFixed(0)}k`, change: "+2%", trend: "up" as const, icon: Briefcase, color: "text-chart-lime" },
  ];

  const recentActivity = [
    { name: "Ava Collins", action: "approved leave request", time: "2 min ago", type: "success" },
    { name: "Ethan Brooks", action: "submitted timesheet", time: "15 min ago", type: "info" },
    { name: "Emma Harper", action: "completed training", time: "1 hour ago", type: "success" },
    { name: "Oliver Reed", action: "updated profile", time: "2 hours ago", type: "info" },
    { name: "James Sullivan", action: "joined project Alpha", time: "3 hours ago", type: "info" },
    { name: "Lucas Parker", action: "received recognition", time: "5 hours ago", type: "success" },
  ];

  const upcomingEvents = [
    { title: "Quarterly Review", date: "Mar 05", type: "Meeting", priority: "high" },
    { title: "Team Building Event", date: "Mar 08", type: "Event", priority: "medium" },
    { title: "Payroll Processing", date: "Mar 01", type: "Task", priority: "high" },
    { title: "Training: Leadership", date: "Mar 10", type: "Training", priority: "low" },
  ];

  const departmentData = employees.reduce((acc, e) => {
    acc[e.department] = (acc[e.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const departments = Object.entries(departmentData).map(([name, count]) => ({
    name, count, pct: Math.round((count / employees.length) * 100),
  }));

  const quickActions = [
    { label: "Add Employee", icon: Users, color: "bg-primary/10 text-primary", nav: "Employees" as NavItem },
    { label: "Approve Leaves", icon: Calendar, color: "bg-chart-green/10 text-chart-green", nav: "Requests" as NavItem },
    { label: "Run Payroll", icon: Briefcase, color: "bg-chart-orange/10 text-chart-orange", nav: "Payroll" as NavItem },
    { label: "View Reports", icon: BarChart3, color: "bg-chart-blue/10 text-chart-blue", nav: "Reports" as NavItem },
  ];

  const alerts = [
    { text: "3 leave requests pending approval", type: "warning", icon: AlertCircle },
    { text: "Payroll due in 2 days", type: "info", icon: Clock },
    { text: "5 employees completed onboarding", type: "success", icon: CheckCircle2 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-2 pb-20 lg:pb-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Good Morning, Admin</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Here's what's happening with your team today.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-chart-green animate-pulse" />
            All systems operational
          </div>
        </div>

        {/* Alerts */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {alerts.map(({ text, type, icon: Icon }, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className={`apple-glass-subtle flex items-center gap-2.5 px-4 py-2.5 rounded-xl min-w-fit ${
                type === "warning" ? "text-chart-orange" : type === "success" ? "text-chart-green" : "text-chart-blue"
              }`}>
              <Icon size={14} />
              <span className="text-foreground text-xs font-medium">{text}</span>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions - now navigable */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quickActions.map(({ label, icon: Icon, color, nav }, i) => (
            <motion.button key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate?.(nav)}
              className="flex items-center gap-3 p-3.5 apple-glass-hover cursor-pointer glass-shine">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}><Icon size={17} /></div>
              <span className="text-foreground text-sm font-medium">{label}</span>
            </motion.button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map(({ label, value, change, trend, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="apple-glass-hover p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`} style={{ background: 'hsl(228 12% 20% / 0.4)' }}><Icon size={16} /></div>
                <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${trend === "up" ? "text-chart-green" : "text-chart-orange"}`}>
                  {trend === "up" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{change}
                </div>
              </div>
              <span className="text-xl font-bold text-foreground">{value}</span>
              <p className="text-muted-foreground text-[10px] mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="apple-glass p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <span className="section-title">Recent Activity</span>
              <span className="text-muted-foreground text-[10px]">{recentActivity.length} events</span>
            </div>
            <div className="space-y-2.5">
              {recentActivity.map(({ name, action, time, type }, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/20 transition-colors group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    type === "success" ? "bg-chart-green/10 text-chart-green" : type === "warning" ? "bg-chart-orange/10 text-chart-orange" : "bg-secondary/40 text-muted-foreground"
                  }`}>{name.split(" ").map(n => n[0]).join("")}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground"><span className="font-semibold">{name}</span> <span className="text-muted-foreground">{action}</span></p>
                  </div>
                  <span className="text-muted-foreground text-[10px] whitespace-nowrap">{time}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="apple-glass p-5">
            <span className="section-title">Upcoming Events</span>
            <div className="space-y-2.5 mt-4">
              {upcomingEvents.map(({ title, date, type, priority }, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/20 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-secondary/30 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-muted-foreground font-medium">{date.split(" ")[0]}</span>
                    <span className="text-sm font-bold text-foreground leading-none">{date.split(" ")[1]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground font-medium truncate">{title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{type}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${priority === "high" ? "bg-chart-red" : priority === "medium" ? "bg-chart-orange" : "bg-chart-green"}`} />
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Department breakdown */}
        <div className="apple-glass p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="section-title">Department Breakdown</span>
            <span className="text-muted-foreground text-xs">{employees.length} total employees</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {departments.map(({ name, count, pct }, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="text-center p-3.5 rounded-xl bg-secondary/15 hover:bg-secondary/30 transition-colors">
                <div className="text-xl font-bold text-foreground">{count}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{name}</div>
                <div className="metric-bar mt-2">
                  <motion.div className="metric-bar-fill bg-primary" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top Performers + Workforce Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="apple-glass p-5">
            <span className="section-title flex items-center gap-1.5 mb-4"><Award size={12} /> Top Performers</span>
            <div className="space-y-2">
              {[...employees].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5).map((emp, i) => (
                <motion.div key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/20 transition-colors">
                  <span className="text-muted-foreground text-xs font-bold w-4">#{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-secondary/30 flex items-center justify-center text-xs font-bold text-muted-foreground">{emp.firstName[0]}{emp.lastName[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{emp.firstName} {emp.lastName}</p>
                    <p className="text-[10px] text-muted-foreground">{emp.department}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-14 metric-bar"><motion.div className="metric-bar-fill bg-primary" initial={{ width: 0 }} animate={{ width: `${emp.performanceScore}%` }} transition={{ duration: 0.6, delay: i * 0.1 }} /></div>
                    <span className="text-sm font-bold text-foreground w-8 text-right">{emp.performanceScore}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="apple-glass p-5">
            <span className="section-title flex items-center gap-1.5 mb-4"><Zap size={12} /> Workforce Insights</span>
            <div className="space-y-4">
              {[
                { label: "Employee Retention", value: "94%", bar: 94, color: "bg-chart-green" },
                { label: "Average Engagement", value: "87%", bar: 87, color: "bg-primary" },
                { label: "Training Completion", value: "72%", bar: 72, color: "bg-chart-blue" },
                { label: "Goal Achievement", value: "68%", bar: 68, color: "bg-chart-orange" },
                { label: "Satisfaction Score", value: "91%", bar: 91, color: "bg-chart-lime" },
              ].map(({ label, value, bar, color }, i) => (
                <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-foreground">{label}</span>
                    <span className="text-sm font-bold text-foreground">{value}</span>
                  </div>
                  <div className="metric-bar h-2">
                    <motion.div className={`metric-bar-fill ${color}`} initial={{ width: 0 }} animate={{ width: `${bar}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
