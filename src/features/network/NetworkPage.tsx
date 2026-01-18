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
            <div className="sticky top-0 bg-[#FAFAFA]/95 backdrop-blur-md z-30 pt-4 pb-4 space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-display">Your Network</h1>
                    <p className="text-slate-500">Connect with students, alumni, and communities.</p>
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
                        className="block w-full pl-11 pr-4 py-3 bg-white border border-stone-200/50 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 shadow-sm transition-all"
                        placeholder="Search people..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex p-1 bg-white border border-stone-200 rounded-xl w-full sm:w-fit overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('grow')}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'grow'
                            ? 'bg-stone-900 text-white shadow-md'
                            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                            }`}
                    >
                        Grow
                    </button>
                    <button
                        onClick={() => setActiveTab('network')}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'network'
                            ? 'bg-stone-900 text-white shadow-md'
                            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                            }`}
                    >
                        My Network
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === 'network' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                            {myNetwork.length}
                        </span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeFilter === 'all'
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                            }`}
                    >
                        All
                    </button>
                    {userProfile?.university && (
                        <button
                            onClick={() => setActiveFilter('university')}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${activeFilter === 'university'
                                ? 'bg-stone-900 text-white border-stone-900'
                                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                                }`}
                        >
                            <School className="w-3 h-3" /> {userProfile.university}
                        </button>
                    )}
                    <button
                        onClick={() => setActiveFilter('verified')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${activeFilter === 'verified'
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                            }`}
                    >
                        <BadgeCheck className="w-3 h-3" /> Verified
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProfiles.map((profile) => (
                    <div key={profile.id} className="bg-white p-5 rounded-3xl border border-stone-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all flex items-center gap-4 group">
                        <Link to={`/app/profile/${profile.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 ring-2 ring-white shadow-sm shrink-0">
                                <img
                                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
                                    alt={profile.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-stone-900 truncate flex items-center gap-1">
                                    {profile.name}
                                    {profile.gold_verified ? (
                                        <BadgeCheck className="w-4 h-4 text-yellow-500 fill-yellow-50 shrink-0" />
                                    ) : profile.is_verified ? (
                                        <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50 shrink-0" />
                                    ) : null}
                                </h3>
                                <p className="text-sm text-stone-500 truncate">
                                    {profile.role === 'org' ? 'Organization' : profile.university}
                                </p>
                                <p className="text-xs text-stone-400 mt-0.5 capitalize">{profile.role}</p>
                            </div>
                        </Link>

                        {/* Action Button: Connect (Grow Tab) or Message (Network Tab) */}
                        {activeTab === 'grow' ? (
                            <button
                                onClick={() => connect(profile.id)}
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
                                className="p-2.5 rounded-xl bg-stone-50 text-stone-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all shrink-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                            </Link>
                        )}
                    </div>
                ))}

                {filteredProfiles.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <p className="text-stone-400">
                            {activeTab === 'grow'
                                ? "No new suggestions found."
                                : "You haven't connected with anyone yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
