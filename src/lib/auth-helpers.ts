/**
 * Auth helpers — NestJS edition.
 *
 * Google OAuth via Supabase is no longer available.
 * Google sign-in will be re-enabled once Google OAuth is configured in NestJS.
 * For now, email/password login is the primary auth method.
 */

import { Capacitor } from '@capacitor/core';

/** @deprecated Google OAuth not yet configured in NestJS backend */
export const signInWithGoogle = async () => {
  alert('Google Sign-In is being migrated. Please use email & password to sign in for now.');
};

/** Handles native deep links — no-op on web */
export const initializeNativeAuth = () => {
  if (!Capacitor.isNativePlatform()) return;
  // Deep link handling will be re-enabled with NestJS Google OAuth
};
