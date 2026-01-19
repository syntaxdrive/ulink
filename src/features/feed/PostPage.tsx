import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFeed } from './hooks/useFeed';
import PostItem from './components/PostItem';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useFeedStore } from '../../stores/useFeedStore';

export default function PostPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const {
        fetchSinglePost,
        currentUserId,
        toggleLike,
        toggleRepost,
        toggleComments,
        comments,
        loadingComments,
        postComment,
        deleteComment,
        deletePost,
        reportPost,
        votePoll
    } = useFeed();

    // We access the specific post from the store
    const { posts } = useFeedStore();
    const post = posts.find(p => p.id === postId);

    const [loading, setLoading] = useState(true);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    useEffect(() => {
        if (postId) {
            setLoading(true);
            fetchSinglePost(postId).finally(() => setLoading(false));
            // Also open comments by default for single post view
            toggleComments(postId);
        }
    }, [postId]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <p className="text-stone-500">Post not found or deleted.</p>
                <Link to="/app" className="text-emerald-600 font-medium hover:underline">
                    Back to Feed
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-6 transition-colors font-medium"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <PostItem
                post={post}
                currentUserId={currentUserId}
                isActiveCommentSection={true} // Always show comments on single page
                isActiveMenu={activeMenuId === post.id}
                comments={comments[post.id] || []}
                loadingComments={loadingComments}
                onDelete={(id) => { deletePost(id); navigate('/app'); }} // Redirect after delete
                onLike={toggleLike}
                onRepost={(post, comment) => toggleRepost(post, comment)}
                onToggleComments={() => { }} // No-op, always open
                onToggleMenu={(id) => setActiveMenuId(activeMenuId === id ? null : id)}
                onPostComment={postComment}
                onSearchTag={(tag) => navigate(`/app?search=${encodeURIComponent(tag)}`)}
                onReport={reportPost}
                onDeleteComment={deleteComment}
                onVotePoll={votePoll}
            />
        </div>
    );
}
