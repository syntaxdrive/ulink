import { Link } from 'react-router-dom';

interface EmptyFeedStateProps {
    onCreatePost?: () => void;
}

export default function EmptyFeedState({ onCreatePost }: EmptyFeedStateProps) {
    return (
        <div className="relative overflow-hidden bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-stone-200/50 dark:border-zinc-800/50 shadow-xl shadow-stone-200/20 dark:shadow-black/20">
            {/* Background Highlights */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-2xl mx-auto text-center space-y-6 z-10">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="text-6xl">👋</div>
                </div>

                {/* Heading */}
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                        Welcome to Your Feed!
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Your feed is looking a bit quiet. Let's get you started on your UniLink journey.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <button
                        onClick={onCreatePost}
                        className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all group"
                    >
                        <div className="text-3xl mb-3">✍️</div>
                        <h3 className="font-bold text-slate-900 mb-1">Share Your First Post</h3>
                        <p className="text-sm text-slate-500">Tell the community what you're up to</p>
                    </button>

                    <Link
                        to="/app/network"
                        className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all group"
                    >
                        <div className="text-3xl mb-3">🤝</div>
                        <h3 className="font-bold text-slate-900 mb-1">Connect with Students</h3>
                        <p className="text-sm text-slate-500">Build your professional network</p>
                    </Link>

                    <Link
                        to="/app/jobs"
                        className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all group"
                    >
                        <div className="text-3xl mb-3">💼</div>
                        <h3 className="font-bold text-slate-900 mb-1">Explore Opportunities</h3>
                        <p className="text-sm text-slate-500">Find internships and jobs</p>
                    </Link>
                </div>

                {/* Tips */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/50">
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center justify-center gap-2">
                        <span>💡</span>
                        Quick Tips to Get Started
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-2 text-left max-w-md mx-auto">
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold mt-0.5">•</span>
                            <span>Complete your profile to help others find and connect with you</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold mt-0.5">•</span>
                            <span>Share your thoughts, projects, or questions to engage the community</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold mt-0.5">•</span>
                            <span>Use hashtags like #TechNigeria or #StudentLife to reach more people</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
