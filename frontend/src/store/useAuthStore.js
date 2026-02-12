import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { apiService } from '../services/api';

const isEmailVerified = (user) => Boolean(user?.email_confirmed_at || user?.confirmed_at);
const SESSION_HANDOFF_PARAMS = ['access_token', 'refresh_token', 'handoff', 'handoff_code', 'checkout'];

const consumeSessionHandoff = async () => {
  if (typeof window === 'undefined' || !supabase) return null;

  const url = new URL(window.location.href);
  const handoffCode = url.searchParams.get('handoff_code');
  let accessToken = url.searchParams.get('access_token');
  let refreshToken = url.searchParams.get('refresh_token');
  const hadHandoff = !!(handoffCode || accessToken || refreshToken);

  if (handoffCode && (!accessToken || !refreshToken)) {
    try {
      const exchanged = await apiService.exchangeHandoffCode(handoffCode);
      accessToken = exchanged.access_token;
      refreshToken = exchanged.refresh_token;
    } catch (err) {
      console.error('Handoff code exchange failed:', err);
      // Clean up URL params before returning
      for (const param of SESSION_HANDOFF_PARAMS) {
        url.searchParams.delete(param);
      }
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
      return 'Sign-in failed. The login link may have expired — please try signing in again.';
    }
  }

  if (!accessToken || !refreshToken) return null;

  for (const param of SESSION_HANDOFF_PARAMS) {
    url.searchParams.delete(param);
  }
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) {
    console.error('Session handoff failed:', error);
    return 'Sign-in failed. Please try signing in again.';
  }
  return null;
};

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  profile: null,
  entitlements: null,
  loading: true,
  initialized: false,
  authError: null,

  initialize: async () => {
    if (!supabase) {
      set({ loading: false, initialized: true });
      return;
    }

    try {
      const handoffError = await consumeSessionHandoff();
      if (handoffError) {
        set({ authError: handoffError });
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        if (!isEmailVerified(session.user)) {
          await supabase.auth.signOut();
          set({ user: null, session: null, profile: null, entitlements: null,
            authError: 'Please verify your email before signing in.' });
          return;
        }
        set({ user: session.user, session, authError: null });
        await get().fetchProfile(session.user.id);
      }
    } catch (err) {
      console.error('Auth initialization failed:', err);
      set({ authError: 'Something went wrong during sign-in. Please try again.' });
    } finally {
      set({ loading: false, initialized: true });
    }

    // Listen for auth state changes (sign-in, sign-out, token refresh).
    // Skip INITIAL_SESSION since initialize() already handled it above.
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') return;

      if (session?.user && !isEmailVerified(session.user)) {
        await supabase.auth.signOut();
        set({ user: null, session: null, profile: null, entitlements: null });
        return;
      }
      set({ user: session?.user ?? null, session });
      if (session?.user) {
        await get().fetchProfile(session.user.id);
        await get().refreshEntitlements();
      } else {
        set({ profile: null, entitlements: null });
      }
    });
  },

  fetchProfile: async (userId) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        set({ profile: data });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  },

  refreshEntitlements: async (paperVersion) => {
    if (!supabase) return;
    try {
      const token = await get().getAccessToken();
      if (!token) {
        set({ entitlements: null });
        return;
      }
      const data = await apiService.getEntitlements(paperVersion, token);
      set({ entitlements: data });
    } catch (err) {
      console.error('Failed to fetch entitlements:', err);
    }
  },

  getAccessToken: async () => {
    if (!supabase) return null;
    const stateSession = get().session;
    if (stateSession?.access_token) return stateSession.access_token;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  },

  getTier: () => {
    const entitlements = get().entitlements;
    if (entitlements?.tier) return entitlements.tier;
    const profile = get().profile;
    return profile?.subscription_tier || 'free';
  },

  getBuildsUsed: () => {
    const profile = get().profile;
    return profile?.builds_used_this_period || 0;
  },

  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null, entitlements: null });
  },
}));

export default useAuthStore;
