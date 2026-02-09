import { useState } from 'react';
import { Plus, Search, BookOpen, Users, Heart, Upload, Hash, AlertCircle } from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';
import type { CourseCategory, CourseLevel } from '../../types/courses';
import { COURSE_CATEGORIES, COURSE_LEVELS } from '../../types/courses';
import { isValidYouTubeUrl, extractYouTubeId, getYouTubeThumbnail } from '../../utils/youtube';
import Modal from '../../components/ui/Modal';

export default function CoursesPage() {
    const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { courses, loading, createCourse, toggleLike, toggleEnrollment } = useCourses(
        selectedCategory === 'All' ? undefined : selectedCategory as CourseCategory,
        searchQuery
    );

    const filteredCourses = searchQuery
        ? courses.filter(course =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : courses;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-stone-200/80 dark:border-zinc-800 mb-6">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-emerald-600" />
                            <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">Courses</h1>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Course</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-stone-100/80 dark:bg-zinc-900/80 border border-stone-200/50 dark:border-zinc-800/50 rounded-lg text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-500 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        />
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === 'All'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-100 dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800'
                                }`}
                        >
                            All
                        </button>
                        {Object.keys(COURSE_CATEGORIES).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat as CourseCategory)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-stone-100 dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length === 0 ? (
                <div className="text-center py-16 px-4">
                    <BookOpen className="w-16 h-16 text-stone-300 dark:text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-stone-900 dark:text-zinc-100 mb-2">
                        {searchQuery ? 'No courses found' : 'No courses yet'}
                    </h3>
                    <p className="text-stone-500 dark:text-zinc-500 mb-6">
                        {searchQuery
                            ? `Try a different search term`
                            : 'Be the first to share a course!'}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Course
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                    {filteredCourses.map((course) => {
                        return (
                            <article
                                key={course.id}
                                className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 transition-all group"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-black overflow-hidden">
                                    {course.thumbnail_url && (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    )}
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-xs text-white font-medium">
                                        {course.category}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    {/* Author */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <img
                                            src={course.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.profiles?.name || 'User')}`}
                                            alt={course.profiles?.name}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <span className="text-sm font-medium text-stone-700 dark:text-zinc-300">
                                            {course.profiles?.name}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-semibold text-[15px] text-stone-900 dark:text-zinc-100 mb-2 line-clamp-2 leading-tight">
                                        {course.title}
                                    </h3>

                                    {/* Description */}
                                    {course.description && (
                                        <p className="text-sm text-stone-600 dark:text-zinc-400 mb-3 line-clamp-2 leading-relaxed">
                                            {course.description}
                                        </p>
                                    )}

                                    {/* Tags */}
                                    {course.tags && course.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {course.tags.slice(0, 3).map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 dark:bg-zinc-800 text-xs text-stone-600 dark:text-zinc-400 rounded"
                                                >
                                                    <Hash className="w-3 h-3" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-zinc-500 mb-3 pt-3 border-t border-stone-100 dark:border-zinc-800">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            {course.enrollments_count}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-3.5 h-3.5" />
                                            {course.likes_count}
                                        </span>
                                        <span className="px-2 py-0.5 bg-stone-100 dark:bg-zinc-800 rounded text-[11px] font-medium">
                                            {course.level}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleEnrollment(course.id)}
                                            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${course.user_has_enrolled
                                                ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-500'
                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                }`}
                                        >
                                            {course.user_has_enrolled ? 'Enrolled' : 'Enroll'}
                                        </button>
                                        <button
                                            onClick={() => toggleLike(course.id)}
                                            className={`p-2 rounded-lg transition-colors ${course.user_has_liked
                                                ? 'bg-red-50 dark:bg-red-950/30 text-red-500'
                                                : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-700'
                                                }`}
                                        >
                                            <Heart className={`w-5 h-5 ${course.user_has_liked ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* Create Course Modal */}
            {showCreateModal && (
                <CreateCourseModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={async (data) => {
                        try {
                            await createCourse(data);
                            setShowCreateModal(false);
                        } catch (error) {
                            console.error('Failed to create course:', error);
                            alert('Failed to create course. Please try again.');
                        }
                    }}
                />
            )}

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}

// Create Course Modal Component
function CreateCourseModal({
    onClose,
    onCreate,
}: {
    onClose: () => void;
    onCreate: (data: {
        title: string;
        description?: string;
        youtube_url: string;
        category: CourseCategory;
        level: string;
        tags?: string[];
    }) => Promise<void>;
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [category, setCategory] = useState<CourseCategory>('School');
    const [level, setLevel] = useState<CourseLevel>('Beginner');
    const [tags, setTags] = useState('');
    const [urlError, setUrlError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValidYouTubeUrl(youtubeUrl)) {
            setUrlError('Please enter a valid YouTube URL');
            return;
        }

        setSubmitting(true);
        try {
            const tagArray = tags
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0);

            await onCreate({
                title,
                description: description || undefined,
                youtube_url: youtubeUrl,
                category,
                level,
                tags: tagArray.length > 0 ? tagArray : undefined,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const videoId = extractYouTubeId(youtubeUrl);
    const thumbnail = videoId ? getYouTubeThumbnail(videoId) : null;

    return (
        <Modal isOpen={true} onClose={onClose} title="Add New Course" size="2xl">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                {/* YouTube URL */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-2">
                        YouTube URL *
                    </label>
                    <input
                        type="text"
                        required
                        value={youtubeUrl}
                        onChange={(e) => {
                            setYoutubeUrl(e.target.value);
                            setUrlError('');
                        }}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    {urlError && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {urlError}
                        </p>
                    )}
                    {thumbnail && !urlError && (
                        <img
                            src={thumbnail}
                            alt="Video thumbnail"
                            className="mt-3 w-full aspect-video object-cover rounded-lg border border-stone-200 dark:border-zinc-800"
                        />
                    )}
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-2">
                        Course Title *
                    </label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Introduction to React Hooks"
                        className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-2">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of what students will learn..."
                        rows={3}
                        className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    />
                </div>

                {/* Category & Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-2">
                            Category *
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as CourseCategory)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg text-stone-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        >
                            {Object.keys(COURSE_CATEGORIES).map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-2">
                            Level *
                        </label>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value as CourseLevel)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg text-stone-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        >
                            {COURSE_LEVELS.map((lvl) => (
                                <option key={lvl} value={lvl}>
                                    {lvl}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-2">
                        Tags (comma-separated)
                    </label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="react, javascript, hooks, frontend"
                        className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300 font-medium rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !title || !youtubeUrl}
                        className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Create Course
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
