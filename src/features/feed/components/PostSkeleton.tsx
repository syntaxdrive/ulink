export default function PostSkeleton() {
    return (
        <div className="bg-white dark:bg-bg-cardDark rounded-[2rem] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none border border-stone-100 dark:border-zinc-800 animate-pulse">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-stone-200 dark:bg-zinc-800 rounded-2xl"></div>
                <div className="flex-1">
                    <div className="h-4 bg-stone-200 dark:bg-zinc-800 rounded-lg w-32 mb-2"></div>
                    <div className="h-3 bg-stone-100 dark:bg-zinc-900 rounded-lg w-24"></div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-2 mb-4">
                <div className="h-3 bg-stone-200 dark:bg-zinc-800 rounded-lg w-full"></div>
                <div className="h-3 bg-stone-200 dark:bg-zinc-800 rounded-lg w-5/6"></div>
                <div className="h-3 bg-stone-200 dark:bg-zinc-800 rounded-lg w-4/6"></div>
            </div>

            {/* Image placeholder */}
            <div className="h-64 bg-stone-100 dark:bg-zinc-900 rounded-2xl mb-4"></div>

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-stone-50 dark:border-zinc-900">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-stone-200 dark:bg-zinc-800 rounded-xl"></div>
                    <div className="h-3 bg-stone-100 dark:bg-zinc-900 rounded w-8"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-stone-200 dark:bg-zinc-800 rounded-xl"></div>
                    <div className="h-3 bg-stone-100 dark:bg-zinc-900 rounded w-8"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-stone-200 dark:bg-zinc-800 rounded-xl"></div>
                    <div className="h-3 bg-stone-100 dark:bg-zinc-900 rounded w-8"></div>
                </div>
            </div>
        </div>
    );
}

export function FeedLoadingState() {
    return (
        <div className="space-y-6">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
        </div>
    );
}
