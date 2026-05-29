import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Plus, Heart, MessageCircle, Share2, Pin, Eye, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ModalPortal from "@/components/ui/modal-portal";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { useAiActionFocus } from "@/hooks/useAiActionFocus";

interface Announcement {
  id: string; title: string; content: string; author: string; authorInitials: string;
  date: string; pinned: boolean; likes: number; comments: number; views: number;
  category: string; liked: boolean; commentsList: { author: string; text: string; time: string }[];
}

const initialAnnouncements: Announcement[] = [
  { id: "1", title: "Q1 2026 Company Goals", content: "We're excited to share our quarterly objectives. Focus areas include expanding our client base by 25%, launching the new product line, and improving employee satisfaction scores.", author: "Sarah Kim", authorInitials: "SK", date: "Feb 24, 2026", pinned: true, likes: 42, comments: 15, views: 180, category: "Company", liked: false, commentsList: [{ author: "Henry Carter", text: "Exciting goals! Let's crush it.", time: "2h ago" }] },
  { id: "2", title: "Office Renovation Update", content: "The 3rd floor renovation is on track for completion by March 15th.", author: "Mike Chen", authorInitials: "MC", date: "Feb 22, 2026", pinned: false, likes: 28, comments: 8, views: 145, category: "Facilities", liked: false, commentsList: [] },
  { id: "3", title: "New Health Benefits Package", content: "Starting March 1st, we're introducing an enhanced health benefits package.", author: "Lisa Wong", authorInitials: "LW", date: "Feb 20, 2026", pinned: true, likes: 56, comments: 22, views: 210, category: "HR", liked: false, commentsList: [] },
  { id: "4", title: "Team Building Event - March 5th", content: "Join us for our quarterly team building event!", author: "Ava Collins", authorInitials: "AC", date: "Feb 18, 2026", pinned: false, likes: 35, comments: 12, views: 165, category: "Events", liked: false, commentsList: [] },
];

const categories = ["All", "Company", "HR", "Events", "Facilities", "Recognition"] as const;
const categoryColors: Record<string, string> = {
  Company: "text-primary bg-primary/10", HR: "text-chart-green bg-chart-green/10",
  Events: "text-chart-blue bg-chart-blue/10", Facilities: "text-chart-orange bg-chart-orange/10",
  Recognition: "text-chart-lime bg-chart-lime/10",
};

const mapAnnouncement = (a: any): Announcement => ({
  id: a.id,
  title: a.title,
  content: a.content,
  author: a.author || "Team",
  authorInitials: a.author_initials || "AI",
  date: a.created_at ? new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Just now",
  pinned: Boolean(a.pinned),
  likes: a.likes || 0,
  comments: a.comments || 0,
  views: a.views || 0,
  category: a.category || "Company",
  liked: false,
  commentsList: [],
});

