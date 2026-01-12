import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './features/auth/AuthPage';
import DashboardLayout from './features/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { type Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import NetworkPage from './features/network/NetworkPage';
import FeedPage from './features/feed/FeedPage';
import MessagesPage from './features/messages/MessagesPage';
import JobsPage from './features/jobs/JobsPage';
import TalentSearchPage from './features/jobs/TalentSearchPage';
import ProfilePage from './features/preferences/ProfilePage';
import NotificationsPage from './features/notifications/NotificationsPage';

import UserProfilePage from './features/profile/UserProfilePage';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-stone-50 text-emerald-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={!session ? <AuthPage /> : <Navigate to="/app" replace />}
        />
        <Route
          path="/app"
          element={session ? <DashboardLayout /> : <Navigate to="/" replace />}
        >
          <Route index element={<FeedPage />} />
          <Route path="network" element={<NetworkPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="talent" element={<TalentSearchPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:userId" element={<UserProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
