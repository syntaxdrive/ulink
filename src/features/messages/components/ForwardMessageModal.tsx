import { useState, useEffect } from 'react';
import { X, Search, Send, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Profile, Message } from '../../../types';

interface ForwardMessageModalProps {
    message: Message | null;
    isOpen: boolean;
    onClose: () => void;
    onForward: (recipientIds: string[], message: Message) => Promise<void>;
}

export default function ForwardMessageModal({ message, isOpen, onClose, onForward }: ForwardMessageModalProps) {
    const [contacts, setContacts] = useState<Profile[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [forwarding, setForwarding] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchContacts();
            setSelectedContacts(new Set());
            setSearchQuery('');
        }
    }, [isOpen]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get all connections
            const { data: connections } = await supabase
                .from('connections')
                .select('requester_id, recipient_id')
                .eq('status', 'accepted')
                .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

            if (!connections) return;

            // Extract contact IDs
            const contactIds = connections.map(conn =>
                conn.requester_id === user.id ? conn.recipient_id : conn.requester_id
            );

            // Fetch profiles
            const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .in('id', contactIds)
                .order('name');

            if (profiles) {
                setContacts(profiles);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleContact = (contactId: string) => {
        const newSelected = new Set(selectedContacts);
        if (newSelected.has(contactId)) {
            newSelected.delete(contactId);
        } else {
            newSelected.add(contactId);
        }
        setSelectedContacts(newSelected);
    };

    const handleForward = async () => {
        if (!message || selectedContacts.size === 0) return;

        setForwarding(true);
        try {
            await onForward(Array.from(selectedContacts), message);
            onClose();
        } catch (error) {
            console.error('Error forwarding message:', error);
            alert('Failed to forward message');
        } finally {
            setForwarding(false);
        }
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-stone-900">Forward Message</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-stone-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search contacts..."
                            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                    </div>
                </div>

                {/* Contacts List */}
                <div className="max-h-96 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="text-center py-8 text-stone-400">
                            {searchQuery ? 'No contacts found' : 'No connections yet'}
                        </div>
                    ) : (
                        filteredContacts.map(contact => (
                            <button
                                key={contact.id}
                                onClick={() => toggleContact(contact.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${selectedContacts.has(contact.id)
                                        ? 'bg-emerald-50 border-2 border-emerald-500'
                                        : 'hover:bg-stone-50 border-2 border-transparent'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-200 shrink-0">
                                    <img
                                        src={contact.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}`}
                                        alt={contact.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="font-semibold text-stone-900 truncate">{contact.name}</p>
                                    {contact.username && (
                                        <p className="text-xs text-stone-500 truncate">@{contact.username}</p>
                                    )}
                                </div>
                                {selectedContacts.has(contact.id) && (
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-stone-100 flex items-center justify-between">
                    <p className="text-sm text-stone-500">
                        {selectedContacts.size} selected
                    </p>
                    <button
                        onClick={handleForward}
                        disabled={selectedContacts.size === 0 || forwarding}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {forwarding ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Forwarding...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Forward
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
