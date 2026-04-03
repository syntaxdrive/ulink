import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useUIStore } from '../../../stores/useUIStore';
import CreatePost from './CreatePost';
import { useFeed } from '../hooks/useFeed';
import { supabase } from '../../../lib/supabase';

export default function PostDrawer() {
    const { isPostDrawerOpen, setPostDrawerOpen } = useUIStore();
    const { createPost } = useFeed();
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setUserProfile(data);
            }
        };
        if (isPostDrawerOpen) fetchProfile();
    }, [isPostDrawerOpen]);

    if (!isPostDrawerOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setPostDrawerOpen(false)}
            />

            {/* Container */}
            <div 
                className="relative w-full max-w-2xl bg-[#FAFAFA] dark:bg-bg-dark rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl shadow-black/50 p-6 pt-2 pb-12 md:pb-8 animate-in slide-in-from-bottom-2 duration-500 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag handle or Indicator line */}
                <div className="md:hidden flex justify-center mb-6">
                    <div className="w-12 h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-full" />
                </div>

                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight">Create Post</h2>
                    <button 
                        onClick={() => setPostDrawerOpen(false)}
                        className="p-2.5 bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all hover:rotate-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto no-scrollbar pb-8">
                    <CreatePost 
                        onCreate={async (content, images, video, communityId, poll) => {
                            await createPost(content, images, video, communityId, poll);
                            setPostDrawerOpen(false);
                        }} 
                        user={userProfile}
                    />
                </div>
            </div>
        </div>
    );
}
