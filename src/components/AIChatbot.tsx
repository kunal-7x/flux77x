import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Maximize2, Minimize2, Bot, User, Loader2, Sparkles, Paperclip, Mic, MicOff, Trash2, Lightbulb, CheckCircle2, XCircle, Volume2, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Papa from "papaparse";
import { queryClient } from "@/App";
import { chatEvents, TABLE_QUERY_KEYS } from "@/lib/chatEvents";
import { AnimatedAvatar } from "./AnimatedAvatar";

type Msg = { role: "user" | "assistant"; content: string; timestamp?: number; actionResults?: any[] };

const isProd = import.meta.env.PROD;
const proxyUrl = typeof window !== 'undefined' ? `${window.location.origin}/supabase-api` : '';
const baseUrl = isProd && proxyUrl ? proxyUrl : import.meta.env.VITE_SUPABASE_URL;
const CHAT_URL = `${baseUrl}/functions/v1/ai-chat`;
const STORAGE_KEY = "flux-ai-chat-history";

const SUGGESTIONS = [
  { icon: "👥", text: "Show all employees", category: "query" },
  { icon: "➕", text: "Add a new employee", category: "action" },
  { icon: "📊", text: "Give me a team summary", category: "query" },
  { icon: "📋", text: "List pending leave requests", category: "query" },
  { icon: "🚀", text: "Create a new project", category: "action" },
  { icon: "📢", text: "Post an announcement", category: "action" },
  { icon: "💼", text: "Open a job position", category: "action" },
  { icon: "🎯", text: "Show project progress", category: "query" },
];

function loadHistory(): Msg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const msgs = JSON.parse(raw); if (msgs.length > 0) return msgs; }
  } catch {}
  return [];
}

