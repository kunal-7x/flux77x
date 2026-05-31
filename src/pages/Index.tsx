import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopNav from "@/components/layout/TopNav";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import DashboardPage from "@/pages/DashboardPage";
import ReportsPage from "@/pages/ReportsPage";
import RequestsPage from "@/pages/RequestsPage";
import ProjectsPage from "@/pages/ProjectsPage";
import AttendancePage from "@/pages/AttendancePage";
import PerformancePage from "@/pages/PerformancePage";
import PayrollPage from "@/pages/PayrollPage";
import AnnouncementsPage from "@/pages/AnnouncementsPage";
import SettingsPage from "@/pages/SettingsPage";
import RecruitmentPage from "@/pages/RecruitmentPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DocumentsPage from "@/pages/DocumentsPage";
import EmployeeDirectory from "@/components/employees/EmployeeDirectory";
import EmployeeDetailPage from "@/components/employees/EmployeeDetailPage";
import { NavItem, navItems } from "@/data/mockData";
import { useEmployees } from "@/hooks/useEmployees";
import { useTheme } from "@/hooks/useTheme";
import { chatEvents } from "@/lib/chatEvents";

interface IndexProps {
  onSignOut: () => void;
}

type AiFocusState = {
  table: string;
  op?: string;
  id?: string;
  search?: string;
  focusKey?: string;
};

type AiActionPayload = {
  table?: string;
  op?: string;
  id?: string;
  record?: Record<string, any>;
  records?: Record<string, any>[];
};

const TABLE_NAV: Record<string, NavItem> = {
  employees: "Employees",
  leave_requests: "Requests",
  projects: "Projects",
  project_tasks: "Projects",
  announcements: "Announcements",
  attendance_records: "Attendance",
  jobs: "Recruitment",
  candidates: "Recruitment",
  interviews: "Recruitment",
  goals: "Performance",
  departments: "Settings",
  notifications: "Dashboard",
  onboarding_tasks: "Onboarding",
  company_settings: "Settings",
};

const navSet = new Set<string>(navItems);

const getInitialNav = (): NavItem => {
  if (typeof window === "undefined") return "Dashboard";
  const nav = new URLSearchParams(window.location.search).get("aiNav");
  return nav && navSet.has(nav) ? (nav as NavItem) : "Dashboard";
};

const getInitialAiFocus = (): AiFocusState | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const table = params.get("aiTable");
  if (!table) return null;
  return {
    table,
    op: params.get("aiOp") || undefined,
    id: params.get("aiFocus") || undefined,
    search: params.get("aiSearch") || undefined,
    focusKey: params.get("aiAt") || undefined,
  };
};

const firstText = (record: Record<string, any> | undefined, keys: string[]) => {
  if (!record) return "";
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
};

const getPrimaryRecord = (payload: AiActionPayload) => (
  payload.record || (payload.records?.length === 1 ? payload.records[0] : undefined)
);

const getAiSearch = (payload: AiActionPayload) => {
  if (payload.op === "delete" || payload.op === "list") return "";
  const record = getPrimaryRecord(payload);
  if (!record) return "";

  if (payload.table === "employees") {
    const name = [record.first_name || record.firstName, record.last_name || record.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || firstText(record, ["employee_id", "employeeId", "email", "role", "department", "id"]);
  }

  return firstText(record, [
    "name",
    "title",
    "subject",
    "employee_name",
    "candidate_name",
    "job_title",
    "email",
    "status",
    "department",
    "role",
    "id",
  ]);
};

const Index = ({ onSignOut }: IndexProps) => {
  const [activeNav, setActiveNav] = useState<NavItem>(getInitialNav);
  const { employees, importCSV } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]);
  const [viewingEmployee, setViewingEmployee] = useState<typeof employees[0] | null>(null);
  const [aiFocus, setAiFocus] = useState<AiFocusState | null>(getInitialAiFocus);
  const { layoutMode } = useTheme();

  useEffect(() => {
    const unsubscribe = chatEvents.on("action", (payload: AiActionPayload) => {
      if (!payload?.table) return;
      const nav = TABLE_NAV[payload.table];
      if (!nav) return;

      const record = getPrimaryRecord(payload);
      const id = payload.id || record?.id || "";
      const search = getAiSearch(payload);
      const focusKey = String(Date.now());
      const nextFocus = { table: payload.table, op: payload.op, id, search, focusKey };

      setActiveNav(nav);
      setViewingEmployee(null);
      setAiFocus(nextFocus);

      const params = new URLSearchParams();
      params.set("aiNav", nav);
      params.set("aiTable", payload.table);
      params.set("aiAt", focusKey);
      if (payload.op) params.set("aiOp", payload.op);
      if (id) params.set("aiFocus", id);
      if (search) params.set("aiSearch", search);
      window.history.pushState(null, "", `/?${params.toString()}`);
    });

    return unsubscribe;
  }, []);

  const handleSelectEmployee = (emp: typeof employees[0]) => {
    setSelectedEmployee(emp);
    setViewingEmployee(emp);
  };

  const handleNavChange = (nav: NavItem) => {
    setActiveNav(nav);
    setViewingEmployee(null);
  };

  const renderContent = () => {
    if (viewingEmployee && activeNav === "Employees") {
      return <EmployeeDetailPage employee={viewingEmployee} onBack={() => setViewingEmployee(null)} />;
    }
    switch (activeNav) {
      case "Dashboard": return <DashboardPage onNavigate={handleNavChange} />;
      case "Reports": return <ReportsPage />;
      case "Requests": return <RequestsPage />;
      case "Projects": return <ProjectsPage />;
      case "Attendance": return <AttendancePage />;
      case "Performance": return <PerformancePage />;
      case "Payroll": return <PayrollPage />;
      case "Announcements": return <AnnouncementsPage />;
      case "Settings": return <SettingsPage />;
      case "Recruitment": return <RecruitmentPage />;
      case "Onboarding": return <OnboardingPage />;
      case "Documents": return <DocumentsPage />;
      case "Employees":
      default:
        return (
          <EmployeeDirectory
            employees={employees}
            onSelectEmployee={handleSelectEmployee}
            onImportCSV={importCSV}
            aiFocus={aiFocus?.table === "employees" ? aiFocus : undefined}
          />
        );
    }
  };

  const isSidebar = layoutMode === "sidebar";
  const collapsed = typeof window !== "undefined" && localStorage.getItem("flux-sidebar-collapsed") === "true";
  const sidebarMargin = collapsed ? "lg:ml-[82px]" : "lg:ml-[258px]";

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <div className={`flex-shrink-0 ${isSidebar ? "lg:hidden" : ""}`}>
        <TopNav activeNav={activeNav} onNavChange={handleNavChange} onSignOut={onSignOut} />
      </div>

      <AnimatePresence>
        {isSidebar && (
          <div className="hidden lg:block">
            <AppSidebar activeNav={activeNav} onNavChange={handleNavChange} onSignOut={onSignOut} />
          </div>
        )}
      </AnimatePresence>

      <div className={`flex flex-1 min-h-0 p-2 md:p-4 pb-20 lg:pb-4 transition-all duration-300 overflow-x-hidden ${
        isSidebar ? sidebarMargin : ""
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNav + (viewingEmployee?.id || "")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-1 min-h-0 overflow-hidden"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <MobileBottomNav activeNav={activeNav} onNavChange={handleNavChange} />
    </div>
  );
};

export default Index;
