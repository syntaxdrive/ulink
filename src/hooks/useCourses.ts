import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Course, CourseCategory } from '../types/courses';
import { extractYouTubeId, getYouTubeThumbnail } from '../utils/youtube';

export function useCourses(category?: CourseCategory, searchQuery?: string) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Get current user
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUserId(data.user?.id || null);
        });
    }, []);

    // Fetch courses
    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('courses')
                .select(`
                    *,
                    profiles:author_id (
                        id,
                        name,
                        avatar_url,
                        university,
                        is_verified
                    )
                `)
                .order('created_at', { ascending: false });

            // Filter by category
            if (category) {
                query = query.eq('category', category);
            }

            // Search filter
            if (searchQuery) {
                query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Fetch user interactions if logged in
            if (currentUserId && data) {
                const courseIds = data.map(c => c.id);

                // Fetch likes
                const { data: likes } = await supabase
                    .from('course_likes')
                    .select('course_id')
                    .in('course_id', courseIds)
                    .eq('user_id', currentUserId);

                // Fetch enrollments
                const { data: enrollments } = await supabase
                    .from('course_enrollments')
                    .select('course_id')
                    .in('course_id', courseIds)
                    .eq('user_id', currentUserId);

                const likedIds = new Set(likes?.map(l => l.course_id) || []);
                const enrolledIds = new Set(enrollments?.map(e => e.course_id) || []);

                const coursesWithInteractions = data.map(course => ({
                    ...course,
                    user_has_liked: likedIds.has(course.id),
                    user_has_enrolled: enrolledIds.has(course.id),
                }));

                setCourses(coursesWithInteractions);
            } else {
                setCourses(data || []);
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
        youtube_url: string;
        category: CourseCategory;
        level: string;
        tags?: string[];
    }) => {
        try {
            const videoId = extractYouTubeId(data.youtube_url);
            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: newCourse, error } = await supabase
                .from('courses')
                .insert({
                    title: data.title,
                    description: data.description || null,
                    youtube_url: data.youtube_url,
                    video_id: videoId,
                    category: data.category,
                    level: data.level,
                    tags: data.tags || null,
                    author_id: user.id,
                    thumbnail_url: getYouTubeThumbnail(videoId, 'hq'),
                })
                .select(`
                    *,
                    profiles:author_id (
                        id,
                        name,
                        avatar_url,
                        university,
                        is_verified
                    )
                `)
                .single();

            if (error) throw error;

            setCourses(prev => [newCourse, ...prev]);
            return newCourse;
        } catch (error) {
            console.error('Error creating course:', error);
            throw error;
        }
    };

    // Delete course
    const deleteCourse = async (courseId: string) => {
        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseId);

            if (error) throw error;

            setCourses(prev => prev.filter(c => c.id !== courseId));
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        }
    };

    // Toggle like
    const toggleLike = async (courseId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const course = courses.find(c => c.id === courseId);
            if (!course) return;

            if (course.user_has_liked) {
                // Unlike
                await supabase
                    .from('course_likes')
                    .delete()
                    .eq('course_id', courseId)
                    .eq('user_id', user.id);

                setCourses(prev => prev.map(c =>
                    c.id === courseId
                        ? { ...c, user_has_liked: false, likes_count: c.likes_count - 1 }
                        : c
                ));
            } else {
                // Like
                await supabase
                    .from('course_likes')
                    .insert({ course_id: courseId, user_id: user.id });

                setCourses(prev => prev.map(c =>
                    c.id === courseId
                        ? { ...c, user_has_liked: true, likes_count: c.likes_count + 1 }
                        : c
                ));
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
                // Unenroll
                await supabase
                    .from('course_enrollments')
                    .delete()
                    .eq('course_id', courseId)
                    .eq('user_id', user.id);

                setCourses(prev => prev.map(c =>
                    c.id === courseId
                        ? { ...c, user_has_enrolled: false, enrollments_count: c.enrollments_count - 1 }
                        : c
                ));
            } else {
                // Enroll
                await supabase
                    .from('course_enrollments')
                    .insert({ course_id: courseId, user_id: user.id });

                setCourses(prev => prev.map(c =>
                    c.id === courseId
                        ? { ...c, user_has_enrolled: true, enrollments_count: c.enrollments_count + 1 }
                        : c
                ));
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
                c.id === courseId
                    ? { ...c, views_count: c.views_count + 1 }
                    : c
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
        refetch: fetchCourses,
    };
}
