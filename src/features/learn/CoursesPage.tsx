import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Search, BookOpen, Users, Heart, Upload, Hash, AlertCircle, FileText, Download, Library, X, ExternalLink, Film, File, Play, Trash2, Sparkles, Brain, Minimize2, Maximize2 } from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';
import type { CourseCategory, CourseLevel, UserDocumentDownload } from '../../types/courses';
import { COURSE_CATEGORIES, COURSE_LEVELS, ACCEPTED_DOC_TYPES, ACCEPTED_DOC_ATTR, MAX_DOC_SIZE_MB, MAX_DOC_SIZE_BYTES, getDocIcon, formatFileSize, resolveDocMimeType } from '../../types/courses';
import { isValidYouTubeUrl, extractYouTubeId, getYouTubeThumbnail } from '../../utils/youtube';
import Modal from '../../components/ui/Modal';
import CourseAIChat from './components/CourseAIChat';
import DocumentViewer from './components/DocumentViewer';
import type { Course } from '../../types/courses';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { CourseDocument } from '../../types/courses';

// ─── PDF First-Page Thumbnail ─────────────────────────────────────────────────
function PdfFirstPageCanvas({ url, className }: { url: string; className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!url.toLowerCase().includes('.pdf') && !url.includes('application/pdf')) {
            setFailed(true);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const pdfjsLib = await import('pdfjs-dist');
                pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
                
                const secureUrl = url.includes('cloudinary') ? url.replace(/^http:/, 'https:') : url;
                const buffer = await fetch(secureUrl).then(r => {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.arrayBuffer();
                });

                const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
                const page = await pdf.getPage(1);
                if (cancelled || !canvasRef.current) return;
                const viewport = page.getViewport({ scale: 1.2 });
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d')!;
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: ctx, viewport } as any).promise;
            } catch {
                if (!cancelled) setFailed(true);
            }
        })();
        return () => { cancelled = true; };
    }, [url]);

    if (failed) return null;
    return <canvas ref={canvasRef} className={className} />;
}

type Tab = 'browse' | 'library';

