import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Sparkles, Users, Globe, BookOpen, MessageSquare, X, ArrowRight, Trophy } from 'lucide-react';
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
    const deptName = user?.department || 'your department';

    const defaultIntroText = `Hey UniLink! 👋 I just registered from ${uniName}${user?.department ? ` studying ${user.department}` : ''}. Excited to connect with fellow students on campus!`;

    // Tasks Status
    const tasks = [
        {
            id: 'post',
            title: 'Say Hello to your Campus',
            desc: 'Post a quick intro so classmates can find you.',
            completed: userPostCount > 0,
            icon: MessageSquare,
            actionLabel: 'Introduce Yourself',
            onClick: () => setPostDrawerOpen(true, defaultIntroText),
        },
        {
            id: 'network',
            title: 'Connect with Classmates',
            desc: 'Find & connect with students at your university.',
            completed: false,
            icon: Users,
            actionLabel: 'Find Students',
            onClick: () => navigate('/app/network'),
        },
        {
            id: 'community',
            title: 'Join a Student Community',
            desc: 'Join your department, tech hubs & campus clubs.',
            completed: false,
            icon: Globe,
            actionLabel: 'Explore Groups',
            onClick: () => navigate('/app/communities'),
        },
        {
            id: 'study',
            title: 'Discover Study Rooms & Notes',
            desc: 'Access past questions, study rooms & course guides.',
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
        <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-emerald-500/20 shadow-xl relative overflow-hidden my-4 animate-in fade-in duration-300">
            {/* Ambient Background Accents */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl shrink-0">
                        <Sparkles className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-display font-bold text-white tracking-tight">Welcome to UniLink, {user.name.split(' ')[0]}! 👋</h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                                <Trophy className="w-3 h-3" /> +50 PTS Reward
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">Complete these 4 quick steps to get activated on your campus:</p>
                    </div>
                </div>

                <button
                    onClick={handleDismiss}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
                    title="Dismiss checklist"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="relative z-10 space-y-1.5 mb-5">
                <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-300">{completedCount} of {tasks.length} Completed</span>
                    <span className="text-slate-300">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Tasks Grid */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tasks.map(task => {
                    const Icon = task.icon;
                    return (
                        <div
                            key={task.id}
                            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${task.completed
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
                                : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                                }`}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                {task.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                    <Circle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <h4 className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
                                        <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        {task.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-300 mt-1 leading-normal">{task.desc}</p>
                                </div>
                            </div>

                            {!task.completed && (
                                <button
                                    onClick={task.onClick}
                                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 mt-auto"
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
