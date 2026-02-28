import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Users, Plus, ArrowRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';


export default function SuggestedCommunities() {
    const [communities, setCommunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCommunities();
    }, []);

    const fetchCommunities = async () => {
        try {
            // Fetch random 5 communities
            // Since we can't do random efficiently securely on client without RPC, 
            // we'll just fetch latest 5 for now.
            // Ideally: order by members_count desc
            const { data } = await supabase
                .from('communities')
                .select('*, community_members(count)')
                .limit(4)
                .order('created_at', { ascending: false });

            if (data) {
                const formatted = data.map(c => ({
                    ...c,
                    members_count: c.community_members?.[0]?.count || 0
                }));
                setCommunities(formatted);
            }
        } catch (error) {
            console.error('Error fetching suggested communities:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="bg-white/70 dark:bg-bg-cardDark/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-stone-200/50 dark:border-zinc-800/50 space-y-4 animate-pulse">
            <div className="h-6 w-1/2 bg-stone-200 dark:bg-zinc-800 rounded-full"></div>
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-200"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-3/4 bg-stone-200 rounded-full"></div>
                            <div className="h-2 w-1/2 bg-stone-200 rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-white/70 dark:bg-bg-cardDark/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-stone-200/50 dark:border-zinc-800/50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-500" />
                    <span>Communities</span>
                </h3>
                <Link to="/app/communities" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                    View All
                </Link>
            </div>

            <div className="space-y-4">
                {communities.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-sm text-stone-500 mb-3">No communities yet.</p>
                        <Link to="/app/communities" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
                            <Plus className="w-3 h-3" /> Create One
                        </Link>
                    </div>
                ) : (
                    <>
                        {communities.map(community => (
                            <Link
                                key={community.id}
                                to={`/app/communities/${community.slug}`}
                                className="flex items-center gap-3 group hover:bg-stone-50 p-2 rounded-xl transition-all"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${community.icon_url ? '' : 'bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600'
                                    }`}>
                                    {community.icon_url ? (
                                        <img src={community.icon_url} alt={community.name} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        community.name.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-stone-900 dark:text-zinc-100 text-sm truncate group-hover:text-indigo-600 transition-colors">
                                        {community.name}
                                    </h4>
                                    <div className="flex items-center gap-1 text-[10px] text-stone-500 dark:text-zinc-500 font-medium">
                                        <Users className="w-3 h-3 text-indigo-500" />
                                        <span>{community.members_count} members</span>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}

                        <Link
                            to="/app/communities"
                            className="block w-full py-2 text-center text-xs font-semibold text-stone-400 hover:text-indigo-600 transition-colors border-t border-stone-100 pt-3"
                        >
                            Find more communities
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
