import { CheckCircle2, Circle } from 'lucide-react';
import { type Profile } from '../types';
import { calculateProfileCompletion } from '../utils/profileCompletion';

interface ProfileCompletionProps {
    profile: Profile;
}

export default function ProfileCompletion({ profile }: ProfileCompletionProps) {
    const { checks, percentage } = calculateProfileCompletion(profile);

    const getColorClass = () => {
        if (percentage >= 80) return 'bg-emerald-600';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    const getTextColorClass = () => {
        if (percentage >= 80) return 'text-emerald-600 dark:text-emerald-500';
        if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-500';
        return 'text-orange-600 dark:text-orange-500';
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Profile Completion</h3>
                <span className={`text-2xl font-bold ${getTextColorClass()}`}>{percentage}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-stone-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
                <div
                    className={`h-full ${getColorClass()} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Checklist */}
            <div className="space-y-3">
                {checks.map((check, index) => (
                    <div key={index} className="flex items-center gap-3">
                        {check.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                        ) : (
                            <Circle className="w-5 h-5 text-stone-300 dark:text-zinc-700 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${check.completed ? 'text-stone-900 dark:text-zinc-100' : 'text-stone-500 dark:text-zinc-500'}`}>
                            {check.label}
                        </span>
                        <span className="ml-auto text-xs text-stone-400 dark:text-zinc-600">
                            +{check.weight}%
                        </span>
                    </div>
                ))}
            </div>

            {percentage < 100 && (
                <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-900">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                        💡 Complete your profile to earn up to <strong>+110 bonus points</strong> and stand out to recruiters!
                    </p>
                </div>
            )}
        </div>
    );
}
