import { useState, useEffect } from 'react';
import { Copy, Share2, Users, Trophy, Gift, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Profile } from '../../../types';
import { getBaseUrl } from '../../../config';

export default function ReferralCard() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [referralCount, setReferralCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch profile with referral code
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileData) setProfile(profileData);

        // Fetch referral count
        const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', user.id);

        setReferralCount(count || 0);
        setLoading(false);
    };

    const copyToClipboard = () => {
        if (!profile?.referral_code) return;
        const referralLink = `${getBaseUrl()}/signup?ref=${profile.referral_code}`;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLink = async () => {
        if (!profile?.referral_code) return;
        const referralLink = `${getBaseUrl()}/signup?ref=${profile.referral_code}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join me on UniLink!',
                    text: 'Join the largest network for Nigerian students and start earning rewards.',
                    url: referralLink,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            copyToClipboard();
        }
    };

    if (loading) return (
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-stone-200 dark:border-zinc-800 animate-pulse">
            <div className="h-6 w-1/2 bg-stone-200 dark:bg-zinc-800 rounded mb-4" />
            <div className="h-20 bg-stone-100 dark:bg-zinc-800/50 rounded-2xl" />
        </div>
    );

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-stone-200 dark:border-zinc-800 shadow-xl shadow-stone-100 dark:shadow-zinc-900/50 overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold mb-3 uppercase tracking-wider">
                            <Gift className="w-3 h-3" />
                            Referral Program
                        </div>
                        <h2 className="text-2xl font-black text-stone-900 dark:text-white leading-tight">
                            Invite Friends, <br />
                            <span className="text-emerald-600">Earn Rewards</span>
                        </h2>
                    </div>
                    <div className="p-4 bg-stone-50 dark:bg-zinc-800 rounded-2xl text-center border border-stone-100 dark:border-zinc-700">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter mb-1">Referrals</p>
                        <p className="text-2xl font-black text-stone-900 dark:text-white">{referralCount}</p>
                    </div>
                </div>

                <p className="text-stone-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">
                    Share your unique link with your schoolmates. You'll earn <span className="font-bold text-emerald-600 dark:text-emerald-500">+50 points</span> for every student who joins!
                </p>

                {/* Code Display */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 bg-stone-50 dark:bg-zinc-800/50 border border-dashed border-emerald-300 dark:border-emerald-600/30 rounded-2xl p-4 flex items-center justify-between group">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase mb-0.5">Your Referral Link</p>
                            <p className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate">
                                {getBaseUrl().replace('https://', '')}/signup?ref={profile?.referral_code || '...'}
                            </p>
                        </div>
                        <button
                            onClick={copyToClipboard}
                            disabled={!profile?.referral_code}
                            className="p-2.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-all active:scale-90 disabled:opacity-50"
                            title="Copy Link"
                        >
                            {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>

                    <button
                        onClick={shareLink}
                        disabled={!profile?.referral_code}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-full px-8 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 py-4 md:py-0 disabled:opacity-50"
                    >
                        <Share2 className="w-5 h-5" />
                        Share Now
                    </button>
                </div>

                {/* Bonus milestones */}
                <div className="mt-8 pt-8 border-t border-stone-100 dark:border-zinc-800 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-stone-900 dark:text-white">Top Referrer</p>
                            <p className="text-[10px] text-stone-500">Weekly Badge</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-stone-900 dark:text-white">Networking</p>
                            <p className="text-[10px] text-stone-500">Auto-Connect</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
