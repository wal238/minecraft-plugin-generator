import { create } from 'zustand';
import { supabase } from '../services/supabase';

const isEmailVerified = (user) => Boolean(user?.email_confirmed_at || user?.confirmed_at);
const SESSION_HANDOFF_PARAMS = ['access_token', 'refresh_token', 'handoff'];

const consumeSessionHandoff = async () => {
  if (typeof window === 'undefined' || !supabase) return;

  const url = new URL(window.location.href);
  const accessToken = url.searchParams.get('access_token');
  const refreshToken = url.searchParams.get('refresh_token');
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
          set({ user: null, session: null, profile: null });
          return;
        }
        set({ user: session.user, session });
        await get().fetchProfile(session.user.id);
      }
    } catch (err) {
      console.error('Auth initialization failed:', err);
    } finally {
      set({ loading: false, initialized: true });
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && !isEmailVerified(session.user)) {
        await supabase.auth.signOut();
        set({ user: null, session: null, profile: null });
        return;
      }
      set({ user: session?.user ?? null, session });
      if (session?.user) {
        await get().fetchProfile(session.user.id);
      } else {
        set({ profile: null });
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

  getAccessToken: async () => {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  },

  getTier: () => {
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
    set({ user: null, session: null, profile: null });
  },
}));

export default useAuthStore;
