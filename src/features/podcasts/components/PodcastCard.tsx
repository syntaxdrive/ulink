import { Users, Mic2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Podcast } from '../../../types';

interface Props {
    podcast: Podcast;
}

const CATEGORY_COLORS: Record<string, string> = {
    Technology:    'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
    Business:      'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
    Education:     'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
    Entertainment: 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400',
    Health:        'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
    Sports:        'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
    News:          'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
    Comedy:        'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
    Arts:          'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
    Other:         'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400',
};

export default function PodcastCard({ podcast }: Props) {
    const navigate = useNavigate();
    const categoryStyle = CATEGORY_COLORS[podcast.category] ?? CATEGORY_COLORS.Other;

    return (
        <button
            onClick={() => navigate(`/app/podcasts/${podcast.id}`)}
            className="group text-left bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
            {/* Cover art */}
            <div className="aspect-square overflow-hidden bg-slate-100 dark:bg-zinc-800 relative">
                {podcast.cover_url ? (
                    <img
                        src={podcast.cover_url}
                        alt={podcast.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                        <Mic2 className="w-10 h-10 text-white/80" />
                    </div>
                )}
                <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryStyle}`}>
                    {podcast.category}
                </span>
            </div>

            {/* Meta */}
            <div className="p-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate">{podcast.title}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                    by {podcast.creator?.name ?? 'Unknown'}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 dark:text-zinc-500">
                    <span className="flex items-center gap-0.5">
                        <Mic2 className="w-3 h-3" /> {podcast.episodes_count} ep
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                        <Users className="w-3 h-3" /> {podcast.followers_count.toLocaleString()}
                    </span>
                </div>
            </div>
        </button>
    );
}
