import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Users, Globe, Lock, Settings, Loader2, Check, X, Share2, Trash2, Crown, Shield, UserMinus, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { shareToWhatsApp, nativeShare } from '../../utils/shareUtils';
import { type Community } from '../../types';
import PostItem from '../feed/components/PostItem';
import CreatePost from '../feed/components/CreatePost';
import { useFeed } from '../feed/hooks/useFeed';
import EditCommunityModal from './components/EditCommunityModal';
import { getBaseUrl } from '../../config';
import { useAuthModalStore } from '../../stores/useAuthModalStore';

export default function CommunityDetailsPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [community, setCommunity] = useState<Community | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [membershipStatus, setMembershipStatus] = useState<'active' | 'pending' | 'rejected' | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [showMembersPanel, setShowMembersPanel] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
    const {
        posts,
        loading: postsLoading,
        currentUserId,
        createPost,
        toggleLike,
        toggleRepost,
        toggleComments,
        activeCommentPostId,
        comments,
        loadingComments,
        postComment,
        deleteComment,
        reportPost,
        deletePost,
        votePoll,
        currentUserProfile
    } = useFeed(community?.id);

    const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);

    useEffect(() => {
        if (slug) fetchCommunityDetails();
    }, [slug]);

    const fetchCommunityDetails = async () => {
        setLoading(true);
        try {
            // Get Community Info
            const { data: comm, error } = await supabase
                .from('communities')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error || !comm) throw new Error('Community not found');

            setCommunity(comm);

            // Check Membership
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Use maybeSingle to avoid throw on 0 rows, and handle potential missing status column gracefully via separate query if needed, or catch error
                const { data: member } = await supabase
                    .from('community_members')
                    .select('*') // Get everything to avoid column missing errors breaking the whole page if possible, or just standard fields
                    .eq('community_id', comm.id)
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (member) {
                    setIsMember(member.status !== 'pending' && member.status !== 'rejected');
                    setMembershipStatus(member.status || 'active'); // Fallback to active if no status column
                    setRole(member.role);

                    // If admin/owner, fetch pending requests
                    if (member.role === 'admin' || member.role === 'owner') {
                        fetchPendingRequests(comm.id).catch(() => { });
                        fetchMembers(comm.id).catch(() => { });
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching community:', error);
            navigate('/app/communities'); // Fallback
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequests = async (communityId: string) => {
        const { data, error } = await supabase
            .from('community_members')
            .select('id, user_id, profiles(name, avatar_url, university, role)')
            .eq('community_id', communityId)
            .eq('status', 'pending');

        if (!error && data) {
            setPendingRequests(data);
        }
    };

    const fetchMembers = async (communityId: string) => {
        setLoadingMembers(true);
        try {
            const { data, error } = await supabase
                .rpc('get_community_members', { p_community_id: communityId });

            if (error) {
                console.error('fetchMembers error:', error.message, error.details);
                return;
            }

            if (data) {
                setMembers(data);
                setShowMembersPanel(true);
            }
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleRemoveMember = async (memberId: string, userId: string) => {
        if (!community || userId === currentUserId) return;
        if (!confirm('Remove this member from the community?')) return;
        setRemovingMemberId(memberId);
        try {
            await supabase
                .from('community_members')
                .delete()
                .eq('id', memberId);
            setMembers(prev => prev.filter(m => m.id !== memberId));
            setCommunity(prev => prev ? { ...prev, members_count: Math.max(0, (prev.members_count || 0) - 1) } : null);
        } catch (err) {
            console.error('Error removing member:', err);
        } finally {
            setRemovingMemberId(null);
        }
    };

    const handleToggleAdminRole = async (memberId: string, currentRole: string) => {
        if (!community) return;
        const newRole = currentRole === 'admin' ? 'member' : 'admin';
        try {
            await supabase
                .from('community_members')
                .update({ role: newRole })
                .eq('id', memberId);
            setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
        } catch (err) {
            console.error('Error changing role:', err);
        }
    };

    const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
        setApprovingRequestId(requestId);
        try {
            if (action === 'approve') {
                await supabase
                    .from('community_members')
                    .update({ status: 'active' })
                    .eq('id', requestId);
            } else {
                await supabase
                    .from('community_members')
                    .delete()
                    .eq('id', requestId);
            }
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
            if (action === 'approve') {
                // Increment member count locally
                setCommunity(prev => prev ? { ...prev, members_count: (prev.members_count || 0) + 1 } : null);
            }
        } catch (error) {
            console.error('Error handling request:', error);
        } finally {
            setApprovingRequestId(null);
        }
    };

    const handleJoin = async () => {
        if (!community) return;
        if (!currentUserId) {
            useAuthModalStore.getState().openAuthModal('Sign in to join this community');
            return;
        }
        try {
            if (isMember) {
                // Leave logic
                if (confirm('Are you sure you want to leave this community?')) {
                    // Optimistic Update
                    setIsMember(false);
                    setRole(null);
                    setCommunity(prev => prev ? { ...prev, members_count: Math.max(0, (prev.members_count || 0) - 1) } : null);

                    await supabase
                        .from('community_members')
                        .delete()
                        .eq('community_id', community.id)
                        .eq('user_id', currentUserId);
                }
            } else {
                // Join logic
                const isPrivate = community.privacy === 'private';

                // Optimistic Update
                if (!isPrivate) {
                    setIsMember(true);
                    setMembershipStatus('active');
                    setRole('member');
                    setCommunity(prev => prev ? { ...prev, members_count: (prev.members_count || 0) + 1 } : null);
                } else {
                    setMembershipStatus('pending');
                }

                await supabase
                    .from('community_members')
                    .insert({
                        community_id: community.id,
                        user_id: currentUserId,
                        status: isPrivate ? 'pending' : 'active'
                    });

                if (isPrivate) alert('Your request to join has been sent to the community admins.');
            }
        } catch (error) {
            console.error('Error modifying membership:', error);
            alert('Failed to update membership');
        }
    };

    const handleShareCommunity = async () => {
        if (!community) return;
        const url = `${getBaseUrl()}/app/communities/${community.slug}`;
        const title = `${community.name} on UniLink`;
        let snippet = community.description ? community.description.replace(/\r?\n|\r/g, ' ') : '';
        if (snippet.length > 100) snippet = `${snippet.substring(0, 100)}...`;

        const text = snippet
            ? `"${snippet}"\n\nJoin the "${community.name}" community on UniLink Nigeria, the largest network for university students!`
            : `Join the "${community.name}" community on UniLink Nigeria, the largest network for university students!`;

        const shared = await nativeShare(title, text, url);
        if (!shared) {
            shareToWhatsApp(text, url);
        }
    };

    const handleDeleteCommunity = async () => {
        if (!community) return;
        if (!confirm('Are you strictly sure you want to delete this community? This action CANNOT be undone and will delete all posts and memberships.')) {
            return;
        }

        const confirmName = prompt(`Please type "${community.name}" to confirm deletion:`);
        if (confirmName !== community.name) {
            if (confirmName !== null) alert('Community name verification failed.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('communities')
                .delete()
                .eq('id', community.id);

            if (error) throw error;

            alert('Community deleted successfully.');
            navigate('/app/communities');
        } catch (error: any) {
            console.error('Error deleting community:', error);
            alert(error.message || 'Failed to delete community');
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center"><span className="loading loading-spinner text-indigo-600"></span></div>;
    if (!community) return null;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Banner & Header */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-xl shadow-stone-200/40 mb-8">
                <div className="h-48 bg-gradient-to-br from-stone-700 to-stone-900 relative">
                    {community.cover_image_url && (
                        <img src={community.cover_image_url} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                </div>

                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 gap-6 mb-6">
                        <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl relative z-10">
                            <div className={`w-full h-full rounded-2xl flex items-center justify-center text-4xl font-bold ${community.icon_url ? '' : 'bg-stone-100 text-stone-400'
                                }`}>
                                {community.icon_url ? (
                                    <img src={community.icon_url} className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    community.name.charAt(0)
                                )}
                            </div>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl font-display font-bold text-stone-900 mb-1">{community.name}</h1>
                            <div className="flex items-center gap-4 text-sm font-medium text-stone-500">
                                <span className="flex items-center gap-1.5">
                                    {community.privacy === 'public' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    {community.privacy === 'public' ? 'Public Group' : 'Private Group'}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4" />
                                    {community.members_count || 0} Members
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={handleShareCommunity}
                                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors border border-emerald-100"
                                title="Share Community"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleJoin}
                                disabled={membershipStatus === 'pending'}
                                className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold transition-all ${isMember
                                    ? 'bg-stone-100 text-stone-600 hover:bg-red-50 hover:text-red-600 border border-stone-200'
                                    : membershipStatus === 'pending'
                                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                    }`}
                            >
                                {isMember ? 'Joined' : membershipStatus === 'pending' ? 'Request Sent' : 'Join Group'}
                            </button>
                            {(role === 'admin' || role === 'owner') && (
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors"
                                    title="Edit Community"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                            )}
                            {role === 'owner' && (
                                <button
                                    onClick={handleDeleteCommunity}
                                    className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-100"
                                    title="Delete Community"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-stone-600 leading-relaxed max-w-3xl">
                        {community.description}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Only show post creation if member */}
                    {isMember ? (
                        <CreatePost
                            user={currentUserProfile}
                            onCreate={createPost}
                            communityId={community.id}
                        />
                    ) : (
                        <div className={`p-8 rounded-[2rem] text-center border ${membershipStatus === 'pending'
                            ? 'bg-amber-50 border-amber-100'
                            : 'bg-indigo-50 border-indigo-100 shadow-xl shadow-indigo-100/50'
                            }`}>
                            <h3 className={`text-xl font-bold mb-2 ${membershipStatus === 'pending' ? 'text-amber-900' : 'text-indigo-900'
                                }`}>
                                {membershipStatus === 'pending'
                                    ? 'Join Request Pending'
                                    : 'Become a Member'}
                            </h3>
                            <p className={`text-sm ${membershipStatus === 'pending' ? 'text-amber-700' : 'text-indigo-700'
                                }`}>
                                {membershipStatus === 'pending'
                                    ? 'An admin needs to approve your request before you can post.'
                                    : 'Join this community to start sharing posts and interacting with members!'}
                            </p>
                            {!membershipStatus && (
                                <button
                                    onClick={handleJoin}
                                    className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                >
                                    Join Group
                                </button>
                            )}
                        </div>
                    )}

                    {/* Feed Content */}
                    <div className="space-y-6">
                        {postsLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-stone-400 text-lg font-medium">No posts yet</p>
                                <p className="text-stone-400 text-sm mt-2">Be the first to post in this community!</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <PostItem
                                    key={post.id}
                                    post={post}
                                    currentUserId={currentUserId}
                                    isActiveCommentSection={activeCommentPostId === post.id}
                                    isActiveMenu={activeMenuPostId === post.id}
                                    comments={comments[post.id] || []}
                                    loadingComments={loadingComments}
                                    onDelete={() => deletePost(post.id)}
                                    onLike={() => toggleLike(post)}
                                    onRepost={(post, comment) => toggleRepost(post, comment)}
                                    onToggleComments={() => toggleComments(post.id)}
                                    onToggleMenu={() => setActiveMenuPostId(prev => prev === post.id ? null : post.id)}
                                    onPostComment={postComment}
                                    onSearchTag={() => { }}
                                    onReport={() => reportPost(post.id)}
                                    onDeleteComment={deleteComment}
                                    onVotePoll={votePoll}
                                    isInCommunityFeed={true}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Join Requests for Admins */}
                    {(role === 'admin' || role === 'owner') && pendingRequests.length > 0 && (
                        <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm shadow-amber-50">
                            <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Join Requests ({pendingRequests.length})
                            </h3>
                            <div className="space-y-4">
                                {pendingRequests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={req.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.profiles.name)}&background=random`}
                                                className="w-10 h-10 rounded-full border border-stone-100"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-stone-900 truncate">{req.profiles.name}</p>
                                                <p className="text-[10px] text-stone-500 truncate">{req.profiles.university || 'Student'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleRequest(req.id, 'approve')}
                                                disabled={approvingRequestId === req.id}
                                                className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                                title="Approve"
                                            >
                                                {approvingRequestId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleRequest(req.id, 'reject')}
                                                disabled={approvingRequestId === req.id}
                                                className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                title="Reject"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Members Panel — Admins & Owners only */}
                    {(role === 'admin' || role === 'owner') && (
                        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                            <button
                                onClick={() => {
                                    setShowMembersPanel(prev => !prev);
                                }}
                                className="w-full flex items-center justify-between p-6 hover:bg-stone-50 transition-colors"
                            >
                                <h3 className="font-bold text-stone-900 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-500" />
                                    Members ({community.members_count || 0})
                                </h3>
                                {showMembersPanel ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                            </button>

                            {showMembersPanel && (
                                <div className="px-6 pb-6 border-t border-stone-50">
                                    {/* Search */}
                                    <div className="relative mt-4 mb-4">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                                        <input
                                            type="text"
                                            placeholder="Search members..."
                                            value={memberSearch}
                                            onChange={e => setMemberSearch(e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 text-sm bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 border border-stone-100"
                                        />
                                    </div>

                                    {loadingMembers ? (
                                        <div className="flex justify-center py-6">
                                            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-96 overflow-y-auto smooth-scroll pr-1">
                                            {members
                                                .filter(m =>
                                                    !memberSearch ||
                                                    m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
                                                    m.username?.toLowerCase().includes(memberSearch.toLowerCase())
                                                )
                                                .map(member => (
                                                    <div
                                                        key={member.member_id}
                                                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-stone-50 transition-colors group"
                                                    >
                                                        <Link to={`/app/profile/${member.username || member.user_id}`} className="shrink-0">
                                                            <img
                                                                src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=random`}
                                                                alt={member.name}
                                                                className="w-9 h-9 rounded-full object-cover border border-stone-100"
                                                            />
                                                        </Link>
                                                        <div className="flex-1 min-w-0">
                                                            <Link to={`/app/profile/${member.username || member.user_id}`}>
                                                                <p className="text-sm font-bold text-stone-900 truncate leading-none hover:text-indigo-600 transition-colors">
                                                                    {member.name}
                                                                </p>
                                                                <p className="text-[10px] text-stone-400 font-medium">@{member.username}</p>
                                                            </Link>
                                                        </div>
                                                        {/* Role badge */}
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            {member.member_role === 'owner' && (
                                                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                                                                    <Crown className="w-2.5 h-2.5" /> Owner
                                                                </span>
                                                            )}
                                                            {member.member_role === 'admin' && (
                                                                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full">
                                                                    <Shield className="w-2.5 h-2.5" /> Admin
                                                                </span>
                                                            )}
                                                            {member.member_role !== 'owner' && member.user_id !== currentUserId && (
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {role === 'owner' && (
                                                                        <button
                                                                            onClick={() => handleToggleAdminRole(member.member_id, member.member_role)}
                                                                            title={member.member_role === 'admin' ? 'Remove admin' : 'Make admin'}
                                                                            className="p-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                                        >
                                                                            <Shield className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleRemoveMember(member.member_id, member.user_id)}
                                                                        disabled={removingMemberId === member.member_id}
                                                                        title="Remove from community"
                                                                        className="p-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                                    >
                                                                        {removingMemberId === member.member_id
                                                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                                                            : <UserMinus className="w-3 h-3" />}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            {members.filter(m =>
                                                !memberSearch ||
                                                m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
                                                m.username?.toLowerCase().includes(memberSearch.toLowerCase())
                                            ).length === 0 && (
                                                    <p className="text-center text-sm text-stone-400 py-4">No members found</p>
                                                )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                        <h3 className="font-bold text-stone-900 mb-4">About</h3>
                        <div className="space-y-4 text-sm font-medium text-stone-500">
                            <div className="flex justify-between border-b border-stone-50 pb-3">
                                <span>Created</span>
                                <span className="text-stone-900">{new Date(community.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-stone-50 pb-3">
                                <span>Privacy</span>
                                <span className="text-stone-900 capitalise">{community.privacy}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Community Modal */}
            {community && (
                <EditCommunityModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    community={community}
                    onUpdate={() => {
                        // Refresh community data
                        fetchCommunityDetails();
                    }}
                />
            )}
        </div>
    );
}
