import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Course, CourseCategory, CourseDocument, UserDocumentDownload } from '../types/courses';
import { ACCEPTED_DOC_TYPES, MAX_DOC_SIZE_BYTES, resolveDocMimeType } from '../types/courses';
import { extractYouTubeId, getYouTubeThumbnail } from '../utils/youtube';
import { useCourseStore } from '../stores/useCourseStore';
import { useAuth } from '../contexts/AuthContext';

export function useCourses(category?: CourseCategory, searchQuery?: string) {
    const store = useCourseStore();
    // ✅ Auth from context — zero network calls, replaces getUser() + 4x getSession()
    const { userId: currentUserId } = useAuth();

    // Hydrate from store immediately — instant render on revisit
    const [courses, setCourses] = useState<Course[]>(store.courses);
    const [loading, setLoading] = useState(store.courses.length === 0);

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
            let { data, error } = await applyFilters(supabase.from('courses').select(DOCS_SELECT).limit(50));

            if (error) {
                // PGRST200 = relationship not found (migration not yet applied)
                if (error.message?.includes('course_documents') || (error as any).code === 'PGRST200') {
                    console.warn('[useCourses] course_documents not in schema cache yet. Apply migration 20260303_course_documents.sql in Supabase SQL Editor, then reload.');
                    const fallback = await applyFilters(supabase.from('courses').select(BASE_SELECT).limit(50));
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
                    supabase.from('course_likes').select('course_id').limit(50).in('course_id', courseIds).eq('user_id', currentUserId),
                    supabase.from('course_enrollments').select('course_id').limit(50).in('course_id', courseIds).eq('user_id', currentUserId),
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

    // Create course — uses currentUserId from AuthContext (no getSession needed)
    const createCourse = async (data: {
        title: string;
        description?: string;
        youtube_url?: string;
        category: CourseCategory;
        level: string;
        tags?: string[];
        documentFile?: File | null;
    }) => {
        if (!currentUserId) throw new Error('Not authenticated');

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
                author_id: currentUserId,
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
            await uploadDocumentToCourse(newCourse.id, data.documentFile, currentUserId);
        }

        return newCourse;
    };

    // Upload a document to an existing course — Supabase Storage (public bucket)
    const uploadDocumentToCourse = async (
        courseId: string,
        file: File,
        userId?: string,
        _onProgress?: (pct: number) => void
    ): Promise<CourseDocument | null> => {
        const uid = userId || currentUserId;
        if (!uid) throw new Error('Not authenticated');

        // Resolve MIME type — mobile browsers (iOS Safari, Android) often return empty file.type
        const resolvedType = resolveDocMimeType(file);

        if (!ACCEPTED_DOC_TYPES[resolvedType]) {
            throw new Error(`File type not supported. Accepted: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT`);
        }

        if (file.size > MAX_DOC_SIZE_BYTES) {
            throw new Error(`File too large. Maximum size is 25MB.`);
        }

        let publicUrl = '';
        let storagePath = '';
        const uploadedBytes = file.size;

        // Documents go directly to Supabase Storage (public bucket)
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
                file_type: resolvedType,
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

    // Delete a document
    const deleteDocument = async (doc: CourseDocument) => {
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

    // Fetch user's downloaded document library — paginated to 20 most recent
    const fetchMyLibrary = async (): Promise<UserDocumentDownload[]> => {
        const { data, error } = await supabase
            .from('user_document_downloads')
            .select(`
                id, user_id, document_id, downloaded_at,
                course_documents (
                    id, name, public_url, file_type, file_size, downloads_count, created_at,
                    courses ( id, title, category )
                )
            `)
            .order('downloaded_at', { ascending: false })
            .limit(20); // ✅ Paginated — previously fetched ALL rows

        if (error) throw error;
        return (data as unknown as UserDocumentDownload[]) || [];
    };

    // Delete course
    const deleteCourse = async (courseId: string) => {
        const { error } = await supabase.from('courses').delete().eq('id', courseId);
        if (error) throw error;
        setCourses(prev => prev.filter(c => c.id !== courseId));
        store.removeCourse(courseId);
    };

    // Toggle like — uses currentUserId from AuthContext
    const toggleLike = async (courseId: string) => {
        try {
            if (!currentUserId) return;

            const course = courses.find(c => c.id === courseId);
            if (!course) return;

            if (course.user_has_liked) {
                await supabase.from('course_likes').delete()
                    .eq('course_id', courseId).eq('user_id', currentUserId);
                const patch = { user_has_liked: false, likes_count: course.likes_count - 1 };
                setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...patch } : c));
                store.updateCourse(courseId, patch);
            } else {
                await supabase.from('course_likes').insert({ course_id: courseId, user_id: currentUserId });
                const patch = { user_has_liked: true, likes_count: course.likes_count + 1 };
                setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...patch } : c));
                store.updateCourse(courseId, patch);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // Toggle enrollment — uses currentUserId from AuthContext
    const toggleEnrollment = async (courseId: string) => {
        try {
            if (!currentUserId) return;

            const course = courses.find(c => c.id === courseId);
            if (!course) return;

            if (course.user_has_enrolled) {
                await supabase.from('course_enrollments').delete()
                    .eq('course_id', courseId).eq('user_id', currentUserId);
                const patch = { user_has_enrolled: false, enrollments_count: course.enrollments_count - 1 };
                setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...patch } : c));
                store.updateCourse(courseId, patch);
            } else {
                await supabase.from('course_enrollments').insert({ course_id: courseId, user_id: currentUserId });
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
