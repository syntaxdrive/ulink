import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Course, CourseCategory, CourseDocument, UserDocumentDownload } from '../types/courses';
import { ACCEPTED_DOC_TYPES, MAX_DOC_SIZE_BYTES, resolveDocMimeType } from '../types/courses';
import { extractYouTubeId, getYouTubeThumbnail } from '../utils/youtube';
import { useCourseStore } from '../stores/useCourseStore';

export function useCourses(category?: CourseCategory, searchQuery?: string) {
    const store = useCourseStore();

    // Hydrate from store immediately — instant render on revisit
    const [courses, setCourses] = useState<Course[]>(store.courses);
    const [loading, setLoading] = useState(store.courses.length === 0);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Get current user
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUserId(data.user?.id || null);
        });
    }, []);

    // Fetch courses — with fallback if course_documents migration not yet applied
    const fetchCourses = useCallback(async () => {
        try {
            // Skip fetch if cache is fresh and category hasn't changed
            const cacheHit = !store.needsRefresh(category ?? null) && store.courses.length > 0;
            if (cacheHit && !searchQuery) {
                setLoading(false);
                return;
            }

            setLoading(true);

            const BASE_SELECT = `*, profiles:author_id(id,name,username,avatar_url,university,is_verified)`;
            const DOCS_SELECT = `${BASE_SELECT}, course_documents(id,name,public_url,file_type,file_size,downloads_count,created_at)`;

            const applyFilters = (q: any) => {
                if (category) q = q.eq('category', category);
                if (searchQuery) q = q.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
                return q.order('created_at', { ascending: false });
            };

            // Try with documents join first
            let { data, error } = await applyFilters(supabase.from('courses').select(DOCS_SELECT));

            if (error) {
                // PGRST200 = relationship not found (migration not yet applied)
                if (error.message?.includes('course_documents') || (error as any).code === 'PGRST200') {
                    console.warn('[useCourses] course_documents not in schema cache yet. Apply migration 20260303_course_documents.sql in Supabase SQL Editor, then reload.');
                    const fallback = await applyFilters(supabase.from('courses').select(BASE_SELECT));
                    data = fallback.data;
                    if (fallback.error) throw fallback.error;
                } else {
                    throw error;
                }
            }

            const fetchedData: Course[] = data?.map((course: any) => ({
                ...course,
                course_documents: course.course_documents ?? [],
                user_has_liked: false,
                user_has_enrolled: false,
            })) || [];

            if (currentUserId && data) {
                const courseIds = data.map((c: any) => c.id);

                const [{ data: likes }, { data: enrollments }] = await Promise.all([
                    supabase.from('course_likes').select('course_id').in('course_id', courseIds).eq('user_id', currentUserId),
                    supabase.from('course_enrollments').select('course_id').in('course_id', courseIds).eq('user_id', currentUserId),
                ]);

                const likedIds = new Set(likes?.map((l: any) => l.course_id) || []);
                const enrolledIds = new Set(enrollments?.map((e: any) => e.course_id) || []);

                const enriched = fetchedData.map((course) => ({
                    ...course,
                    user_has_liked: likedIds.has(course.id),
                    user_has_enrolled: enrolledIds.has(course.id),
                }));
                setCourses(enriched);
                // Only persist to store if not a search query (search results are transient)
                if (!searchQuery) store.setCourses(enriched, category ?? null);
            } else {
                setCourses(fetchedData);
                if (!searchQuery) store.setCourses(fetchedData, category ?? null);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    }, [category, searchQuery, currentUserId]);


    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Create course
    const createCourse = async (data: {
        title: string;
        description?: string;
        youtube_url?: string;
        category: CourseCategory;
        level: string;
        tags?: string[];
        documentFile?: File | null;
    }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const isVideoMode = !!data.youtube_url;
        const isDocMode = !!data.documentFile;

        if (!isVideoMode && !isDocMode) {
            throw new Error('Please provide a YouTube URL or upload a document.');
        }

        let videoId: string | null = null;
        let thumbnailUrl: string | null = null;

        if (isVideoMode && data.youtube_url) {
            videoId = extractYouTubeId(data.youtube_url);
            if (!videoId) throw new Error('Invalid YouTube URL');
            thumbnailUrl = getYouTubeThumbnail(videoId, 'hq');
        }

        const contentType = isVideoMode && isDocMode ? 'both'
            : isDocMode ? 'document'
                : 'video';

        const { data: newCourse, error } = await supabase
            .from('courses')
            .insert({
                title: data.title,
                description: data.description || null,
                youtube_url: data.youtube_url || '',
                video_id: videoId || '',
                category: data.category,
                level: data.level,
                tags: data.tags || null,
                author_id: user.id,
                thumbnail_url: thumbnailUrl,
                content_type: contentType,
            })
            .select(`
                *,
                profiles:author_id (
                    id, name, username, avatar_url, university, is_verified
                ),
                course_documents (
                    id, name, public_url, file_type, file_size, downloads_count, created_at
                )
            `)
            .single();

        if (error) throw error;

        // Add course to state immediately so the upload's state patch can find it by id
        setCourses(prev => [{
            ...newCourse,
            course_documents: [],
            user_has_liked: false,
            user_has_enrolled: false,
        }, ...prev]);

        // Upload document if provided — uploadDocumentToCourse will patch state once done
        if (data.documentFile && newCourse) {
            await uploadDocumentToCourse(newCourse.id, data.documentFile, user.id);
        }

        return newCourse;
    };

    // Upload a document to an existing course — Cloudinary first, Supabase Storage fallback
    const uploadDocumentToCourse = async (
        courseId: string,
        file: File,
        userId?: string,
        _onProgress?: (pct: number) => void
    ): Promise<CourseDocument | null> => {
        const { data: { user } } = await supabase.auth.getUser();
        const uid = userId || user?.id;
        if (!uid) throw new Error('Not authenticated');

        // Resolve MIME type — mobile browsers (iOS Safari, Android) often return empty file.type
        const resolvedType = resolveDocMimeType(file);

        // Validate type with resolved MIME
        if (!ACCEPTED_DOC_TYPES[resolvedType]) {
            throw new Error(`File type not supported. Accepted: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT`);
        }

        // Validate size
        if (file.size > MAX_DOC_SIZE_BYTES) {
            throw new Error(`File too large. Maximum size is 25MB.`);
        }

        let publicUrl = '';
        let storagePath = '';
        let uploadedBytes = file.size;

        // Documents go directly to Supabase Storage (public bucket) — Cloudinary raw resources
        // require authenticated access by default, causing 401s when viewing in-app.
        const ext = file.name.split('.').pop() ?? 'bin';
        const fileName = `course-documents/${courseId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: storageErr } = await supabase.storage
            .from('uploads')
            .upload(fileName, file, { upsert: true });
        if (storageErr) throw new Error(`Upload failed: ${storageErr.message}`);
        publicUrl = supabase.storage.from('uploads').getPublicUrl(fileName).data.publicUrl;
        storagePath = fileName;

        // Store metadata in DB
        const { data: doc, error: dbError } = await supabase
            .from('course_documents')
            .insert({
                course_id: courseId,
                uploader_id: uid,
                name: file.name,
                storage_path: storagePath,
                public_url: publicUrl,
                file_type: resolvedType,  // use resolved type, not raw file.type
                file_size: uploadedBytes,
            })
            .select()
            .single();

        if (dbError) throw dbError;

        // Update local state
        setCourses(prev => prev.map(c =>
            c.id === courseId
                ? { ...c, course_documents: [...(c.course_documents || []), doc] }
                : c
        ));

        return doc;
    };

    // Delete a document — removes from Cloudinary and DB
    const deleteDocument = async (doc: CourseDocument) => {
        // Note: Cloudinary deletion requires a signed API call (server-side).
        // For now we just delete the DB record; optionally add a Supabase Edge Function later.
        // The file will remain on Cloudinary's CDN but won't be accessible from the app.
        await supabase.from('course_documents').delete().eq('id', doc.id);
        setCourses(prev => prev.map(c =>
            c.id === doc.course_id
                ? { ...c, course_documents: c.course_documents?.filter(d => d.id !== doc.id) }
                : c
        ));
    };

    // Track a download (increments counter + logs to user library)
    const trackDownload = async (documentId: string) => {
        try {
            await supabase.rpc('track_document_download', { p_document_id: documentId });
        } catch (e) {
            // Non-critical — don't block the download
            console.warn('Failed to track download:', e);
        }
    };

    // Fetch user's downloaded document library
    const fetchMyLibrary = async (): Promise<UserDocumentDownload[]> => {
        const { data, error } = await supabase
            .from('user_document_downloads')
            .select(`
                *,
                course_documents (
                    id, name, public_url, file_type, file_size, downloads_count, created_at,
                    courses ( id, title, category )
                )
            `)
            .order('downloaded_at', { ascending: false });

        if (error) throw error;
        return data || [];
    };

    // Delete course — removes docs from DB (Cloudinary cleanup via Edge Function later)
    const deleteCourse = async (courseId: string) => {
        const { error } = await supabase.from('courses').delete().eq('id', courseId);
        if (error) throw error;
        setCourses(prev => prev.filter(c => c.id !== courseId));
        store.removeCourse(courseId);
    };

    // Toggle like
    const toggleLike = async (courseId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const course = courses.find(c => c.id === courseId);
            if (!course) return;

            if (course.user_has_liked) {
                await supabase.from('course_likes').delete()
                    .eq('course_id', courseId).eq('user_id', user.id);
                const patch = { user_has_liked: false, likes_count: course.likes_count - 1 };
                setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...patch } : c));
                store.updateCourse(courseId, patch);
            } else {
                await supabase.from('course_likes').insert({ course_id: courseId, user_id: user.id });
                const patch = { user_has_liked: true, likes_count: course.likes_count + 1 };
                setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...patch } : c));
                store.updateCourse(courseId, patch);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // Toggle enrollment
    const toggleEnrollment = async (courseId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const course = courses.find(c => c.id === courseId);
            if (!course) return;

            if (course.user_has_enrolled) {
                await supabase.from('course_enrollments').delete()
                    .eq('course_id', courseId).eq('user_id', user.id);
                const patch = { user_has_enrolled: false, enrollments_count: course.enrollments_count - 1 };
                setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...patch } : c));
                store.updateCourse(courseId, patch);
            } else {
                await supabase.from('course_enrollments').insert({ course_id: courseId, user_id: user.id });
                const patch = { user_has_enrolled: true, enrollments_count: course.enrollments_count + 1 };
                setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...patch } : c));
                store.updateCourse(courseId, patch);
            }
        } catch (error) {
            console.error('Error toggling enrollment:', error);
        }
    };

    // Increment views
    const incrementViews = async (courseId: string) => {
        try {
            await supabase.rpc('increment_course_views', { course_id: courseId });
            setCourses(prev => prev.map(c =>
                c.id === courseId ? { ...c, views_count: c.views_count + 1 } : c
            ));
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    };

    return {
        courses,
        loading,
        currentUserId,
        createCourse,
        deleteCourse,
        toggleLike,
        toggleEnrollment,
        incrementViews,
        uploadDocumentToCourse,
        deleteDocument,
        trackDownload,
        fetchMyLibrary,
        refetch: fetchCourses,
    };
}
