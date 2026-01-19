import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Globe, Lock, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { type Community } from '../../types';
import PostItem from '../feed/components/PostItem';
import CreatePost from '../feed/components/CreatePost';
import { useFeed } from '../feed/hooks/useFeed';
import EditCommunityModal from './components/EditCommunityModal';

export default function CommunityDetailsPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [community, setCommunity] = useState<Community | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

    useEffect(() => {
        if (slug) fetchCommunityDetails();
    }, [slug]);

    const fetchCommunityDetails = async () => {
        setLoading(true);
        try {
            // Get Community Info
            const { data: comm, error } = await supabase
                .from('communities')
                .select('*, community_members(count)')
                .eq('slug', slug)
                .single();

            if (error || !comm) throw new Error('Community not found');

            const communityWithCount = {
                ...comm,
                members_count: comm.community_members?.[0]?.count || 0
            };
            setCommunity(communityWithCount);

            // Check Membership
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: member } = await supabase
                    .from('community_members')
                    .select('role')
                    .eq('community_id', comm.id)
                    .eq('user_id', user.id)
                    .single();

                if (member) {
                    setIsMember(true);
                    setRole(member.role);
                }
            }
        } catch (error) {
            console.error('Error fetching community:', error);
            navigate('/app/communities'); // Fallback
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!currentUserId || !community) return;
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
                // Optimistic Update
                setIsMember(true);
                setRole('member');
                setCommunity(prev => prev ? { ...prev, members_count: (prev.members_count || 0) + 1 } : null);

                await supabase
                    .from('community_members')
                    .insert({ community_id: community.id, user_id: currentUserId });
            }
        } catch (error) {
            console.error('Error modifying membership:', error);
            alert('Failed to update membership');
        }
    };

    if (loading) return <div className="p-10 text-center"><span className="loading loading-spinner text-indigo-600"></span></div>;
    if (!community) return null;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Banner & Header */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-xl shadow-stone-200/40 mb-8">
                <div className="h-48 bg-gradient-to-r from-indigo-600 to-violet-600 relative">
                    {community.cover_image_url && (
                        <img src={community.cover_image_url} className="w-full h-full object-cover opacity-50" />
                    )}
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
                                onClick={handleJoin}
                                className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold transition-all ${isMember
                                    ? 'bg-stone-100 text-stone-600 hover:bg-red-50 hover:text-red-600 border border-stone-200'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                    }`}
                            >
                                {isMember ? 'Joined' : 'Join Group'}
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
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
                            <p className="font-bold text-indigo-900">Join this community to start posting!</p>
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
                                    isActiveMenu={false}
                                    comments={comments[post.id] || []}
                                    loadingComments={loadingComments}
                                    onDelete={() => deletePost(post.id)}
                                    onLike={() => toggleLike(post)}
                                    onRepost={(post, comment) => toggleRepost(post, comment)}
                                    onToggleComments={() => toggleComments(post.id)}
                                    onToggleMenu={() => { }}
                                    onPostComment={(content) => postComment(post.id, content)}
                                    onSearchTag={() => { }}
                                    onReport={() => reportPost(post.id)}
                                    onDeleteComment={deleteComment}
                                    onVotePoll={votePoll}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-6">
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
