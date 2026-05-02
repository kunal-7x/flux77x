import { motion } from "framer-motion";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Briefcase, Award, Shield, FileText, Clock, DollarSign, Heart, Star } from "lucide-react";
import { Employee } from "@/data/mockData";
import { useState } from "react";

interface EmployeeDetailPageProps {
  employee: Employee;
  onBack: () => void;
}

const tabs = ["Personal Info", "Emergency", "Documents", "Employment History", "Salary History"] as const;

const EmployeeDetailPage = ({ employee, onBack }: EmployeeDetailPageProps) => {
  const [activeTab, setActiveTab] = useState<string>("Personal Info");

  return (
    <div className="flex-1 overflow-y-auto max-h-[calc(100vh-5.5rem)] p-1 pr-2 pb-20 lg:pb-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {/* Back + Header */}
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="icon-button"><ArrowLeft size={16} /></button>
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center text-2xl font-black text-muted-foreground border border-border/40">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{employee.firstName} {employee.lastName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-muted-foreground text-sm flex items-center gap-1"><Briefcase size={12} />{employee.role}</span>
                <span className="text-muted-foreground text-sm flex items-center gap-1"><MapPin size={12} />{employee.city}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${employee.status === "active" ? "bg-chart-green/10 text-chart-green" : employee.status === "on-leave" ? "bg-chart-orange/10 text-chart-orange" : "bg-chart-red/10 text-chart-red"}`}>{employee.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Performance", value: `${employee.performanceScore}%`, icon: Star, color: "text-primary" },
            { label: "Salary", value: `$${employee.salary.toLocaleString()}`, icon: DollarSign, color: "text-chart-green" },
            { label: "Vacation", value: `${employee.vacationDays} days`, icon: Calendar, color: "text-chart-blue" },
            { label: "Level", value: employee.level, icon: Award, color: "text-chart-orange" },
            { label: "Tasks", value: `${employee.tasksInProgress} active`, icon: Clock, color: "text-chart-lime" },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-hover p-4">
              <Icon size={16} className={`${color} mb-2`} />
              <span className="text-foreground font-bold text-lg block">{value}</span>
              <span className="text-muted-foreground text-xs">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card/60 p-1 rounded-full w-fit backdrop-blur-sm border border-border/30 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`nav-pill relative whitespace-nowrap ${activeTab === tab ? "" : "text-muted-foreground hover:text-foreground"}`}>
              {activeTab === tab && <motion.div layoutId="empDetailTab" className="absolute inset-0 bg-foreground rounded-full" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className={`relative z-10 ${activeTab === tab ? "text-background" : ""}`}>{tab}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Personal Info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5 space-y-4">
              <span className="section-title">Basic Information</span>
              {[
                { label: "Full Name", value: `${employee.firstName} ${employee.lastName}` },
                { label: "Email", value: employee.email, icon: Mail },
                { label: "Phone", value: employee.phone, icon: Phone },
                { label: "Date of Birth", value: employee.dateOfBirth || "N/A" },
                { label: "Nationality", value: employee.nationality || "N/A" },
                { label: "Address", value: employee.address || "N/A", icon: MapPin },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">{label}</label>
                  <p className="text-foreground text-sm font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="glass-card p-5 space-y-4">
              <span className="section-title">Professional Details</span>
              {[
                { label: "Employee ID", value: employee.employeeId || "N/A" },
                { label: "Department", value: employee.department },
                { label: "Job Title", value: employee.role },
                { label: "Level", value: employee.level },
                { label: "Manager", value: employee.manager },
                { label: "Join Date", value: employee.joinDate || "N/A" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">{label}</label>
                  <p className="text-foreground text-sm font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="glass-card p-5 md:col-span-2">
              <span className="section-title mb-3 block">Skills & Certifications</span>
              <div className="flex flex-wrap gap-1.5">
                {((employee as any).skills || ["Figma", "React", "CSS", "Prototyping"]).map((skill: string) => (
                  <span key={skill} className="text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-lg">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Emergency" && (
          <div className="glass-card p-5 space-y-4 max-w-lg">
            <span className="section-title flex items-center gap-1.5"><Heart size={12} />Emergency Contact</span>
            {[
              { label: "Contact Name", value: employee.emergencyContact || "Not provided" },
              { label: "Phone", value: employee.emergencyPhone || "Not provided" },
              { label: "Relationship", value: "Next of Kin" },
            ].map(({ label, value }) => (
              <div key={label}>
                <label className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">{label}</label>
                <p className="text-foreground text-sm font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Documents" && (
          <div className="glass-card p-5 space-y-3">
            <span className="section-title flex items-center gap-1.5"><FileText size={12} />Documents</span>
            {[
              { name: "Employment Contract", date: employee.joinDate || "2021-06-01", type: "PDF" },
              { name: "NDA Agreement", date: employee.joinDate || "2021-06-01", type: "PDF" },
              { name: "ID Verification", date: employee.joinDate || "2021-06-01", type: "Image" },
              { name: "Tax Declaration", date: "2025-12-15", type: "PDF" },
            ].map((doc, i) => (
              <motion.div key={doc.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><FileText size={16} /></div>
                  <div>
                    <p className="text-foreground text-sm font-medium">{doc.name}</p>
                    <p className="text-muted-foreground text-xs">{doc.type} · {doc.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "Employment History" && (
          <div className="glass-card p-5 space-y-4">
            <span className="section-title flex items-center gap-1.5"><Briefcase size={12} />Career Timeline</span>
            {[
              { title: employee.role, company: "Flux Technologies", period: `${employee.joinDate || "2021"} - Present`, level: employee.level },
              { title: "Junior Designer", company: "Flux Technologies", period: "2020 - 2021", level: "Junior" },
              { title: "Design Intern", company: "CreativeCo", period: "2019 - 2020", level: "Intern" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-primary" : "bg-secondary"}`} />
                  {i < 2 && <div className="w-0.5 flex-1 bg-border/30" />}
                </div>
                <div className="pb-6">
                  <h3 className="text-foreground font-semibold text-sm">{item.title}</h3>
                  <p className="text-muted-foreground text-xs">{item.company} · {item.level}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">{item.period}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "Salary History" && (
          <div className="glass-card p-5 space-y-4">
            <span className="section-title flex items-center gap-1.5"><DollarSign size={12} />Compensation History</span>
            {[
              { period: "2026", salary: employee.salary, bonus: employee.bonus, change: "+8%" },
              { period: "2025", salary: Math.round(employee.salary * 0.92), bonus: Math.round(employee.bonus * 0.9), change: "+12%" },
              { period: "2024", salary: Math.round(employee.salary * 0.82), bonus: Math.round(employee.bonus * 0.8), change: "+15%" },
              { period: "2023", salary: Math.round(employee.salary * 0.71), bonus: Math.round(employee.bonus * 0.7), change: "Base" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                <div>
                  <span className="text-foreground font-semibold text-sm">{item.period}</span>
                  <p className="text-muted-foreground text-xs">Bonus: ${item.bonus.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-foreground font-bold">${item.salary.toLocaleString()}</span>
                  <p className={`text-xs font-semibold ${item.change.startsWith("+") ? "text-chart-green" : "text-muted-foreground"}`}>{item.change}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EmployeeDetailPage;
