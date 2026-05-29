import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Plus, CheckCircle2, Circle, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ModalPortal from "@/components/ui/modal-portal";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { useAiActionFocus } from "@/hooks/useAiActionFocus";

const OnboardingPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", category: "General", employee_id: "", due_date: "" });
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const { toast } = useToast();
  const { canCreateEmployee } = usePermissions();

  const fetchData = useCallback(async () => {
    const [{ data: t }, { data: e }] = await Promise.all([
      supabase.from("onboarding_tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("employees").select("id, first_name, last_name").limit(50),
    ]);
    if (t) setTasks(t);
    if (e) setEmployees(e);
  }, []);
  const aiFocus = useAiActionFocus("onboarding_tasks", fetchData);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createTask = async () => {
    if (!newTask.title.trim() || !newTask.employee_id) { toast({ title: "Error", description: "Title and employee required", variant: "destructive" }); return; }
    setSaving(true);
    const payload: any = { title: newTask.title, category: newTask.category, employee_id: newTask.employee_id };
    if (newTask.due_date) payload.due_date = newTask.due_date;
    const { data, error } = await supabase.from("onboarding_tasks").insert(payload).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { setTasks(p => [data, ...p]); setNewTaskOpen(false); setNewTask({ title: "", category: "General", employee_id: "", due_date: "" }); toast({ title: "Task created!" }); }
    setSaving(false);
  };

  const toggleTask = async (id: string, completed: boolean) => {
    await supabase.from("onboarding_tasks").update({ completed: !completed }).eq("id", id);
    setTasks(p => p.map(t => t.id === id ? { ...t, completed: !completed } : t));
  };

  const grouped = tasks.reduce<Record<string, any[]>>((acc, t) => {
    const emp = employees.find((e: any) => e.id === t.employee_id);
    const key = emp ? `${emp.first_name} ${emp.last_name}` : t.employee_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-2 pb-20 lg:pb-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Onboarding</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Track onboarding tasks for new hires.</p>
          </div>
          {canCreateEmployee && (
            <button onClick={() => setNewTaskOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98]">
              <Plus size={14} /> New Task
            </button>
          )}
        </div>

        {Object.keys(grouped).length === 0 && (
          <div className="glass-card p-12 text-center">
            <UserPlus size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No onboarding tasks yet.</p>
          </div>
        )}

        {Object.entries(grouped).map(([empName, empTasks]) => {
          const completed = empTasks.filter((t: any) => t.completed).length;
          const total = empTasks.length;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          return (
            <div key={empName} className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-foreground font-semibold text-sm">{empName}</h3>
                  <p className="text-muted-foreground text-xs">{completed}/{total} tasks completed · {pct}%</p>
                </div>
                <div className="w-20 metric-bar h-2"><motion.div className="metric-bar-fill bg-chart-green" initial={{ width: 0 }} animate={{ width: `${pct}%` }} /></div>
              </div>
              <div className="space-y-1">
                {empTasks.map((task: any) => (
                  <button key={task.id} onClick={() => toggleTask(task.id, task.completed)} className={`w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/20 transition-colors text-left ${aiFocus.focusClass(task.id)}`}>
                    {task.completed ? <CheckCircle2 size={16} className="text-chart-green flex-shrink-0" /> : <Circle size={16} className="text-muted-foreground flex-shrink-0" />}
                    <span className={`text-sm flex-1 ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</span>
                    <span className="text-[10px] text-muted-foreground bg-secondary/40 px-2 py-0.5 rounded-full">{task.category}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </motion.div>

      <ModalPortal open={newTaskOpen} onClose={() => setNewTaskOpen(false)} title="New Onboarding Task">
        <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Task Title *</label><input value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))} className="glass-input" /></div>
        <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Employee *</label>
          <select value={newTask.employee_id} onChange={e => setNewTask(t => ({ ...t, employee_id: e.target.value }))} className="glass-input">
            <option value="">Select employee</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Category</label>
            <select value={newTask.category} onChange={e => setNewTask(t => ({ ...t, category: e.target.value }))} className="glass-input">
              <option>General</option><option>Documents</option><option>Training</option><option>Equipment</option><option>Access</option>
            </select></div>
          <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Due Date</label>
            <input type="date" value={newTask.due_date} onChange={e => setNewTask(t => ({ ...t, due_date: e.target.value }))} className="glass-input" /></div>
        </div>
        <button onClick={createTask} disabled={saving} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">{saving ? "Creating..." : "Create Task"}</button>
      </ModalPortal>
    </div>
  );
};

export default OnboardingPage;
