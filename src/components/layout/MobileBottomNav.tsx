import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Clock, FileText, TrendingUp,
  DollarSign, FolderOpen, BarChart3, Megaphone, Settings,
  MoreHorizontal, Briefcase, UserPlus, FileBox
} from "lucide-react";
import { NavItem } from "@/data/mockData";
import { useState } from "react";

interface MobileBottomNavProps {
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
}

const navConfig: { item: NavItem; icon: typeof LayoutDashboard }[] = [
  { item: "Dashboard", icon: LayoutDashboard },
  { item: "Employees", icon: Users },
  { item: "Attendance", icon: Clock },
  { item: "Requests", icon: FileText },
  { item: "Performance", icon: TrendingUp },
  { item: "Payroll", icon: DollarSign },
  { item: "Projects", icon: FolderOpen },
  { item: "Reports", icon: BarChart3 },
  { item: "Announcements", icon: Megaphone },
  { item: "Recruitment", icon: Briefcase },
  { item: "Onboarding", icon: UserPlus },
  { item: "Documents", icon: FileBox },
  { item: "Settings", icon: Settings },
];

const primaryItems = navConfig.slice(0, 4);
const moreItems = navConfig.slice(4);

const MobileBottomNav = ({ activeNav, onNavChange }: MobileBottomNavProps) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = moreItems.some(i => i.item === activeNav);

  return (
    <>
      {moreOpen && <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden" onClick={() => setMoreOpen(false)} />}
      {moreOpen && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 left-2 right-2 z-50 apple-glass p-3 rounded-2xl lg:hidden">
          <div className="grid grid-cols-3 gap-2">
            {moreItems.map(({ item, icon: Icon }) => (
              <button key={item} onClick={() => { onNavChange(item); setMoreOpen(false); }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                  activeNav === item ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/30"
                }`}>
                <Icon size={18} />
                <span className="text-[10px] font-medium">{item}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-area-bottom" style={{ borderRadius: 0 }}>
        <div className="apple-glass" style={{ borderRadius: 0, borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>
          <div className="flex items-center justify-around px-2 py-2">
            {primaryItems.map(({ item, icon: Icon }) => (
              <button key={item} onClick={() => { onNavChange(item); setMoreOpen(false); }}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all relative ${
                  activeNav === item ? "text-primary" : "text-muted-foreground"
                }`}>
                {activeNav === item && (
                  <motion.div layoutId="mobileNav" className="absolute -top-1 w-8 h-1 bg-primary rounded-full" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item}</span>
              </button>
            ))}
            <button onClick={() => setMoreOpen(!moreOpen)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${
                isMoreActive ? "text-primary" : "text-muted-foreground"
              }`}>
              <MoreHorizontal size={20} />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
