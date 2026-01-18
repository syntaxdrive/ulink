import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, MessageCircle, Briefcase, LogOut, User, Bell, Menu, X, Search, Settings, Shield, Globe, Download, GraduationCap } from 'lucide-react';

import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';
import NotificationToast from '../../components/ui/NotificationToast';
import UsernameSetupModal from '../auth/components/UsernameSetupModal';
import ErrorBoundary from '../../components/ErrorBoundary';
import InstallGuideModal from '../../components/InstallGuideModal';

import { useNotifications } from '../notifications/hooks/useNotifications';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useUIStore } from '../../stores/useUIStore';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isImmersive } = useUIStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Use Global Notifications Data
    const { requests, generalNotifications } = useNotifications();
    const unreadNotifications = requests.length + generalNotifications.filter(n => !n.read).length;

    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const [notificationPermission, setNotificationPermission] = useState(() =>
        'Notification' in window ? Notification.permission : 'denied'
    );
    const [toast, setToast] = useState<{ title: string; message: string; isVisible: boolean; onClick?: () => void }>({
        title: '', message: '', isVisible: false
    });

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

        if (document.visibilityState === 'hidden') playNotificationSound();
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

        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                await supabase.auth.signOut();
                navigate('/');
                return;
            }

            // Fetch User Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setUserProfile(profile);
                if (!profile.role) {
                    navigate('/onboarding');
                }
            } else {
                navigate('/onboarding');
            }

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

                            handleNotification(
                                `New message from ${senderName}`,
                                payload.new.content || 'Sent an attachment',
                                () => navigate(`/app/messages?chat=${payload.new.sender_id}`)
                            );
                        }
                    }
                )
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                    (_payload) => {
                        if (locationRef.current.startsWith('/app/notifications')) {
                            return;
                        }
                        handleNotification(
                            'New Notification',
                            'You have a new notification',
                            () => navigate('/app/notifications')
                        );
                    }
                )
                .subscribe();
        };

        setupRealtime();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    // Activity Heartbeat
    useEffect(() => {
        const ping = () => {
            supabase.rpc('update_last_seen').then(({ error }) => {
                if (error) console.error('Activity heartbeat failed', error);
            });
        };

        ping();
        const timer = setInterval(ping, 5 * 60 * 1000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const navItems = [
        { icon: LayoutGrid, label: 'Home', path: '/app' },
        { icon: Users, label: 'Network', path: '/app/network' },
        { icon: Globe, label: 'Communities', path: '#', comingSoon: true },
        ...(userProfile?.role === 'org' ? [{ icon: Search, label: 'Talent', path: '/app/talent' }] : []),
        ...(userProfile?.is_admin ? [{ icon: Shield, label: 'Admin', path: '/app/admin' }] : []),
        { icon: MessageCircle, label: 'Messages', path: '/app/messages' },
        { icon: Briefcase, label: 'Career', path: '/app/jobs' },
        { icon: GraduationCap, label: 'Learn', path: '/app/learn' },
        { icon: Bell, label: 'Notifications', path: '/app/notifications' },
        { icon: User, label: 'Profile', path: userProfile ? `/app/profile/${userProfile.username || userProfile.id}` : '/app/profile' },
        { icon: Settings, label: 'Settings', path: '/app/settings' },
    ];

    const getBadgeCount = (label: string) => {
        if (label === 'Messages') return unreadMessages;
        if (label === 'Notifications') return unreadNotifications;
        return 0;
    };

    const bottomNavItems = navItems.filter(item =>
        ['Home', 'Network', 'Messages', 'Profile'].includes(item.label)
    );

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-500/10 selection:text-indigo-600 overflow-hidden relative">

            <div className="fixed inset-0 bg-grid-slate-200/50 bg-[length:30px_30px] opacity-40 pointer-events-none z-0"></div>

            {/* Mobile Top Bar */}
            {location.pathname !== '/app/learn' && (
                <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 z-40">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative"
                    >
                        <Menu className="w-6 h-6" />
                        {(unreadNotifications > 0) && (
                            <span className="absolute top-2 right-2 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                        )}
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-lg text-slate-900">UniLink</span>
                        <img src="/icon-512.png" alt="UniLink" className="w-8 h-8 rounded-lg" />
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
                    <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <span className="font-display font-bold text-xl text-slate-900">Menu</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="flex-1 space-y-2">
                            {navItems.map((item: any) =>
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
                                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                                    {getBadgeCount(item.label)}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-medium">{item.label}</span>
                                    </NavLink>
                                )
                            )}
                        </nav>

                        <div className="pt-6 border-t border-slate-100">
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

                            {isInstallable && (
                                <button
                                    onClick={install}
                                    className="flex items-center gap-3 px-4 py-3 w-full text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all mb-2"
                                >
                                    <Download className="w-5 h-5" />
                                    <span className="font-medium">Install App</span>
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Log Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar - Desktop */}
            <aside className="w-[280px] fixed h-full hidden md:flex flex-col z-40 border-r border-slate-200 bg-white/80 backdrop-blur-xl">
                <div className="p-8 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <img src="/icon-512.png" alt="UniLink" className="w-10 h-10 shadow-sm rounded-xl" />
                        <div>
                            <h1 className="text-xl font-display font-bold tracking-tight text-slate-900">
                                UniLink
                            </h1>
                            <div className="text-xs font-medium text-slate-500 tracking-wide">
                                Student Network
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2">
                    <div className="px-4 mb-4">
                        <span className="text-xs font-semibold text-slate-400 tracking-wider">MENU</span>
                    </div>

                    {navItems.map((item: any) =>
                        item.comingSoon ? (
                            <div
                                key={item.label}
                                className="relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 cursor-not-allowed bg-slate-50/30"
                            >
                                <item.icon className="w-5 h-5 opacity-70" strokeWidth={1.5} />
                                <span className="font-sans text-sm font-medium">{item.label}</span>
                                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Soon</span>
                            </div>
                        ) : (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/app'}
                                className={({ isActive }) =>
                                    `relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-stone-900 text-white shadow-xl shadow-stone-200 ring-1 ring-stone-900'
                                        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                                    }`
                                }
                            >
                                <div className="relative">
                                    <item.icon className="w-5 h-5" strokeWidth={1.5} />
                                    {getBadgeCount(item.label) > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                            {getBadgeCount(item.label)}
                                        </span>
                                    )}
                                </div>
                                <span className="font-sans text-sm font-medium">{item.label}</span>
                            </NavLink>
                        )
                    )}
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
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
                    {notificationPermission === 'default' && (
                        <button
                            onClick={requestNotificationPermission}
                            className="w-full mb-3 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <Bell className="w-3 h-3" /> Enable Notifications
                        </button>
                    )}

                    {isInstallable && (
                        <button
                            onClick={install}
                            className="flex items-center gap-3 px-4 py-2.5 w-full text-emerald-600 hover:bg-emerald-50 border border-transparent rounded-xl transition-all duration-300 group mb-2"
                        >
                            <Download className="w-4 h-4" />
                            <span className="font-sans text-xs font-semibold">Install App</span>
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent rounded-xl transition-all duration-300 group"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
                        <span className="font-sans text-xs font-semibold">Log Out</span>
                    </button>

                    <div className="mt-6 px-2 text-[10px] text-slate-400 font-medium space-y-2 border-t border-slate-100 pt-4">
                        <p className="opacity-70">&copy; {new Date().getFullYear()} UniLink Nigeria. All rights reserved.</p>
                    </div>
                </div>
            </aside>


            <main className={`flex-1 md:ml-[280px] min-h-screen relative z-10 transition-colors duration-300 md:pt-0 ${location.pathname === '/app/learn' ? 'pt-0' : 'pt-16'}`}>
                <div className={location.pathname === '/app/learn' ? "w-full h-full p-0" : "max-w-7xl mx-auto p-6 md:p-10 pb-32"}>
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-stone-200 flex justify-around p-3 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-transform duration-300 ${isImmersive ? 'translate-y-full' : 'translate-y-0'}`}>
                {bottomNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/app'}
                        className={({ isActive }) =>
                            `relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${isActive
                                ? 'text-emerald-600'
                                : 'text-stone-400 hover:text-stone-600'
                            }`
                        }
                    >
                        <div className="relative">
                            <item.icon className="w-6 h-6" strokeWidth={1.5} />
                            {getBadgeCount(item.label) > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                                    {getBadgeCount(item.label)}
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
        </div>
    );
}