function saveHistory(msgs: Msg[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-100))); } catch {}
}

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(loadHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const isDragging = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [chatOrigin, setChatOrigin] = useState({ left: 0, top: 0, transformOrigin: "bottom right" });
  const [isPlaced, setIsPlaced] = useState(false);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Focus input on open
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  // Save history
  useEffect(() => { saveHistory(messages); }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "K") { e.preventDefault(); setOpen(p => !p); }
      if (e.key === "Escape" && open) { if (expanded) setExpanded(false); else setOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, expanded]);

  // Invalidate queries when actions complete
  const handleActionResults = useCallback((results: any[]) => {
    results.forEach(r => {
      if (r.ok && r.table) {
        const keys = TABLE_QUERY_KEYS[r.table] || [r.table];
        keys.forEach(k => queryClient.invalidateQueries({ queryKey: [k] }));
        chatEvents.emit("action", {
          table: r.table,
          op: r.op,
          action: r.action,
          id: r.id || r.record?.id || r.records?.[0]?.id,
          record: r.record,
          records: r.records,
        });
      }
    });
  }, []);

  // Send message
  const send = async (extraContent?: string) => {
    const content = extraContent || input.trim();
    if (!content || loading) return;
    const userMsg: Msg = { role: "user", content, timestamp: Date.now() };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInput("");
    setLoading(true);

    let assistantContent = "";
    let actionResults: any[] = [];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: allMsgs.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.error || `Error ${resp.status}`);
      }
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processLine = (line: string) => {
        if (!line.startsWith("data: ")) return;
        const json = line.slice(6).trim();
        if (json === "[DONE]") return;
        try {
          const parsed = JSON.parse(json);
          // Collect action results
          if (parsed.action_results) {
            actionResults = parsed.action_results;
            return;
          }
          const c = parsed.choices?.[0]?.delta?.content;
          if (c) {
            assistantContent += c;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > allMsgs.length) {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
              }
              return [...prev, { role: "assistant", content: assistantContent, timestamp: Date.now() }];
            });
          }
        } catch {}
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          processLine(line);
        }
      }
      if (buffer.trim()) buffer.split("\n").forEach(processLine);

      if (!assistantContent) {
        setMessages(prev => [...prev, { role: "assistant", content: "I received your message but couldn't generate a response. Please try again.", timestamp: Date.now() }]);
      }

      // Handle action results - invalidate caches
      if (actionResults.length > 0) {
        handleActionResults(actionResults);
        // Update the last message to include action results
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, actionResults } : m);
          }
          return prev;
        });
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${err.message || "Something went wrong."}`, timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  // Voice input
  const toggleVoice = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice input is not supported in this browser. Use Chrome or Edge."); return; }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      setInput(transcript);
      if (e.results[0]?.isFinal) {
        setRecording(false);
        // Auto-send after final result
        setTimeout(() => {
          if (transcript.trim()) send(transcript.trim());
        }, 300);
      }
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  // File upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.includes("csv") || file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (results) => {
          const preview = results.data.slice(0, 5);
          send(`I've uploaded a CSV file "${file.name}" with ${results.data.length} rows. Preview:\n\`\`\`json\n${JSON.stringify(preview, null, 2)}\n\`\`\`\nPlease analyze this data.`);
        },
      });
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const XLSX = await import("xlsx");
      const reader = new FileReader();
      reader.onload = (ev) => {
        const wb = XLSX.read(ev.target?.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        const preview = data.slice(0, 5);
        send(`I've uploaded an Excel file "${file.name}" with ${data.length} rows. Preview:\n\`\`\`json\n${JSON.stringify(preview, null, 2)}\n\`\`\`\nPlease analyze this data.`);
      };
      reader.readAsArrayBuffer(file);
    } else {
      send(`I've uploaded a file: "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Please help me with this file.`);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const chatSize = expanded
    ? "fixed inset-0 z-[100]"
    : "fixed w-[420px] h-[600px] z-[100] rounded-3xl";

  const hasActions = messages.some(m => m.actionResults && m.actionResults.length > 0);

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        ref={buttonRef}
        drag
        dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 80, bottom: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={() => { setTimeout(() => { isDragging.current = false; setIsPlaced(true); }, 150); }}
        animate={{ scale: open ? 0 : 1 }}
        whileHover={!open ? { scale: 1.05 } : undefined}
        whileTap={!open ? { scale: 0.95 } : undefined}
        onClick={() => {
          if (isDragging.current || open) return;
          if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const isLeft = rect.left < window.innerWidth / 2;
            const isTop = rect.top < window.innerHeight / 2;
            
            let left = isLeft ? rect.left : rect.right - 420;
            let top = isTop ? rect.bottom + 10 : rect.top - 600 - 10;
            
            left = Math.max(10, Math.min(left, window.innerWidth - 430));
            top = Math.max(10, Math.min(top, window.innerHeight - 610));
            
            setChatOrigin({
               left, top,
               transformOrigin: `${isLeft ? 'left' : 'right'} ${isTop ? 'top' : 'bottom'}`
            });
            setIsPlaced(true);
          }
          setOpen(true);
        }}
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-[100] w-20 h-20 rounded-full bg-transparent text-primary-foreground flex items-center justify-center cursor-grab active:cursor-grabbing p-0 overflow-visible border-none"
        style={{ 
          filter: "drop-shadow(0 10px 15px hsl(var(--primary) / 0.2))",
          pointerEvents: open ? "none" : "auto"
        }}
        title="Open Flux AI (Ctrl+Shift+K)"
      >
        <AnimatedAvatar size={80} className="pointer-events-none" />
        {/* Notification dot if there were recent actions */}
        {hasActions && <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-chart-green animate-pulse z-10 shadow-sm" />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <>
            {expanded && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[99]" onClick={() => setExpanded(false)} />
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`${chatSize} ${expanded ? "bg-background" : "glass-card"} flex flex-col overflow-hidden shadow-2xl`}
              style={expanded ? {} : { 
                boxShadow: "0 25px 80px -12px hsl(var(--primary) / 0.2)",
                left: isPlaced ? chatOrigin.left : undefined,
                top: isPlaced ? chatOrigin.top : undefined,
                bottom: isPlaced ? undefined : "24px",
                right: isPlaced ? undefined : "24px",
                transformOrigin: isPlaced ? chatOrigin.transformOrigin : "bottom right"
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center relative">
                    <Bot size={18} className="text-primary" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-chart-green border-2 border-card" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold text-sm">Flux AI Co-Pilot</h3>
                    <p className="text-muted-foreground text-[10px]">Full CRUD • Real-time • Voice enabled</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={clearHistory} className="icon-button w-8 h-8" title="New chat"><Plus size={14} /></button>
                  <button onClick={() => setExpanded(!expanded)} className="icon-button w-8 h-8" title={expanded ? "Minimize" : "Expand"}>
                    {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                  <button onClick={() => { setOpen(false); setExpanded(false); }} className="icon-button w-8 h-8" title="Close (Esc)">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
               {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-2 text-center space-y-6 mt-8 mb-8">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg mx-auto">
                      <Sparkles size={28} className="text-primary" />
                    </motion.div>
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                      <h2 className="text-xl font-bold text-foreground">How can I help you today?</h2>
                      <p className="text-sm text-muted-foreground mt-2 max-w-[280px] mx-auto">Ask a question or give a command to manage employees, projects, and more.</p>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-lg mt-4 mx-auto">
                      {SUGGESTIONS.slice(0, 6).map((s, i) => (
                        <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + (i * 0.05) }}
                          onClick={() => send(s.text)}
                          className="text-left p-3 rounded-xl bg-secondary/40 hover:bg-secondary/80 border border-border/30 hover:border-primary/40 transition-all flex items-start gap-3"
                        >
                          <span className="text-lg leading-none">{s.icon}</span>
                          <span className="text-xs text-muted-foreground font-medium">{s.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
               ) : (
               <div className={`space-y-4 ${expanded ? "max-w-3xl mx-auto" : ""}`}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      msg.role === "assistant" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      {msg.role === "assistant" ? <Bot size={14} /> : <User size={14} />}
                    </div>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary/60 text-foreground rounded-bl-md"}`}>
                      {msg.role === "assistant" ? (
                        <div className="ai-msg-md">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      ) : msg.content}

                      {/* Action result badges */}
                      {msg.actionResults && msg.actionResults.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/20">
                          {msg.actionResults.map((r: any, j: number) => (
                            <span key={j} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              r.ok ? "bg-chart-green/10 text-chart-green" : "bg-chart-red/10 text-chart-red"}`}>
                              {r.ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                              {r.action?.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Bot size={14} /></div>
                    <div className="bg-secondary/60 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-muted-foreground text-xs">Thinking...</span>
                    </div>
                  </motion.div>
                )}
               </div>
               )}
              </div>

              {/* Input area */}
              <div className={`p-3 border-t border-border/30 ${expanded ? "" : ""}`}>
               <div className={`${expanded ? "max-w-3xl mx-auto" : ""}`}>
                <div className="flex gap-2 items-end">
                  <button onClick={() => fileRef.current?.click()} className="icon-button w-9 h-9 flex-shrink-0" title="Upload file">
                    <Paperclip size={15} />
                  </button>
                  <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileUpload} />

                  <button onClick={toggleVoice}
                    className={`icon-button w-9 h-9 flex-shrink-0 transition-all ${recording ? "bg-chart-red/20 text-chart-red ring-2 ring-chart-red/30" : ""}`}
                    title={recording ? "Stop recording" : "Voice input"}>
                    {recording ? (
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                        <MicOff size={15} />
                      </motion.div>
                    ) : <Mic size={15} />}
                  </button>

                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={recording ? "🎤 Listening..." : "Ask anything or give a command..."}
                    rows={1}
                    className="flex-1 bg-secondary/60 text-foreground text-sm px-4 py-2.5 rounded-xl outline-none border border-border/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 resize-none max-h-[120px] min-h-[40px]"
                    disabled={loading || recording}
                    style={{ height: "40px" }}
                  />

                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => send()} disabled={loading || !input.trim()}
                    className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-opacity flex-shrink-0"
                    title="Send (Enter)">
                    <Send size={15} />
                  </motion.button>
                </div>
                <div className="flex items-center justify-between mt-1.5 px-1">
                  <span className="text-muted-foreground/40 text-[9px]">Shift+Enter for new line • Ctrl+Shift+K to toggle</span>
                  {recording && <span className="text-chart-red text-[10px] font-semibold animate-pulse flex items-center gap-1"><Volume2 size={10} /> Recording...</span>}
                </div>
               </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
