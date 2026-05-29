import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import { Clock, LogIn, LogOut, MapPin, Calendar, CheckCircle2, X, ChevronLeft, ChevronRight } from "lucide-react";
import ModalPortal from "@/components/ui/modal-portal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAiActionFocus } from "@/hooks/useAiActionFocus";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type AttendanceStatus = "present" | "absent" | "half-day" | "leave" | "weekend" | "holiday" | "wfh";

const statusColors: Record<AttendanceStatus, string> = {
  present: "bg-chart-green", absent: "bg-chart-red", "half-day": "bg-chart-orange",
  leave: "bg-chart-blue", weekend: "bg-secondary/30", holiday: "bg-primary/40", wfh: "bg-chart-lime",
};

const statusLabels: Record<AttendanceStatus, string> = {
  present: "Present", absent: "Absent", "half-day": "Half Day",
  leave: "On Leave", weekend: "Weekend", holiday: "Holiday", wfh: "Work from Home",
};

const generateCalendar = (year: number, month: number): { day: number; status: AttendanceStatus; checkIn: string; checkOut: string }[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: { day: number; status: AttendanceStatus; checkIn: string; checkOut: string }[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      days.push({ day: i, status: "weekend", checkIn: "", checkOut: "" });
    } else {
      const statuses: AttendanceStatus[] = ["present", "present", "present", "present", "wfh", "present", "half-day", "leave", "absent"];
      const s = statuses[i % statuses.length] || "present";
      const cin = s === "present" || s === "wfh" ? "09:0" + (i % 3) + " AM" : s === "half-day" ? "09:15 AM" : "";
      const cout = s === "present" || s === "wfh" ? "06:0" + (i % 4) + " PM" : s === "half-day" ? "01:00 PM" : "";
      days.push({ day: i, status: s, checkIn: cin, checkOut: cout });
    }
  }
  return days;
};

const summaryStats = [
  { label: "Present", value: 18, total: 20, icon: CheckCircle2, color: "text-chart-green" },
  { label: "Absent", value: 1, total: 20, icon: Clock, color: "text-chart-red" },
  { label: "WFH", value: 3, total: 20, icon: MapPin, color: "text-chart-lime" },
  { label: "On Leave", value: 2, total: 20, icon: Calendar, color: "text-chart-blue" },
];

const workHoursWeek = [
  { day: "Mon", hours: 8.2 }, { day: "Tue", hours: 7.8 }, { day: "Wed", hours: 9.1 },
  { day: "Thu", hours: 7.5 }, { day: "Fri", hours: 6.9 },
];

