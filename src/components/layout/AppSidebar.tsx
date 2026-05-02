import { motion } from "framer-motion";
import { NavItem, navItems } from "@/data/mockData";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Clock, FileText, Target, DollarSign,
  FolderOpen, BarChart3, Megaphone, Settings, PanelTop, LogOut,
  ChevronsLeft, ChevronsRight, Briefcase, UserPlus, FileBox
} from "lucide-react";

const navIcons: Record<NavItem, typeof LayoutDashboard> = {
  Dashboard: LayoutDashboard, Employees: Users, Attendance: Clock,
  Requests: FileText, Performance: Target, Payroll: DollarSign,
  Projects: FolderOpen, Reports: BarChart3, Announcements: Megaphone,
  Recruitment: Briefcase, Onboarding: UserPlus, Documents: FileBox,
  Settings: Settings,
};

interface AppSidebarProps {
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
  onSignOut: () => void;
}

const AppSidebar = ({ activeNav, onNavChange, onSignOut }: AppSidebarProps) => {
  const { setLayoutMode } = useTheme();
  const { isGuest, user } = useAuth();
  const displayName = isGuest ? "Guest" : (user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User");
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("flux-sidebar-collapsed") === "true");

  useEffect(() => {
    localStorage.setItem("flux-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1, width: sidebarWidth }}
      exit={{ x: -280, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-3 top-3 bottom-3 z-40 flex flex-col"
      style={{
        background: "linear-gradient(160deg, hsl(228 14% 16% / 0.85), hsl(228 14% 12% / 0.75))",
        backdropFilter: "blur(40px) saturate(1.5)",
        WebkitBackdropFilter: "blur(40px) saturate(1.5)",
        borderRadius: "20px",
        border: "1px solid hsl(0 0% 100% / 0.06)",
        boxShadow: "0 8px 40px -8px hsl(228 16% 4% / 0.6), inset 0 1px 0 hsl(0 0% 100% / 0.04)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center premium-glow flex-shrink-0">
          <span className="text-primary-foreground font-black text-sm">◆</span>
        </div>
        {!collapsed && <span className="text-foreground font-bold text-lg tracking-tight">Flux</span>}
      </div>

      {/* Nav items — scrollable */}
      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 space-y-0.5 scrollbar-none">
        {navItems.map((item) => {
          const Icon = navIcons[item];
          const active = activeNav === item;
          return (
            <button
              key={item}
              onClick={() => onNavChange(item)}
              title={collapsed ? item : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {active && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="absolute left-0 top-0 bottom-0 my-auto w-1 h-5 rounded-r-full bg-primary-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={16} className="relative z-10 flex-shrink-0" />
              {!collapsed && <span className="relative z-10 truncate">{item}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom section — fixed */}
      <div className="flex-shrink-0 px-2 pb-3 pt-2 border-t border-border/20 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={() => setLayoutMode("topnav")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
          title="Switch to Top Navigation"
        >
          <PanelTop size={14} />
          {!collapsed && <span>Top Navigation</span>}
        </button>
        <div className="px-1">
          <NotificationCenter onNavigate={(nav) => onNavChange(nav as NavItem)} />
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: "hsl(var(--primary) / 0.2)", color: "hsl(var(--primary))" }}>
            {displayName[0]?.toUpperCase()}
          </div>
          {!collapsed && <span className="text-foreground text-xs font-medium flex-1 truncate">{displayName}</span>}
          <button onClick={onSignOut} className="text-muted-foreground hover:text-chart-red transition-colors flex-shrink-0" title="Sign out">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
