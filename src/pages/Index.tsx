import { useState } from "react";
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
import { NavItem } from "@/data/mockData";
import { useEmployees } from "@/hooks/useEmployees";
import { useTheme } from "@/hooks/useTheme";

interface IndexProps {
  onSignOut: () => void;
}

const Index = ({ onSignOut }: IndexProps) => {
  const [activeNav, setActiveNav] = useState<NavItem>("Dashboard");
  const { employees, importCSV } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]);
  const [viewingEmployee, setViewingEmployee] = useState<typeof employees[0] | null>(null);
  const { layoutMode } = useTheme();

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