const AttendancePage = () => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(1); // Feb 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState<{ day: number; status: AttendanceStatus; checkIn: string; checkOut: string } | null>(null);
  const { toast } = useToast();

  const handleAiAttendance = useCallback((payload: any) => {
    const record = payload.record;
    if (!record?.check_in) return;
    if (record.check_out) {
      setCheckedIn(false);
      setCheckInTime(null);
      return;
    }
    setCheckedIn(true);
    setCheckInTime(new Date(record.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, []);
  useAiActionFocus("attendance_records", handleAiAttendance);

  const calendarDays = generateCalendar(currentYear, currentMonth);
  const firstDayOffset = new Date(currentYear, currentMonth, 1).getDay();
  const offsetCells = firstDayOffset === 0 ? 6 : firstDayOffset - 1;
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const handleCheckIn = async () => {
    const now = new Date();
    setCheckInTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setCheckedIn(true);
    // Persist to DB
    try {
      const { data: emps } = await supabase.from("employees").select("id").limit(1);
      if (emps?.[0]) {
        await supabase.from("attendance_records").insert({
          employee_id: emps[0].id,
          check_in: now.toISOString(),
          status: "present",
          location: "Office",
        });
      }
    } catch {}
    toast({ title: "Checked In!", description: `You checked in at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` });
  };

  const handleCheckOut = async () => {
    setCheckedIn(false);
    setCheckInTime(null);
    try {
      const now = new Date();
      const { data: records } = await supabase.from("attendance_records").select("id").order("created_at", { ascending: false }).limit(1);
      if (records?.[0]) {
        await supabase.from("attendance_records").update({ check_out: now.toISOString() }).eq("id", records[0].id);
      }
    } catch {}
    toast({ title: "Checked Out!", description: "Have a great day!" });
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 pb-20 lg:pb-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Attendance</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Track check-ins, work hours, and attendance records.</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={checkedIn ? handleCheckOut : handleCheckIn}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
              checkedIn ? "bg-chart-red/10 text-chart-red border border-chart-red/20 hover:bg-chart-red/20"
                : "bg-chart-green/10 text-chart-green border border-chart-green/20 hover:bg-chart-green/20"
            }`}>
            {checkedIn ? <LogOut size={18} /> : <LogIn size={18} />}
            {checkedIn ? "Check Out" : "Check In"}
            {checkInTime && <span className="text-xs opacity-70 ml-1">since {checkInTime}</span>}
          </motion.button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryStats.map(({ label, value, total, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card-hover p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center ${color}`}><Icon size={16} /></div>
                <span className="text-foreground text-lg font-bold">{value}<span className="text-muted-foreground text-xs">/{total}</span></span>
              </div>
              <p className="text-muted-foreground text-xs">{label}</p>
              <div className="metric-bar mt-2">
                <motion.div className={`metric-bar-fill ${statusColors[label.toLowerCase().replace(" ", "-") as AttendanceStatus] || "bg-primary"}`} initial={{ width: 0 }} animate={{ width: `${(value / total) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar */}
          <div className="glass-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <span className="section-title">{monthName}</span>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="icon-button w-8 h-8"><ChevronLeft size={14} /></button>
                <button onClick={nextMonth} className="icon-button w-8 h-8"><ChevronRight size={14} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(d => <div key={d} className="text-center text-muted-foreground text-[10px] font-semibold uppercase py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: offsetCells }).map((_, i) => <div key={`empty-${i}`} />)}
              {calendarDays.map((item, i) => (
                <motion.button
                  key={item.day}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.008 }}
                  onClick={() => setSelectedDay(item)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all active:scale-95 ${
                    item.status === "weekend" ? "bg-secondary/20 text-muted-foreground/50" : "bg-secondary/40 text-foreground hover:bg-secondary/60"
                  }`}>
                  <span className="font-medium">{item.day}</span>
                  {item.status !== "weekend" && <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${statusColors[item.status]}`} />}
                </motion.button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border/30">
              {Object.entries(statusColors).filter(([k]) => k !== "weekend").map(([key, color]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-muted-foreground text-[10px] capitalize">{key.replace("-", " ")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Work Hours */}
          <div className="glass-card p-5">
            <span className="section-title">This Week's Hours</span>
            <div className="space-y-3 mt-4">
              {workHoursWeek.map(({ day, hours }, i) => (
                <motion.div key={day} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs w-8">{day}</span>
                  <div className="flex-1 metric-bar h-3 rounded-full">
                    <motion.div className={`metric-bar-fill rounded-full ${hours >= 8 ? "bg-chart-green" : hours >= 7 ? "bg-primary" : "bg-chart-orange"}`} initial={{ width: 0 }} animate={{ width: `${(hours / 10) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.1 }} />
                  </div>
                  <span className="text-foreground text-sm font-bold w-10 text-right">{hours}h</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-border/30 space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground text-xs">Total</span><span className="text-foreground font-bold text-sm">{workHoursWeek.reduce((a, b) => a + b.hours, 0).toFixed(1)}h</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-xs">Avg/Day</span><span className="text-foreground font-bold text-sm">{(workHoursWeek.reduce((a, b) => a + b.hours, 0) / 5).toFixed(1)}h</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-xs">Overtime</span><span className="text-chart-orange font-bold text-sm">1.1h</span></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Day detail modal */}
      <ModalPortal open={!!selectedDay} onClose={() => setSelectedDay(null)} title={selectedDay ? `${monthName.split(" ")[0]} ${selectedDay.day}, ${currentYear}` : ""}>
        {selectedDay && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${statusColors[selectedDay.status]}`} />
              <span className="text-foreground font-semibold">{statusLabels[selectedDay.status]}</span>
            </div>
            {selectedDay.checkIn && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-secondary/30">
                  <span className="text-muted-foreground text-xs">Check In</span>
                  <p className="text-foreground font-bold text-lg">{selectedDay.checkIn}</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30">
                  <span className="text-muted-foreground text-xs">Check Out</span>
                  <p className="text-foreground font-bold text-lg">{selectedDay.checkOut || "—"}</p>
                </div>
              </div>
            )}
            {selectedDay.status === "weekend" && (
              <p className="text-muted-foreground text-sm text-center py-4">No attendance record for weekends.</p>
            )}
            {(selectedDay.status === "leave" || selectedDay.status === "absent") && (
              <p className="text-muted-foreground text-sm text-center py-4">
                {selectedDay.status === "leave" ? "Employee was on approved leave." : "Employee was absent."}
              </p>
            )}
          </div>
        )}
      </ModalPortal>
    </div>
  );
};

export default AttendancePage;
