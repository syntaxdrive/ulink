import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './features/landing/LandingPage';
import AboutPage from './features/landing/AboutPage';
import DashboardLayout from './features/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { type Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import NetworkPage from './features/network/NetworkPage';
import FeedPage from './features/feed/FeedPage';
import PostPage from './features/feed/PostPage';
import MessagesPage from './features/messages/MessagesPage';
import JobsPage from './features/jobs/JobsPage';
import TalentSearchPage from './features/jobs/TalentSearchPage';
import ProfilePage from './features/preferences/ProfilePage';
import NotificationsPage from './features/notifications/NotificationsPage';

import UserProfilePage from './features/profile/UserProfilePage';
import LegalPage from './features/legal/LegalPage';
import SettingsPage from './features/settings/SettingsPage';
import AdminPage from './features/admin/AdminPage';
import NotFoundPage from './features/layout/NotFoundPage';
import OnboardingPage from './features/auth/OnboardingPage';
import CommunitiesPage from './features/communities/CommunitiesPage';
import CommunityDetailsPage from './features/communities/CommunityDetailsPage';
import CoursesPage from './features/learn/CoursesPage';
import UpdateNotification from './components/UpdateNotification';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from './components/SEO/SEO';
import { useUIStore } from './stores/useUIStore';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { setDarkMode } = useUIStore();

  // Initialize dark mode on mount
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    const shouldBeDark = stored !== null ? stored === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', shouldBeDark);
    if (stored === null) {
      setDarkMode(shouldBeDark);
    }
  }, [setDarkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      // Clean URL after OAuth callback to remove sensitive tokens
      // This handles both PKCE flow (query params) and implicit flow (hash)
      if (session) {
        const url = new URL(window.location.href);
        let shouldClean = false;

        // Check for OAuth callback parameters in hash (implicit flow - legacy)
        if (url.hash && (url.hash.includes('access_token') || url.hash.includes('refresh_token'))) {
          shouldClean = true;
        }

        // Check for OAuth callback parameters in query string (PKCE flow)
        if (url.searchParams.has('code') || url.searchParams.has('access_token')) {
          shouldClean = true;
        }

        // Clean the URL if OAuth parameters were found
        if (shouldClean) {
          // Remove all query params and hash
          const cleanUrl = `${url.origin}${url.pathname}`;
          window.history.replaceState(null, '', cleanUrl);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-stone-50 dark:bg-zinc-950 text-emerald-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <HelmetProvider>
      <BrowserRouter>
        <UpdateNotification />
        {/* Default SEO Tags */}
        <SEO
          title="Home"
          description="Join the largest network of Nigerian university students. Collaborate, share resources, and grow your career."
        />
        <Routes>
          <Route
            path="/"
            element={!session ? <LandingPage /> : <Navigate to="/app" replace />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/onboarding"
            /* ... */
            element={session ? <OnboardingPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/app"
            element={session ? <DashboardLayout /> : <Navigate to="/" replace />}
          >
            <Route index element={<FeedPage />} />
            <Route path="post/:postId" element={<PostPage />} />
            <Route path="communities" element={<CommunitiesPage />} />
            <Route path="communities/:slug" element={<CommunityDetailsPage />} />
            <Route path="network" element={<NetworkPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="talent" element={<TalentSearchPage />} />
            <Route path="learn" element={<CoursesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/:userId" element={<UserProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<AdminPage />} />
            {/* Internal 404: Keeps sidebar */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/legal/:type" element={<LegalPage />} />

          {/* Global 404: Full page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
