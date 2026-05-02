import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if guest mode was previously set
    const guestMode = sessionStorage.getItem("flux_guest_mode");
    if (guestMode === "true") {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const enterGuestMode = useCallback(() => {
    sessionStorage.setItem("flux_guest_mode", "true");
    setIsGuest(true);
  }, []);

  const signOut = useCallback(async () => {
    const guestMode = sessionStorage.getItem("flux_guest_mode");
    if (guestMode === "true") {
      sessionStorage.removeItem("flux_guest_mode");
      setIsGuest(false);
      setUser(null);
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  }, []);

  return { user, session, loading, signOut, isGuest, enterGuestMode };
}
