import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, Globe, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { type Community } from '../../types';
import CreateCommunityModal from './components/CreateCommunityModal';

export default function CommunitiesPage({ embed = false }: { embed?: boolean }) {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchCommunities();
    }, []);

    const fetchCommunities = async () => {
        setLoading(true);
        try {
            // Fetch communities with member count
            const { data, error } = await supabase
                .from('communities')
                .select('*, community_members(count)')
                .order('created_at', { ascending: false });

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

    const filteredCommunities = communities.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={embed ? "" : "max-w-5xl mx-auto"}>
            {/* Header */}
            {!embed && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-stone-900">Communities</h1>
                        <p className="text-stone-500 mt-1">Discover and join groups based on your interests and campus.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-stone-200"
                    >
                        <Plus className="w-5 h-5" />
                        Create Community
                    </button>
                </div>
            )}

            {embed && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-stone-200"
                    >
                        <Plus className="w-5 h-5" />
                        Create Community
                    </button>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                    type="text"
                    placeholder="Search communities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 bg-stone-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredCommunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCommunities.map(community => (
                        <Link
                            key={community.id}
                            to={`/app/communities/${community.slug}`}
                            className="group bg-white rounded-3xl border border-stone-200 p-6 hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner ${community.icon_url ? '' : 'bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600'
                                    }`}>
                                    {community.icon_url ? (
                                        <img src={community.icon_url} className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        community.name.charAt(0)
                                    )}
                                </div>
                                <div className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-100 flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
                                    {community.privacy === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                    {community.privacy}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-stone-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                {community.name}
                            </h3>
                            <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                                {community.description || 'No description provided.'}
                            </p>

                            <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2 text-stone-400 text-xs font-semibold">
                                    <Users className="w-4 h-4" />
                                    <span>{community.members_count || 0} Members</span>
                                </div>
                                <span className="text-indigo-600 text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                    View Group →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-300">
                        <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 mb-1">No communities found</h3>
                    <p className="text-stone-500 max-w-md mx-auto">
                        We couldn't find any communities matching "{searchQuery}".
                        Why not create your own?
                    </p>
                    <button
                        onClick={() => { setSearchQuery(''); setIsCreateModalOpen(true); }}
                        className="mt-6 text-indigo-600 font-bold hover:underline"
                    >
                        Create new community
                    </button>
                </div>
            )}

            <CreateCommunityModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
