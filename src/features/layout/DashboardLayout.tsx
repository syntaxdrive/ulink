import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, MessageCircle, Briefcase, LogOut, User, Bell, Menu, X, Search, Settings, Shield, Globe, Download, GraduationCap, Trophy, Zap, Sun, Moon, Newspaper, Mic2, Library, RefreshCw, Plus, ShoppingBag } from 'lucide-react';
import { type Session } from '@supabase/supabase-js';

import { supabase } from '../../lib/supabase';
import { signInWithGoogle } from '../../lib/auth-helpers';
import type { Profile } from '../../types';
import NotificationToast from '../../components/ui/NotificationToast';
import UsernameSetupModal from '../auth/components/UsernameSetupModal';
import ErrorBoundary from '../../components/ErrorBoundary';
import InstallGuideModal from '../../components/InstallGuideModal';

import { useNotifications } from '../notifications/hooks/useNotifications';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useUIStore } from '../../stores/useUIStore';
import { useLocalNotifications } from '../../hooks/usePushNotifications';
import GlobalAudioPlayer from '../../components/audio/GlobalAudioPlayer';
import PostDrawer from '../feed/components/PostDrawer';

export interface DashboardLayoutProps {
    session: Session | null;
}

function isOnboardingComplete(profile: Profile) {
    if (!profile.name?.trim()) return false;
    if (!profile.username?.trim()) return false;
    if (!profile.role) return false;
    if (profile.role === 'student' && !profile.university?.trim()) return false;
    return true;
}

