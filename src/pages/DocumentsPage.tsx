import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Upload, FileText, Download, Trash2, Search, FolderOpen, Image,
  FileSpreadsheet, File, Grid3X3, List, Filter, X, Eye, Tag,
  HardDrive, Clock, Users, ChevronRight, MoreHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import PageSkeleton from "@/components/ui/PageSkeleton";
import ModalPortal from "@/components/ui/modal-portal";

const categoryIcons: Record<string, typeof FileText> = {
  Document: FileText, Image: Image, Spreadsheet: FileSpreadsheet,
  HR: FileText, Contracts: FileText, Policies: FileText,
  Assets: FolderOpen, Other: File, General: File,
};

const categoryFilters = ["All", "HR Documents", "Contracts", "Policies", "Assets", "Images", "Other"] as const;

interface DocAsset {
  id: string; name: string; file_url: string | null; file_type: string | null;
  file_size: number | null; category: string | null; uploaded_by: string | null;
  created_at: string; tags: string[] | null; description: string | null; folder: string | null;
}

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<DocAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocAsset | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { canCreateEmployee } = usePermissions();

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("document_assets").select("*").order("created_at", { ascending: false });
    if (data) setDocuments(data as DocAsset[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleUpload = async (files: FileList | File[]) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      const filePath = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file);
      if (uploadError) { toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" }); continue; }

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(filePath);
      const category = file.type.includes("image") ? "Images"
        : file.type.includes("spreadsheet") || file.type.includes("excel") ? "Spreadsheet"
        : file.type.includes("pdf") ? "Document" : "Other";

      const { data, error } = await supabase.from("document_assets").insert({
        name: file.name, file_url: urlData.publicUrl, file_type: file.type,
        file_size: file.size, category, uploaded_by: "Current User",
      }).select().single();

      if (!error && data) setDocuments(p => [data as DocAsset, ...p]);
    }
    toast({ title: "Upload complete" });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleUpload(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
  };

  const deleteDoc = async (id: string) => {
    await supabase.from("document_assets").delete().eq("id", id);
    setDocuments(p => p.filter(d => d.id !== id));
    setSelectedDoc(null);
    toast({ title: "Deleted" });
  };

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await supabase.from("document_assets").delete().eq("id", id);
    }
    setDocuments(p => p.filter(d => !selectedIds.has(d.id)));
    setSelectedIds(new Set());
    toast({ title: `${ids.length} files deleted` });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = documents.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== "All" && d.category !== categoryFilter && d.folder !== categoryFilter) return false;
    return true;
  });

  const totalSize = documents.reduce((a, d) => a + (d.file_size || 0), 0);
  const recentCount = documents.filter(d => Date.now() - new Date(d.created_at).getTime() < 7 * 86400000).length;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getFileIcon = (doc: DocAsset) => {
    if (doc.file_type?.includes("image")) return Image;
    if (doc.file_type?.includes("spreadsheet") || doc.file_type?.includes("excel") || doc.file_type?.includes("csv")) return FileSpreadsheet;
    if (doc.file_type?.includes("pdf") || doc.file_type?.includes("document")) return FileText;
    return File;
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="flex-1 overflow-y-auto p-2 pb-20 lg:pb-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Documents & Assets</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Upload, organize, and manage files.</p>
          </div>
          {canCreateEmployee && (
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 active:scale-[0.98]">
              <Upload size={14} /> {uploading ? "Uploading..." : "Upload Files"}
            </button>
          )}
          <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileInput} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Files", value: documents.length, icon: FileText, color: "text-primary" },
            { label: "Storage Used", value: formatSize(totalSize), icon: HardDrive, color: "text-chart-blue" },
            { label: "Recent Uploads", value: recentCount, icon: Clock, color: "text-chart-green" },
            { label: "Categories", value: [...new Set(documents.map(d => d.category))].length, icon: FolderOpen, color: "text-chart-orange" },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card-hover p-4">
              <div className={`w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center ${color} mb-3`}><Icon size={16} /></div>
              <span className="text-xl font-bold text-foreground">{value}</span>
              <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Drag & drop zone */}
        {canCreateEmployee && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${dragOver ? "border-primary bg-primary/5" : "border-border/30 hover:border-border/50"}`}
          >
            <Upload size={24} className={`mx-auto mb-2 ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-muted-foreground text-sm">Drag & drop files here, or <button onClick={() => fileRef.current?.click()} className="text-primary font-medium hover:underline">browse</button></p>
            <p className="text-muted-foreground text-[10px] mt-1">PDF, DOCX, XLSX, Images, and more</p>
          </div>
        )}

        {/* Filters & search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..."
              className="w-full bg-secondary/60 text-foreground text-sm pl-9 pr-4 py-2.5 rounded-xl outline-none border border-border/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50" />
          </div>
          <div className="flex gap-2">
            <div className="flex bg-secondary/40 rounded-xl p-0.5 border border-border/20">
              <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}><List size={14} /></button>
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}><Grid3X3 size={14} /></button>
            </div>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {categoryFilters.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${categoryFilter === cat ? "bg-primary/15 text-primary font-semibold border border-primary/25" : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-transparent"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <span className="text-foreground text-sm font-medium">{selectedIds.size} selected</span>
            <button onClick={bulkDelete} className="text-chart-red text-xs font-medium hover:underline flex items-center gap-1"><Trash2 size={12} /> Delete</button>
            <button onClick={() => setSelectedIds(new Set())} className="text-muted-foreground text-xs ml-auto hover:text-foreground">Clear</button>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="glass-card p-12 text-center">
            <FolderOpen size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">{search ? "No documents match your search." : "No documents uploaded yet."}</p>
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((doc, i) => {
              const Icon = getFileIcon(doc);
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className={`glass-card-hover p-4 flex items-center gap-4 cursor-pointer ${selectedIds.has(doc.id) ? "ring-1 ring-primary/40" : ""}`}
                  onClick={() => setSelectedDoc(doc)}>
                  <input type="checkbox" checked={selectedIds.has(doc.id)}
                    onChange={e => { e.stopPropagation(); toggleSelect(doc.id); }}
                    onClick={e => e.stopPropagation()}
                    className="w-4 h-4 rounded accent-primary flex-shrink-0" />
                  <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center text-primary flex-shrink-0"><Icon size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-semibold truncate">{doc.name}</p>
                    <p className="text-muted-foreground text-xs">{doc.category || "Uncategorized"} · {formatSize(doc.file_size || 0)} · {new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="icon-button w-8 h-8"><Download size={14} /></a>
                    )}
                    <button onClick={() => deleteDoc(doc.id)} className="icon-button w-8 h-8 text-chart-red hover:bg-chart-red/10"><Trash2 size={14} /></button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && filtered.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((doc, i) => {
              const Icon = getFileIcon(doc);
              const isImage = doc.file_type?.includes("image");
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                  onClick={() => setSelectedDoc(doc)}
                  className={`glass-card-hover p-4 cursor-pointer group ${selectedIds.has(doc.id) ? "ring-1 ring-primary/40" : ""}`}>
                  <div className="aspect-square rounded-xl bg-secondary/40 flex items-center justify-center mb-3 overflow-hidden">
                    {isImage && doc.file_url ? (
                      <img src={doc.file_url} alt={doc.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Icon size={32} className="text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-foreground text-sm font-semibold truncate">{doc.name}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">{formatSize(doc.file_size || 0)}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* File Detail Panel */}
      <ModalPortal open={!!selectedDoc} onClose={() => setSelectedDoc(null)} title="File Details" maxWidth="max-w-md">
        {selectedDoc && (
          <div className="space-y-4">
            {/* Preview */}
            <div className="rounded-xl bg-secondary/30 p-4 flex items-center justify-center min-h-[120px]">
              {selectedDoc.file_type?.includes("image") && selectedDoc.file_url ? (
                <img src={selectedDoc.file_url} alt={selectedDoc.name} className="max-h-48 rounded-lg object-contain" />
              ) : selectedDoc.file_type?.includes("pdf") && selectedDoc.file_url ? (
                <iframe src={selectedDoc.file_url} className="w-full h-48 rounded-lg" />
              ) : (
                <File size={48} className="text-muted-foreground" />
              )}
            </div>

            {/* Metadata */}
            <div className="space-y-3">
              <div><span className="text-muted-foreground text-xs">File Name</span><p className="text-foreground text-sm font-medium">{selectedDoc.name}</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground text-xs">Type</span><p className="text-foreground text-sm">{selectedDoc.file_type || "Unknown"}</p></div>
                <div><span className="text-muted-foreground text-xs">Size</span><p className="text-foreground text-sm">{formatSize(selectedDoc.file_size || 0)}</p></div>
                <div><span className="text-muted-foreground text-xs">Category</span><p className="text-foreground text-sm">{selectedDoc.category || "Uncategorized"}</p></div>
                <div><span className="text-muted-foreground text-xs">Uploaded</span><p className="text-foreground text-sm">{new Date(selectedDoc.created_at).toLocaleDateString()}</p></div>
              </div>
              {selectedDoc.uploaded_by && (
                <div><span className="text-muted-foreground text-xs">Uploaded By</span><p className="text-foreground text-sm">{selectedDoc.uploaded_by}</p></div>
              )}
              {selectedDoc.tags && selectedDoc.tags.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-xs">Tags</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {selectedDoc.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {selectedDoc.file_url && (
                <a href={selectedDoc.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold text-center hover:opacity-90">
                  <Download size={14} className="inline mr-1.5" />Download
                </a>
              )}
              <button onClick={() => deleteDoc(selectedDoc.id)}
                className="px-4 py-2.5 rounded-xl bg-chart-red/10 text-chart-red text-sm font-semibold hover:bg-chart-red/20">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </ModalPortal>
    </div>
  );
};

export default DocumentsPage;
