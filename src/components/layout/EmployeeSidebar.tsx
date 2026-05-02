import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { employees, departments, Employee } from "@/data/mockData";

interface EmployeeSidebarProps {
  selectedEmployee: Employee;
  onSelectEmployee: (emp: Employee) => void;
}

const EmployeeSidebar = ({ selectedEmployee, onSelectEmployee }: EmployeeSidebarProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Designers: true,
    Testers: true,
    Managers: false,
    Developers: false,
  });

  const toggle = (dept: string) => setExpanded((p) => ({ ...p, [dept]: !p[dept] }));
  const totalEmployees = departments.reduce((a, d) => a + d.count, 0);

  return (
    <aside className="w-[280px] min-w-[280px] glass-card p-4 flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-5.5rem)]">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-foreground font-semibold text-[15px]">Employees</span>
        <span className="text-muted-foreground text-sm font-medium bg-secondary/60 px-2.5 py-0.5 rounded-full">{totalEmployees}</span>
      </div>

      {departments.map((dept) => {
        const deptEmployees = employees.filter((e) => e.department === dept.name);
        const isOpen = expanded[dept.name];

        return (
          <div key={dept.name} className="rounded-xl overflow-hidden bg-secondary/30">
            <button
              onClick={() => toggle(dept.name)}
              className="flex items-center justify-between w-full px-3 py-3 hover:bg-secondary/50 transition-all duration-200"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg border border-border/60 bg-background/30 flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {dept.count}
                </span>
                <span className="text-foreground font-semibold text-sm">{dept.name}</span>
              </div>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} className="text-muted-foreground" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isOpen && deptEmployees.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-2 pb-2 space-y-0.5">
                    {deptEmployees.map((emp, i) => (
                      <motion.button
                        key={emp.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.2 }}
                        onClick={() => onSelectEmployee(emp)}
                        className={`flex items-center gap-3 w-full px-2.5 py-2.5 rounded-xl transition-all duration-200 text-left group ${
                          selectedEmployee.id === emp.id
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-secondary/60 border border-transparent"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                          selectedEmployee.id === emp.id
                            ? "bg-primary/20 text-primary"
                            : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                        }`}>
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="text-foreground text-sm font-medium truncate">{emp.firstName} {emp.lastName}</div>
                          <div className="text-muted-foreground text-xs truncate">{emp.role}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </aside>
  );
};

export default EmployeeSidebar;
