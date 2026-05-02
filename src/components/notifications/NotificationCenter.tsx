import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Info, AlertCircle, CheckCircle2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

const typeIcons: Record<string, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
};

const typeColors: Record<string, string> = {
  info: "text-chart-blue",
  success: "text-chart-green",
  warning: "text-chart-orange",
};

interface NotificationCenterProps {
  onNavigate?: (nav: string) => void;
}

const NotificationCenter = ({ onNavigate }: NotificationCenterProps) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifications(data as Notification[]);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dropdownStyle = {
    background: "hsl(228 14% 18% / 0.95)",
    backdropFilter: "blur(16px)",
    border: "1px solid hsl(0 0% 100% / 0.08)",
    boxShadow: "0 8px 32px -4px hsl(228 16% 4% / 0.6)",
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative">
      <button
        className="icon-button w-8 h-8 relative"
        onClick={() => setOpen(!open)}
      >
        <Bell size={14} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[89]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="absolute right-0 top-11 w-80 rounded-xl z-[100]"
              style={dropdownStyle}
            >
              <div className="p-3 border-b border-border/20 flex items-center justify-between">
                <span className="text-foreground font-semibold text-xs">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-primary text-[10px] font-medium hover:underline flex items-center gap-1"
                  >
                    <CheckCheck size={10} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 && (
                  <div className="p-6 text-center">
                    <Bell size={20} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-xs">No notifications yet</p>
                  </div>
                )}
                {notifications.map((n) => {
                  const Icon = typeIcons[n.type] || Info;
                  const color = typeColors[n.type] || "text-muted-foreground";
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.read) markAsRead(n.id);
                        if (n.link && onNavigate) { onNavigate(n.link); setOpen(false); }
                      }}
                      className={`p-3 flex gap-2.5 hover:bg-secondary/20 transition-colors cursor-pointer ${n.read ? "" : "bg-primary/5"}`}
                    >
                      <div className={`w-7 h-7 rounded-lg bg-secondary/60 flex items-center justify-center ${color} flex-shrink-0 mt-0.5`}>
                        <Icon size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-xs font-medium">{n.title}</p>
                        <p className="text-muted-foreground text-[10px] mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-muted-foreground text-[9px] mt-0.5">{timeAgo(n.created_at)}</p>
                      </div>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
