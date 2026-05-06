import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './features/layout/DashboardLayout';
import { useEffect, useState, lazy, Suspense } from 'react';
import { supabase } from './lib/supabase';
import { type Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

// Lazy load feature pages for bandwidth optimization
const FeedPage = lazy(() => import('./features/feed/FeedPage'));
const PostPage = lazy(() => import('./features/feed/PostPage'));
const NetworkPage = lazy(() => import('./features/network/NetworkPage'));
const MessagesPage = lazy(() => import('./features/messages/MessagesPage'));
const JobsPage = lazy(() => import('./features/jobs/JobsPage'));
const TalentSearchPage = lazy(() => import('./features/jobs/TalentSearchPage'));
const ProfilePage = lazy(() => import('./features/preferences/ProfilePage'));
const NotificationsPage = lazy(() => import('./features/notifications/NotificationsPage'));
const UserProfilePage = lazy(() => import('./features/profile/UserProfilePage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));
const AdminPage = lazy(() => import('./features/admin/AdminPage'));
const OnboardingPage = lazy(() => import('./features/auth/OnboardingPage'));
const CommunitiesPage = lazy(() => import('./features/communities/CommunitiesPage'));
const CommunityDetailsPage = lazy(() => import('./features/communities/CommunityDetailsPage'));
const CoursesPage = lazy(() => import('./features/learn/CoursesPage'));
const LeaderboardPage = lazy(() => import('./features/leaderboard/LeaderboardPage'));
const CampusChallengePage = lazy(() => import('./features/challenge/CampusChallengePage'));
const NewsPage = lazy(() => import('./features/news/NewsPage'));
const PodcastsPage = lazy(() => import('./features/podcasts/PodcastsPage'));
const PodcastChannelPage = lazy(() => import('./features/podcasts/PodcastChannelPage'));
const PodcastManagePage = lazy(() => import('./features/podcasts/PodcastManagePage'));
const StudyRoomsPage = lazy(() => import('./features/study/StudyRoomsPage'));
const MarketplacePage = lazy(() => import('./features/marketplace/MarketplacePage'));
const DownloadPage = lazy(() => import('./features/landing/DownloadPage'));
const LandingPage = lazy(() => import('./features/landing/LandingPage'));
const AboutPage = lazy(() => import('./features/landing/AboutPage'));
const LegalPage = lazy(() => import('./features/legal/LegalPage'));
const StoryModePage = lazy(() => import('./features/story/StoryModePage'));
const StoryBuilderPage = lazy(() => import('./features/story/StoryBuilderPage'));
const NotFoundPage = lazy(() => import('./features/layout/NotFoundPage'));
import UpdateNotification from './components/UpdateNotification';
import PWAInstallBanner from './components/PWAInstallBanner';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from './components/SEO/SEO';
import { useUIStore } from './stores/useUIStore';

import { Capacitor } from '@capacitor/core';
import { initializeNativeAuth } from './lib/auth-helpers';
import DeepLinkHelper from './components/DeepLinkHelper';
import ShareIntentHelper from './components/ShareIntentHelper';
import ShareTargetChoiceModal from './components/ShareTargetChoiceModal';

function App() {

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { setDarkMode } = useUIStore();
  const isNative = Capacitor.isNativePlatform();

  // Handle native deep links for auth
  useEffect(() => {
    initializeNativeAuth();
  }, []);

  // Initialize dark mode and Project Cache Buster
  useEffect(() => {
    // 1. Dark Mode
    const stored = localStorage.getItem('darkMode');
    const shouldBeDark = stored !== null ? stored === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', shouldBeDark);
    if (stored === null) {
      setDarkMode(shouldBeDark);
    }

    // 2. Project Cache Buster
    // This ensures that when we switch Supabase projects, users don't get stuck with old profile data.
    const currentProjectId = import.meta.env.VITE_SUPABASE_URL?.split('.')[0].split('//')[1];
    const storedProjectId = localStorage.getItem('ulink_project_id');

    if (currentProjectId && storedProjectId !== currentProjectId) {
      console.log('[Auth] Project change detected. Clearing stale cache...');
      localStorage.removeItem('ulink_profile_cache');
      localStorage.setItem('ulink_project_id', currentProjectId);
    }
  }, [setDarkMode]);

  // Lock to portrait — silently no-ops on desktop or unsupported browsers
  useEffect(() => {
    (window.screen?.orientation as any)?.lock?.('portrait').catch(() => {});
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] State Change:', event, session ? 'Session Active' : 'No Session');
      setSession(session);
      setLoading(false); // Ensure loading is false once we have a definitive auth event

      // Clean URL after OAuth callback to remove sensitive tokens
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        const url = new URL(window.location.href);
        const hasTokens = url.hash && (url.hash.includes('access_token') || url.hash.includes('refresh_token'));
        const hasCode = url.searchParams.has('code');

        if (hasTokens || hasCode) {
          // Small delay to ensure Supabase has finished processing the URL
          setTimeout(() => {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState(null, '', cleanUrl);
            console.log('[Auth] URL Cleaned');
          }, 100);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-zinc-950 text-emerald-600">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">UniLink Nigeria</h1>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <BrowserRouter>
        <DeepLinkHelper />
        <ShareIntentHelper />
        <ShareTargetChoiceModal />
        <UpdateNotification />
        <PWAInstallBanner />
        {/* Default SEO Tags */}
        <SEO
          title="Home"
          description="Join the largest network of Nigerian university students. Collaborate, share resources, and grow your career."
        />
        <Suspense fallback={
          <div className="h-screen w-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-bg-dark">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        }>
          <Routes>
            <Route path="/download" element={<DownloadPage />} />
            <Route
              path="/"
              element={<Navigate to="/app" replace />}
            />
            <Route path="/welcome" element={<LandingPage />} />
            <Route
              path="/signup"
              element={
                session
                  ? <Navigate to="/app" replace />
                  : <LandingPage />
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/onboarding"
              element={session ? <OnboardingPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/app"
              element={<DashboardLayout session={session} />}
            >
              <Route index element={<FeedPage />} />
              <Route path="post/:postId" element={<PostPage />} />
              <Route path="communities" element={<CommunitiesPage />} />
              <Route path="communities/:slug" element={<CommunityDetailsPage />} />
              <Route path="network" element={<NetworkPage />} />
              <Route path="messages" element={session ? <MessagesPage /> : <Navigate to="/app" replace />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="talent" element={<TalentSearchPage />} />
              <Route path="learn" element={<CoursesPage />} />
              <Route path="story" element={<StoryModePage />} />
              <Route path="story/create" element={<StoryBuilderPage />} />
              <Route path="study" element={<StudyRoomsPage />} />
              <Route path="marketplace" element={<MarketplacePage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="challenge" element={<CampusChallengePage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="podcasts" element={<PodcastsPage />} />
              <Route path="podcasts/manage" element={session ? <PodcastManagePage /> : <Navigate to="/app" replace />} />
              <Route path="podcasts/:podcastId" element={<PodcastChannelPage />} />
              <Route path="notifications" element={session ? <NotificationsPage /> : <Navigate to="/app" replace />} />
              <Route path="profile" element={session ? <ProfilePage /> : <Navigate to="/app" replace />} />
              <Route path="profile/:userId" element={<UserProfilePage />} />
              <Route path="settings" element={session ? <SettingsPage /> : <Navigate to="/app" replace />} />
              <Route path="admin" element={session ? <AdminPage /> : <Navigate to="/app" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="/legal/:type" element={<LegalPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
