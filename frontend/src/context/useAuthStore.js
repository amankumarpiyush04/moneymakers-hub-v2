import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { usersAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  session: null,      // Supabase session
  user: null,         // MongoDB profile (name, role, wishlist etc.)
  isLoading: true,

  // Called once on app mount — listens for Supabase auth changes
  init: () => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        set({ session });
        await get().fetchProfile();
      }
      set({ isLoading: false });
    });

    // Listen for login/logout/token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
      if (session) get().fetchProfile();
      else set({ user: null });
    });

    return () => subscription.unsubscribe();
  },

  fetchProfile: async () => {
    try {
      const { data } = await usersAPI.getProfile();
      set({ user: data.user });
    } catch (_) {}
  },

  // ── Auth actions (Supabase handles everything) ─────────────
  register: async (name, email, password) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } },
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Check your email to confirm your account!' };
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true };
  },

  loginWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) return { success: false, message: error.message };
    return { success: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },

  forgotPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Password reset link sent to your email.' };
  },

  resetPassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, message: error.message };
    return { success: true };
  },

  // ── Computed ───────────────────────────────────────────────
  isAuthenticated: () => !!get().session,
  isAdmin: () => get().user?.role === 'admin',
}));

export default useAuthStore;
