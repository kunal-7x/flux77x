import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, Filter, ArrowUpDown, Eye, FileText } from "lucide-react";
import Papa from "papaparse";
import { Employee } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import ModalPortal from "@/components/ui/modal-portal";
import ExportMenu from "@/components/ui/ExportMenu";

interface EmployeeDirectoryProps {
  employees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
  onImportCSV: (data: any[]) => Promise<number>;
  aiFocus?: {
    id?: string;
    search?: string;
    op?: string;
    focusKey?: string;
  };
}

const AI_FOCUS_VISIBLE_MS = 5000;

const CSV_TEMPLATE = `first_name,last_name,email,phone,role,department,level,manager,city,salary,bonus,performance_score,vacation_days,date_of_birth,nationality,address,emergency_contact,emergency_phone,join_date,employee_id,status,skills
John,Doe,john@example.com,(555) 123-4567,Software Engineer,Developers,Senior,Jane Smith,New York,5000,800,85,20,1990-01-15,American,123 Main St,Jane Doe,(555) 987-6543,2022-01-01,EMP-NEW,active,"React,TypeScript,Node.js"`;

const EmployeeDirectory = ({ employees, onSelectEmployee, onImportCSV, aiFocus }: EmployeeDirectoryProps) => {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "department" | "salary">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [visibleFocusId, setVisibleFocusId] = useState(aiFocus?.id || "");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setVisibleFocusId(aiFocus?.id || "");
    if (!aiFocus?.id) return;

    const timeout = window.setTimeout(() => setVisibleFocusId(""), AI_FOCUS_VISIBLE_MS);
    return () => window.clearTimeout(timeout);
  }, [aiFocus?.id, aiFocus?.focusKey]);

  useEffect(() => {
    if (!aiFocus) return;
    setSearch(aiFocus.search || "");
    setDeptFilter("All");
    setStatusFilter("All");
  }, [aiFocus?.id, aiFocus?.search]);

  const departments = ["All", ...Array.from(new Set(employees.map(e => e.department)))];
  const statuses = ["All", "active", "on-leave", "inactive"];

  const filtered = employees
    .filter(e => {
      const q = search.toLowerCase();
      const matchSearch = !q || `${e.firstName} ${e.lastName} ${e.email} ${e.role} ${e.employeeId || ""} ${e.id}`.toLowerCase().includes(q);
      const matchDept = deptFilter === "All" || e.department === deptFilter;
      const matchStatus = statusFilter === "All" || e.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    })
    .sort((a, b) => {
      if (visibleFocusId) {
        if (a.id === visibleFocusId) return -1;
        if (b.id === visibleFocusId) return 1;
      }
      let cmp = 0;
      if (sortBy === "name") cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      else if (sortBy === "department") cmp = a.department.localeCompare(b.department);
      else cmp = a.salary - b.salary;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const getExportData = () => employees.map(e => ({
    first_name: e.firstName, last_name: e.lastName, email: e.email, phone: e.phone,
    role: e.role, department: e.department, level: e.level, manager: e.manager,
    city: e.city, salary: e.salary, bonus: e.bonus, performance_score: e.performanceScore,
    vacation_days: e.vacationDays, status: e.status, employee_id: e.employeeId,
  }));

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    import("file-saver").then(({ saveAs }) => saveAs(blob, "employee_import_template.csv"));
    toast({ title: "Template Downloaded", description: "Fill in the template and import it back." });
  };

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const count = await onImportCSV(results.data);
          toast({ title: "Import Successful!", description: `${count} employees imported.` });
          setImportOpen(false);
        } catch (err: any) {
          toast({ title: "Import Failed", description: err.message, variant: "destructive" });
        } finally { setImporting(false); }
      },
      error: (err) => {
        toast({ title: "Parse Error", description: err.message, variant: "destructive" });
        setImporting(false);
      },
    });
    if (fileRef.current) fileRef.current.value = "";
  }, [onImportCSV, toast]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("asc"); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-1 pr-2 pb-20 lg:pb-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Employee Directory</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{filtered.length} of {employees.length} employees</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setImportOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/60 text-foreground text-sm font-medium border border-border/30 hover:bg-secondary transition-all">
              <Upload size={14} /> Import
            </button>
            <ExportMenu data={getExportData()} filename={`employees_export_${new Date().toISOString().split("T")[0]}`} label="Export" />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, role, ID..."
              className="w-full bg-secondary/60 text-foreground text-sm pl-9 pr-4 py-2.5 rounded-xl outline-none border border-border/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50" />
          </div>
          <button onClick={() => setFilterOpen(!filterOpen)} className={`icon-button ${filterOpen ? "bg-primary/10 text-primary" : ""}`}>
            <Filter size={16} />
          </button>
        </div>

        <AnimatePresence>
          {filterOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass-card p-4 flex gap-4 flex-wrap">
              <div>
                <label className="text-muted-foreground text-xs font-medium block mb-1">Department</label>
                <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="bg-secondary/60 text-foreground text-sm px-3 py-2 rounded-xl border border-border/30 outline-none">
                  {departments.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium block mb-1">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-secondary/60 text-foreground text-sm px-3 py-2 rounded-xl border border-border/30 outline-none">
                  {statuses.map(s => <option key={s} value={s}>{s === "All" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <button onClick={() => { setDeptFilter("All"); setStatusFilter("All"); setSearch(""); }} className="text-primary text-xs font-medium self-end pb-2 hover:underline">Clear Filters</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  {[
                    { label: "Employee", field: "name" as const },
                    { label: "Department", field: "department" as const },
                    { label: "Role", field: null },
                    { label: "Status", field: null },
                    { label: "Salary", field: "salary" as const },
                    { label: "Actions", field: null },
                  ].map(({ label, field }) => (
                    <th key={label} className="text-left px-4 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      {field ? (
                        <button onClick={() => toggleSort(field)} className="flex items-center gap-1 hover:text-foreground transition-colors">
                          {label} <ArrowUpDown size={10} />
                        </button>
                      ) : label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => {
                  const focused = visibleFocusId === emp.id;
                  return (
                  <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className={`border-b border-border/10 hover:bg-secondary/20 transition-colors cursor-pointer ${focused ? "ai-focus-ring" : ""}`} onClick={() => onSelectEmployee(emp)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">{emp.firstName[0]}{emp.lastName[0]}</div>
                        <div>
                          <p className="text-foreground text-sm font-semibold flex flex-wrap items-center gap-2">
                            <span>{emp.firstName} {emp.lastName}</span>
                            {focused && <span className="ai-focus-badge">AI updated</span>}
                          </p>
                          <p className="text-muted-foreground text-xs">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground text-sm">{emp.department}</td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">{emp.role}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        emp.status === "active" ? "bg-chart-green/10 text-chart-green" :
                        emp.status === "on-leave" ? "bg-chart-orange/10 text-chart-orange" :
                        "bg-chart-red/10 text-chart-red"
                      }`}>{emp.status}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground text-sm font-semibold">${emp.salary.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => onSelectEmployee(emp)} className="icon-button w-7 h-7"><Eye size={12} /></button>
                      </div>
                    </td>
                  </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No employees match your filters.</div>
          )}
        </div>

        <ModalPortal open={importOpen} onClose={() => setImportOpen(false)} title="Import Employees">
          <p className="text-muted-foreground text-sm">Upload a CSV file to bulk import employees. Download our template first to ensure correct formatting.</p>
          <button onClick={downloadTemplate} className="flex items-center gap-2 w-full py-3 rounded-xl bg-secondary/60 text-foreground text-sm font-medium border border-border/30 hover:bg-secondary transition-all justify-center">
            <FileText size={14} /> Download CSV Template
          </button>
          <div className="card-dashed p-6 text-center cursor-pointer hover:border-primary/40 transition-colors" onClick={() => fileRef.current?.click()}>
            <Upload size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-foreground text-sm font-medium">{importing ? "Importing..." : "Click to upload CSV file"}</p>
            <p className="text-muted-foreground text-xs mt-1">Supports .csv files</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} disabled={importing} />
        </ModalPortal>
      </motion.div>
    </div>
  );
};

export default EmployeeDirectory;
