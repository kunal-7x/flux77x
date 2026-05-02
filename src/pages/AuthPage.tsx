import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, LogIn, UserPlus, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthPageProps {
  onAuth: () => void;
  onGuestEntry: () => void;
}

const AuthPage = ({ onAuth, onGuestEntry }: AuthPageProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { username: username.trim() || email.split("@")[0], full_name: username.trim() } },
        });
        if (error) throw error;
        toast({ title: "Welcome!", description: "Account created successfully." });
        onAuth();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "Signed in successfully." });
        onAuth();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/2 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center premium-glow">
              <span className="text-primary-foreground font-black text-xl">◆</span>
            </div>
            <span className="text-foreground font-bold text-4xl tracking-tight">Flux</span>
          </motion.div>
          <p className="text-muted-foreground text-sm">Enterprise HR Management Platform</p>
        </div>

        <div className="apple-glass p-8">
          {/* Tabs */}
          <div className="flex gap-1 bg-secondary/30 p-1 rounded-2xl mb-6 backdrop-blur-sm">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="nav-pill flex-1 relative text-center"
              >
                {mode === m && (
                  <motion.div layoutId="authTab" className="absolute inset-0 bg-foreground/90 rounded-xl backdrop-blur-sm" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span className={`relative z-10 flex items-center justify-center gap-1.5 text-sm font-medium ${mode === m ? "text-background" : "text-muted-foreground"}`}>
                  {m === "login" ? <LogIn size={14} /> : <UserPlus size={14} />}
                  {m === "login" ? "Sign In" : "Sign Up"}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div key="username" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Full Name</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="John Doe"
                    className="glass-input"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="glass-input"
              />
            </div>

            <div>
              <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              type="submit"
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 premium-glow"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight size={14} />
                </>
              )}
            </motion.button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/20" /></div>
            <div className="relative flex justify-center"><span className="bg-card/80 backdrop-blur-sm px-3 text-muted-foreground text-xs">or</span></div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onGuestEntry}
            className="w-full py-3.5 rounded-xl bg-secondary/40 text-foreground text-sm font-medium border border-border/20 hover:bg-secondary/60 hover:border-primary/30 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            <Sparkles size={14} className="text-primary" />
            Continue as Guest
          </motion.button>

          <p className="text-muted-foreground text-[10px] text-center mt-4 opacity-60">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
