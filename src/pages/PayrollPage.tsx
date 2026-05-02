import { motion } from "framer-motion";
import { useState } from "react";
import { DollarSign, Download, FileText, TrendingUp, Users, Calculator, CreditCard, ArrowUpRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExportMenu from "@/components/ui/ExportMenu";
import { usePermissions } from "@/hooks/usePermissions";

const tabs = ["Overview", "Salary Slips", "Structure"] as const;

const payrollSummary = [
  { label: "Total Payroll", value: "$186,400", icon: DollarSign, color: "text-primary", change: "+3.2%" },
  { label: "Avg. Salary", value: "$4,660", icon: Calculator, color: "text-chart-green", change: "+1.5%" },
  { label: "Bonuses Paid", value: "$12,800", icon: CreditCard, color: "text-chart-orange", change: "+8.0%" },
  { label: "Employees Paid", value: "40/42", icon: Users, color: "text-chart-blue", change: "" },
];

const salarySlips = [
  { month: "February 2026", gross: 4500, deductions: 675, net: 3825, status: "Processed" },
  { month: "January 2026", gross: 4500, deductions: 675, net: 3825, status: "Processed" },
  { month: "December 2025", gross: 4500, deductions: 675, net: 3825, status: "Processed" },
  { month: "November 2025", gross: 5250, deductions: 787, net: 4463, status: "Processed" },
  { month: "October 2025", gross: 4500, deductions: 675, net: 3825, status: "Processed" },
];

const salaryComponents = [
  { component: "Basic Salary", amount: 2700, pct: 60 },
  { component: "House Rent Allowance", amount: 900, pct: 20 },
  { component: "Transport Allowance", amount: 225, pct: 5 },
  { component: "Special Allowance", amount: 450, pct: 10 },
  { component: "Medical", amount: 225, pct: 5 },
];

const deductions = [
  { component: "Income Tax", amount: 450 },
  { component: "Social Security", amount: 135 },
  { component: "Health Insurance", amount: 90 },
];

const PayrollPage = () => {
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const { toast } = useToast();
  const { canManagePayroll } = usePermissions();

  const getExportData = () => salarySlips.map(s => ({
    Month: s.month, Gross: s.gross, Deductions: s.deductions, Net: s.net, Status: s.status,
  }));

  const downloadSlip = async (month: string, net: number) => {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("FLUX TECHNOLOGIES INC.", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("SALARY SLIP", 105, 28, { align: "center" });
    doc.setDrawColor(200);
    doc.line(20, 32, 190, 32);

    // Employee details
    doc.setFontSize(10);
    doc.text(`Period: ${month}`, 20, 42);
    doc.text("Employee: Henry Carter", 20, 48);
    doc.text("Employee ID: EMP-001", 20, 54);
    doc.text("Department: Designers", 120, 42);
    doc.text("Designation: UX/UI Designer", 120, 48);

    // Earnings table
    autoTable(doc, {
      startY: 62,
      head: [["Earnings", "Amount ($)"]],
      body: salaryComponents.map(c => [c.component, c.amount.toLocaleString()]),
      foot: [["Total Earnings", salaryComponents.reduce((a, b) => a + b.amount, 0).toLocaleString()]],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [43, 43, 43] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
    });

    // Deductions table
    const finalY = (doc as any).lastAutoTable.finalY + 8;
    autoTable(doc, {
      startY: finalY,
      head: [["Deductions", "Amount ($)"]],
      body: deductions.map(c => [c.component, c.amount.toLocaleString()]),
      foot: [["Total Deductions", deductions.reduce((a, b) => a + b.amount, 0).toLocaleString()]],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [180, 50, 50] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
    });

    // Net salary
    const finalY2 = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Net Salary: $${net.toLocaleString()}.00`, 105, finalY2, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Confidential`, 105, finalY2 + 12, { align: "center" });

    doc.save(`salary_slip_${month.replace(/\s/g, "_").toLowerCase()}.pdf`);
    toast({ title: "Downloaded!", description: `PDF salary slip for ${month}.` });
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 pb-20 lg:pb-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Payroll</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Salary management, slips, and compensation.</p>
          </div>
          {canManagePayroll && <ExportMenu data={getExportData()} filename={`payroll_export_${new Date().toISOString().split("T")[0]}`} label="Export Payroll" />}
        </div>

        <div className="flex gap-1 bg-card/60 p-1 rounded-full w-fit backdrop-blur-sm border border-border/30">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`nav-pill relative whitespace-nowrap ${activeTab === tab ? "" : "text-muted-foreground hover:text-foreground"}`}>
              {activeTab === tab && <motion.div layoutId="payrollTab" className="absolute inset-0 rounded-full" style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.25)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className={`relative z-10 ${activeTab === tab ? "text-primary font-semibold" : ""}`}>{tab}</span>
            </button>
          ))}
        </div>

        {activeTab === "Overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {payrollSummary.map(({ label, value, icon: Icon, color, change }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card-hover p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center ${color}`}><Icon size={16} /></div>
                    {change && <span className="text-chart-green text-xs font-semibold flex items-center gap-0.5"><ArrowUpRight size={10} />{change}</span>}
                  </div>
                  <span className="text-xl font-bold text-foreground">{value}</span>
                  <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
                </motion.div>
              ))}
            </div>
            <div className="glass-card p-5">
              <span className="section-title">Monthly Payroll Trend</span>
              <div className="flex items-end gap-3 mt-5 h-32">
                {[172, 178, 180, 183, 186, 190].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div className="w-full rounded-t-md bg-gradient-to-t from-primary/40 to-primary" initial={{ height: 0 }} animate={{ height: `${(val / 200) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.08 }} />
                    <span className="text-muted-foreground text-[10px]">{["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Salary Slips" && (
          <div className="space-y-3">
            {salarySlips.map((slip, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-hover p-5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center text-primary flex-shrink-0"><FileText size={18} /></div>
                  <div>
                    <h3 className="text-foreground font-semibold text-sm">{slip.month}</h3>
                    <p className="text-muted-foreground text-xs">Gross: ${slip.gross.toLocaleString()} · Deductions: ${slip.deductions.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-foreground font-bold">${slip.net.toLocaleString()}</span>
                    <p className="text-chart-green text-[10px] font-semibold">{slip.status}</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => downloadSlip(slip.month, slip.net)} className="icon-button w-8 h-8"><Download size={14} /></motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "Structure" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5">
              <span className="section-title">Earnings</span>
              <div className="space-y-3 mt-4">
                {salaryComponents.map(({ component, amount, pct }, i) => (
                  <motion.div key={component} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-center justify-between mb-1"><span className="text-foreground text-sm">{component}</span><span className="text-foreground text-sm font-bold">${amount.toLocaleString()}</span></div>
                    <div className="metric-bar"><motion.div className="metric-bar-fill bg-chart-green" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.08 }} /></div>
                  </motion.div>
                ))}
                <div className="pt-3 border-t border-border/30 flex justify-between">
                  <span className="text-foreground font-semibold text-sm">Total Earnings</span>
                  <span className="text-foreground font-bold">${salaryComponents.reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="glass-card p-5">
              <span className="section-title">Deductions</span>
              <div className="space-y-3 mt-4">
                {deductions.map(({ component, amount }, i) => (
                  <motion.div key={component} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                    <span className="text-foreground text-sm">{component}</span>
                    <span className="text-chart-red text-sm font-bold">-${amount.toLocaleString()}</span>
                  </motion.div>
                ))}
                <div className="pt-3 border-t border-border/30 flex justify-between">
                  <span className="text-foreground font-semibold text-sm">Total Deductions</span>
                  <span className="text-chart-red font-bold">-${deductions.reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-border/30 flex justify-between">
                  <span className="text-foreground font-bold text-sm">Net Salary</span>
                  <span className="text-primary font-bold text-lg">${(salaryComponents.reduce((a, b) => a + b.amount, 0) - deductions.reduce((a, b) => a + b.amount, 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PayrollPage;
