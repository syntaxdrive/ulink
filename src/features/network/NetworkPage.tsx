import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, UserPlus, Check, Search, BadgeCheck, School } from 'lucide-react';
import { useNetwork } from './hooks/useNetwork';

export default function NetworkPage() {
    const { suggestions, myNetwork, loading, connections, sentRequests, connecting, connect, searchUsers, searchResults, searching, userProfile } = useNetwork();
    const [activeTab, setActiveTab] = useState<'grow' | 'network'>('grow');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'university' | 'verified'>('all');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchUsers(searchQuery);
            }
        }, 300); // Wait 300ms after user stops typing

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Determine which profiles to display
    const displayedProfiles = searchQuery.trim()
        ? searchResults // Show search results when searching
        : (activeTab === 'grow' ? suggestions : myNetwork); // Otherwise show tab content

    const filteredProfiles = displayedProfiles.filter(profile => {
        if (activeFilter === 'university') {
            if (!userProfile?.university || !profile.university) return false;
            return profile.university.toLowerCase().trim() === userProfile.university.toLowerCase().trim();
        }
        if (activeFilter === 'verified') {
            return profile.is_verified || profile.gold_verified;
        }
        return true;
    });

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header & Tabs */}
            <div className="sticky top-0 bg-[#FAFAFA]/95 dark:bg-zinc-950/95 backdrop-blur-md z-30 pt-4 pb-4 space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 font-display transition-colors">Your Network</h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Connect with students, alumni, and communities.</p>
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {searching ? (
                            <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                        ) : (
                            <Search className="h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                        )}
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800 rounded-2xl text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 shadow-sm transition-all"
                        placeholder="Search people..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex p-1 bg-white dark:bg-bg-cardDark border border-stone-200 dark:border-zinc-800 rounded-xl w-full sm:w-fit overflow-x-auto transition-colors">
                    <button
                        onClick={() => setActiveTab('grow')}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'grow'
                            ? 'bg-stone-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                            : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-zinc-800'
                            }`}
                    >
                        Grow
                        {suggestions.length > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === 'grow' ? 'bg-white/20 text-white dark:text-zinc-900' : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'}`}>
                                {suggestions.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('network')}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'network'
                            ? 'bg-stone-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                            : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-zinc-800'
                            }`}
                    >
                        My Network
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === 'network' ? 'bg-white/20 text-white dark:text-zinc-900' : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'}`}>
                            {myNetwork.length}
                        </span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex-shrink-0 snap-start ${activeFilter === 'all'
                            ? 'bg-stone-900 dark:bg-white text-white dark:text-zinc-900 border-stone-900 dark:border-white'
                            : 'bg-white dark:bg-bg-cardDark text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800'
                            }`}
                    >
                        All
                    </button>
                    {userProfile?.university && (
                        <button
                            onClick={() => setActiveFilter('university')}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 snap-start ${activeFilter === 'university'
                                ? 'bg-stone-900 dark:bg-white text-white dark:text-zinc-900 border-stone-900 dark:border-white'
                                : 'bg-white dark:bg-bg-cardDark text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <School className="w-3 h-3" /> {userProfile.university}
                        </button>
                    )}
                    <button
                        onClick={() => setActiveFilter('verified')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 snap-start ${activeFilter === 'verified'
                            ? 'bg-stone-900 dark:bg-white text-white dark:text-zinc-900 border-stone-900 dark:border-white'
                            : 'bg-white dark:bg-bg-cardDark text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800'
                            }`}
                    >
                        <BadgeCheck className="w-3 h-3" /> Verified
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProfiles.map((profile) => (
                    <div key={profile.id} className="bg-white dark:bg-bg-cardDark p-5 rounded-3xl border border-stone-100 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all flex items-center gap-4 group">
                        <Link to={`/app/profile/${profile.username || profile.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 dark:bg-zinc-800 ring-2 ring-white dark:ring-zinc-900 shadow-sm shrink-0">
                                <img
                                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || profile.email?.split('@')[0] || 'U')}&background=10b981&color=fff`}
                                    alt={profile.name || 'User'}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-stone-900 dark:text-white truncate flex items-center gap-1">
                                    {profile.name || profile.email?.split('@')[0] || 'New User'}
                                    {profile.gold_verified ? (
                                        <BadgeCheck className="w-4 h-4 text-yellow-500 fill-yellow-50 shrink-0" />
                                    ) : profile.is_verified ? (
                                        <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50 shrink-0" />
                                    ) : null}
                                </h3>
                                <p className="text-sm text-stone-500 dark:text-zinc-400 truncate">
                                    {profile.role === 'org' ? 'Organization' : (profile.university || 'Setting up profile…')}
                                </p>
                                <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5 capitalize">{profile.role || 'student'}</p>
                            </div>
                        </Link>

                        {activeTab === 'grow' ? (
                            <button
                                onClick={() => {
                                    if (!userProfile) {
                                        alert('Please sign in to send connection requests.');
                                        return;
                                    }
                                    connect(profile.id);
                                }}
                                disabled={connections.has(profile.id) || sentRequests.has(profile.id) || connecting === profile.id}
                                className={`p-2.5 rounded-xl transition-all shrink-0 ${connections.has(profile.id)
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : sentRequests.has(profile.id)
                                        ? 'bg-stone-100 text-stone-500 cursor-default'
                                        : 'bg-stone-900 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200'
                                    }`}
                            >
                                {connections.has(profile.id) ? (
                                    <Check className="w-5 h-5" />
                                ) : sentRequests.has(profile.id) ? (
                                    <span className="text-xs font-semibold px-1">Sent</span>
                                ) : connecting === profile.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <UserPlus className="w-5 h-5" />
                                )}
                            </button>
                        ) : (
                            <Link
                                to={`/app/messages?chat=${profile.id}`}
                                className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shrink-0 border border-transparent dark:border-zinc-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                            </Link>
                        )}
                    </div>
                ))}

                {filteredProfiles.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <p className="text-stone-400">
                            {searchQuery.trim()
                                ? 'No users found for your search.'
                                : activeTab === 'grow'
                                    ? 'You\u2019ve connected with everyone — impressive!'
                                    : 'You haven\u2019t connected with anyone yet.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
