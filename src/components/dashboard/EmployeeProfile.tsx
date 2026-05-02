import { Phone, Video, MessageCircle, Globe, Mail, MapPin, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { Employee } from "@/data/mockData";

interface EmployeeProfileProps {
  employee: Employee;
}

const EmployeeProfile = ({ employee }: EmployeeProfileProps) => {
  const actions = [
    { icon: Phone, label: "Call" },
    { icon: Video, label: "Video" },
    { icon: MessageCircle, label: "Chat" },
    { icon: Globe, label: "Web" },
    { icon: Mail, label: "Email" },
  ];

  const details = [
    { label: "First Name", value: employee.firstName },
    { label: "Last Name", value: employee.lastName },
    { label: "Phone", value: employee.phone },
    { label: "Email", value: employee.email },
    { label: "Job Title", value: employee.role },
    { label: "Level", value: employee.level },
    { label: "Manager", value: employee.manager },
    { label: "City", value: employee.city },
  ];

  return (
    <motion.aside
      key={employee.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-[300px] min-w-[300px] glass-card p-6 flex flex-col items-center gap-5 overflow-y-auto max-h-[calc(100vh-5.5rem)]"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground tracking-tight">{employee.firstName} {employee.lastName}</h2>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <Briefcase size={12} className="text-muted-foreground" />
          <p className="text-muted-foreground text-sm">{employee.role}</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="w-44 h-44 rounded-2xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center border border-border/40 overflow-hidden">
        <span className="text-5xl font-black text-muted-foreground/60">{employee.firstName[0]}{employee.lastName[0]}</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {actions.map(({ icon: Icon, label }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="icon-button"
            title={label}
          >
            <Icon size={15} />
          </motion.button>
        ))}
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 bg-chart-green/10 px-3 py-1.5 rounded-full">
        <div className="w-2 h-2 rounded-full bg-chart-green animate-pulse" />
        <span className="text-chart-green text-xs font-semibold">Active</span>
      </div>

      {/* Professional Details */}
      <div className="w-full mt-1">
        <h3 className="section-title mb-4">Professional Details</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {details.map(({ label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
            >
              <div className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">{label}</div>
              <div className="text-foreground text-sm font-semibold truncate mt-0.5">{value}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tools / Skills */}
      <div className="w-full mt-2">
        <h3 className="section-title mb-3">Skills</h3>
        <div className="flex flex-wrap gap-1.5">
          {["Figma", "Sketch", "React", "CSS", "Prototyping"].map((tool) => (
            <span key={tool} className="text-xs font-medium bg-secondary/60 text-secondary-foreground px-3 py-1.5 rounded-lg border border-border/30">
              {tool}
            </span>
          ))}
        </div>
      </div>
    </motion.aside>
  );
};

export default EmployeeProfile;
