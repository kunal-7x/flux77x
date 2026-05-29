import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Building2, Users, Shield, Bell, Palette, Globe, Calendar, Clock, Save, Plus, Trash2, Check, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { useAiActionFocus } from "@/hooks/useAiActionFocus";

const tabs = ["Company", "Users & Roles", "Notifications", "Policies", "Appearance"] as const;

const presetColors = [
  { name: "Gold", h: 43, s: 100, l: 56 },
  { name: "Blue", h: 210, s: 80, l: 58 },
  { name: "Green", h: 152, s: 60, l: 48 },
  { name: "Purple", h: 270, s: 70, l: 58 },
  { name: "Rose", h: 340, s: 75, l: 55 },
  { name: "Orange", h: 25, s: 95, l: 53 },
  { name: "Cyan", h: 185, s: 70, l: 50 },
  { name: "Lime", h: 82, s: 72, l: 52 },
  { name: "Red", h: 0, s: 72, l: 51 },
  { name: "Teal", h: 170, s: 60, l: 45 },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<string>("Company");
  const [companyName, setCompanyName] = useState("Flux Technologies Inc.");
  const [industry, setIndustry] = useState("Technology");
  const [timezone, setTimezone] = useState("UTC-5 (Eastern)");
  const [fiscalYear, setFiscalYear] = useState("January - December");
  const [workHoursStart, setWorkHoursStart] = useState("09:00");
  const [workHoursEnd, setWorkHoursEnd] = useState("18:00");
  const [gpsTracking, setGpsTracking] = useState(true);
  const [autoPunchOut, setAutoPunchOut] = useState(true);
  const [remoteCheckin, setRemoteCheckin] = useState(true);
  const [overtimeApproval, setOvertimeApproval] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();
  const { primaryHue, primarySaturation, primaryLightness, setPrimaryColor, resetTheme } = useTheme();

  const [roles, setRoles] = useState([
    { name: "Super Admin", users: 2, permissions: "Full Access", color: "text-chart-red" },
    { name: "HR Manager", users: 5, permissions: "HR + Reports + Settings", color: "text-primary" },
    { name: "Department Head", users: 8, permissions: "Department Data + Approvals", color: "text-chart-blue" },
    { name: "Employee", users: 230, permissions: "Self-service + View", color: "text-chart-green" },
  ]);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePerms, setNewRolePerms] = useState("");

  const [notifications, setNotifications] = useState([
    { label: "Leave request submitted", email: true, push: true, sms: false },
    { label: "Leave request approved/rejected", email: true, push: true, sms: true },
    { label: "Attendance anomaly", email: true, push: false, sms: false },
    { label: "Payroll processed", email: true, push: true, sms: false },
    { label: "Performance review due", email: true, push: true, sms: false },
    { label: "New announcement", email: false, push: true, sms: false },
  ]);

  const loadSettings = useCallback(async () => {
    const { data } = await supabase.from("company_settings").select("*").limit(1).single();
    if (data) {
      setCompanyName(data.company_name || "Flux Technologies Inc.");
      setIndustry(data.industry || "Technology");
      setTimezone(data.timezone || "UTC-5 (Eastern)");
      setFiscalYear(data.fiscal_year || "January - December");
      setWorkHoursStart(data.work_hours_start || "09:00");
      setWorkHoursEnd(data.work_hours_end || "18:00");
      setGpsTracking(data.gps_tracking ?? true);
      setAutoPunchOut(data.auto_punch_out ?? true);
      setRemoteCheckin(data.remote_checkin ?? true);
      setOvertimeApproval(data.overtime_approval ?? false);
    }
  }, []);

  const handleAiAction = useCallback(() => {
    setActiveTab("Company");
    loadSettings();
  }, [loadSettings]);
  useAiActionFocus(["company_settings", "departments"], handleAiAction);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase.from("company_settings").select("id").limit(1).single();
      const payload = { company_name: companyName, industry, timezone, fiscal_year: fiscalYear, work_hours_start: workHoursStart, work_hours_end: workHoursEnd, gps_tracking: gpsTracking, auto_punch_out: autoPunchOut, remote_checkin: remoteCheckin, overtime_approval: overtimeApproval };
      if (existing) { await supabase.from("company_settings").update(payload).eq("id", existing.id); }
      setSaved(true);
      toast({ title: "Settings saved", description: "Company settings have been updated." });
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const toggleNotification = (index: number, channel: "email" | "push" | "sms") => {
    setNotifications(prev => prev.map((n, i) => i === index ? { ...n, [channel]: !n[channel] } : n));
  };

  const addRole = () => {
    if (!newRoleName.trim()) return;
    setRoles(prev => [...prev, { name: newRoleName, users: 0, permissions: newRolePerms || "Custom", color: "text-chart-blue" }]);
    setNewRoleName(""); setNewRolePerms(""); setShowAddRole(false);
    toast({ title: "Role added", description: `${newRoleName} role has been created.` });
  };

  const deleteRole = (index: number) => {
    const role = roles[index];
    setRoles(prev => prev.filter((_, i) => i !== index));
    toast({ title: "Role removed", description: `${role.name} has been deleted.` });
  };

  const toggles = [
    { label: "Enable GPS tracking", checked: gpsTracking, onChange: setGpsTracking },
    { label: "Auto punch-out at end of day", checked: autoPunchOut, onChange: setAutoPunchOut },
    { label: "Allow remote check-in", checked: remoteCheckin, onChange: setRemoteCheckin },
    { label: "Require manager approval for overtime", checked: overtimeApproval, onChange: setOvertimeApproval },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-2 pb-20 lg:pb-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Configure your workspace and company preferences.</p>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              saved ? "bg-chart-green/10 text-chart-green" : "bg-primary text-primary-foreground hover:opacity-90"
            } disabled:opacity-50`}>
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </motion.button>
        </div>

        <div className="flex gap-1 apple-glass-subtle p-1 rounded-2xl w-fit overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`nav-pill relative whitespace-nowrap ${activeTab === tab ? "" : "text-muted-foreground hover:text-foreground"}`}>
              {activeTab === tab && <motion.div layoutId="settingsTab" className="absolute inset-0 rounded-xl" style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.25)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className={`relative z-10 ${activeTab === tab ? "text-primary font-semibold" : ""}`}>{tab}</span>
            </button>
          ))}
        </div>

        {activeTab === "Company" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="apple-glass p-5 space-y-4">
              <span className="section-title flex items-center gap-1.5"><Building2 size={12} />Company Profile</span>
              {[
                { label: "Company Name", value: companyName, onChange: setCompanyName },
                { label: "Industry", value: industry, onChange: setIndustry },
                { label: "Timezone", value: timezone, onChange: setTimezone },
                { label: "Fiscal Year", value: fiscalYear, onChange: setFiscalYear },
              ].map(({ label, value, onChange }) => (
                <div key={label}>
                  <label className="text-muted-foreground text-xs font-medium mb-1 block">{label}</label>
                  <input value={value} onChange={(e) => onChange(e.target.value)} className="glass-input" />
                </div>
              ))}
            </div>
            <div className="apple-glass p-5 space-y-4">
              <span className="section-title flex items-center gap-1.5"><Clock size={12} />Work Configuration</span>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Work Start</label><input type="time" value={workHoursStart} onChange={(e) => setWorkHoursStart(e.target.value)} className="glass-input" /></div>
                <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Work End</label><input type="time" value={workHoursEnd} onChange={(e) => setWorkHoursEnd(e.target.value)} className="glass-input" /></div>
              </div>
              <div className="pt-3 space-y-3">
                {toggles.map(({ label, checked, onChange }) => (
                  <label key={label} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-foreground text-sm group-hover:text-primary transition-colors">{label}</span>
                    <button onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 ${checked ? "bg-primary" : "bg-secondary"}`}>
                      <motion.div animate={{ x: checked ? 20 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-5 h-5 rounded-full bg-foreground shadow-sm" />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Users & Roles" && (
          <div className="apple-glass p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="section-title flex items-center gap-1.5"><Shield size={12} />Role Management</span>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAddRole(true)} className="flex items-center gap-1 text-primary text-xs font-semibold hover:underline"><Plus size={12} /> Add Role</motion.button>
            </div>
            {showAddRole && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4 p-4 rounded-xl bg-secondary/30 space-y-3">
                <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="Role name" className="glass-input" />
                <input value={newRolePerms} onChange={e => setNewRolePerms(e.target.value)} placeholder="Permissions description" className="glass-input" />
                <div className="flex gap-2">
                  <button onClick={addRole} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Create</button>
                  <button onClick={() => setShowAddRole(false)} className="px-4 py-2 rounded-lg bg-secondary text-foreground text-xs font-semibold">Cancel</button>
                </div>
              </motion.div>
            )}
            <div className="space-y-2">
              {roles.map((role, i) => (
                <motion.div key={role.name + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${role.color.replace("text-", "bg-")}`} />
                    <div>
                      <span className="text-foreground font-semibold text-sm">{role.name}</span>
                      <p className="text-muted-foreground text-xs">{role.permissions}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs bg-secondary/60 px-2 py-1 rounded-lg">{role.users} users</span>
                    <button onClick={() => deleteRole(i)} className="opacity-0 group-hover:opacity-100 text-chart-red hover:bg-chart-red/10 p-1.5 rounded-lg transition-all"><Trash2 size={12} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Notifications" && (
          <div className="apple-glass p-5">
            <span className="section-title flex items-center gap-1.5 mb-4"><Bell size={12} />Notification Preferences</span>
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-3 py-2">
                <span className="flex-1 text-muted-foreground text-xs font-semibold">Event</span>
                <span className="w-16 text-center text-muted-foreground text-xs font-semibold">Email</span>
                <span className="w-16 text-center text-muted-foreground text-xs font-semibold">Push</span>
                <span className="w-16 text-center text-muted-foreground text-xs font-semibold">SMS</span>
              </div>
              {notifications.map((n, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/20 transition-colors">
                  <span className="flex-1 text-foreground text-sm">{n.label}</span>
                  {(["email", "push", "sms"] as const).map(channel => (
                    <div key={channel} className="w-16 flex justify-center">
                      <button onClick={() => toggleNotification(i, channel)} className={`w-5 h-5 rounded-md border transition-all ${n[channel] ? "bg-primary border-primary" : "border-border bg-secondary/40"}`}>
                        {n[channel] && <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Policies" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="apple-glass p-5 space-y-4">
              <span className="section-title flex items-center gap-1.5"><Calendar size={12} />Leave Policies</span>
              {[{ label: "Annual Leave", value: "20 days" }, { label: "Sick Leave", value: "10 days" }, { label: "Personal Leave", value: "5 days" }, { label: "Maternity/Paternity", value: "90 days" }, { label: "Carryover Limit", value: "5 days" }].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20">
                  <span className="text-foreground text-sm">{label}</span>
                  <span className="text-primary text-sm font-bold">{value}</span>
                </div>
              ))}
            </div>
            <div className="apple-glass p-5 space-y-4">
              <span className="section-title flex items-center gap-1.5"><Globe size={12} />Holiday Calendar 2026</span>
              {[{ name: "New Year's Day", date: "Jan 1" }, { name: "Martin Luther King Jr. Day", date: "Jan 19" }, { name: "Presidents' Day", date: "Feb 16" }, { name: "Memorial Day", date: "May 25" }, { name: "Independence Day", date: "Jul 4" }, { name: "Labor Day", date: "Sep 7" }, { name: "Thanksgiving", date: "Nov 26" }, { name: "Christmas Day", date: "Dec 25" }].map(({ name, date }) => (
                <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20">
                  <span className="text-foreground text-sm">{name}</span>
                  <span className="text-muted-foreground text-xs font-medium bg-secondary/60 px-2 py-0.5 rounded-lg">{date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Appearance" && (
          <div className="apple-glass p-5 space-y-6">
            <div>
              <span className="section-title flex items-center gap-1.5 mb-4"><Palette size={12} />Theme Color</span>
              <p className="text-muted-foreground text-sm mb-4">Choose a primary accent color for the entire application.</p>

              {/* Presets */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 mb-6">
                {presetColors.map(({ name, h, s, l }) => (
                  <button key={name} onClick={() => setPrimaryColor(h, s, l)} className={`group flex flex-col items-center gap-1.5`} title={name}>
                    <div className={`w-10 h-10 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${primaryHue === h ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""}`}
                      style={{ background: `hsl(${h} ${s}% ${l}%)` }} />
                    <span className="text-[9px] text-muted-foreground">{name}</span>
                  </button>
                ))}
              </div>

              {/* Custom sliders */}
              <div className="space-y-4 p-4 rounded-xl bg-secondary/20">
                <span className="text-foreground text-sm font-semibold">Custom Color</span>
                <div>
                  <label className="text-muted-foreground text-xs mb-1 block">Hue: {primaryHue}°</label>
                  <input type="range" min="0" max="360" value={primaryHue} onChange={e => setPrimaryColor(Number(e.target.value), primarySaturation, primaryLightness)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))` }} />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs mb-1 block">Saturation: {primarySaturation}%</label>
                  <input type="range" min="20" max="100" value={primarySaturation} onChange={e => setPrimaryColor(primaryHue, Number(e.target.value), primaryLightness)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, hsl(${primaryHue},20%,${primaryLightness}%), hsl(${primaryHue},100%,${primaryLightness}%))` }} />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs mb-1 block">Lightness: {primaryLightness}%</label>
                  <input type="range" min="30" max="70" value={primaryLightness} onChange={e => setPrimaryColor(primaryHue, primarySaturation, Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, hsl(${primaryHue},${primarySaturation}%,30%), hsl(${primaryHue},${primarySaturation}%,70%))` }} />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-12 h-12 rounded-xl" style={{ background: `hsl(${primaryHue} ${primarySaturation}% ${primaryLightness}%)` }} />
                  <div>
                    <p className="text-foreground text-sm font-semibold">Preview</p>
                    <p className="text-muted-foreground text-xs">{`hsl(${primaryHue}, ${primarySaturation}%, ${primaryLightness}%)`}</p>
                  </div>
                  <button onClick={resetTheme} className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg bg-secondary/40">
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SettingsPage;