export default function DashboardLayout({ session }: DashboardLayoutProps) {

    const navigate = useNavigate();
    const location = useLocation();
    const { isImmersive, isDarkMode, toggleDarkMode, setPostDrawerOpen } = useUIStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Register for local notifications on native (Android/iOS)
    useLocalNotifications();

    // Use Global Notifications Data
    const { requests, generalNotifications } = useNotifications();
    const unreadNotifications = requests.length + generalNotifications.filter(n => !n.read).length;

    const [userProfile, setUserProfile] = useState<Profile | null>(() => {
        // Load cached profile instantly to avoid the '@handle' flash
        try {
            const cached = localStorage.getItem('ulink_profile_cache');
            return cached ? JSON.parse(cached) : null;
        } catch { return null; }
    });
    const [isGuest, setIsGuest] = useState(false);

    const [notificationPermission, setNotificationPermission] = useState(() =>
        'Notification' in window ? Notification.permission : 'denied'
    );
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [toast, setToast] = useState<{ title: string; message: string; isVisible: boolean; onClick?: () => void }>({
        title: '', message: '', isVisible: false
    });

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const { isInstallable, install, showInstallModal, setShowInstallModal, isIOs } = usePWAInstall({
        onInstallAvailable: () => {
            // Show a subtle toast when install becomes available
            setToast({
                title: '📱 Install UniLink',
                message: 'You can now install UniLink as an app. Click here or use the Install button in settings.',
                isVisible: true,
                onClick: install
            });
        }
    });

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            alert('Notifications are not supported on this device.');
            return;
        }

        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission !== 'granted') return;

        // Subscribe to Push API and save endpoint to Supabase
        try {
            const reg = await navigator.serviceWorker.ready;
            const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!vapidKey) return; // Push not configured yet

            let sub = await reg.pushManager.getSubscription();
            if (!sub) {
                sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: vapidKey,
                });
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Upsert subscription so refreshed endpoints are always current
            await supabase.from('push_subscriptions').upsert({
                user_id: user.id,
                endpoint: sub.endpoint,
                p256dh: btoa(String.fromCharCode(...new Uint8Array((sub.getKey('p256dh') as ArrayBuffer)))),
                auth: btoa(String.fromCharCode(...new Uint8Array((sub.getKey('auth') as ArrayBuffer)))),
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        } catch (err) {
            console.error('[Push] subscription failed:', err);
        }
    };

    const handleNotification = (title: string, body: string, onClick?: () => void) => {
        // System Notification
        if ('Notification' in window && document.visibilityState === 'hidden' && Notification.permission === 'granted') {
            if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, {
                        body,
                        icon: '/icon-512.png',
                        vibrate: [200, 100, 200],
                        tag: 'ulink-notification',
                        renotify: true,
                        data: { url: window.location.origin + (onClick ? '' : '/app/notifications') }
                    } as any);
                }).catch(err => console.error('SW Notif failed', err));
            } else {
                try {
                    new Notification(title, { body, icon: '/icon-512.png' });
                } catch (e) {
                    console.error('Notification API failed', e);
                }
            }
        }

        // In-App Toast
        setToast({ title, message: body, isVisible: true, onClick });
    };

    const audioCtxRef = useRef<AudioContext | null>(null);

    const playNotificationSound = () => {
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) {
            console.error('Audio play failed', e);
        }
    };

    const locationRef = useRef(location.pathname);
    useEffect(() => { locationRef.current = location.pathname; }, [location.pathname]);

    // Initialize Audio Context
    useEffect(() => {
        const initAudio = () => {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                if (ctx.state === 'suspended') ctx.resume();
            }
            window.removeEventListener('click', initAudio);
        };
        window.addEventListener('click', initAudio);
        return () => window.removeEventListener('click', initAudio);
    }, []);

    useEffect(() => {
        let channel: any;
        let cancelled = false;

        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (cancelled) return;

            if (!user) {
                setIsGuest(true);
                return;
            }

            setIsGuest(false);

            // Fetch User Profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id,name,username,email,avatar_url,role,university,is_admin,is_verified,points,headline,store_name')
                .eq('id', user.id)
                .single();

            if (cancelled) return;

            if (profile) {
                setUserProfile(profile);
                // Cache profile for instant display on next load
                try { localStorage.setItem('ulink_profile_cache', JSON.stringify(profile)); } catch {}
                // Only redirect if genuinely incomplete — not if a stale call fires
                // while the user is already heading to or on onboarding
                if (!isOnboardingComplete(profile) && !window.location.pathname.startsWith('/onboarding')) {
                    navigate('/onboarding');
                }
            } else if (profileError?.code === 'PGRST116' &&
                !window.location.pathname.startsWith('/onboarding')) {
                // No row found at all — genuinely new user
                navigate('/onboarding');
            }
            // Any other DB error — stay put, don't disrupt the user

            // 1. Fetch Initial Unread Message Count
            const fetchMessageCount = async () => {
                if (!user?.id) return;
                const { count } = await supabase
                    .from('messages')
                    .select('id', { count: 'exact', head: true })
                    .eq('recipient_id', user.id)
                    .is('read_at', null);

                if (count !== null) setUnreadMessages(count);
            };
            fetchMessageCount();
            const messagePollTimer = setInterval(fetchMessageCount, 12000);

            // 2. Subscribe to Messenger Events
            channel = supabase.channel('dashboard-alerts')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}` },
                    async (payload) => {
                        fetchMessageCount();

                        if (payload.eventType === 'INSERT' && payload.new) {
                            const currentParams = new URLSearchParams(window.location.search);
                            const currentChatId = currentParams.get('chat');
                            const isViewingThatChat = window.location.pathname.startsWith('/app/messages') && currentChatId === payload.new.sender_id;

                            if (isViewingThatChat) return;

                            let senderName = 'Someone';
                            if (payload.new.sender_id) {
                                const { data: sender } = await supabase
                                    .from('profiles')
                                    .select('name')
                                    .eq('id', payload.new.sender_id)
                                    .single();
                                if (sender) senderName = sender.name;
                            }

                            playNotificationSound();
                            handleNotification(
                                `New message from ${senderName}`,
                                payload.new.content || 'Sent an attachment',
                                () => navigate(`/app/messages?chat=${payload.new.sender_id}`)
                            );
                        }
                    }
                )
                .subscribe();

            const SEEN_TOAST_IDS = new Set<string>();
            let initialBatch = useNotificationStore.getState().generalNotifications;
            initialBatch.forEach(n => SEEN_TOAST_IDS.add(n.id));

            const unsubNotifStore = useNotificationStore.subscribe((state) => {
                const newest = state.generalNotifications[0];
                if (!newest || SEEN_TOAST_IDS.has(newest.id)) return;
                
                SEEN_TOAST_IDS.add(newest.id);
                // Keep set small
                if (SEEN_TOAST_IDS.size > 100) {
                    const first = SEEN_TOAST_IDS.values().next().value;
                    if (first) SEEN_TOAST_IDS.delete(first);
                }

                if (locationRef.current.startsWith('/app/notifications')) return;

                let targetUrl = '/app/notifications';
                if (newest.action_url) {
                    let url = newest.action_url;
                    if (!url.startsWith('/app/')) {
                        url = url.replace('/posts/', '/post/');
                        if (!url.startsWith('/')) url = '/' + url;
                        const routes = ['/post/', '/profile/', '/communities/', '/network', '/messages', '/jobs', '/talent', '/learn', '/study', '/leaderboard', '/challenge', '/settings', '/admin', '/news'];
                        if (routes.some(r => url.startsWith(r))) url = '/app' + url;
                    }
                    targetUrl = url;
                } else if (newest.data?.post_id) {
                    targetUrl = `/app/post/${newest.data.post_id}`;
                } else if (newest.data?.sender_id || newest.sender_id) {
                    targetUrl = `/app/profile/${newest.data?.sender_id || newest.sender_id}`;
                }

                playNotificationSound();
                handleNotification(
                    newest.title || 'New Notification',
                    newest.message || 'You have a new notification',
                    () => navigate(targetUrl)
                );
            });

            // Store cleanup fn for unsubbing the store watcher
            (channel as any)._unsubNotifStore = unsubNotifStore;
            (channel as any)._messagePollTimer = messagePollTimer;
        };

        setupRealtime();

        return () => {
            cancelled = true;
            if (channel) {
                (channel as any)._unsubNotifStore?.();
                if ((channel as any)._messagePollTimer) clearInterval((channel as any)._messagePollTimer);
                channel.unsubscribe();
                supabase.removeChannel(channel);
            }
        };
    }, [session?.user?.id]);

    // Activity Heartbeat
    useEffect(() => {
        const ping = () => {
            supabase.rpc('update_last_seen').then(({ error }) => {
                if (error) {
                    const isAbort =
                        error.message?.includes('AbortError') ||
                        (error as any).code === 'ERR_ABORTED' ||
                        (error as any).name === 'AbortError';

                    if (!isAbort) {
                        console.warn('Activity heartbeat failed:', error.message);
                    }
                }
            });
        };

        ping();
        const timer = setInterval(ping, 5 * 60 * 1000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        try { localStorage.removeItem('ulink_profile_cache'); } catch {}
        await supabase.auth.signOut();
        navigate('/');
    };

    // Listen for push subscription renewals sent by the service worker
    // (fires when the browser auto-expires a push subscription after ~60 days)
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;
        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type !== 'PUSH_SUBSCRIPTION_RENEWED') return;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const sub = event.data.subscription;
            await supabase.from('push_subscriptions').upsert({
                user_id: user.id,
                endpoint: sub.endpoint,
                p256dh: sub.keys?.p256dh,
                auth: sub.keys?.auth,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        };
        navigator.serviceWorker.addEventListener('message', handleMessage);
        return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }, []);

    const primaryNavItems = [
        { icon: LayoutGrid, label: 'Home', path: '/app' },
        { icon: Users, label: 'Network', path: '/app/network' },
        { icon: Globe, label: 'Communities', path: '/app/communities' },
        { icon: Zap, label: 'Challenge', path: '/app/challenge' },
        ...(!isGuest ? [
            { icon: MessageCircle, label: 'Messages', path: '/app/messages' },
            { icon: Bell, label: 'Notifications', path: '/app/notifications' },
            { icon: User, label: 'Profile', path: userProfile ? `/app/profile/${userProfile.username || userProfile.id}` : '/app/profile' }
        ] : []),
    ];

    const secondaryNavItems = [
        { icon: Briefcase, label: 'Career', path: '/app/jobs' },
        { icon: Newspaper, label: 'News Feed', path: '/app/news' },
        { icon: Mic2, label: 'Podcasts', path: '/app/podcasts' },
        {icon: Trophy, label: 'Leaderboard', path: '/app/leaderboard'},
        {icon: GraduationCap, label: 'Courses', path: '/app/learn'},
        // {icon: BookOpen, label: 'Story Mode', path: '/app/story'},
        {icon: Library, label: 'Study Rooms', path: '/app/study'},
        { icon: ShoppingBag, label: 'Market', path: '/app/marketplace' },
        ...(!isGuest ? [{icon: Settings, label: 'Settings', path: '/app/settings'}] : []),
        ...(userProfile?.role === 'org' ? [{ icon: Search, label: 'Talent', path: '/app/talent' }] : []),
        ...(userProfile?.is_admin ? [{ icon: Shield, label: 'Admin', path: '/app/admin' }] : []),
    ];

    const navItems = [...primaryNavItems, ...secondaryNavItems];

    const getBadgeCount = (label: string) => {
        if (label === 'Messages') return unreadMessages;
        if (label === 'Notifications') return unreadNotifications;
        return 0;
    };

    const bottomNavItems = navItems.filter(item =>
        ['Home', 'Network', 'Messages', 'Profile'].includes(item.label)
    );

    // PWA standalone mode — unauthenticated users get a native-feel sign-in screen
    // instead of the public feed view to keep the full native app experience.
    const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

    if (isGuest && isStandalone) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col items-center justify-center p-8 text-center safe-inset">
                <div className="w-full max-w-xs">
                    <img src="/icon-512.png" alt="UniLink" className="w-24 h-24 rounded-3xl shadow-2xl mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">UniLink Nigeria</h1>
                    <p className="text-slate-500 dark:text-zinc-400 mb-10 leading-relaxed text-sm">
                        The #1 network for Nigerian university students. Connect, grow, and thrive.
                    </p>
                    <button
                        onClick={signInWithGoogle}
                        className="flex items-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-base rounded-2xl shadow-xl transition-all w-full justify-center mb-4"
                    >
                        <Globe className="w-5 h-5" />
                        Continue with Google
                    </button>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-600 leading-relaxed">
                        By continuing, you agree to UniLink's Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-bg-dark text-slate-900 dark:text-white font-sans selection:bg-indigo-500/10 selection:text-indigo-600 overflow-hidden relative transition-colors duration-300">

            {/* Offline Indicator Banner */}
            {isOffline && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-zinc-900 dark:bg-white text-white dark:text-black py-1 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300 shadow-lg">
                    <Globe className="w-3 h-3 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Offline Mode — Viewing Cached Data</span>
                </div>
            )}

            <div className="fixed inset-0 bg-grid-slate-200/50 bg-[length:30px_30px] opacity-40 pointer-events-none z-0"></div>

            {/* Mobile Top Bar */}
            {!(location.pathname === '/app/learn' || location.pathname === '/app/story') && (
                <header className="md:hidden flex items-center justify-between px-4 mobile-header-h bg-white/80 dark:bg-bg-dark/80 backdrop-blur-xl border-b border-slate-100 dark:border-zinc-800 fixed top-0 left-0 right-0 z-40 transition-transform duration-300">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors relative"
                    >
                        <Menu className="w-6 h-6" />
                        {(unreadNotifications > 0) && (
                            <span className="absolute top-2 right-2 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 ring-2 ring-white"></span>
                            </span>
                        )}
                    </button>
                    <div className="flex items-center gap-2">
                        {isGuest ? (
                            <button
                                onClick={signInWithGoogle}
                                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-md active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Globe className="w-3 h-3" /> Sign In with Google
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all active:rotate-180"
                                    title="Refresh"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                                <span className="font-display font-black text-xl tracking-[-0.03em] text-slate-900 dark:text-white">
                                    UniLink
                                </span>
                                <img src="/icon-512.png" alt="UniLink" className="w-8 h-8 rounded-lg shadow-sm" />
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-2 ml-1 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-90"
                                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                >
                                    {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
                                </button>
                            </>
                        )}
                    </div>
                </header>
            )}

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>
                    <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-bg-dark shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <span className="font-display font-bold text-xl text-slate-900 dark:text-zinc-100">Menu</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto space-y-1">
                            {/* Primary items */}
                            {primaryNavItems.map((item: any) =>
                                item.comingSoon ? (
                                    <div
                                        key={item.label}
                                        className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 cursor-not-allowed bg-slate-50/50"
                                    >
                                        <item.icon className="w-5 h-5 opacity-70" />
                                        <span className="font-medium">{item.label}</span>
                                        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full">Soon</span>
                                    </div>
                                ) : (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        end={item.path === '/app'}
                                        className={({ isActive }) =>
                                            `relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                                ? 'bg-stone-900 text-white shadow-md'
                                                : 'text-stone-600 hover:bg-stone-50'
                                            }`
                                        }
                                    >
                                        <div className="relative">
                                            <item.icon className="w-5 h-5" />
                                            {getBadgeCount(item.label) > 0 && (
                                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                                        {getBadgeCount(item.label)}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-medium">{item.label}</span>
                                    </NavLink>
                                )
                            )}

                            {/* Secondary items */}
                            <div className="px-4 pt-4 pb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">More</span>
                            </div>
                            {secondaryNavItems.map((item: any) =>
                                item.comingSoon ? (
                                    <div
                                        key={item.label}
                                        className="relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-slate-300 cursor-not-allowed"
                                    >
                                        <item.icon className="w-4 h-4 opacity-70" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full">Soon</span>
                                    </div>
                                ) : (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        end={item.path === '/app'}
                                        className={({ isActive }) =>
                                            `relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive
                                                ? 'bg-stone-100 text-stone-900'
                                                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'
                                            }`
                                        }
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </NavLink>
                                )
                            )}
                        </nav>

                        <div className="pt-6 border-t border-slate-100">
                            {isGuest ? (
                                <button
                                    onClick={signInWithGoogle}
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all"
                                >
                                    <Globe className="w-4 h-4" /> Sign In with Google
                                </button>
                            ) : (
                                <div className="flex items-center gap-3 mb-4 px-2">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
                                        <img
                                            src={userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.name || 'User')}&background=random`}
                                            alt={userProfile?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-slate-800 truncate">{userProfile?.name || 'User'}</p>
                                        <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tight opacity-70">
                                            {userProfile?.role === 'org' ? 'Organization' : userProfile?.university || userProfile?.role}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {isInstallable && (
                                <button
                                    onClick={install}
                                    className="flex items-center gap-3 px-4 py-3 w-full text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all mb-2"
                                >
                                    <Download className="w-5 h-5" />
                                    <span className="font-medium">Install App</span>
                                </button>
                            )}
                            {!isGuest && (
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Log Out</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar - Desktop */}
            <aside className="w-[280px] fixed h-full hidden md:flex flex-col z-40 border-r border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-xl">
                <div className="p-8 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <img src="/icon-512.png" alt="UniLink" className="w-10 h-10 shadow-sm rounded-xl" />
                        <div>
                            <h1 className="text-xl font-display font-black tracking-[-0.03em] text-slate-900 dark:text-white">
                                UniLink
                            </h1>
                            <div className="text-xs font-medium text-slate-400 dark:text-zinc-500 tracking-wide flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                Student Network
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 overflow-y-auto smooth-scroll space-y-1">
                    <div className="px-4 mb-3">
                        <span className="text-xs font-semibold text-slate-400 tracking-wider">MAIN</span>
                    </div>

                    {primaryNavItems.map((item: any) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/app'}
                            className={({ isActive }) =>
                                `relative group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl shadow-stone-200 dark:shadow-none ring-1 ring-stone-900 dark:ring-zinc-100'
                                    : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-zinc-800'
                                }`
                            }
                        >
                            <div className="relative">
                                <item.icon className="w-5 h-5" strokeWidth={1.5} />
                                {getBadgeCount(item.label) > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                            {getBadgeCount(item.label)}
                                        </span>
                                    </span>
                                )}
                            </div>
                            <span className="font-sans text-sm font-medium">{item.label}</span>
                        </NavLink>
                    ))}

                    <div className="px-4 pt-4 pb-2">
                        <span className="text-xs font-semibold text-slate-400 tracking-wider">MORE</span>
                    </div>

                    {secondaryNavItems.map((item: any) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/app'}
                            className={({ isActive }) =>
                                `relative group flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 font-semibold'
                                    : 'text-stone-400 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                                }`
                            }
                        >
                            <item.icon className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-sans text-xs font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-bg-cardDark/50">
                    {isGuest ? (
                        <button
                            onClick={signInWithGoogle}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all mb-4"
                        >
                            <Globe className="w-4 h-4" /> Sign In with Google
                        </button>
                    ) : (
                        <>
                            <NavLink
                                to={userProfile ? `/app/profile/${userProfile.username || userProfile.id}` : '/app/profile'}
                                className="flex items-center gap-3 mb-4 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
                                    <img
                                        src={userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.name || 'User')}&size=128&background=random`}
                                        alt={userProfile?.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate">
                                        {userProfile?.name || 'User'}
                                    </p>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black truncate uppercase tracking-tight">
                                        {userProfile?.username
                                            ? `@${userProfile.username}`
                                            : <span className="inline-block w-20 h-2.5 bg-stone-200 dark:bg-zinc-700 rounded-full animate-pulse" />}
                                    </p>
                                    <p className="text-[9px] text-slate-500 dark:text-zinc-400 font-medium truncate uppercase tracking-tighter opacity-70">
                                        {userProfile?.role === 'org' ? 'Organization' : userProfile?.university || userProfile?.role}
                                    </p>
                                </div>
                            </NavLink>

                            {notificationPermission === 'default' && (
                                <button
                                    onClick={requestNotificationPermission}
                                    className="w-full mb-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Bell className="w-3 h-3" /> Enable Notifications
                                </button>
                            )}

                            {isInstallable && (
                                <button
                                    onClick={install}
                                    className="flex items-center gap-3 px-4 py-2.5 w-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-transparent rounded-xl transition-all duration-300 group mb-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="font-sans text-xs font-semibold">Install App</span>
                                </button>
                            )}

                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-transparent rounded-xl transition-all duration-300 group mb-1"
                            >
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" strokeWidth={1.5} />
                                <span className="font-sans text-xs font-semibold">Refresh Page</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent rounded-xl transition-all duration-300 group"
                            >
                                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
                                <span className="font-sans text-xs font-semibold">Log Out</span>
                            </button>

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                                <button
                                    onClick={toggleDarkMode}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-bg-cardDark border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600'}`}>
                                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                        </span>
                                    </div>
                                    <div className={`w-10 h-5 rounded-full transition-colors relative ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </button>
                            </div>
                        </>
                    )}

                    <div className="mt-6 px-2 text-[10px] text-slate-400 font-medium space-y-2 border-t border-slate-100 pt-4">
                        <p className="opacity-70">&copy; {new Date().getFullYear()} UniLink Nigeria. All rights reserved.</p>
                    </div>
                </div>
            </aside>


            <main className={`flex-1 md:ml-[280px] min-h-screen relative z-10 transition-colors duration-300 md:pt-0 bg-[#FAFAFA] dark:bg-zinc-950 ${(location.pathname === '/app/learn' || location.pathname === '/app/story') ? 'pt-0' : 'pt-mobile-header'}`}>
                <div className={location.pathname === '/app/learn' ? "w-full h-full p-0" : "max-w-7xl mx-auto p-4 md:p-8 pb-32"}>
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-t border-stone-100/50 dark:border-zinc-800/30 flex items-center justify-around px-2 py-2.5 pb-safe z-40 transition-transform duration-500 overflow-visible ${isImmersive ? 'translate-y-full' : 'translate-y-0 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]'}`}>
                {/* First half of nav */}
                {bottomNavItems.slice(0, 2).map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/app'}
                        className={({ isActive }) =>
                            `relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300 ${isActive
                                ? 'text-emerald-600'
                                : 'text-stone-400 hover:text-stone-600'
                            }`
                        }
                    >
                        <div className="relative">
                            <item.icon className={`w-6 h-6 transition-transform duration-300`} strokeWidth={1.75} />
                            {getBadgeCount(item.label) > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                                    <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-zinc-900 shadow-sm">
                                        {getBadgeCount(item.label)}
                                    </span>
                                </span>
                            )}
                        </div>
                    </NavLink>
                ))}

                {/* Centered Floating Action Button */}
                <div className="relative px-1 -mt-6">
                    <button
                        onClick={() => setPostDrawerOpen(true)}
                        className="relative w-12 h-12 bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 transition-all duration-300 border-4 border-white dark:border-zinc-950"
                    >
                        <Plus className="w-6 h-6" strokeWidth={3} />
                    </button>
                </div>

                {/* Second half of nav */}
                {bottomNavItems.slice(2).map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/app'}
                        className={({ isActive }) =>
                            `relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300 ${isActive
                                ? 'text-emerald-600'
                                : 'text-stone-400 hover:text-stone-600'
                            }`
                        }
                    >
                        <div className="relative">
                            <item.icon className="w-6 h-6 transition-transform duration-300" strokeWidth={1.75} />
                            {getBadgeCount(item.label) > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                                    <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-zinc-900 shadow-sm">
                                        {getBadgeCount(item.label)}
                                    </span>
                                </span>
                            )}
                        </div>
                    </NavLink>
                ))}
            </nav>

            {userProfile && !userProfile.username && (
                <UsernameSetupModal
                    user={userProfile}
                    onComplete={(newUsername) => setUserProfile({ ...userProfile, username: newUsername })}
                />
            )}

            <NotificationToast
                title={toast.title}
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                onClick={toast.onClick}
            />

            <InstallGuideModal
                isOpen={showInstallModal}
                onClose={() => setShowInstallModal(false)}
                isIOS={isIOs}
            />

            <GlobalAudioPlayer />
            <PostDrawer />
        </div>
    );
}
