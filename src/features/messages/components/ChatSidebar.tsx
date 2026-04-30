import { useMemo, useState } from 'react';
import { Search, BadgeCheck } from 'lucide-react';
import type { Profile } from '../../../types';

interface ChatSidebarProps {
    conversations: Profile[];
    activeChat: Profile | null;
    setActiveChat: (profile: Profile) => void;
    unreadCounts: Record<string, number>;
    onlineUsers: Set<string>;
    activeTab: 'all' | 'market';
    onTabChange: (tab: 'all' | 'market') => void;
}

export default function ChatSidebar({ 
    conversations, 
    activeChat, 
    setActiveChat, 
    unreadCounts, 
    onlineUsers,
    activeTab,
    onTabChange 
}: ChatSidebarProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredConversations = useMemo(() => {
        let filtered = conversations;
        
        // Tab filtering
        if (activeTab === 'market') {
            filtered = conversations.filter(c => {
                const isMarket = (c as any).last_message && (c as any).last_message.includes('🛒');
                // Always show the currently active chat if it's the one we're deep-linking to
                const isActiveMarket = activeChat?.id === c.id;
                return isMarket || isActiveMarket;
            });
        } else {
            filtered = conversations.filter(c => !((c as any).last_message && (c as any).last_message.includes('🛒')));
        }

        const q = searchTerm.trim().toLowerCase();
        if (!q) return filtered;
        return filtered.filter((profile) => {
            const haystack = [profile.name, profile.username, profile.headline, profile.university, profile.role]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [conversations, searchTerm, activeTab]);

    return (
        <div className={`w-full md:w-80 border-r border-stone-100 dark:border-zinc-800 flex flex-col h-full bg-white dark:bg-black ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-stone-100 dark:border-zinc-800">
                <h2 className="font-bold text-lg mb-4 text-stone-900 dark:text-white">Messages</h2>
                
                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-stone-100 dark:bg-zinc-900 rounded-xl mb-4">
                    <button
                        onClick={() => onTabChange('all')}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${activeTab === 'all' ? 'bg-white dark:bg-zinc-800 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 dark:text-zinc-500 hover:text-stone-700'}`}
                    >
                        Chats
                    </button>
                    <button
                        onClick={() => onTabChange('market')}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${activeTab === 'market' ? 'bg-white dark:bg-zinc-800 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 dark:text-zinc-500 hover:text-stone-700'}`}
                    >
                        Marketplace
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                    <input
                        type="text"
                        placeholder={activeTab === 'market' ? "Search market chats..." : "Search connections..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-zinc-600"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto smooth-scroll divide-y divide-stone-50/80 dark:divide-zinc-900/50">
                {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-stone-500 dark:text-zinc-500 text-sm">
                        <p>{searchTerm.trim() ? 'No matching conversations.' : 'No connections yet.'}</p>
                    </div>
                ) : (
                    filteredConversations.map((profile) => (
                        <button
                            key={profile.id}
                            onClick={() => setActiveChat(profile)}
                            className={`w-full p-4 flex items-center gap-3 hover:bg-stone-50 dark:hover:bg-zinc-900 transition-all duration-300 text-left 
                                    ${activeChat?.id === profile.id ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}
                                    ${unreadCounts[profile.id] ? 'bg-emerald-50/50 dark:bg-emerald-950/10' : ''}
                                `}
                        >
                            <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                                <img
                                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
                                    alt={profile.name}
                                    className="w-full h-full object-cover"
                                />
                                {onlineUsers.has(profile.id) && (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-black rounded-full z-10"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium text-stone-900 dark:text-white truncate flex items-center gap-1">
                                        {profile.name}
                                        {profile.gold_verified ? (
                                            <BadgeCheck className="w-4 h-4 text-yellow-500 fill-yellow-50 shrink-0" />
                                        ) : profile.is_verified ? (
                                            <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50 shrink-0" />
                                        ) : null}
                                    </h3>
                                    {unreadCounts[profile.id] > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-in zoom-in duration-300 shadow-sm flex items-center justify-center">
                                            {unreadCounts[profile.id]}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-stone-500 dark:text-zinc-500 truncate">{profile.headline || profile.university || profile.role}</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
