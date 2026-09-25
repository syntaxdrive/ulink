import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Users, Globe, BookOpen, MessageSquare, X, ArrowRight, CheckSquare } from 'lucide-react';
import { useUIStore } from '../../../stores/useUIStore';

interface GettingStartedChecklistProps {
    user?: any;
    userPostCount?: number;
}

export default function GettingStartedChecklist({ user, userPostCount = 0 }: GettingStartedChecklistProps) {
    const navigate = useNavigate();
    const { setPostDrawerOpen } = useUIStore();
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const isDismissed = localStorage.getItem('unilink_checklist_dismissed') === 'true';
        if (isDismissed) setDismissed(true);
    }, []);

    if (dismissed || !user) return null;

    const uniName = user?.university || 'Campus';
    const defaultIntroText = `Hello UniLink, I just registered from ${uniName}${user?.department ? ` studying ${user.department}` : ''}. Excited to connect with classmates on campus.`;

    const tasks = [
        {
            id: 'post',
            title: 'Say Hello to your Campus',
            desc: 'Post a brief intro so classmates can find you.',
            completed: userPostCount > 0,
            icon: MessageSquare,
            actionLabel: 'Introduce Yourself',
            onClick: () => setPostDrawerOpen(true, defaultIntroText),
        },
        {
            id: 'network',
            title: 'Connect with Classmates',
            desc: 'Find and connect with students at your university.',
            completed: false,
            icon: Users,
            actionLabel: 'Find Students',
            onClick: () => navigate('/app/network'),
        },
        {
            id: 'community',
            title: 'Join a Student Community',
            desc: 'Join your department, tech hubs, and campus clubs.',
            completed: false,
            icon: Globe,
            actionLabel: 'Explore Groups',
            onClick: () => navigate('/app/communities'),
        },
        {
            id: 'study',
            title: 'Discover Study Rooms & Notes',
            desc: 'Access past questions, study rooms, and course guides.',
            completed: false,
            icon: BookOpen,
            actionLabel: 'Open Study Hub',
            onClick: () => navigate('/app/study'),
        },
    ];

    const completedCount = tasks.filter(t => t.completed).length;
    const progressPercent = Math.round((completedCount / tasks.length) * 100);

    const handleDismiss = () => {
        localStorage.setItem('unilink_checklist_dismissed', 'true');
        setDismissed(true);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm my-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl shrink-0 text-emerald-600 dark:text-emerald-400">
                        <CheckSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Welcome to UniLink, {user.name.split(' ')[0]}</h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Complete these steps to get started on your campus:</p>
                    </div>
                </div>

                <button
                    onClick={handleDismiss}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors shrink-0"
                    title="Dismiss checklist"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-zinc-400">
                    <span>{completedCount} of {tasks.length} Completed</span>
                    <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tasks.map(task => {
                    const Icon = task.icon;
                    return (
                        <div
                            key={task.id}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${task.completed
                                ? 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white'
                                }`}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                {task.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                    <Circle className="w-5 h-5 text-slate-300 dark:text-zinc-600 shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                                        <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        {task.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-normal">{task.desc}</p>
                                </div>
                            </div>

                            {!task.completed && (
                                <button
                                    onClick={task.onClick}
                                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 active:scale-98 mt-auto"
                                >
                                    <span>{task.actionLabel}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
