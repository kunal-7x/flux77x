import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Plus, Briefcase, Users, Calendar, Star, MoreHorizontal, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ModalPortal from "@/components/ui/modal-portal";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { useAiActionFocus } from "@/hooks/useAiActionFocus";

const tabs = ["Jobs", "Candidates", "Interviews"] as const;

const statusColors: Record<string, string> = {
  Open: "text-chart-green bg-chart-green/10",
  Draft: "text-muted-foreground bg-secondary/40",
  Closed: "text-chart-red bg-chart-red/10",
  Applied: "text-chart-blue bg-chart-blue/10",
  Screening: "text-primary bg-primary/10",
  Interview: "text-chart-orange bg-chart-orange/10",
  Offered: "text-chart-lime bg-chart-lime/10",
  Hired: "text-chart-green bg-chart-green/10",
  Rejected: "text-chart-red bg-chart-red/10",
  Pending: "text-primary bg-primary/10",
  Completed: "text-chart-green bg-chart-green/10",
};

const RecruitmentPage = () => {
  const [activeTab, setActiveTab] = useState<string>("Jobs");
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [newJobOpen, setNewJobOpen] = useState(false);
  const [newCandidateOpen, setNewCandidateOpen] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", department: "", location: "", employment_type: "Full-time", description: "", status: "Draft" });
  const [newCandidate, setNewCandidate] = useState({ name: "", email: "", phone: "", job_id: "", status: "Applied", stage: "Screening", notes: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { canCreateEmployee } = usePermissions();

  const fetchAll = useCallback(async () => {
    const [{ data: j }, { data: c }, { data: iv }] = await Promise.all([
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("candidates").select("*").order("created_at", { ascending: false }),
      supabase.from("interviews").select("*").order("scheduled_at", { ascending: false }),
    ]);
    if (j) setJobs(j);
    if (c) setCandidates(c);
    if (iv) setInterviews(iv);
  }, []);

  const handleAiAction = useCallback((payload: any) => {
    if (payload.table === "candidates") setActiveTab("Candidates");
    else if (payload.table === "interviews") setActiveTab("Interviews");
    else setActiveTab("Jobs");
    fetchAll();
  }, [fetchAll]);
  const aiFocus = useAiActionFocus(["jobs", "candidates", "interviews"], handleAiAction);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createJob = async () => {
    if (!newJob.title.trim()) return;
    setSaving(true);
    const { data, error } = await supabase.from("jobs").insert(newJob).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { setJobs(p => [data, ...p]); setNewJobOpen(false); setNewJob({ title: "", department: "", location: "", employment_type: "Full-time", description: "", status: "Draft" }); toast({ title: "Job created!" }); }
    setSaving(false);
  };

  const createCandidate = async () => {
    if (!newCandidate.name.trim()) return;
    setSaving(true);
    const payload: any = { ...newCandidate };
    if (!payload.job_id) delete payload.job_id;
    const { data, error } = await supabase.from("candidates").insert(payload).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { setCandidates(p => [data, ...p]); setNewCandidateOpen(false); setNewCandidate({ name: "", email: "", phone: "", job_id: "", status: "Applied", stage: "Screening", notes: "" }); toast({ title: "Candidate added!" }); }
    setSaving(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 pb-20 lg:pb-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Recruitment</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage job openings, candidates, and interviews.</p>
          </div>
          {canCreateEmployee && (
            <button onClick={() => activeTab === "Jobs" ? setNewJobOpen(true) : setNewCandidateOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]">
              <Plus size={14} /> {activeTab === "Jobs" ? "New Job" : "Add Candidate"}
            </button>
          )}
        </div>

        <div className="flex gap-1 bg-card/60 p-1 rounded-full w-fit backdrop-blur-sm border border-border/30">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`nav-pill relative whitespace-nowrap ${activeTab === tab ? "" : "text-muted-foreground hover:text-foreground"}`}>
              {activeTab === tab && <motion.div layoutId="recruitTab" className="absolute inset-0 rounded-full" style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.25)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className={`relative z-10 ${activeTab === tab ? "text-primary font-semibold" : ""}`}>{tab}</span>
            </button>
          ))}
        </div>

        {activeTab === "Jobs" && (
          <div className="space-y-3">
            {jobs.length === 0 && <div className="glass-card p-12 text-center text-muted-foreground">No job openings yet. Create your first job posting.</div>}
            {jobs.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`glass-card-hover p-5 ${aiFocus.focusClass(job.id)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Briefcase size={18} /></div>
                    <div>
                      <h3 className="text-foreground font-semibold text-sm">{job.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        {job.department && <span>{job.department}</span>}
                        {job.location && <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>}
                        <span>{job.employment_type}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[job.status] || "text-muted-foreground bg-secondary"}`}>{job.status}</span>
                </div>
                {job.description && <p className="text-muted-foreground text-xs mt-3">{job.description}</p>}
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "Candidates" && (
          <div className="space-y-3">
            {candidates.length === 0 && <div className="glass-card p-12 text-center text-muted-foreground">No candidates yet.</div>}
            {candidates.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`glass-card-hover p-5 flex items-center gap-4 ${aiFocus.focusClass(c.id)}`}>
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {c.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-foreground font-semibold text-sm">{c.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[c.stage] || "text-muted-foreground bg-secondary"}`}>{c.stage}</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5">{c.email} {c.phone && `· ${c.phone}`}</p>
                </div>
                {c.rating > 0 && <div className="flex items-center gap-1 text-primary"><Star size={12} /><span className="text-sm font-bold">{c.rating}</span></div>}
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "Interviews" && (
          <div className="space-y-3">
            {interviews.length === 0 && <div className="glass-card p-12 text-center text-muted-foreground">No interviews scheduled.</div>}
            {interviews.map((iv, i) => (
              <motion.div key={iv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`glass-card-hover p-5 flex items-center gap-4 ${aiFocus.focusClass(iv.id)}`}>
                <div className="w-10 h-10 rounded-xl bg-chart-blue/10 flex items-center justify-center text-chart-blue"><Calendar size={18} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-semibold text-sm">{iv.interviewer || "TBD"}</p>
                  <p className="text-muted-foreground text-xs">{iv.interview_type} · {iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleDateString() : "Not scheduled"}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[iv.decision] || "text-muted-foreground bg-secondary"}`}>{iv.decision}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <ModalPortal open={newJobOpen} onClose={() => setNewJobOpen(false)} title="New Job Opening">
        <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Job Title *</label><input value={newJob.title} onChange={e => setNewJob(j => ({ ...j, title: e.target.value }))} className="glass-input" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Department</label><input value={newJob.department} onChange={e => setNewJob(j => ({ ...j, department: e.target.value }))} className="glass-input" /></div>
          <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Location</label><input value={newJob.location} onChange={e => setNewJob(j => ({ ...j, location: e.target.value }))} className="glass-input" /></div>
        </div>
        <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Description</label><textarea value={newJob.description} onChange={e => setNewJob(j => ({ ...j, description: e.target.value }))} className="glass-input resize-none h-20" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Type</label>
            <select value={newJob.employment_type} onChange={e => setNewJob(j => ({ ...j, employment_type: e.target.value }))} className="glass-input"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></div>
          <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Status</label>
            <select value={newJob.status} onChange={e => setNewJob(j => ({ ...j, status: e.target.value }))} className="glass-input"><option>Draft</option><option>Open</option><option>Closed</option></select></div>
        </div>
        <button onClick={createJob} disabled={saving} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">{saving ? "Creating..." : "Create Job"}</button>
      </ModalPortal>

      <ModalPortal open={newCandidateOpen} onClose={() => setNewCandidateOpen(false)} title="Add Candidate">
        <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Name *</label><input value={newCandidate.name} onChange={e => setNewCandidate(c => ({ ...c, name: e.target.value }))} className="glass-input" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Email</label><input value={newCandidate.email} onChange={e => setNewCandidate(c => ({ ...c, email: e.target.value }))} className="glass-input" /></div>
          <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Phone</label><input value={newCandidate.phone} onChange={e => setNewCandidate(c => ({ ...c, phone: e.target.value }))} className="glass-input" /></div>
        </div>
        <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Notes</label><textarea value={newCandidate.notes} onChange={e => setNewCandidate(c => ({ ...c, notes: e.target.value }))} className="glass-input resize-none h-16" /></div>
        <button onClick={createCandidate} disabled={saving} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">{saving ? "Adding..." : "Add Candidate"}</button>
      </ModalPortal>
    </div>
  );
};

export default RecruitmentPage;
