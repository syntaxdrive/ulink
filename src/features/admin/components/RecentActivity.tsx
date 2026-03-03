import { format } from 'date-fns';
import { FileText, MessageCircle, Briefcase, UserPlus, Clock } from 'lucide-react';

interface Activity {
    activity_type: string;
    user_id: string;
    user_name: string;
    user_avatar: string | null;
    description: string;
    created_at: string;
}

interface RecentActivityProps {
    activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'post': return <FileText className="w-4 h-4 text-emerald-500" />;
            case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
            case 'job': return <Briefcase className="w-4 h-4 text-orange-500" />;
            case 'signup': return <UserPlus className="w-4 h-4 text-purple-500" />;
            default: return <Clock className="w-4 h-4 text-slate-500" />;
        }
    };

    const getBadgeStyle = (type: string) => {
        switch (type) {
            case 'post': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'comment': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'job': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'signup': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-stone-200 dark:border-zinc-700 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/50">
                <h3 className="font-bold text-lg text-stone-900 dark:text-white">Recent Activity</h3>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">Live</span>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-zinc-800 max-h-[500px] overflow-y-auto no-scrollbar">
                {activities.length > 0 ? (
                    activities.map((activity, i) => (
                        <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors flex items-start gap-4 group">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden ring-2 ring-white dark:ring-zinc-900 shadow-sm">
                                    <img
                                        src={activity.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user_name)}&background=random`}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 p-1 rounded-full shadow-md border border-slate-100 dark:border-zinc-800">
                                    {getIcon(activity.activity_type)}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-sm text-stone-900 dark:text-white truncate">
                                        {activity.user_name}
                                    </span>
                                    <span className="text-[10px] font-medium text-stone-400 dark:text-zinc-500 whitespace-nowrap ml-2">
                                        {format(new Date(activity.created_at), 'HH:mm')}
                                    </span>
                                </div>
                                <p className="text-sm text-stone-600 dark:text-zinc-400 line-clamp-2 leading-snug">
                                    {activity.description}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${getBadgeStyle(activity.activity_type)}`}>
                                        {activity.activity_type}
                                    </span>
                                    <span className="text-[10px] text-stone-400 dark:text-zinc-500 italic">
                                        {format(new Date(activity.created_at), 'MMM d')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-10 text-center text-stone-400 dark:text-zinc-500">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No activity recorded yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
