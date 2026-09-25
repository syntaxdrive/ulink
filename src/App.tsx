import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './features/layout/DashboardLayout';
import { useEffect, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

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
const CreatorDashboardPage = lazy(() => import('./features/story/CreatorDashboardPage'));
const ConfessionsPage = lazy(() => import('./features/confessions/ConfessionsPage'));
const ArcadePage = lazy(() => import('./features/arcade/ArcadePage'));
const OpenCampusPage = lazy(() => import('./features/open-campus/OpenCampusPage'));
const NotFoundPage = lazy(() => import('./features/layout/NotFoundPage'));
import UpdateNotification from './components/UpdateNotification';
import PWAInstallBanner from './components/PWAInstallBanner';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from './components/SEO/SEO';
import { useUIStore } from './stores/useUIStore';
import { AuthProvider } from './contexts/AuthContext';

import { initializeNativeAuth } from './lib/auth-helpers';
import DeepLinkHelper from './components/DeepLinkHelper';
import ShareIntentHelper from './components/ShareIntentHelper';
import ShareTargetChoiceModal from './components/ShareTargetChoiceModal';

function App() {
  const { user, loading } = useAuth();
  const isLoggedIn = !!user;
  const { setDarkMode } = useUIStore();

  // Handle native deep links for auth
  useEffect(() => {
    initializeNativeAuth();
  }, []);

  // Initialize dark mode
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    const shouldBeDark = stored !== null ? stored === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', shouldBeDark);
    if (stored === null) {
      setDarkMode(shouldBeDark);
    }
  }, [setDarkMode]);

  // Lock to portrait — silently no-ops on desktop or unsupported browsers
  useEffect(() => {
    (window.screen?.orientation as any)?.lock?.('portrait').catch(() => {});
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
              <Route path="/" element={isLoggedIn ? <Navigate to="/app" replace /> : <LandingPage />} />
              <Route path="/welcome" element={<LandingPage />} />
              <Route path="/signup" element={isLoggedIn ? <Navigate to="/app" replace /> : <LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/onboarding" element={isLoggedIn ? <OnboardingPage /> : <Navigate to="/" replace />} />
              <Route path="/app" element={<DashboardLayout isLoggedIn={isLoggedIn} />}>
                <Route index element={<FeedPage />} />
                <Route path="post/:postId" element={<PostPage />} />
                <Route path="communities" element={<CommunitiesPage />} />
                <Route path="communities/:slug" element={<CommunityDetailsPage />} />
                <Route path="network" element={<NetworkPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="jobs" element={<JobsPage />} />
                <Route path="talent" element={<TalentSearchPage />} />
                <Route path="learn" element={<CoursesPage />} />
                <Route path="story" element={<StoryModePage />} />
                <Route path="story/create" element={<StoryBuilderPage />} />
                <Route path="story/dashboard" element={<CreatorDashboardPage />} />
                <Route path="study" element={<StudyRoomsPage />} />
                <Route path="marketplace" element={<MarketplacePage />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
                <Route path="challenge" element={<CampusChallengePage />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="podcasts" element={<PodcastsPage />} />
                <Route path="podcasts/manage" element={<PodcastManagePage />} />
                <Route path="podcasts/:podcastId" element={<PodcastChannelPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="confessions" element={<ConfessionsPage />} />
                <Route path="arcade" element={<ArcadePage />} />
                <Route path="open-campus" element={<OpenCampusPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/:userId" element={<UserProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="admin" element={<AdminPage />} />
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


