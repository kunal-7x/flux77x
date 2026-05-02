import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./hooks/useAuth";
import AIChatbot from "./components/AIChatbot";
import { ThemeProvider } from "./hooks/useTheme";

export const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading, signOut, isGuest, enterGuestMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center premium-glow animate-pulse">
            <span className="text-primary-foreground font-black text-lg">◆</span>
          </div>
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <AuthPage onAuth={() => {}} onGuestEntry={enterGuestMode} />;
  }

  return (
    <>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index onSignOut={signOut} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <AIChatbot />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
