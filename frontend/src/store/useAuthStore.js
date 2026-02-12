import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { apiService } from '../services/api';

const isEmailVerified = (user) => Boolean(user?.email_confirmed_at || user?.confirmed_at);
const SESSION_HANDOFF_PARAMS = ['access_token', 'refresh_token', 'handoff', 'handoff_code', 'checkout'];

const consumeSessionHandoff = async () => {
  if (typeof window === 'undefined' || !supabase) return;

  const url = new URL(window.location.href);
  const handoffCode = url.searchParams.get('handoff_code');
  let accessToken = url.searchParams.get('access_token');
  let refreshToken = url.searchParams.get('refresh_token');

  if (handoffCode && (!accessToken || !refreshToken)) {
    try {
      const exchanged = await apiService.exchangeHandoffCode(handoffCode);
      accessToken = exchanged.access_token;
      refreshToken = exchanged.refresh_token;
    } catch (err) {
      console.error('Handoff code exchange failed:', err);
    }
  }

  if (!accessToken || !refreshToken) return;

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
  }
};

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  profile: null,
  entitlements: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (!supabase) {
      set({ loading: false, initialized: true });
      return;
    }

    try {
      await consumeSessionHandoff();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        if (!isEmailVerified(session.user)) {
          await supabase.auth.signOut();
          set({ user: null, session: null, profile: null, entitlements: null });
          return;
        }
        set({ user: session.user, session });
        await get().fetchProfile(session.user.id);
        await get().refreshEntitlements();
      }
    } catch (err) {
      console.error('Auth initialization failed:', err);
    } finally {
      set({ loading: false, initialized: true });
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
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
      const data = await apiService.getEntitlements(paperVersion);
      set({ entitlements: data });
    } catch (err) {
      console.error('Failed to fetch entitlements:', err);
    }
  },

  getAccessToken: async () => {
    if (!supabase) return null;
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
