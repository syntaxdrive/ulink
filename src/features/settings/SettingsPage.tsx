import { ChevronRight, Shield, FileText, Cookie, Scale, LogOut, User, Bell, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function SettingsPage() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isStandalone, setIsStandalone] = useState(false);
    const [notifPermission, setNotifPermission] = useState(
        'Notification' in window ? Notification.permission : 'denied'
    );

    useEffect(() => {
        // Detect Standalone (Already Installed)
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) return;
        const result = await Notification.requestPermission();
        setNotifPermission(result);
        if (result === 'granted') {
            new Notification('UniLink', { body: 'Notifications enabled successfully!' });
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const sections = [
        {
            title: "Account",
            items: [
                { icon: User, label: "Personal Information", path: "/app/profile", description: "Update your profile details" },
                { icon: Bell, label: "Notifications", path: "/app/notifications", description: "Manage your alert preferences" },
            ]
        },
        {
            title: "Legal & Policies",
            items: [
                { icon: Shield, label: "Privacy Policy", path: "/app/legal/privacy", description: "How we handle your data" },
                { icon: FileText, label: "Terms of Service", path: "/app/legal/terms", description: "Usage agreement" },
                { icon: Cookie, label: "Cookie Policy", path: "/app/legal/cookies", description: "Cookie usage and preferences" },
                { icon: Scale, label: "Copyright Policy", path: "/app/legal/copyright", description: "Intellectual property rights" },
            ]
        }
    ];

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-stone-900 mb-8 font-display">Settings</h1>

            <div className="space-y-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                            <h2 className="font-semibold text-stone-900">{section.title}</h2>
                        </div>
                        <div className="divide-y divide-stone-100">
                            {section.items.map((item, i) => (
                                <Link
                                    key={i}
                                    to={item.path}
                                    className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors group"
                                >
                                    <div className="p-2 bg-stone-100 rounded-xl text-stone-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-stone-900">{item.label}</h3>
                                        <p className="text-xs text-stone-500">{item.description}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Notification Permission Card */}
                {notifPermission === 'default' && (
                    <div className="bg-blue-50 rounded-[2rem] border border-blue-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-blue-900">Enable Notifications</h2>
                                <p className="text-xs text-blue-700">Stay updated with messages and alerts</p>
                            </div>
                        </div>
                        <button
                            onClick={requestNotificationPermission}
                            className="w-full bg-blue-600 rounded-xl shadow-sm p-3 text-white font-medium hover:bg-blue-700 transition-all text-sm"
                        >
                            Allow Notifications
                        </button>
                    </div>
                )}

                {/* Install App Section */}
                {!isStandalone && (
                    <div className="bg-emerald-50 rounded-[2rem] border border-emerald-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                                <Download className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-emerald-900">Get the App</h2>
                                <p className="text-xs text-emerald-700">No download required!</p>
                            </div>
                        </div>

                        {deferredPrompt ? (
                            <button
                                onClick={handleInstallClick}
                                className="w-full bg-emerald-600 rounded-xl shadow-sm p-3 text-white font-medium hover:bg-emerald-700 transition-all text-sm"
                            >
                                Install App
                            </button>
                        ) : (
                            <div className="text-sm text-emerald-800 bg-white/60 p-4 rounded-xl border border-emerald-100/50">
                                <p className="mb-2 font-medium">Use as a Native App:</p>
                                <p className="text-xs opacity-90 leading-relaxed">
                                    This is a Progressive Web App (PWA). You don't need an APK file.
                                </p>
                                <div className="mt-3 space-y-2 text-xs">
                                    <div className="flex gap-2 items-start">
                                        <span className="font-bold">1.</span>
                                        <span>Tap your browser's menu button (usually 3 dots <span className="font-bold">⋮</span> or Share icon).</span>
                                    </div>
                                    <div className="flex gap-2 items-start">
                                        <span className="font-bold">2.</span>
                                        <span>Select <span className="font-bold">"Add to Home Screen"</span> or <span className="font-bold">"Install App"</span>.</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="w-full bg-white rounded-[2rem] border border-stone-200 shadow-sm p-4 flex items-center justify-center gap-3 text-red-600 font-medium hover:bg-red-50 hover:border-red-100 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Log Out
                </button>

                <div className="text-center text-xs text-stone-400">
                    <p>UniLink Version 1.0.0</p>
                    <p>&copy; {new Date().getFullYear()} UniLink Nigeria</p>
                </div>
            </div>
        </div>
    );
}