const AnnouncementsPage = () => {
  const [filter, setFilter] = useState("All");
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "Company" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { canCreateAnnouncement } = usePermissions();

  const fetchAnnouncements = useCallback(async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if (data) setAnnouncements(data.map(mapAnnouncement));
  }, []);
  const aiFocus = useAiActionFocus("announcements", fetchAnnouncements);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel('announcements-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
      fetchAnnouncements();
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAnnouncements]);

  const filtered = filter === "All" ? announcements : announcements.filter(a => a.category === filter);
  const pinned = filtered.filter(a => a.pinned);
  const regular = filtered.filter(a => !a.pinned);

  const toggleLike = async (id: string) => {
    const ann = announcements.find(a => a.id === id);
    if (!ann) return;
    const newLikes = ann.liked ? ann.likes - 1 : ann.likes + 1;
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, liked: !a.liked, likes: newLikes } : a));
    await supabase.from("announcements").update({ likes: newLikes }).eq("id", id);
  };

  const addComment = (id: string) => {
    if (!newComment.trim()) return;
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, comments: a.comments + 1, commentsList: [...a.commentsList, { author: "You", text: newComment, time: "Just now" }] } : a));
    setNewComment("");
    toast({ title: "Comment added!" });
  };

  const shareAnnouncement = (title: string) => {
    navigator.clipboard.writeText(`Check out: ${title}`);
    toast({ title: "Link Copied!" });
  };

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) { toast({ title: "Error", description: "Title and content required", variant: "destructive" }); return; }
    setSaving(true);
    const { data, error } = await supabase.from("announcements").insert({ title: newPost.title, content: newPost.content, category: newPost.category, author: "You", author_initials: "YO" }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else {
      setAnnouncements(prev => [mapAnnouncement(data), ...prev]);
      setNewPostOpen(false);
      setNewPost({ title: "", content: "", category: "Company" });
      toast({ title: "Post Created!" });
    }
    setSaving(false);
  };

  const commentAnnouncement = announcements.find(x => x.id === commentingOn);

  return (
    <div className="flex-1 overflow-y-auto p-2 pb-20 lg:pb-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Announcements</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Stay updated with company news.</p>
          </div>
          {canCreateAnnouncement && (
            <button onClick={() => setNewPostOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98]">
              <Plus size={14} /> New Post
            </button>
          )}
        </div>

        <div className="flex gap-1 bg-card/60 p-1 rounded-full w-fit backdrop-blur-sm border border-border/30 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} className={`nav-pill relative whitespace-nowrap ${filter === cat ? "" : "text-muted-foreground hover:text-foreground"}`}>
              {filter === cat && <motion.div layoutId="annFilter" className="absolute inset-0 rounded-full" style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.25)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className={`relative z-10 ${filter === cat ? "text-primary font-semibold" : ""}`}>{cat}</span>
            </button>
          ))}
        </div>

        {pinned.length > 0 && (
          <div className="space-y-3">
            <span className="section-title flex items-center gap-1.5"><Pin size={12} />Pinned</span>
            {pinned.map((a, i) => <AnnouncementCard key={a.id} announcement={a} index={i} focused={aiFocus.isFocused(a.id)} onLike={toggleLike} onComment={setCommentingOn} onShare={shareAnnouncement} />)}
          </div>
        )}
        <div className="space-y-3">
          {pinned.length > 0 && <span className="section-title">Recent</span>}
          {regular.map((a, i) => <AnnouncementCard key={a.id} announcement={a} index={i} focused={aiFocus.isFocused(a.id)} onLike={toggleLike} onComment={setCommentingOn} onShare={shareAnnouncement} />)}
        </div>
      </motion.div>

      <ModalPortal open={!!commentingOn} onClose={() => setCommentingOn(null)} title="Comments">
        {commentAnnouncement && (
          <>
            <div className="max-h-60 overflow-y-auto space-y-3">
              {commentAnnouncement.commentsList.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">{c.author[0]}</div>
                  <div><p className="text-foreground text-sm"><span className="font-semibold">{c.author}</span> <span className="text-muted-foreground text-xs">{c.time}</span></p><p className="text-muted-foreground text-sm">{c.text}</p></div>
                </div>
              ))}
              {commentAnnouncement.commentsList.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No comments yet.</p>}
            </div>
            <div className="flex gap-2">
              <input value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === "Enter" && commentingOn && addComment(commentingOn)} placeholder="Write a comment..." className="flex-1 glass-input" />
              <button onClick={() => commentingOn && addComment(commentingOn)} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Post</button>
            </div>
          </>
        )}
      </ModalPortal>

      <ModalPortal open={newPostOpen} onClose={() => setNewPostOpen(false)} title="New Announcement">
        <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Title *</label><input value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} className="glass-input" /></div>
        <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Content *</label><textarea value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} className="glass-input resize-none h-24" /></div>
        <div><label className="text-muted-foreground text-xs font-medium mb-1 block">Category</label><select value={newPost.category} onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))} className="glass-input">{categories.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}</select></div>
        <button onClick={createPost} disabled={saving} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">{saving ? "Publishing..." : "Publish"}</button>
      </ModalPortal>
    </div>
  );
};

const AnnouncementCard = ({ announcement: a, index, focused, onLike, onComment, onShare }: { announcement: Announcement; index: number; focused?: boolean; onLike: (id: string) => void; onComment: (id: string) => void; onShare: (title: string) => void }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className={`glass-card-hover p-5 ${focused ? "ai-focus-ring" : ""}`}>
    <div className="flex items-start gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">{a.authorInitials}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-foreground font-semibold text-sm">{a.author}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[a.category] || "text-muted-foreground bg-secondary"}`}>{a.category}</span>
          {a.pinned && <Pin size={10} className="text-primary" />}
        </div>
        <p className="text-muted-foreground text-xs flex items-center gap-1"><Clock size={10} />{a.date}</p>
      </div>
    </div>
    <h3 className="text-foreground font-semibold mb-1.5">{a.title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{a.content}</p>
    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30 flex-wrap">
      <button onClick={() => onLike(a.id)} className={`flex items-center gap-1.5 text-xs transition-colors ${a.liked ? "text-chart-red" : "text-muted-foreground hover:text-chart-red"}`}>
        <Heart size={14} fill={a.liked ? "currentColor" : "none"} />{a.likes}
      </button>
      <button onClick={() => onComment(a.id)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"><MessageCircle size={14} />{a.comments}</button>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Eye size={14} />{a.views}</span>
      <button onClick={() => onShare(a.title)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"><Share2 size={14} />Share</button>
    </div>
  </motion.div>
);

export default AnnouncementsPage;
