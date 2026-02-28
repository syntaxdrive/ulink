import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, Globe, Lock, Loader2, Compass } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { type Community } from '../../types';
import CreateCommunityModal from './components/CreateCommunityModal';

export default function CommunitiesPage({ embed = false }: { embed?: boolean }) {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchCommunities = async (query: string = '') => {
        setLoading(true);
        try {
            let dbQuery = supabase
                .from('communities')
                .select('*, community_members(count)')
                .order('created_at', { ascending: false });

            if (query.trim()) {
                dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
            }

            const { data, error } = await dbQuery.limit(50);

            if (error) throw error;

            const communitiesWithCount = data.map(c => ({
                ...c,
                members_count: c.community_members?.[0]?.count || 0
            }));

            setCommunities(communitiesWithCount || []);
        } catch (error) {
            console.error('Error fetching communities:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchCommunities();
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCommunities(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <div className={`transition-colors duration-300 ${embed ? "" : "max-w-6xl mx-auto"}`}>
            {/* Header */}
            {!embed && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-4 md:px-0">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Compass className="w-5 h-5 text-emerald-500" />
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Discovery</span>
                        </div>
                        <h1 className="text-4xl font-display font-black text-stone-900 dark:text-white tracking-tight">Communities</h1>
                        <p className="text-stone-500 dark:text-zinc-400 font-medium">Discover and join groups based on your interests and campus.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-3.5 bg-stone-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-stone-200 dark:shadow-none hover:scale-105 active:scale-95 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        CREATE COMMUNITY
                    </button>
                </div>
            )}

            {embed && (
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-lg hover:bg-emerald-600 hover:text-white font-sans"
                    >
                        <Plus className="w-4 h-4" />
                        CREATE
                    </button>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative mb-10 px-4 md:px-0 group">
                <Search className="absolute left-8 md:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search for tech groups, study circles, or campus societies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 md:pl-14 pr-6 py-4 md:py-5 bg-white dark:bg-bg-cardDark border border-stone-200 dark:border-zinc-800 rounded-[2rem] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-900/20 transition-all font-medium text-stone-900 dark:text-white shadow-sm placeholder:text-stone-400 dark:placeholder:text-zinc-600"
                />
                {loading && searchQuery && (
                    <div className="absolute right-8 md:right-5 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    </div>
                )}
            </div>

            {/* Grid */}
            <div className="px-4 md:px-0">
                {loading && communities.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-stone-100 dark:bg-bg-cardDark rounded-[2rem] animate-pulse border border-stone-100 dark:border-zinc-800" />
                        ))}
                    </div>
                ) : communities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                        {communities.map((community, idx) => (
                            <Link
                                key={community.id}
                                to={`/app/communities/${community.slug}`}
                                className="group relative bg-white dark:bg-bg-cardDark rounded-[2.5rem] border border-stone-200/60 dark:border-zinc-800 p-8 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] dark:hover:shadow-none dark:hover:border-zinc-700 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-2xl font-black shadow-inner overflow-hidden ring-4 ring-stone-50 dark:ring-zinc-950 transition-transform group-hover:scale-110 duration-500 ${community.icon_url ? '' : 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                                        }`}>
                                        {community.icon_url ? (
                                            <img src={community.icon_url} className="w-full h-full object-cover" />
                                        ) : (
                                            community.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest shadow-sm">
                                        {community.privacy === 'public' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                        {community.privacy}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-display font-black text-stone-900 dark:text-white mb-3 leading-tight group-hover:text-emerald-500 transition-colors">
                                    {community.name}
                                </h3>
                                <p className="text-stone-500 dark:text-zinc-400 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                                    {community.description || 'Welcome to the inner circle! Join us to connect, share resources, and build meaningful relationships within our community.'}
                                </p>

                                <div className="pt-6 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2 text-stone-400 dark:text-zinc-500 text-xs font-black uppercase tracking-widest">
                                        <Users className="w-4 h-4 text-emerald-500" />
                                        <span>{community.members_count || 0} MEMBERS</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all transform scale-90 group-hover:scale-100">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 px-6 bg-stone-50/50 dark:bg-bg-cardDark/30 rounded-[3rem] border-2 border-dashed border-stone-200 dark:border-zinc-800">
                        <div className="w-24 h-24 bg-white dark:bg-bg-cardDark rounded-[2rem] shadow-xl border border-stone-100 dark:border-zinc-800 flex items-center justify-center mx-auto mb-8 text-stone-300 dark:text-zinc-700">
                            <Search className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-display font-black text-stone-900 dark:text-white mb-2">No results for "{searchQuery}"</h3>
                        <p className="text-stone-500 dark:text-zinc-400 max-w-md mx-auto font-medium mb-10 leading-relaxed">
                            We couldn't find any communities matching your search. Try adjusting your keywords or start an entirely new movement!
                        </p>
                        <button
                            onClick={() => { setSearchQuery(''); setIsCreateModalOpen(true); }}
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-200 dark:shadow-none active:scale-95 uppercase tracking-widest"
                        >
                            CREATE THE FIRST ONE
                        </button>
                    </div>
                )}
            </div>

            <CreateCommunityModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    fetchCommunities();
                }}
            />
        </div>
    );
}
