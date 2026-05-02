import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, FileSpreadsheet, File } from "lucide-react";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";

interface ExportMenuProps {
  data: Record<string, any>[];
  filename: string;
  label?: string;
}

const ExportMenu = ({ data, filename, label = "Export" }: ExportMenuProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const exportCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${filename}.csv`);
    toast({ title: "Exported!", description: `Downloaded as CSV.` });
    setOpen(false);
  };

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `${filename}.xlsx`);
    toast({ title: "Exported!", description: `Downloaded as Excel.` });
    setOpen(false);
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    const cols = Object.keys(data[0] || {});
    const rows = data.map(row => cols.map(c => String(row[c] ?? "")));
    autoTable(doc, { head: [cols], body: rows, styles: { fontSize: 8 }, headStyles: { fillColor: [43, 43, 43] } });
    doc.save(`${filename}.pdf`);
    toast({ title: "Exported!", description: `Downloaded as PDF.` });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]"
      >
        <Download size={14} /> {label}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[89]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="absolute right-0 top-12 w-48 rounded-xl z-[90] p-1.5 space-y-0.5"
              style={{
                background: "hsl(228 14% 18% / 0.95)",
                backdropFilter: "blur(16px)",
                border: "1px solid hsl(0 0% 100% / 0.08)",
                boxShadow: "0 8px 32px -4px hsl(228 16% 4% / 0.6)"
              }}
            >
              <button onClick={exportCSV} className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary/40 transition-colors">
                <FileText size={14} className="text-chart-green" /> CSV
              </button>
              <button onClick={exportExcel} className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary/40 transition-colors">
                <FileSpreadsheet size={14} className="text-chart-blue" /> Excel (.xlsx)
              </button>
              <button onClick={exportPDF} className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary/40 transition-colors">
                <File size={14} className="text-chart-orange" /> PDF
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportMenu;
