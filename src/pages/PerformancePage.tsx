import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Plus, Target, Award, TrendingUp, Star, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ModalPortal from "@/components/ui/modal-portal";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { useAiActionFocus } from "@/hooks/useAiActionFocus";

const tabs = ["Overview", "Goals & OKRs", "Reviews", "Competencies"] as const;

const statusColors: Record<string, string> = {
  "On Track": "text-chart-green bg-chart-green/10",
  "At Risk": "text-chart-orange bg-chart-orange/10",
  "Behind": "text-chart-red bg-chart-red/10",
  "Completed": "text-chart-blue bg-chart-blue/10",
};

interface Goal {
  id: string;
  title: string;
  progress: number;
  status: string;
  quarter: string;
  keyResults: string[];
}

const PerformancePage = () => {
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", quarter: "Q1 2026", keyResults: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { canCreateGoal } = usePermissions();

  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", title: "Increase design system coverage", progress: 85, status: "On Track", quarter: "Q1 2026", keyResults: ["40+ components documented", "Design tokens in 3 products", "Accessibility audit passed"] },
    { id: "2", title: "Reduce design iteration cycles", progress: 62, status: "At Risk", quarter: "Q1 2026", keyResults: ["Cut review time by 30%", "Implement design sprints", "Stakeholder feedback < 24h"] },
    { id: "3", title: "Launch mobile design system", progress: 40, status: "Behind", quarter: "Q1 2026", keyResults: ["Component library for React Native", "Design guidelines published", "3 apps migrated"] },
    { id: "4", title: "Improve team velocity by 20%", progress: 92, status: "Completed", quarter: "Q4 2025", keyResults: ["Automate handoff process", "Reduce meeting overhead", "Sprint capacity +20%"] },
  ]);

  // Fetch goals from DB
  const fetchGoals = useCallback(async () => {
    const { data } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) {
      setGoals(data.map(g => ({
        id: g.id, title: g.title, progress: g.progress || 0,
        status: g.status || "On Track", quarter: g.quarter || "Q1 2026",
        keyResults: g.key_results || [],
      })));
    }
  }, []);
  const handleAiAction = useCallback(() => {
    setActiveTab("Goals & OKRs");
    fetchGoals();
  }, [fetchGoals]);
  const aiFocus = useAiActionFocus("goals", handleAiAction);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);
  useEffect(() => { if (aiFocus.id) setActiveTab("Goals & OKRs"); }, [aiFocus.id]);

  const reviews = [
    { period: "Q4 2025", rating: 4.5, reviewer: "Ava Collins", status: "Completed", feedback: "Excellent communication and design quality." },
    { period: "Q3 2025", rating: 4.2, reviewer: "Sarah Kim", status: "Completed", feedback: "Strong technical skills, room for growth in leadership." },
    { period: "Q2 2025", rating: 4.0, reviewer: "Ava Collins", status: "Completed", feedback: "Great progress on the mobile redesign project." },
  ];

  const competencies = [
    { name: "Visual Design", self: 90, manager: 85, peer: 88 },
    { name: "User Research", self: 75, manager: 80, peer: 72 },
    { name: "Prototyping", self: 88, manager: 82, peer: 85 },
    { name: "Communication", self: 85, manager: 90, peer: 87 },
    { name: "Leadership", self: 70, manager: 65, peer: 68 },
    { name: "Problem Solving", self: 82, manager: 85, peer: 80 },
  ];

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim()) { toast({ title: "Error", description: "Goal title is required", variant: "destructive" }); return; }
    setSaving(true);
    const keyResults = newGoal.keyResults.split(",").map(s => s.trim()).filter(Boolean);
    
    const { data, error } = await supabase.from("goals").insert({
      title: newGoal.title, quarter: newGoal.quarter,
      key_results: keyResults, progress: 0, status: "On Track",
    }).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setGoals(prev => [{ id: data.id, title: data.title, progress: 0, status: "On Track", quarter: data.quarter || "Q1 2026", keyResults }, ...prev]);
      setNewGoalOpen(false);
      setNewGoal({ title: "", quarter: "Q1 2026", keyResults: "" });
      toast({ title: "Goal Created", description: "New goal has been added." });
    }
    setSaving(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 pb-20 lg:pb-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Performance</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Goals, OKRs, reviews, and competency tracking.</p>
          </div>
          {canCreateGoal && (
            <button onClick={() => setNewGoalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]">
              <Plus size={14} /> New Goal
            </button>
          )}
        </div>

        <div className="flex gap-1 bg-card/60 p-1 rounded-full w-fit backdrop-blur-sm border border-border/30 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`nav-pill relative whitespace-nowrap ${activeTab === tab ? "" : "text-muted-foreground hover:text-foreground"}`}>
              {activeTab === tab && <motion.div layoutId="perfTab" className="absolute inset-0 rounded-full" style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.25)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className={`relative z-10 ${activeTab === tab ? "text-primary font-semibold" : ""}`}>{tab}</span>
            </button>
          ))}
        </div>

        {activeTab === "Overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Overall Score", value: "4.3/5", icon: Star, color: "text-primary" },
                { label: "Goals Completed", value: `${goals.filter(g => g.status === "Completed").length}/${goals.length}`, icon: Target, color: "text-chart-green" },
                { label: "Reviews Done", value: "3/4", icon: Award, color: "text-chart-blue" },
                { label: "Growth Rate", value: "+18%", icon: TrendingUp, color: "text-chart-lime" },
              ].map(({ label, value, icon: Icon, color }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card-hover p-4">
                  <div className={`w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center ${color} mb-3`}><Icon size={16} /></div>
                  <span className="text-xl font-bold text-foreground">{value}</span>
                  <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
                </motion.div>
              ))}
            </div>
            <div className="glass-card p-5">
              <span className="section-title">Performance Trend (Last 6 Months)</span>
              <div className="flex items-end gap-2 mt-5 h-32">
                {[3.8, 4.0, 3.9, 4.2, 4.3, 4.5].map((score, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary" initial={{ height: 0 }} animate={{ height: `${(score / 5) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.08 }} />
                    <span className="text-muted-foreground text-[10px]">{["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Goals & OKRs" && (
          <div className="space-y-3">
            {goals.map((goal, i) => (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`glass-card-hover p-5 ${aiFocus.focusClass(goal.id)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-foreground font-semibold text-sm">{goal.title}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[goal.status] || "text-muted-foreground bg-secondary"}`}>{goal.status}</span>
                    </div>
                    <p className="text-muted-foreground text-xs">{goal.quarter}</p>
                  </div>
                  <span className="text-foreground font-bold text-lg">{goal.progress}%</span>
                </div>
                <div className="metric-bar mt-3 h-2">
                  <motion.div className={`metric-bar-fill ${goal.progress >= 80 ? "bg-chart-green" : goal.progress >= 50 ? "bg-primary" : "bg-chart-orange"}`} initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                </div>
                <div className="mt-3 space-y-1">
                  {goal.keyResults.map((kr, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-1 h-1 rounded-full bg-muted-foreground" />{kr}</div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "Reviews" && (
          <div className="space-y-3">
            {reviews.map((review, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-hover p-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="text-foreground font-semibold text-sm">{review.period} Review</h3>
                    <p className="text-muted-foreground text-xs">Reviewed by {review.reviewer}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} className={s <= Math.floor(review.rating) ? "text-primary fill-primary" : "text-muted-foreground/30"} />
                    ))}
                    <span className="text-foreground font-bold text-sm ml-1">{review.rating}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm italic">"{review.feedback}"</p>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "Competencies" && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="section-title">360° Competency Assessment</span>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-primary" />Self</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-chart-green" />Manager</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-chart-blue" />Peers</span>
              </div>
            </div>
            <div className="space-y-4">
              {competencies.map(({ name, self, manager, peer }, i) => (
                <motion.div key={name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-foreground text-sm font-medium">{name}</span>
                    <span className="text-muted-foreground text-xs">Avg: {Math.round((self + manager + peer) / 3)}%</span>
                  </div>
                  <div className="flex gap-1">
                    {[{ val: self, color: "bg-primary" }, { val: manager, color: "bg-chart-green" }, { val: peer, color: "bg-chart-blue" }].map(({ val, color }, j) => (
                      <div key={j} className="flex-1 metric-bar">
                        <motion.div className={`metric-bar-fill ${color}`} initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.6, delay: i * 0.05 + j * 0.1 }} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <ModalPortal open={newGoalOpen} onClose={() => setNewGoalOpen(false)} title="New Goal">
        <div>
          <label className="text-muted-foreground text-xs font-medium mb-1 block">Goal Title *</label>
          <input value={newGoal.title} onChange={e => setNewGoal(g => ({ ...g, title: e.target.value }))} className="glass-input" placeholder="Increase team velocity by 25%" />
        </div>
        <div>
          <label className="text-muted-foreground text-xs font-medium mb-1 block">Quarter</label>
          <select value={newGoal.quarter} onChange={e => setNewGoal(g => ({ ...g, quarter: e.target.value }))} className="glass-input">
            <option>Q1 2026</option><option>Q2 2026</option><option>Q3 2026</option><option>Q4 2026</option>
          </select>
        </div>
        <div>
          <label className="text-muted-foreground text-xs font-medium mb-1 block">Key Results (comma-separated)</label>
          <textarea value={newGoal.keyResults} onChange={e => setNewGoal(g => ({ ...g, keyResults: e.target.value }))} className="glass-input resize-none h-20" placeholder="Result 1, Result 2, Result 3" />
        </div>
        <button onClick={handleCreateGoal} disabled={saving} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
          {saving ? "Creating..." : "Create Goal"}
        </button>
      </ModalPortal>
    </div>
  );
};

export default PerformancePage;
