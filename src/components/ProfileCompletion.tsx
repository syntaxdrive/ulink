import { type Profile } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProfileCompletionProps {
    profile: Profile;
}

export default function ProfileCompletion({ profile }: ProfileCompletionProps) {
    const calculateCompletion = () => {
        const checks = [
            { label: 'Profile Picture', completed: !!profile.avatar_url, weight: 15 },
            { label: 'Headline', completed: !!profile.headline && profile.headline.length > 10, weight: 10 },
            { label: 'About', completed: !!profile.about && profile.about.length > 50, weight: 15 },
            { label: 'Location', completed: !!profile.location, weight: 5 },
            { label: 'Skills (3+)', completed: !!profile.skills && profile.skills.length >= 3, weight: 15 },
            { label: 'Experience', completed: !!profile.experience && profile.experience.length >= 1, weight: 20 },
            { label: 'Social Links (2+)', completed: getSocialLinksCount() >= 2, weight: 10 },
            { label: 'Resume', completed: !!profile.resume_url, weight: 10 },
        ];

        const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
        const completedWeight = checks.filter(c => c.completed).reduce((sum, check) => sum + check.weight, 0);
        const percentage = Math.round((completedWeight / totalWeight) * 100);

        return { checks, percentage };
    };

    const getSocialLinksCount = () => {
        let count = 0;
        if (profile.linkedin_url) count++;
        if (profile.github_url) count++;
        if (profile.twitter_url) count++;
        if (profile.instagram_url) count++;
        if (profile.facebook_url) count++;
        if (profile.website_url || profile.website) count++;
        return count;
    };

    const { checks, percentage } = calculateCompletion();

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
