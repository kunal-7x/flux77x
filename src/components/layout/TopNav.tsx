import { Search, SlidersHorizontal, X, LogOut, Settings, PanelLeft } from "lucide-react";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";
import { NavItem, navItems } from "@/data/mockData";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

interface TopNavProps {
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
  onSignOut?: () => void;
}

const TopNav = ({ activeNav, onNavChange, onSignOut }: TopNavProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const { user, isGuest } = useAuth();
  const { setLayoutMode } = useTheme();

  const filterCategories = [
    { label: "Active Employees", action: () => onNavChange("Employees") },
    { label: "On Leave", action: () => onNavChange("Requests") },
    { label: "Recent Hires", action: () => onNavChange("Employees") },
    { label: "Pending Reviews", action: () => onNavChange("Performance") },
    { label: "High Performers", action: () => onNavChange("Performance") },
  ];

  const closeAll = () => { setSearchOpen(false); setProfileOpen(false); setFilterOpen(false); };

  const displayName = isGuest ? "Guest" : (user?.user_metadata?.full_name || user?.email || "User");
  const displayInitial = isGuest ? "G" : (displayName[0]?.toUpperCase() || "U");

  const dropdownStyle = {
    background: "hsl(228 14% 18% / 0.95)",
    backdropFilter: "blur(16px)",
    border: "1px solid hsl(0 0% 100% / 0.08)",
    boxShadow: "0 8px 32px -4px hsl(228 16% 4% / 0.6)",
  };

  return (
    <header className="relative z-50">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 lg:py-4 border-b border-border/30" style={{ background: "hsl(228 14% 14% / 0.8)", backdropFilter: "blur(24px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center premium-glow">
            <span className="text-primary-foreground font-black text-xs">◆</span>
          </div>
          <span className="text-foreground font-bold text-base tracking-tight hidden sm:block">Flux</span>
        </div>

        <nav className="hidden lg:flex items-center gap-0.5 p-1 rounded-xl overflow-x-auto scrollbar-none max-w-[800px]" style={{ scrollbarWidth: "none" }}>
          {navItems.map((item) => (
            <button key={item} onClick={() => onNavChange(item)}
              className={`nav-pill relative whitespace-nowrap text-xs px-3 py-2 ${activeNav === item ? "" : "text-muted-foreground hover:text-foreground"}`}>
              {activeNav === item && (
                <motion.div layoutId="activeNav" className="absolute inset-0 rounded-xl" style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.25)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <span className={`relative z-10 ${activeNav === item ? "text-primary font-semibold" : ""}`}>{item}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button onClick={() => setLayoutMode("sidebar")} className="icon-button w-8 h-8 hidden lg:flex" title="Switch to Sidebar"><PanelLeft size={14} /></button>

          <div className="relative">
            <button className="icon-button w-8 h-8" onClick={() => { closeAll(); setSearchOpen(!searchOpen); }}>
              {searchOpen ? <X size={14} /> : <Search size={14} />}
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }} className="absolute right-0 top-11 p-3 rounded-xl z-[100] w-72" style={dropdownStyle}>
                  <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search modules..." className="glass-input text-sm" />
                  {searchQuery && (
                    <div className="mt-2 space-y-0.5 max-h-48 overflow-y-auto">
                      {navItems.filter(n => n.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                        <button key={item} onClick={() => { onNavChange(item); closeAll(); setSearchQuery(""); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary/40 transition-colors">{item}</button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button className={`icon-button w-8 h-8 hidden sm:flex ${filterOpen ? "!bg-primary/10 !text-primary" : ""}`} onClick={() => { closeAll(); setFilterOpen(!filterOpen); }}>
              <SlidersHorizontal size={14} />
            </button>
            <AnimatePresence>
              {filterOpen && (
                <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }} className="absolute right-0 top-11 w-56 rounded-xl z-[100] p-3 space-y-1" style={dropdownStyle}>
                  <span className="text-foreground font-semibold text-xs block mb-2">Quick Filters</span>
                  {filterCategories.map(f => (
                    <button key={f.label} onClick={() => { f.action(); closeAll(); }} className="w-full text-left px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary/30 hover:text-foreground transition-colors">{f.label}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NotificationCenter onNavigate={(nav) => onNavChange(nav as any)} />

          <div className="relative">
            <button onClick={() => { closeAll(); setProfileOpen(!profileOpen); }} className="w-8 h-8 rounded-xl flex items-center justify-center ml-0.5 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95" style={{ background: 'hsl(var(--primary) / 0.15)', border: '1px solid hsl(var(--primary) / 0.2)' }}>
              <span className="text-[10px] font-bold text-primary">{displayInitial}</span>
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }} className="absolute right-0 top-11 w-52 rounded-xl z-[100]" style={dropdownStyle}>
                  <div className="p-3 border-b border-border/20">
                    <p className="text-foreground font-semibold text-xs truncate">{displayName}</p>
                    <p className="text-muted-foreground text-[10px]">{isGuest ? "Guest User" : "Member"}</p>
                  </div>
                  <div className="p-1">
                    <button onClick={() => { onNavChange("Settings"); closeAll(); }} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary/30 hover:text-foreground transition-colors"><Settings size={12} /> Settings</button>
                    <button onClick={() => { onSignOut?.(); closeAll(); }} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-chart-red hover:bg-chart-red/10 transition-colors"><LogOut size={12} /> Sign Out</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {(searchOpen || profileOpen || filterOpen) && <div className="fixed inset-0 z-[90]" onClick={closeAll} />}
      </div>
    </header>
  );
};

export default TopNav;
