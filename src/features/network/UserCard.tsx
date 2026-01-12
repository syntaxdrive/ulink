import { User, Building2, UserPlus, Check, Clock } from 'lucide-react';

interface Profile {
    id: string;
    name: string;
    role: 'student' | 'org';
    university?: string;
    avatar_url?: string;
}

interface UserCardProps {
    profile: Profile;
    status: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
    onConnect: () => void;
    onAccept: () => void;
    isLoading: boolean;
}

export default function UserCard({ profile, status, onConnect, onAccept, isLoading }: UserCardProps) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md">
            <div className="mb-4 relative">
                <img
                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=10b981&color=fff`}
                    alt={profile.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-emerald-50"
                />
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-stone-100 shadow-sm">
                    {profile.role === 'student' ? (
                        <User className="w-3 h-3 text-emerald-600" />
                    ) : (
                        <Building2 className="w-3 h-3 text-emerald-600" />
                    )}
                </div>
            </div>

            <h3 className="font-bold text-stone-800 mb-1">{profile.name}</h3>
            <p className="text-sm text-stone-500 mb-4 h-10 line-clamp-2">
                {profile.role === 'student' ? profile.university : 'Organization'}
            </p>

            {status === 'none' && (
                <button
                    onClick={onConnect}
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                    <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Connect
                </button>
            )}

            {status === 'pending_sent' && (
                <button
                    disabled
                    className="w-full py-2 px-4 bg-stone-50 text-stone-400 rounded-xl font-medium flex items-center justify-center gap-2 cursor-default"
                >
                    <Clock className="w-4 h-4" />
                    Pending
                </button>
            )}

            {status === 'pending_received' && (
                <button
                    onClick={onAccept}
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                    <Check className="w-4 h-4" />
                    Accept
                </button>
            )}

            {status === 'accepted' && (
                <button
                    disabled
                    className="w-full py-2 px-4 bg-emerald-50 text-emerald-700 rounded-xl font-medium flex items-center justify-center gap-2 cursor-default"
                >
                    <Check className="w-4 h-4" />
                    Connected
                </button>
            )}
        </div>
    );
}
