import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Plus, MoreHorizontal, Users, Calendar, CheckCircle2, Clock, AlertCircle, FolderOpen, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ModalPortal from "@/components/ui/modal-portal";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { useAiActionFocus } from "@/hooks/useAiActionFocus";

type ProjectStatus = "In Progress" | "Completed" | "Planning" | "On Hold";
type ProjectFilter = "All" | ProjectStatus;

interface Project {
  id: string; name: string; description: string; status: ProjectStatus;
  progress: number; team: string[]; deadline: string; tasks: { total: number; completed: number };
}

const initialProjects: Project[] = [
  { id: "1", name: "Website Redesign", description: "Complete overhaul of corporate website", status: "In Progress", progress: 72, team: ["HC", "AC", "EB"], deadline: "Mar 15", tasks: { total: 24, completed: 17 } },
  { id: "2", name: "Mobile App v2.0", description: "New features and performance improvements", status: "In Progress", progress: 45, team: ["LP", "EH", "AC"], deadline: "Apr 01", tasks: { total: 32, completed: 14 } },
  { id: "3", name: "HR Analytics Dashboard", description: "Internal dashboard for HR metrics", status: "Planning", progress: 15, team: ["OR", "JS"], deadline: "May 10", tasks: { total: 18, completed: 3 } },
  { id: "4", name: "Employee Onboarding Flow", description: "Streamlined onboarding automation", status: "Completed", progress: 100, team: ["HC", "EH"], deadline: "Feb 20", tasks: { total: 12, completed: 12 } },
  { id: "5", name: "Data Migration", description: "Migrate legacy data to cloud", status: "On Hold", progress: 30, team: ["JS", "OR", "EB"], deadline: "TBD", tasks: { total: 8, completed: 2 } },
];

const statusConfig: Record<ProjectStatus, { color: string; bg: string; icon: typeof Clock }> = {
  "In Progress": { color: "text-chart-blue", bg: "bg-chart-blue/10", icon: Clock },
  "Completed": { color: "text-chart-green", bg: "bg-chart-green/10", icon: CheckCircle2 },
  "Planning": { color: "text-primary", bg: "bg-primary/10", icon: AlertCircle },
  "On Hold": { color: "text-chart-orange", bg: "bg-chart-orange/10", icon: AlertCircle },
};

const filtersArr: ProjectFilter[] = ["All", "In Progress", "Completed", "Planning", "On Hold"];

