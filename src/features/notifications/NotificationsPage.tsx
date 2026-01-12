import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, UserPlus, Check, X, Bell } from 'lucide-react';
import { type Profile } from '../../types';

interface NotificationItem {
    id: string; // Connection ID
    created_at: string;
    requester: Profile;
}

export default function NotificationsPage() {
    const [requests, setRequests] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchNotifications();

        // Subscribe to NEW connection requests in real-time
        const channel = supabase
            .channel('connection-requests')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'connections',
                },
                (payload) => {
                    // We only care if WE are the recipient
                    supabase.auth.getUser().then(({ data: { user } }) => {
                        if (user && payload.new.recipient_id === user.id) {
                            // Fetch full details of the new request
                            fetchSingleRequest(payload.new.id);
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch pending connection requests where I am the recipient
            const { data } = await supabase
                .from('connections')
                .select(`
                    id,
                    created_at,
                    requester:profiles!requester_id (
                        id,
                        name,
                        role,
                        university,
                        avatar_url
                    )
                `)
                .eq('recipient_id', user.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            // Cast data carefully as Supabase types can be tricky with joins
            if (data) {
                const formatted = data.map((item: any) => ({
                    id: item.id,
                    created_at: item.created_at,
                    requester: item.requester
                }));
                setRequests(formatted);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSingleRequest = async (connectionId: string) => {
        const { data } = await supabase
            .from('connections')
            .select(`
                id,
                created_at,
                requester:profiles!requester_id (*)
            `)
            .eq('id', connectionId)
            .single();

        if (data) {
            setRequests((prev) => [
                { id: data.id, created_at: data.created_at, requester: data.requester } as any,
                ...prev
            ]);
        }
    };

    const handleAction = async (connectionId: string, action: 'accept' | 'reject') => {
        setProcessing(connectionId);
        try {
            if (action === 'accept') {
                await supabase
                    .from('connections')
                    .update({ status: 'accepted' })
                    .eq('id', connectionId);
            } else {
                await supabase
                    .from('connections')
                    .delete()
                    .eq('id', connectionId); // Or update to 'rejected' if you prefer soft delete
            }

            // Remove from list locally
            setRequests((prev) => prev.filter(req => req.id !== connectionId));
        } catch (error) {
            console.error(`Error ${action}ing request:`, error);
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                Notifications
                {requests.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {requests.length}
                    </span>
                )}
            </h1>

            <div className="space-y-4">
                {requests.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-stone-100 border-dashed">
                        <Bell className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                        <h3 className="text-stone-900 font-medium">No new notifications</h3>
                        <p className="text-stone-500 text-sm">You're all caught up!</p>
                    </div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-stone-100 overflow-hidden relative">
                                    <img
                                        src={req.requester.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.requester.name)}&background=random`}
                                        alt={req.requester.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border-2 border-white">
                                        <UserPlus className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-stone-900 text-sm">
                                        <span className="font-bold">{req.requester.name}</span> wants to connect with you.
                                    </p>
                                    <p className="text-xs text-stone-500 mt-0.5">
                                        {req.requester.role === 'org' ? 'Organization' : req.requester.university} • {new Date(req.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleAction(req.id, 'accept')}
                                    disabled={processing === req.id}
                                    className="p-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors disabled:opacity-50"
                                    title="Accept"
                                >
                                    {processing === req.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, 'reject')}
                                    disabled={processing === req.id}
                                    className="p-2 bg-stone-100 text-stone-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                                    title="Reject"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
