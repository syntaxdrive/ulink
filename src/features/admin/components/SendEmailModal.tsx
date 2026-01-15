import { useState } from 'react';
import { X, Mail, Loader2, Users, BadgeCheck, User } from 'lucide-react';
import { type Profile } from '../../../types';
import { supabase } from '../../../lib/supabase';

interface SendEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedUser?: Profile | null;
    allUsers?: Profile[];
}

type Audience = 'single' | 'all' | 'verified' | 'unverified';

export default function SendEmailModal({ isOpen, onClose, preSelectedUser, allUsers = [] }: SendEmailModalProps) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [audience, setAudience] = useState<Audience>(preSelectedUser ? 'single' : 'all');

    if (!isOpen) return null;

    const getRecipientCount = () => {
        switch (audience) {
            case 'single': return 1;
            case 'all': return allUsers.length;
            case 'verified': return allUsers.filter(u => u.is_verified).length;
            case 'unverified': return allUsers.filter(u => !u.is_verified).length;
            default: return 0;
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email || '';

        // Filter recipients
        let recipients: string[] = [];
        switch (audience) {
            case 'single':
                if (preSelectedUser?.email) recipients = [preSelectedUser.email];
                break;
            case 'all':
                recipients = allUsers.map(u => u.email).filter(Boolean);
                break;
            case 'verified':
                recipients = allUsers.filter(u => u.is_verified).map(u => u.email).filter(Boolean);
                break;
            case 'unverified':
                recipients = allUsers.filter(u => !u.is_verified).map(u => u.email).filter(Boolean);
                break;
        }

        if (recipients.length === 0) {
            alert('No recipients found for this selection.');
            setSending(false);
            return;
        }

        // Gmail URL Limit is approx 2000-8000 chars. To be safe, we chunk recipients.
        // Assuming avg email is 30 chars, 50 emails = 1500 chars.
        const CHUNK_SIZE = 50;
        const recipientChunks = [];
        for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
            recipientChunks.push(recipients.slice(i, i + CHUNK_SIZE));
        }

        // Open Gmail Composer(s)
        recipientChunks.forEach((chunk) => {
            const bccString = chunk.join(',');
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(userEmail)}&bcc=${encodeURIComponent(bccString)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
            window.open(gmailUrl, '_blank');
        });

        alert(`Opened ${recipientChunks.length} Gmail composer window(s) with ${recipients.length} recipients in BCC.`);
        setSending(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-stone-50 px-6 py-4 flex items-center justify-between border-b border-stone-100">
                    <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-indigo-500" />
                        Send Email Broadcast
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSend} className="p-6 space-y-6">
                    {/* Audience Selector */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-stone-900">Select Audience</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {preSelectedUser && (
                                <button
                                    type="button"
                                    onClick={() => setAudience('single')}
                                    className={`flex flex-col items-center p-3 rounded-xl border transition-all ${audience === 'single' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                                >
                                    <User className="w-5 h-5 mb-1" />
                                    <span className="text-xs font-medium">Single User</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setAudience('all')}
                                className={`flex flex-col items-center p-3 rounded-xl border transition-all ${audience === 'all' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                            >
                                <Users className="w-5 h-5 mb-1" />
                                <span className="text-xs font-medium">All Users</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAudience('verified')}
                                className={`flex flex-col items-center p-3 rounded-xl border transition-all ${audience === 'verified' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                            >
                                <BadgeCheck className="w-5 h-5 mb-1" />
                                <span className="text-xs font-medium">Verified Only</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAudience('unverified')}
                                className={`flex flex-col items-center p-3 rounded-xl border transition-all ${audience === 'unverified' ? 'bg-stone-100 border-stone-300 text-stone-700' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                            >
                                <Users className="w-5 h-5 mb-1 opacity-50" />
                                <span className="text-xs font-medium">Unverified Only</span>
                            </button>
                        </div>
                        <p className="text-xs text-stone-500 text-right">
                            Targeting <span className="font-bold text-stone-900">{getRecipientCount()}</span> user(s)
                            {audience === 'single' && preSelectedUser && ` (${preSelectedUser.name})`}
                        </p>
                    </div>

                    {/* Email Content */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="subject" className="text-sm font-semibold text-stone-900">Subject Line</label>
                            <input
                                id="subject"
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                placeholder="Important update..."
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="message" className="text-sm font-semibold text-stone-900">Message Body</label>
                            <textarea
                                id="message"
                                rows={6}
                                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                placeholder="Write your message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-stone-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-stone-500 font-medium hover:bg-stone-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={sending || getRecipientCount() === 0}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                            {sending ? 'Sending...' : 'Send Broadcast'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