const ProjectsPage = () => {
  const [filter, setFilter] = useState<ProjectFilter>("All");
  const [projects, setProjects] = useState(initialProjects);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "", deadline: "", status: "Planning" as ProjectStatus });
  const { toast } = useToast();
  const { canCreateProject, canDeleteProject } = usePermissions();

  const fetchProjects = useCallback(async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) {
      setProjects(data.map(p => ({ id: p.id, name: p.name, description: p.description || "", status: (p.status as ProjectStatus) || "Planning", progress: p.progress || 0, team: p.team || [], deadline: p.deadline || "TBD", tasks: { total: p.tasks_total || 0, completed: p.tasks_completed || 0 } })));
    }
  }, []);
  const aiFocus = useAiActionFocus(["projects", "project_tasks"], fetchProjects);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Realtime
  useEffect(() => {
    const channel = supabase.channel('projects-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => { fetchProjects(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchProjects]);

  const filtered = filter === "All" ? projects : projects.filter((p) => p.status === filter);

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) { toast({ title: "Error", description: "Project name is required", variant: "destructive" }); return; }
    setSaving(true);
    const { data, error } = await supabase.from("projects").insert({ name: newProject.name, description: newProject.description, deadline: newProject.deadline || null, status: newProject.status, progress: 0, team: [], tasks_total: 0, tasks_completed: 0 }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { const project: Project = { id: data.id, name: data.name, description: data.description || "", status: data.status as ProjectStatus, progress: 0, team: [], deadline: data.deadline || "TBD", tasks: { total: 0, completed: 0 } }; setProjects(prev => [project, ...prev]); setNewProjectOpen(false); setNewProject({ name: "", description: "", deadline: "", status: "Planning" }); toast({ title: "Project Created" }); }
    setSaving(false);
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { setProjects(prev => prev.filter(p => p.id !== id)); setMenuOpen(null); toast({ title: "Deleted" }); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 pb-20 lg:pb-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Projects</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{filtered.length} projects</p>
          </div>
          {canCreateProject && (
            <button onClick={() => setNewProjectOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98]">
              <Plus size={14} /> New Project
            </button>
          )}
        </div>

        <div className="flex gap-1 bg-card/60 p-1 rounded-full w-fit backdrop-blur-sm border border-border/30 flex-wrap overflow-x-auto scrollbar-none">
          {filtersArr.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`nav-pill relative whitespace-nowrap ${filter === f ? "" : "text-muted-foreground hover:text-foreground"}`}>
              {filter === f && <motion.div layoutId="projectFilter" className="absolute inset-0 rounded-full" style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.25)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className={`relative z-10 ${filter === f ? "text-primary font-semibold" : ""}`}>{f}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((project, i) => {
            const config = statusConfig[project.status];
            return (
              <motion.div key={project.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`glass-card-hover p-5 flex flex-col gap-4 cursor-pointer group ${aiFocus.focusClass(project.id)}`} onClick={() => setSelectedProject(project)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center ${config.color} flex-shrink-0`}><FolderOpen size={18} /></div>
                    <div>
                      <h3 className="text-foreground font-semibold text-sm group-hover:text-primary transition-colors">{project.name}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>{project.status}</span>
                    </div>
                  </div>
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <button className="icon-button w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}><MoreHorizontal size={14} /></button>
                    <AnimatePresence>
                      {menuOpen === project.id && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-10 w-40 rounded-xl z-[60] p-1"
                          style={{ background: "hsl(228 14% 18% / 0.95)", backdropFilter: "blur(16px)", border: "1px solid hsl(0 0% 100% / 0.08)", boxShadow: "0 8px 32px -4px hsl(228 16% 4% / 0.6)" }}>
                          <button onClick={() => { setSelectedProject(project); setMenuOpen(null); }} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/40 hover:text-foreground"><Eye size={12} />View</button>
                          {canDeleteProject && <button onClick={() => deleteProject(project.id)} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-chart-red hover:bg-chart-red/10"><Trash2 size={12} />Delete</button>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">{project.description}</p>
                <div>
                  <div className="flex items-center justify-between mb-1.5"><span className="text-muted-foreground text-xs">Progress</span><span className="text-foreground text-sm font-bold">{project.progress}%</span></div>
                  <div className="metric-bar h-2"><motion.div className={`metric-bar-fill ${project.progress === 100 ? "bg-chart-green" : "bg-primary"}`} initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 0.8, delay: i * 0.08 }} /></div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/30 flex-wrap gap-2">
                  <div className="flex -space-x-2">
                    {project.team.map((member) => (<div key={member} className="w-7 h-7 rounded-lg bg-secondary border-2 border-card flex items-center justify-center text-[10px] font-bold text-muted-foreground">{member}</div>))}
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-xs">
                    <span className="flex items-center gap-1"><CheckCircle2 size={12} />{project.tasks.completed}/{project.tasks.total}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} />{project.deadline}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <ModalPortal open={newProjectOpen} onClose={() => setNewProjectOpen(false)} title="New Project">
        <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Project Name *</label><input value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} className="glass-input" /></div>
        <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Description</label><textarea value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} className="glass-input resize-none h-20" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Deadline</label><input type="date" value={newProject.deadline} onChange={e => setNewProject(p => ({ ...p, deadline: e.target.value }))} className="glass-input" /></div>
          <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Status</label><select value={newProject.status} onChange={e => setNewProject(p => ({ ...p, status: e.target.value as ProjectStatus }))} className="glass-input"><option>Planning</option><option>In Progress</option><option>On Hold</option></select></div>
        </div>
        <button onClick={handleCreateProject} disabled={saving} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">{saving ? "Creating..." : "Create Project"}</button>
      </ModalPortal>

      <ModalPortal open={!!selectedProject} onClose={() => setSelectedProject(null)} title={selectedProject?.name || ""} maxWidth="max-w-lg">
        {selectedProject && (
          <>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[selectedProject.status].bg} ${statusConfig[selectedProject.status].color}`}>{selectedProject.status}</span>
            <p className="text-muted-foreground text-sm">{selectedProject.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-secondary/30"><span className="text-muted-foreground text-xs">Progress</span><p className="text-foreground font-bold text-lg">{selectedProject.progress}%</p></div>
              <div className="p-3 rounded-xl bg-secondary/30"><span className="text-muted-foreground text-xs">Deadline</span><p className="text-foreground font-bold text-lg">{selectedProject.deadline}</p></div>
              <div className="p-3 rounded-xl bg-secondary/30"><span className="text-muted-foreground text-xs">Tasks</span><p className="text-foreground font-bold text-lg">{selectedProject.tasks.completed}/{selectedProject.tasks.total}</p></div>
              <div className="p-3 rounded-xl bg-secondary/30"><span className="text-muted-foreground text-xs">Team</span><p className="text-foreground font-bold text-lg">{selectedProject.team.length}</p></div>
            </div>
          </>
        )}
      </ModalPortal>
    </div>
  );
};

export default ProjectsPage;