export default function CoursesPage() {
    const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('browse');
    const [library, setLibrary] = useState<UserDocumentDownload[]>([]);
    const [libraryLoading, setLibraryLoading] = useState(false);
    const [libraryLoaded, setLibraryLoaded] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [watchingCourse, setWatchingCourse] = useState<{ id: string; youtubeId: string; title: string } | null>(null);
    const [videoExpanded, setVideoExpanded] = useState(false);
    const [videoPos, setVideoPos] = useState({ x: 24, y: 80 });
    const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

    // Close video player on Escape key
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setWatchingCourse(null); setVideoExpanded(false); } };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Dragging logic for floating player
    const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (videoExpanded) return; // no drag when expanded
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragRef.current = { startX: clientX, startY: clientY, origX: videoPos.x, origY: videoPos.y };

        const onMove = (ev: MouseEvent | TouchEvent) => {
            if (!dragRef.current) return;
            const cx = 'touches' in ev ? (ev as TouchEvent).touches[0].clientX : (ev as MouseEvent).clientX;
            const cy = 'touches' in ev ? (ev as TouchEvent).touches[0].clientY : (ev as MouseEvent).clientY;
            const nx = dragRef.current.origX + (cx - dragRef.current.startX);
            const ny = dragRef.current.origY + (cy - dragRef.current.startY);
            setVideoPos({ x: Math.max(0, Math.min(nx, window.innerWidth - 380)), y: Math.max(0, Math.min(ny, window.innerHeight - 220)) });
        };
        const onUp = () => {
            dragRef.current = null;
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchend', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchend', onUp);
    }, [videoExpanded, videoPos]);
    const [aiCourse, setAiCourse] = useState<Course | null>(null);
    const [viewingDoc, setViewingDoc] = useState<{ doc: CourseDocument; course: Course } | null>(null);

    const { courses, loading, createCourse, deleteCourse, toggleLike, toggleEnrollment, incrementViews, trackDownload, fetchMyLibrary, currentUserId } = useCourses(
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

    const handleTabChange = async (tab: Tab) => {
        setActiveTab(tab);
        if (tab === 'library' && !libraryLoaded && currentUserId) {
            setLibraryLoading(true);
            try {
                const data = await fetchMyLibrary();
                setLibrary(data);
                setLibraryLoaded(true);
            } catch (e) {
                console.error(e);
            } finally {
                setLibraryLoading(false);
            }
        }
    };

    const handleDownload = async (docId: string, url: string, _name: string) => {
        trackDownload(docId);
        window.open(url, '_blank', 'noopener,noreferrer');
        if (activeTab === 'library') {
            const data = await fetchMyLibrary();
            setLibrary(data);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        try {
            await deleteCourse(courseId);
        } catch (e: any) {
            alert(e?.message || 'Failed to delete course.');
        } finally {
            setConfirmDeleteId(null);
        }
    };

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
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Course</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-3 bg-stone-100 dark:bg-zinc-900 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => handleTabChange('browse')}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'browse'
                                ? 'bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 shadow-sm'
                                : 'text-stone-500 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            Browse
                        </button>
                        <button
                            onClick={() => handleTabChange('library')}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'library'
                                ? 'bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 shadow-sm'
                                : 'text-stone-500 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            <Library className="w-3.5 h-3.5" />
                            My Library
                        </button>
                    </div>

                    {activeTab === 'browse' && (
                        <>
                            {/* Search */}
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-stone-100/80 dark:bg-zinc-900/80 border border-stone-200/50 dark:border-zinc-800/50 rounded-xl text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-500 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                />
                            </div>

                            {/* Categories */}
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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
                        </>
                    )}
                </div>
            </div>

            {/* Browse Tab */}
            {activeTab === 'browse' && (
                filteredCourses.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <BookOpen className="w-16 h-16 text-stone-300 dark:text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-stone-900 dark:text-zinc-100 mb-2">
                            {searchQuery ? 'No courses found' : 'No courses yet'}
                        </h3>
                        <p className="text-stone-500 dark:text-zinc-500 mb-6">
                            {searchQuery ? `Try a different search term` : 'Be the first to share a course!'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add Course
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 px-3">
                        {filteredCourses.map((course) => (
                            <article
                                key={course.id}
                                className="relative bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-stone-100 dark:hover:shadow-none"
                            >
                                {/* Thumbnail — only for video courses */}
                                {course.content_type !== 'document' && course.thumbnail_url && (() => {
                                    const ytId = course.youtube_url ? extractYouTubeId(course.youtube_url) : null;
                                    const isClickable = !!ytId;
                                    const El = isClickable ? 'button' : 'div';
                                    return (
                                        <El
                                            {...(isClickable ? {
                                                onClick: () => {
                                                    incrementViews(course.id);
                                                    setWatchingCourse({ id: course.id, youtubeId: ytId!, title: course.title });
                                                },
                                                className: 'relative aspect-video bg-black overflow-hidden w-full group/thumb cursor-pointer'
                                            } : {
                                                className: 'relative aspect-video bg-black overflow-hidden'
                                            })}
                                        >
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                className={`w-full h-full object-cover transition-transform duration-300 ${isClickable ? 'group-hover/thumb:scale-105 group-hover/thumb:brightness-75' : 'group-hover:scale-105'}`}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                            {isClickable && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-xl">
                                                        <Play className="w-4 h-4 md:w-6 md:h-6 text-white fill-current ml-1" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-xs text-white font-medium flex items-center gap-1">
                                                <Film className="w-3 h-3" />
                                                {course.category}
                                            </div>
                                            {course.content_type === 'both' && (
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-600/90 backdrop-blur-sm rounded-lg text-xs text-white font-medium flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />
                                                    +Docs
                                                </div>
                                            )}
                                        </El>
                                    );
                                })()}

                                {/* Document-only banner */}
                                {course.content_type === 'document' && (() => {
                                    const firstDoc = course.course_documents?.[0];
                                    const isPdf = firstDoc?.file_type === 'application/pdf' || firstDoc?.public_url?.toLowerCase().includes('.pdf');
                                    return (
                                        <div className="relative h-36 bg-stone-50 dark:bg-zinc-800/60 flex items-center justify-center border-b border-stone-200/60 dark:border-zinc-800 overflow-hidden">
                                            {isPdf && firstDoc?.public_url ? (
                                                <>
                                                    <PdfFirstPageCanvas
                                                        url={firstDoc.public_url}
                                                        className="w-full h-full object-cover object-top absolute inset-0"
                                                    />
                                                    {/* overlay so text is readable */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                                </>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="text-5xl mb-1">
                                                        {firstDoc ? getDocIcon(firstDoc.file_type) : '📁'}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-600 rounded-lg text-xs text-white font-medium">
                                                {course.category}
                                            </div>
                                            <div className="absolute bottom-2 left-2 text-[10px] font-semibold text-white/90 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded">
                                                {course.course_documents?.length || 0} doc{(course.course_documents?.length || 0) !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Content */}
                                <div className="p-3 md:p-4">
                                    {/* Author */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <img
                                            src={course.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.profiles?.name || 'User')}`}
                                            alt={course.profiles?.name}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <div className="flex flex-col leading-none flex-1 min-w-0">
                                            <span className="text-[12px] font-bold text-stone-900 dark:text-zinc-100 truncate">{course.profiles?.name}</span>
                                            <span className="hidden md:block text-[10px] text-stone-400 dark:text-zinc-600">@{course.profiles?.username}</span>
                                        </div>
                                        {currentUserId === course.author_id && (
                                            <button
                                                onClick={() => setConfirmDeleteId(course.id)}
                                                className="p-1.5 text-stone-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors flex-shrink-0"
                                                title="Delete course"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    <h3 className="font-semibold text-[13px] md:text-[15px] text-stone-900 dark:text-zinc-100 mb-2 line-clamp-1 md:line-clamp-2 leading-tight">
                                        {course.title}
                                    </h3>

                                    {course.description && (
                                        <p className="hidden md:block text-sm text-stone-600 dark:text-zinc-400 mb-3 line-clamp-2 leading-relaxed">
                                            {course.description}
                                        </p>
                                    )}

                                    {course.tags && course.tags.length > 0 && (
                                        <div className="hidden md:flex flex-wrap gap-1.5 mb-3">
                                            {course.tags.slice(0, 3).map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 dark:bg-zinc-800 text-xs text-stone-600 dark:text-zinc-400 rounded-full"
                                                >
                                                    <Hash className="w-2.5 h-2.5" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Documents list */}
                                    {course.course_documents && course.course_documents.length > 0 && (
                                        <div className="mb-3 space-y-1.5">
                                            {course.course_documents.map((doc) => (
                                                <button
                                                    key={doc.id}
                                                    onClick={() => {
                                                        setViewingDoc({ doc, course });
                                                        trackDownload(doc.id);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 bg-stone-50 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-colors group/doc border border-stone-200/60 dark:border-zinc-700"
                                                >
                                                    <span className="text-lg flex-shrink-0">{getDocIcon(doc.file_type)}</span>
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <p className="text-xs font-semibold text-stone-800 dark:text-zinc-200 truncate">{doc.name}</p>
                                                        <p className="text-[10px] text-stone-400 dark:text-zinc-600">{formatFileSize(doc.file_size)} · {doc.downloads_count} opens</p>
                                                    </div>
                                                    <Sparkles className="w-3.5 h-3.5 text-violet-400 opacity-0 group-hover/doc:opacity-100 transition-opacity flex-shrink-0" />
                                                </button>
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
                                        <span className="ml-auto px-2 py-0.5 bg-stone-100 dark:bg-zinc-800 rounded-full text-[11px] font-medium">
                                            {course.level}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-2">
                                        {/* Watch — only for video/both */}
                                        {(course.content_type === 'video' || course.content_type === 'both') && course.youtube_url && (() => {
                                            const ytId = extractYouTubeId(course.youtube_url);
                                            if (!ytId) return null;
                                            return (
                                                <button
                                                    onClick={() => {
                                                        incrementViews(course.id);
                                                        setWatchingCourse({ id: course.id, youtubeId: ytId, title: course.title });
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors"
                                                >
                                                    <Play className="w-4 h-4 fill-current" />
                                                    Watch Now
                                                </button>
                                            );
                                        })()}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleEnrollment(course.id)}
                                                className={`flex-1 py-2 rounded-xl font-medium text-sm transition-colors ${course.user_has_enrolled
                                                    ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-500'
                                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                    }`}
                                            >
                                                {course.user_has_enrolled ? 'Enrolled ✓' : 'Enroll'}
                                            </button>
                                            <button
                                                onClick={() => setAiCourse(course)}
                                                className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/40 transition-colors"
                                                title="Ask UAI"
                                            >
                                                <Brain className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => toggleLike(course.id)}
                                                className={`p-2 rounded-xl transition-colors ${course.user_has_liked
                                                    ? 'bg-red-50 dark:bg-red-950/30 text-red-500'
                                                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-700'
                                                    }`}
                                            >
                                                <Heart className={`w-5 h-5 ${course.user_has_liked ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Delete confirmation overlay */}
                                    {confirmDeleteId === course.id && (
                                        <div className="absolute inset-0 bg-white/97 dark:bg-zinc-900/97 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4 z-10 p-6">
                                            <Trash2 className="w-8 h-8 text-red-500" />
                                            <div className="text-center">
                                                <p className="font-semibold text-stone-900 dark:text-zinc-100">Delete this course?</p>
                                                <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">All attached documents will also be removed.</p>
                                            </div>
                                            <div className="flex gap-3 w-full">
                                                <button
                                                    onClick={() => setConfirmDeleteId(null)}
                                                    className="flex-1 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 text-sm font-medium text-stone-600 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCourse(course.id)}
                                                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )
            )}

            {/* My Library Tab */}
            {activeTab === 'library' && (
                <div className="px-4">
                    {!currentUserId ? (
                        <div className="text-center py-16">
                            <Library className="w-16 h-16 text-stone-300 dark:text-zinc-700 mx-auto mb-4" />
                            <p className="text-stone-500 dark:text-zinc-500">Sign in to view your downloaded documents</p>
                        </div>
                    ) : libraryLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                        </div>
                    ) : library.length === 0 ? (
                        <div className="text-center py-16">
                            <Library className="w-16 h-16 text-stone-300 dark:text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-stone-900 dark:text-zinc-100 mb-2">No downloads yet</h3>
                            <p className="text-stone-500 dark:text-zinc-500">
                                Download documents from courses and they'll appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-w-2xl mx-auto">
                            <p className="text-xs font-bold text-stone-400 dark:text-zinc-600 uppercase tracking-widest mb-4">
                                {library.length} downloaded document{library.length !== 1 ? 's' : ''}
                            </p>
                            {library.map((item) => {
                                const doc = item.course_documents;
                                if (!doc) return null;
                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 rounded-2xl hover:border-emerald-300 dark:hover:border-emerald-800 transition-all"
                                    >
                                        <div className="text-3xl flex-shrink-0">{getDocIcon(doc.file_type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-stone-900 dark:text-zinc-100 text-sm truncate">{doc.name}</p>
                                            <p className="text-xs text-stone-400 dark:text-zinc-600 mt-0.5">
                                                {(doc as any).courses?.title && (
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{(doc as any).courses.title} · </span>
                                                )}
                                                {formatFileSize(doc.file_size)} · Downloaded {new Date(item.downloaded_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <a
                                                href={doc.public_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-all"
                                                title="Open"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => handleDownload(doc.id, doc.public_url, doc.name)}
                                                className="p-2 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-all"
                                                title="Download again"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* In-app Document Viewer */}
            {viewingDoc && (
                <DocumentViewer
                    doc={viewingDoc.doc}
                    course={viewingDoc.course}
                    onClose={() => setViewingDoc(null)}
                />
            )}

            {/* AI Study Chat */}
            {aiCourse && (
                <CourseAIChat
                    course={aiCourse}
                    onClose={() => setAiCourse(null)}
                />
            )}

            {/* Floating Video Player */}
            {watchingCourse && (
                videoExpanded ? (
                    // ── Fullscreen expanded overlay ──
                    <div className="fixed inset-0 z-50 bg-black flex flex-col">
                        {/* Top bar */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-black/90 backdrop-blur-sm shrink-0">
                            <button
                                onClick={() => { setWatchingCourse(null); setVideoExpanded(false); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all active:scale-95"
                                aria-label="Close video"
                            >
                                <X className="w-4 h-4" />
                                Close
                            </button>
                            <h2 className="text-white font-semibold text-sm flex-1 truncate">{watchingCourse.title}</h2>
                            <button
                                onClick={() => setVideoExpanded(false)}
                                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                title="Float as mini player"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                            <a
                                href={`https://www.youtube.com/watch?v=${watchingCourse.youtubeId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                title="Open on YouTube"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                        {/* Embed */}
                        <div className="flex-1 flex items-center justify-center bg-black min-h-0 p-4">
                            <div className="w-full max-w-6xl" style={{ aspectRatio: '16/9', maxHeight: '100%' }}>
                                <iframe
                                    className="w-full h-full rounded-xl"
                                    src={`https://www.youtube.com/embed/${watchingCourse.youtubeId}?autoplay=1&rel=0`}
                                    title={watchingCourse.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                        {/* ESC hint */}
                        <p className="text-center text-white/30 text-xs pb-3">Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/50">Esc</kbd> to close</p>
                    </div>
                ) : (
                    // ── Floating mini player (draggable) ──
                    <div
                        className="fixed z-50 bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                        style={{
                            left: videoPos.x,
                            top: videoPos.y,
                            width: 'min(380px, calc(100vw - 32px))'
                        }}
                    >
                        {/* Drag handle / title bar */}
                        <div
                            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 cursor-grab active:cursor-grabbing select-none"
                            onMouseDown={onDragStart}
                            onTouchStart={onDragStart}
                        >
                            {/* Visible close button — large and easy to tap */}
                            <button
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => { setWatchingCourse(null); setVideoExpanded(false); }}
                                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors active:scale-95 shrink-0"
                                aria-label="Close video"
                            >
                                <X className="w-3.5 h-3.5" />
                                Close
                            </button>
                            <p className="text-white/80 text-xs font-medium truncate flex-1">{watchingCourse.title}</p>
                            <button
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => setVideoExpanded(true)}
                                className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
                                title="Expand to fullscreen"
                            >
                                <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        {/* Video iframe */}
                        <div style={{ aspectRatio: '16/9' }}>
                            <iframe
                                className="w-full h-full block"
                                src={`https://www.youtube.com/embed/${watchingCourse.youtubeId}?autoplay=1&rel=0`}
                                title={watchingCourse.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                        {/* Bottom action row */}
                        <div className="flex items-center justify-between px-3 py-2 bg-zinc-800/80">
                            <p className="text-white/40 text-[10px]">Drag to reposition</p>
                            <a
                                href={`https://www.youtube.com/watch?v=${watchingCourse.youtubeId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-white/50 hover:text-white text-[10px] font-medium transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                YouTube
                            </a>
                        </div>
                    </div>
                )
            )}

            {/* Create Course Modal */}
            {showCreateModal && (
                <CreateCourseModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={async (data) => {
                        try {
                            await createCourse(data);
                            setShowCreateModal(false);
                        } catch (error: any) {
                            console.error('Failed to create course:', error);
                            alert(error?.message || 'Failed to create course. Please try again.');
                        }
                    }}
                />
            )}

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

// ─── Create Course Modal ─────────────────────────────────────────────────────

function CreateCourseModal({
    onClose,
    onCreate,
}: {
    onClose: () => void;
    onCreate: (data: {
        title: string;
        description?: string;
        youtube_url?: string;
        category: CourseCategory;
        level: string;
        tags?: string[];
        documentFile?: File | null;
    }) => Promise<void>;
}) {
    const [mode, setMode] = useState<'video' | 'document' | 'both'>('video');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [category, setCategory] = useState<CourseCategory>('School');
    const [level, setLevel] = useState<CourseLevel>('Beginner');
    const [tags, setTags] = useState('');
    const [urlError, setUrlError] = useState('');
    const [docFile, setDocFile] = useState<File | null>(null);
    const [docError, setDocError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const docInputRef = useRef<HTMLInputElement>(null);

    const videoId = extractYouTubeId(youtubeUrl);
    const thumbnail = videoId ? getYouTubeThumbnail(videoId) : null;

    const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setDocError('');
        if (!file) return;
        // Use resolveDocMimeType so iOS/Android empty file.type falls back to extension
        const resolvedType = resolveDocMimeType(file);
        if (!ACCEPTED_DOC_TYPES[resolvedType]) {
            setDocError('Unsupported file type. Please upload PDF, DOCX, PPTX, XLSX, or TXT.');
            return;
        }
        if (file.size > MAX_DOC_SIZE_BYTES) {
            setDocError(`File too large. Maximum size is ${MAX_DOC_SIZE_MB}MB.`);
            return;
        }
        setDocFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if ((mode === 'video' || mode === 'both') && !isValidYouTubeUrl(youtubeUrl)) {
            setUrlError('Please enter a valid YouTube URL');
            return;
        }
        if ((mode === 'document' || mode === 'both') && !docFile) {
            setDocError('Please select a document to upload');
            return;
        }

        setSubmitting(true);
        try {
            const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
            await onCreate({
                title,
                description: description || undefined,
                youtube_url: (mode === 'video' || mode === 'both') ? youtubeUrl : undefined,
                category,
                level,
                tags: tagArray.length > 0 ? tagArray : undefined,
                documentFile: (mode === 'document' || mode === 'both') ? docFile : null,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = "w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm";
    const labelCls = "block text-xs font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-wider mb-1.5";

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Add New Course"
            size="2xl"
            footer={
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300 font-medium rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || !title || (!youtubeUrl && !docFile)}
                        className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {docFile ? 'Uploading...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Create Course
                            </>
                        )}
                    </button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 pb-4">

                {/* Content type selector */}
                <div>
                    <label className={labelCls}>Content Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['video', 'document', 'both'] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMode(m)}
                                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${mode === m
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                                    : 'border-stone-200 dark:border-zinc-800 text-stone-500 dark:text-zinc-500 hover:border-stone-300 dark:hover:border-zinc-700'
                                    }`}
                            >
                                {m === 'video' && <Film className="w-5 h-5" />}
                                {m === 'document' && <FileText className="w-5 h-5" />}
                                {m === 'both' && <File className="w-5 h-5" />}
                                <span className="text-xs font-semibold capitalize">{m === 'both' ? 'Video + Doc' : m}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* YouTube URL */}
                {(mode === 'video' || mode === 'both') && (
                    <div>
                        <label className={labelCls}>YouTube URL *</label>
                        <input
                            type="text"
                            required={mode === 'video'}
                            value={youtubeUrl}
                            onChange={(e) => { setYoutubeUrl(e.target.value); setUrlError(''); }}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className={inputCls}
                        />
                        {urlError && (
                            <p className="mt-1.5 text-xs text-red-600 dark:text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />{urlError}
                            </p>
                        )}
                        {thumbnail && !urlError && (
                            <img src={thumbnail} alt="Thumbnail" className="mt-2 w-full aspect-video object-cover rounded-xl border border-stone-200 dark:border-zinc-800" />
                        )}
                    </div>
                )}

                {/* Document Upload */}
                {(mode === 'document' || mode === 'both') && (
                    <div>
                        <label className={labelCls}>Document * <span className="text-stone-400 font-normal normal-case">(PDF, DOCX, PPTX, XLSX, TXT · max {MAX_DOC_SIZE_MB}MB)</span></label>
                        <input
                            ref={docInputRef}
                            type="file"
                            className="hidden"
                            accept={ACCEPTED_DOC_ATTR}
                            onChange={handleDocChange}
                        />
                        {docFile ? (
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                                <span className="text-2xl">{getDocIcon(resolveDocMimeType(docFile))}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100 truncate">{docFile.name}</p>
                                    <p className="text-xs text-stone-500">{formatFileSize(docFile.size)}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setDocFile(null); if (docInputRef.current) docInputRef.current.value = ''; }}
                                    className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => docInputRef.current?.click()}
                                className="w-full py-8 border-2 border-dashed border-stone-200 dark:border-zinc-700 rounded-xl flex flex-col items-center gap-2 text-stone-400 dark:text-zinc-600 hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-all"
                            >
                                <Upload className="w-6 h-6" />
                                <span className="text-sm font-medium">Click to select your document</span>
                                <span className="text-xs">PDF, DOCX, PPTX, XLSX, TXT</span>
                            </button>
                        )}
                        {docError && (
                            <p className="mt-1.5 text-xs text-red-600 dark:text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />{docError}
                            </p>
                        )}
                    </div>
                )}

                {/* Title */}
                <div>
                    <label className={labelCls}>Title *</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Introduction to React Hooks"
                        className={inputCls}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of what students will learn..."
                        rows={3}
                        className={`${inputCls} resize-none`}
                    />
                </div>

                {/* Category & Level */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls}>Category *</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value as CourseCategory)} className={inputCls}>
                            {Object.keys(COURSE_CATEGORIES).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Level *</label>
                        <select value={level} onChange={(e) => setLevel(e.target.value as CourseLevel)} className={inputCls}>
                            {COURSE_LEVELS.map((lvl) => (
                                <option key={lvl} value={lvl}>{lvl}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label className={labelCls}>Tags <span className="text-stone-400 font-normal normal-case">(comma-separated)</span></label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="react, javascript, frontend"
                        className={inputCls}
                    />
                </div>
            </form>
        </Modal>
    );
}
