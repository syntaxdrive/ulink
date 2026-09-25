import { MessageSquarePlus, HelpCircle, Lightbulb, GraduationCap } from 'lucide-react';
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
            color: 'bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100/60',
            text: `Hello UniLink, I just registered from ${uniName}${user?.department ? ` studying ${deptName}` : ''}. Excited to connect with classmates on campus.`,
        },
        {
            id: 'question',
            icon: HelpCircle,
            label: 'Ask Campus Question',
            color: 'bg-slate-50 dark:bg-zinc-800/50 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700/60 hover:bg-slate-100',
            text: `Question for ${uniName} students: What are the best study spots or group chat links on campus right now?`,
        },
        {
            id: 'tip',
            icon: Lightbulb,
            label: 'Share a Study Tip',
            color: 'bg-slate-50 dark:bg-zinc-800/50 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700/60 hover:bg-slate-100',
            text: `Here is a study tip that helped me prepare for exams at ${uniName}: `,
        },
    ];

    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm my-3">
            <div className="flex items-center gap-2 mb-3">
                <MessageSquarePlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    Quick Post Templates
                </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {prompts.map(({ id, icon: Icon, label, color, text }) => (
                    <button
                        key={id}
                        onClick={() => setPostDrawerOpen(true, text)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold text-left transition-colors shadow-sm ${color}`}
                    >
                        <Icon className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
