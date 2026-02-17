import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getPlanByProductId, getPlanByPriceId, type PlanTier } from "@/config/plans";

interface SubscriptionState {
  subscribed: boolean;
  status: string | null;
  tier: PlanTier | null;
  productId: string | null;
  priceId: string | null;
  subscriptionEnd: string | null;
  cancelAtPeriodEnd: boolean;
  loading: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionState;
  refreshSubscription: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultSubscription: SubscriptionState = {
  subscribed: false,
  status: null,
  tier: null,
  productId: null,
  priceId: null,
  subscriptionEnd: null,
  cancelAtPeriodEnd: false,
  loading: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultSubscription);

  const refreshSubscription = useCallback(async () => {
    const currentSession = session;
    if (!currentSession?.access_token) {
      setSubscription({ ...defaultSubscription, loading: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: { Authorization: `Bearer ${currentSession.access_token}` },
      });

      if (error) {
        console.error("[Auth] check-subscription error:", error);
        setSubscription({ ...defaultSubscription, loading: false });
        return;
      }

      const tier = data.product_id ? getPlanByProductId(data.product_id) : 
                   data.price_id ? getPlanByPriceId(data.price_id) : null;

      setSubscription({
        subscribed: data.subscribed || false,
        status: data.status || null,
        tier,
        productId: data.product_id || null,
        priceId: data.price_id || null,
        subscriptionEnd: data.subscription_end || null,
        cancelAtPeriodEnd: data.cancel_at_period_end || false,
        loading: false,
      });
    } catch {
      setSubscription({ ...defaultSubscription, loading: false });
    }
  }, [session]);

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => authSub.unsubscribe();
  }, []);

  // Check subscription when session changes
  useEffect(() => {
    if (session) {
      refreshSubscription();
    } else {
      setSubscription({ ...defaultSubscription, loading: false });
    }
  }, [session, refreshSubscription]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(refreshSubscription, 60_000);
    return () => clearInterval(interval);
  }, [session, refreshSubscription]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, subscription, refreshSubscription, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
