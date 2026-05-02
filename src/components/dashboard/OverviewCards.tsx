import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, ArrowUp, Target, TrendingUp, Users, Award, BookOpen } from "lucide-react";
import { Employee } from "@/data/mockData";

interface OverviewCardsProps {
  employee: Employee;
}

const tabs = ["Overview", "Engagement", "Performance"] as const;

const CircularProgress = ({ value, size = 80, strokeWidth = 6, color }: { value: number; size?: number; strokeWidth?: number; color: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
};

const OverviewTab = ({ employee }: { employee: Employee }) => (
  <motion.div
    key="overview"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3 }}
    className="grid grid-cols-2 gap-4"
  >
    {/* Performance Card */}
    <div className="glass-card-hover p-6 flex flex-col gap-3">
      <span className="section-title">Performance</span>
      <div className="flex items-center justify-between">
        <div>
          <motion.span
            key={employee.performanceScore}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="stat-value text-foreground inline-block"
          >
            {employee.performanceScore}%
          </motion.span>
          <p className="text-muted-foreground text-xs mt-1">Efficiency Score</p>
        </div>
        <div className="text-primary">
          <Zap size={44} className="drop-shadow-[0_0_12px_hsl(43_100%_56%/0.4)]" fill="currentColor" />
        </div>
      </div>
      <div className="mt-auto pt-3 border-t border-border/40">
        <span className="text-foreground font-bold text-lg">{employee.avgWorkTime}</span>
        <span className="text-muted-foreground text-xs ml-1.5">hours avg. work time</span>
      </div>
    </div>

    {/* Vacation Balance Card */}
    <div className="card-dashed p-6 flex flex-col gap-3">
      <span className="section-title">Vacation Balance</span>
      <div className="flex items-baseline gap-2">
        <motion.span
          key={employee.vacationDays}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="stat-value text-foreground"
        >
          {employee.vacationDays}
        </motion.span>
        <span className="text-muted-foreground text-sm font-medium">Days Remaining</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {Array.from({ length: Math.min(employee.vacationDays, 20) }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            className="w-3.5 h-3.5 rounded-full bg-primary/70"
          />
        ))}
      </div>
    </div>

    {/* Salary Card */}
    <div className="glass-card-hover p-6 flex flex-col gap-3">
      <span className="section-title">Salary</span>
      <div>
        <motion.span
          key={employee.salary}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gradient-gold stat-value"
        >
          ${employee.salary.toLocaleString()}
        </motion.span>
        <span className="text-gradient-gold text-xl font-bold">.00</span>
      </div>
      <span className="text-muted-foreground text-sm">+ ${employee.bonus.toLocaleString()}.00 bonus</span>
      <div className="flex gap-3 mt-auto pt-3 border-t border-border/40">
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm transition-all duration-200 group">
          <ArrowUp size={14} className="group-hover:translate-y-[-2px] transition-transform" /> Raise
        </button>
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm transition-all duration-200">
          <Clock size={14} /> History
        </button>
      </div>
    </div>

    {/* Work Summary Card */}
    <div className="glass-card-hover p-6 flex flex-col gap-3">
      <span className="section-title">Work Summary</span>
      <div className="space-y-3 flex-1">
        {[
          { label: "External", value: employee.externalWork, color: "bg-chart-orange" },
          { label: "Internal", value: employee.internalWork, color: "bg-primary" },
          { label: "Learning", value: employee.learningProgress, color: "bg-chart-lime" },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground text-xs">{label}</span>
              <span className="text-foreground text-sm font-bold">{value}%</span>
            </div>
            <div className="metric-bar">
              <motion.div
                className={`metric-bar-fill ${color}`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-border/40">
        <span className="text-foreground font-bold">{employee.tasksInProgress} Tasks</span>
        <span className="text-muted-foreground text-xs ml-1.5">in Progress</span>
      </div>
    </div>
  </motion.div>
);

const EngagementTab = ({ employee }: { employee: Employee }) => (
  <motion.div
    key="engagement"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3 }}
    className="grid grid-cols-2 gap-4"
  >
    <div className="glass-card-hover p-6 flex flex-col items-center gap-4 col-span-1">
      <span className="section-title self-start">Team Engagement</span>
      <CircularProgress value={78} size={100} color="hsl(var(--primary))" />
      <div className="text-center">
        <span className="text-2xl font-bold text-foreground">78%</span>
        <p className="text-muted-foreground text-xs mt-1">Engagement Score</p>
      </div>
    </div>
    <div className="glass-card-hover p-6 flex flex-col gap-4">
      <span className="section-title">Activity Metrics</span>
      {[
        { icon: Users, label: "Team Meetings", value: "12 this month", pct: 80 },
        { icon: Award, label: "Recognitions", value: "5 received", pct: 65 },
        { icon: BookOpen, label: "Training Hours", value: "24 hrs", pct: 72 },
      ].map(({ icon: Icon, label, value, pct }) => (
        <div key={label} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
            <Icon size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-sm font-medium">{label}</span>
              <span className="text-muted-foreground text-xs">{value}</span>
            </div>
            <div className="metric-bar mt-1.5">
              <motion.div className="metric-bar-fill bg-chart-blue" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="glass-card-hover p-6 col-span-2">
      <span className="section-title">Collaboration Score</span>
      <div className="flex items-center gap-8 mt-4">
        {[
          { label: "Communication", score: 85, color: "bg-chart-green" },
          { label: "Teamwork", score: 72, color: "bg-primary" },
          { label: "Initiative", score: 90, color: "bg-chart-lime" },
          { label: "Reliability", score: 88, color: "bg-chart-blue" },
        ].map(({ label, score, color }) => (
          <div key={label} className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-muted-foreground text-xs">{label}</span>
              <span className="text-foreground text-sm font-bold">{score}%</span>
            </div>
            <div className="metric-bar">
              <motion.div className={`metric-bar-fill ${color}`} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const PerformanceTab = ({ employee }: { employee: Employee }) => (
  <motion.div
    key="performance"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3 }}
    className="grid grid-cols-3 gap-4"
  >
    {[
      { label: "Goals Completed", value: "8/10", sub: "This Quarter", icon: Target, color: "text-chart-green" },
      { label: "Avg Rating", value: "4.5", sub: "Out of 5.0", icon: Award, color: "text-primary" },
      { label: "Growth Rate", value: "+12%", sub: "vs Last Quarter", icon: TrendingUp, color: "text-chart-lime" },
    ].map(({ label, value, sub, icon: Icon, color }) => (
      <div key={label} className="glass-card-hover p-5 flex flex-col gap-3">
        <Icon size={20} className={color} />
        <div>
          <span className="text-2xl font-bold text-foreground">{value}</span>
          <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
          <p className="text-muted-foreground text-[10px]">{sub}</p>
        </div>
      </div>
    ))}
    <div className="glass-card-hover p-6 col-span-3">
      <span className="section-title">Competency Breakdown</span>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-4">
        {[
          { label: "Technical Skills", score: employee.performanceScore },
          { label: "Communication", score: 85 },
          { label: "Problem Solving", score: 78 },
          { label: "Leadership", score: 62 },
          { label: "Time Management", score: 88 },
          { label: "Creativity", score: 91 },
        ].map(({ label, score }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-muted-foreground text-xs">{label}</span>
              <span className="text-foreground text-sm font-bold">{score}%</span>
            </div>
            <div className="metric-bar">
              <motion.div
                className="metric-bar-fill bg-gradient-to-r from-primary to-chart-lime"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const OverviewCards = ({ employee }: OverviewCardsProps) => {
  const [activeTab, setActiveTab] = useState<string>("Overview");

  return (
    <div className="flex-1 flex flex-col gap-4 min-w-0">
      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-card/60 rounded-full p-1 flex gap-0.5 backdrop-blur-sm border border-border/30">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`nav-pill relative ${
                activeTab === tab ? "" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-foreground rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 ${activeTab === tab ? "text-background" : ""}`}>{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "Overview" && <OverviewTab employee={employee} />}
        {activeTab === "Engagement" && <EngagementTab employee={employee} />}
        {activeTab === "Performance" && <PerformanceTab employee={employee} />}
      </AnimatePresence>
    </div>
  );
};

export default OverviewCards;
