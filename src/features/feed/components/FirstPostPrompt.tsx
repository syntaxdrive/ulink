import { Sparkles, MessageSquarePlus, HelpCircle, Lightbulb, GraduationCap } from 'lucide-react';
import { useUIStore } from '../../../stores/useUIStore';

interface FirstPostPromptProps {
    user?: any;
}

export default function FirstPostPrompt({ user }: FirstPostPromptProps) {
    const { setPostDrawerOpen } = useUIStore();

    const uniName = user?.university || 'Campus';
    const deptName = user?.department || 'your department';

    const prompts = [
        {
            id: 'intro',
            icon: GraduationCap,
            label: 'Introduce Yourself',
            color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800',
            text: `Hey UniLink! 👋 I just registered from ${uniName}${user?.department ? ` studying ${deptName}` : ''}. Excited to connect with classmates on campus!`,
        },
        {
            id: 'question',
            icon: HelpCircle,
            label: 'Ask Campus Question',
            color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800',
            text: `Quick question for ${uniName} students: What are the best study spots or group chat links on campus right now? 📚`,
        },
        {
            id: 'tip',
            icon: Lightbulb,
            label: 'Share a Study Tip',
            color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800',
            text: `Here is a study tip that helped me prepare for exams at ${uniName}: `,
        },
    ];

    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-sm my-3">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    Not sure what to post? Pick a prompt to get started:
                </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {prompts.map(({ id, icon: Icon, label, color, text }) => (
                    <button
                        key={id}
                        onClick={() => setPostDrawerOpen(true, text)}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold text-left transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${color}`}
                    >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
