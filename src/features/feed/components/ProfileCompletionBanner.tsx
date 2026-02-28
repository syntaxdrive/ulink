import { Link } from 'react-router-dom';
import { Camera, GraduationCap, FileText, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

export default function ProfileCompletionBanner({ profile }: { profile: any }) {
    const [dismissed, setDismissed] = useState(false);

    if (!profile || dismissed) return null;

    // Calculate completion score
    let completedSteps = 0;
    const totalSteps = 4;
    const missing: { icon: any, label: string }[] = [];

    if (profile.avatar_url) completedSteps++;
    else missing.push({ icon: Camera, label: 'Add Profile Photo' });

    if (profile.headline) completedSteps++;
    else missing.push({ icon: FileText, label: 'Add Headline' });

    if (profile.role === 'student') {
        if (profile.university) completedSteps++;
        else missing.push({ icon: GraduationCap, label: 'Add University' });
    } else {
        if (profile.industry) completedSteps++;
        else missing.push({ icon: FileText, label: 'Add Industry' });
    }

    if (profile.about) completedSteps++;
    else missing.push({ icon: FileText, label: 'Add Bio' });

    const percentage = Math.round((completedSteps / totalSteps) * 100);

    // If fully complete, don't show the banner
    if (completedSteps === totalSteps) return null;

    return (
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-stone-200/50 dark:border-zinc-800/50 mb-6 relative">
            <button
                onClick={() => setDismissed(true)}
                className="absolute top-4 right-4 p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 rounded-full transition-colors"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="flex-1 w-full">
                    <h3 className="font-bold text-lg text-stone-900 dark:text-white mb-1">
                        Complete your profile
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-zinc-400 mb-4">
                        A complete profile helps you connect with more people!
                    </p>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-2.5 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-stone-700 dark:text-zinc-200 w-10 text-right">
                            {percentage}%
                        </span>
                    </div>

                    {/* Missing Steps */}
                    <div className="flex flex-wrap gap-2">
                        {missing.slice(0, 2).map((step, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-700/50 rounded-xl text-xs font-semibold text-stone-600 dark:text-zinc-300">
                                <step.icon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                                {step.label}
                            </div>
                        ))}
                    </div>
                </div>

                <Link
                    to="/app/profile"
                    className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
                >
                    Update Profile
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
