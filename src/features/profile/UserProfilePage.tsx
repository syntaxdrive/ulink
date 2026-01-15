import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { type Profile } from '../../types';
import { Loader2, Mail, School, Globe, MapPin, Briefcase, Github, Linkedin, BadgeCheck, ArrowLeft, Heart, MessageCircle, Award, ExternalLink, Trash2, Flag, UserPlus, Check, Clock, Share, UserMinus, Ban } from 'lucide-react';
import EditProfileModal from './components/EditProfileModal';

export default function UserProfilePage() {
    const { userId } = useParams();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const [posts, setPosts] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAddingCert, setIsAddingCert] = useState(false);
    const [newCert, setNewCert] = useState({ title: '', issuing_org: '', issue_date: '', credential_url: '' });

    // Connection Logic
    const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected' | 'received' | 'rejected' | 'blocked'>('none');
    const [actionLoading, setActionLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const fetchConnectionStatus = async (targetId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('connections')
            .select('*')
            .or(`and(requester_id.eq.${user.id},recipient_id.eq.${targetId}),and(requester_id.eq.${targetId},recipient_id.eq.${user.id})`)
            .maybeSingle();

        if (data) {
            if (data.status === 'blocked') {
                if (data.requester_id === user.id) {
                    setConnectionStatus('blocked'); // I blocked them
                } else {
                    setConnectionStatus('none'); // They blocked me (appear as none)
                }
            } else if (data.status === 'accepted') {
                setConnectionStatus('connected');
            } else if (data.status === 'rejected') {
                setConnectionStatus('rejected');
            } else if (data.requester_id === user.id) {
                setConnectionStatus('pending');
            } else {
                setConnectionStatus('received');
            }
        } else {
            setConnectionStatus('none');
        }
    };

    const handleConnect = async () => {
        setActionLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !profile) return;

        if (connectionStatus === 'none' || connectionStatus === 'rejected') {
            // Treat rejected as "can try again" or new request
            const { error } = await supabase
                .from('connections')
                .upsert({
                    requester_id: user.id,
                    recipient_id: profile.id,
                    status: 'pending'
                }, { onConflict: 'requester_id,recipient_id' });

            if (error) {
                alert(error.message);
            } else {
                setConnectionStatus('pending');
            }
        } else if (connectionStatus === 'received') {
            // Accept request logic
            const { error } = await supabase
                .from('connections')
                .update({ status: 'accepted' })
                .eq('recipient_id', user.id)
                .eq('requester_id', profile.id);
            if (!error) setConnectionStatus('connected');
        } else if (connectionStatus === 'blocked') {
            // Unblock logic (delete the block record)
            const { error } = await supabase
                .from('connections')
                .delete()
                // We know we are the requester if status is 'blocked' (from fetch logic)
                .match({ requester_id: user.id, recipient_id: profile.id });

            if (!error) setConnectionStatus('none');
        }

        setActionLoading(false);
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect?')) return;
        setActionLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !profile) return;

        // Delete the connection record regardless of who started it
        const { error } = await supabase
            .from('connections')
            .delete()
            .or(`and(requester_id.eq.${user.id},recipient_id.eq.${profile.id}),and(requester_id.eq.${profile.id},recipient_id.eq.${user.id})`);

        if (!error) setConnectionStatus('none');
        setActionLoading(false);
    };

    const handleBlock = async () => {
        if (!confirm('Are you sure you want to block this user? They will not be able to contact you.')) return;
        setActionLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !profile) return;

        // Upsert a block record: Current user is requester, Status is blocked
        // This overwrites any existing connection
        const { error } = await supabase
            .from('connections')
            .upsert({
                requester_id: user.id,
                recipient_id: profile.id,
                status: 'blocked'
            });

        if (!error) setConnectionStatus('blocked');
        setActionLoading(false);
    };

    const handleAddCertificate = async () => {
        if (!newCert.title || !newCert.issuing_org) return; // Basic validation
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('certificates').insert({
            user_id: user.id,
            ...newCert,
            issue_date: newCert.issue_date || null
        });

        if (!error) {
            setIsAddingCert(false);
            setNewCert({ title: '', issuing_org: '', issue_date: '', credential_url: '' });
            if (userId) fetchProfile(userId); // Refresh profile
        } else {
            console.error('Error adding cert:', error);
            alert('Failed to add certificate.');
        }
    };

    const fetchProfile = async (idOrUsername: string) => {
        let query = supabase.from('profiles').select('*, certificates(*)');

        // Simple UUID check
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUsername);

        if (isUUID) {
            query = query.eq('id', idOrUsername);
        } else {
            query = query.eq('username', idOrUsername);
        }

        const { data } = await query.single();

        if (data) {
            setProfile(data);
        }
        setLoading(false);
    };

    const fetchUserPosts = async (id: string) => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data } = await supabase
            .from('posts')
            .select(`
                *,
                profiles:author_id (*),
                likes (user_id),
                comments (id)
            `)
            .eq('author_id', id)
            .order('created_at', { ascending: false });

        if (data) {
            const formattedPosts = data.map((post: any) => ({
                ...post,
                likes_count: post.likes ? post.likes.length : 0,
                comments_count: post.comments ? post.comments.length : 0,
                user_has_liked: user ? post.likes.some((like: any) => like.user_id === user.id) : false
            }));
            setPosts(formattedPosts);
        }
    };

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
    }, []);

    useEffect(() => {
        if (userId) {
            fetchProfile(userId);
        }
    }, [userId]);

    useEffect(() => {
        if (profile?.id) {
            fetchUserPosts(profile.id);
            fetchConnectionStatus(profile.id);
        }
    }, [profile?.id]);

    const toggleLike = async (post: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Optimistic Update
        const isLiked = post.user_has_liked;
        const newLikeCount = isLiked ? (post.likes_count || 0) - 1 : (post.likes_count || 0) + 1;

        setPosts(prev => prev.map(p =>
            p.id === post.id
                ? { ...p, user_has_liked: !isLiked, likes_count: newLikeCount }
                : p
        ));

        if (isLiked) {
            await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id });
        } else {
            await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post.');
        } else {
            setPosts(prev => prev.filter(p => p.id !== postId));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-20 text-slate-400">
                User not found.
            </div>
        );
    }

    const isStudent = profile.role === 'student';

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <Link to="/app/network" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Network
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Identity Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10"></div>
                        <div className="flex flex-col items-center text-center relative z-10 pt-8">
                            <div className="relative mb-4 inline-block group/avatar">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white relative z-10">
                                    <img
                                        src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=10b981&color=fff`}
                                        alt={profile.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Profile link copied to clipboard!');
                                    }}
                                    className="absolute bottom-0 right-0 z-20 p-2.5 bg-white text-slate-500 hover:text-indigo-600 rounded-full shadow-lg border border-slate-100 transition-all hover:scale-110 hover:shadow-xl"
                                    title="Copy Profile Link"
                                >
                                    <Share className="w-4 h-4" />
                                </button>
                            </div>

                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-1.5 justify-center">
                                {profile.name}
                                {profile.gold_verified ? (
                                    <BadgeCheck className="w-5 h-5 text-yellow-500 fill-yellow-50" />
                                ) : profile.is_verified ? (
                                    <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50" />
                                ) : null}
                            </h1>
                            <p className="text-stone-400 font-medium text-sm mb-3">@{profile.username || profile.id.slice(0, 6)}</p>

                            {profile.headline && (
                                <p className="text-slate-500 font-medium mt-1 mb-3">{profile.headline}</p>
                            )}

                            {profile.location && (
                                <div className="flex items-center gap-1 text-slate-400 text-sm mb-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {profile.location}
                                </div>
                            )}

                            {isStudent && profile.university && (
                                <div className="flex items-center gap-1 text-slate-400 text-sm">
                                    <School className="w-3.5 h-3.5" />
                                    {profile.university}
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex justify-center gap-6 mt-6 border-t border-b border-stone-100 py-4 w-full">
                            <div className="text-center">
                                <div className="font-bold text-slate-900 text-lg">{profile.connections_count || 0}</div>
                                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Connections</div>
                            </div>
                        </div>



                        {/* Socials & Share */}
                        <div className="mt-6 flex justify-center gap-3">
                            {profile.github_url && (
                                <a href={profile.github_url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
                                    <Github className="w-5 h-5" />
                                </a>
                            )}
                            {profile.linkedin_url && (
                                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            )}
                            {profile.website && (
                                <a href={profile.website} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                                    <Globe className="w-5 h-5" />
                                </a>
                            )}
                            <a href={`mailto:${profile.email}`} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                                <Mail className="w-5 h-5" />
                            </a>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                                title="Share Profile"
                            >
                                <Share className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Action Buttons */}
                        {currentUser && currentUser.id === profile.id ? (
                            <div className="mt-6 px-6 w-full">
                                <div className="mt-6 px-6 w-full">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:bg-slate-800 shadow-lg shadow-slate-200 hover:shadow-slate-300"
                                    >
                                        <Briefcase className="w-4 h-4" /> Edit Profile
                                    </button>
                                </div>
                            </div>
                        ) : currentUser && (
                            <div className="mt-6 px-6 w-full space-y-3">
                                {connectionStatus === 'connected' ? (
                                    <>
                                        <button
                                            disabled
                                            className="w-full py-2.5 rounded-xl bg-green-50 text-green-600 font-semibold text-sm flex items-center justify-center gap-2 cursor-default border border-green-200"
                                        >
                                            <Check className="w-4 h-4" /> Connected
                                        </button>
                                        <button
                                            onClick={handleDisconnect}
                                            disabled={actionLoading}
                                            className="w-full py-2.5 rounded-xl bg-white text-stone-500 font-medium text-sm flex items-center justify-center gap-2 border border-stone-200 hover:bg-stone-50 hover:text-red-600 transition-colors"
                                        >
                                            <UserMinus className="w-4 h-4" /> Disconnect
                                        </button>
                                    </>
                                ) : connectionStatus === 'pending' ? (
                                    <button
                                        disabled
                                        className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 font-medium text-sm flex items-center justify-center gap-2 cursor-default border border-slate-200"
                                    >
                                        <Clock className="w-4 h-4" /> Pending
                                    </button>
                                ) : connectionStatus === 'received' ? (
                                    <button
                                        onClick={handleConnect}
                                        disabled={actionLoading}
                                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                        Accept Request
                                    </button>
                                ) : connectionStatus === 'blocked' ? (
                                    <button
                                        onClick={handleConnect} // Reuse handleConnect for unblock as it handles 'blocked' status
                                        disabled={actionLoading}
                                        className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-200"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                                        Unblock User
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleConnect}
                                        disabled={actionLoading}
                                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                        Connect
                                    </button>
                                )}

                                {connectionStatus !== 'blocked' && (
                                    <>
                                        <button
                                            onClick={async () => {
                                                const reason = prompt(`Why are you reporting ${profile.name}?`);
                                                if (!reason) return;

                                                const { data: { user } } = await supabase.auth.getUser();
                                                if (!user) return;

                                                const { error } = await supabase
                                                    .from('reports')
                                                    .insert({
                                                        reporter_id: user.id,
                                                        reported_id: profile.id,
                                                        reason: reason,
                                                        status: 'pending'
                                                    });

                                                if (error) {
                                                    console.error(error);
                                                    alert('Failed to submit report.');
                                                } else {
                                                    alert('Report submitted successfully. We will review this account.');
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-50 text-stone-500 hover:bg-stone-100 rounded-xl transition-all font-medium text-sm border border-stone-200"
                                        >
                                            <Flag className="w-4 h-4" />
                                            Report Account
                                        </button>

                                        <button
                                            onClick={handleBlock}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent text-stone-400 hover:text-red-600 rounded-xl transition-all font-medium text-sm"
                                        >
                                            <Ban className="w-4 h-4" />
                                            Block User
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Skills */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-indigo-500" />
                            Skills
                        </h3>
                        {profile.skills && profile.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic text-sm">No skills listed.</p>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Experience (New) */}
                    {profile.experience && profile.experience.length > 0 && (
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-indigo-500" /> Experience
                            </h3>
                            <div className="space-y-6">
                                {profile.experience.map((exp: any, i: number) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg">{exp.title}</h4>
                                            <p className="font-medium text-slate-700">{exp.company}</p>
                                            <p className="text-xs text-slate-500 mt-1 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded-full">
                                                {new Date(exp.start_date).getFullYear()} -
                                                {exp.current ? 'Present' : (exp.end_date ? new Date(exp.end_date).getFullYear() : '')}
                                            </p>
                                            {exp.description && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{exp.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}



                    {/* Certificates */}
                    {(currentUser?.id === profile.id || (profile.certificates && profile.certificates.length > 0)) && (
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-indigo-500" /> Certificates
                                </h3>
                                {currentUser?.id === profile.id && (
                                    <button
                                        onClick={() => setIsAddingCert(true)}
                                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        + Add
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {profile.certificates && profile.certificates.length > 0 ? (
                                    profile.certificates.map((cert) => (
                                        <div key={cert.id} className="flex gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 border border-orange-100">
                                                <Award className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{cert.title}</h4>
                                                <p className="font-medium text-slate-700">{cert.issuing_org}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Issued {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : 'Unknown date'}
                                                </p>
                                                {cert.credential_url && (
                                                    <a href={cert.credential_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 mt-2 hover:underline">
                                                        Verify Credential <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 italic text-sm">No certificates added yet.</p>
                                )}
                            </div>

                            {/* Add Certificate Form (Inline or Modal could work, simplistic inline here/modal overlay better for aesthetics) */}
                            {isAddingCert && (
                                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4">Add Certificate</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Certificate Title</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                    value={newCert.title}
                                                    onChange={e => setNewCert({ ...newCert, title: e.target.value })}
                                                    placeholder="e.g. AWS Certified Developer"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Issuing Organization</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                    value={newCert.issuing_org}
                                                    onChange={e => setNewCert({ ...newCert, issuing_org: e.target.value })}
                                                    placeholder="e.g. Amazon Web Services"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                    value={newCert.issue_date}
                                                    onChange={e => setNewCert({ ...newCert, issue_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Credential URL (Optional)</label>
                                                <input
                                                    type="url"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                    value={newCert.credential_url}
                                                    onChange={e => setNewCert({ ...newCert, credential_url: e.target.value })}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                onClick={() => setIsAddingCert(false)}
                                                className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddCertificate}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                                            >
                                                Save Certificate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* About */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">About</h3>
                        {profile.about ? (
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                {profile.about}
                            </p>
                        ) : (
                            <p className="text-slate-400 italic">No bio provided.</p>
                        )}
                    </div>

                    {/* Projects */}
                    {profile.projects && profile.projects.length > 0 && (
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Projects</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {profile.projects.map((project, idx) => (
                                    <div key={idx} className="p-5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                        <h4 className="font-bold text-slate-900 text-lg">{project.title}</h4>
                                        <p className="text-slate-600 text-sm mt-1">{project.description}</p>
                                        {project.link && (
                                            <a href={project.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 mt-3 hover:underline">
                                                View Project <Globe className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Activity (Posts) */}
                    {posts.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-900 px-2">Recent Activity</h3>
                            {posts.map((post) => (
                                <article key={post.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100">
                                                <img
                                                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
                                                    alt={profile.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-stone-900 text-sm">{profile.name}</h3>
                                                <p className="text-xs text-stone-400">{new Date(post.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {currentUser?.id === profile.id && (
                                            <button
                                                onClick={() => handleDeletePost(post.id)}
                                                className="text-stone-400 hover:text-red-500 transition-colors p-1"
                                                title="Delete Post"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-stone-600 leading-relaxed mb-4 text-sm">
                                        {post.content}
                                    </p>
                                    <div className="flex items-center gap-4 text-stone-400 text-xs font-medium">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => toggleLike(post)}
                                                className={`flex items-center gap-1 hover:text-red-500 transition-colors ${post.user_has_liked ? 'text-red-500' : ''}`}
                                            >
                                                <Heart className={`w-4 h-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
                                                <span>{post.likes_count}</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageCircle className="w-4 h-4" /> {post.comments_count}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div >
            {isEditing && profile && (
                <EditProfileModal
                    user={profile}
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    onUpdate={(updated) => setProfile(updated)}
                />
            )}
        </div>
    );
}
