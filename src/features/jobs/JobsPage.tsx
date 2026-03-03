import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Job } from '../../types';
import { Loader2, Briefcase, Building2, Search, Plus, Globe, Trash2, Edit2, CheckCircle, Users, MapPin, Calendar, DollarSign, Clock, Share2 } from 'lucide-react';
import { shareToWhatsApp, nativeShare } from '../../utils/shareUtils';
import Modal from '../../components/ui/Modal';

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<'student' | 'org' | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userCompany, setUserCompany] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [showMyJobsOnly, setShowMyJobsOnly] = useState(false);
    const [myApplications, setMyApplications] = useState<Record<string, string>>({});
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [viewApplicantsJob, setViewApplicantsJob] = useState<Job | null>(null);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);

    const openJobDetails = (job: Job) => {
        setSelectedJob(job);
    };

    const handleShareJob = async (job: Job, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/app/jobs?job=${job.id}`;
        const title = `${job.title} at ${job.company}`;

        let snippet = job.description ? job.description.replace(/\r?\n|\r/g, ' ') : '';
        if (snippet.length > 100) snippet = `${snippet.substring(0, 100)}...`;

        const text = snippet
            ? `"${snippet}"\n\nCheck out this ${job.type} opportunity at ${job.company} on UniLink Nigeria!`
            : `Check out this ${job.type} opportunity at ${job.company} on UniLink Nigeria!`;

        const shared = await nativeShare(title, text, url);
        if (!shared) {
            shareToWhatsApp(text, url);
        }
    };

    const closeJobDetails = () => {
        setSelectedJob(null);
    };

    const fetchApplicants = async (jobId: string) => {
        setLoadingApplicants(true);
        const { data, error } = await supabase
            .from('job_applications')
            .select(`
                user_id,
                status,
                created_at,
                profiles:user_id (
                    id,
                    name,
                    headline,
                    avatar_url,
                    university,
                    email
                )
            `)
            .eq('job_id', jobId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setApplicants(data);
        } else {
            console.error('Error fetching applicants:', error);
        }
        setLoadingApplicants(false);
    };

    const updateApplicantStatus = async (jobId: string, userId: string, newStatus: string) => {
        // Optimistic update
        setApplicants(prev => prev.map(app =>
            app.user_id === userId ? { ...app, status: newStatus } : app
        ));

        const { error } = await supabase
            .from('job_applications')
            .update({ status: newStatus })
            .match({ job_id: jobId, user_id: userId });

        if (error) {
            console.error('Error updating applicant status:', error);
            // Revert would be complex, just re-fetch
            fetchApplicants(jobId);
            alert('Failed to update status.');
        }
    };

    // New Job Form State
    const [showPostForm, setShowPostForm] = useState(false);
    const [newJob, setNewJob] = useState<{
        title: string;
        company: string;
        type: 'Internship' | 'Entry Level' | 'Full Time' | 'Scholarship';
        description: string;
        application_link: string;
        location: string;
        salary_range: string;
        deadline: string;
        logo_url: string;
    }>({
        title: '',
        company: '',
        type: 'Internship',
        description: '',
        application_link: '',
        location: '',
        salary_range: '',
        deadline: '',
        logo_url: ''
    });

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('All');

    const checkUserRole = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
            const { data } = await supabase.from('profiles').select('role, university, company_name').eq('id', user.id).single();
            if (data) {
                setUserRole(data.role);
                setUserCompany(data.company_name || data.university || '');
            }
        }
    };

    const fetchJobs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setJobs(data);
        }
        setLoading(false);
    };

    const fetchMyApplications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('job_applications')
            .select('job_id, status')
            .eq('user_id', user.id);

        if (data) {
            const apps: Record<string, string> = {};
            data.forEach((app: any) => {
                apps[app.job_id] = app.status;
            });
            setMyApplications(apps);
        }
    };

    const handleDeleteJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) return;

        // Optimistic update
        setJobs(prev => prev.filter(j => j.id !== jobId));

        const { error } = await supabase.from('jobs').delete().eq('id', jobId);
        if (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete job. You might not have permission.');
            // Rollback
            fetchJobs();
        }
    };

    useEffect(() => {
        checkUserRole();
        fetchJobs();
        fetchMyApplications();

        const channel = supabase
            .channel('public:jobs')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'jobs' },
                (payload) => {
                    setJobs(prev => [payload.new as Job, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, [userId]);

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPosting(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            if (editingJob) {
                const { error } = await supabase
                    .from('jobs')
                    .update({
                        ...newJob,
                        application_link: newJob.application_link || null
                    })
                    .eq('id', editingJob.id);

                if (error) throw error;
                // Optimistic Update
                setJobs(prev => prev.map(j => j.id === editingJob.id ? { ...j, ...newJob } : j));
            } else {
                const { data, error } = await supabase
                    .from('jobs')
                    .insert({
                        creator_id: user.id,
                        ...newJob,
                        application_link: newJob.application_link || null,
                        status: 'active'
                    })
                    .select()
                    .single();

                if (error) throw error;
                if (data) setJobs(prev => [data, ...prev]);
            }

            setShowPostForm(false);
            setEditingJob(null);
            setNewJob({ title: '', company: userCompany, type: 'Internship', description: '', application_link: '', location: '', salary_range: '', deadline: '', logo_url: '' });
        } catch (error) {
            console.error('Error saving job:', error);
            alert('Failed to save job post.');
        } finally {
            setIsPosting(false);
        }
    };

    const handleEditJob = (job: Job) => {
        setEditingJob(job);
        setNewJob({
            title: job.title,
            company: job.company,
            type: job.type || 'Internship',
            description: job.description || '',
            application_link: job.application_link || '',
            location: job.location || '',
            salary_range: job.salary_range || '',
            deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '', // Format for date input
            logo_url: job.logo_url || ''
        });
        setShowPostForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingJob(null);
        setShowPostForm(false);
        setNewJob({ title: '', company: userCompany, type: 'Internship', description: '', application_link: '', location: '', salary_range: '', deadline: '', logo_url: '' });
    };


    const handleApply = async (job: Job) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Open Link
        if (job.application_link) {
            window.open(job.application_link, '_blank');
        }

        // Track Application
        if (!myApplications[job.id]) {
            const { error } = await supabase.from('job_applications').insert({
                user_id: user.id,
                job_id: job.id,
                status: 'applied'
            });

            if (!error) {
                setMyApplications(prev => ({ ...prev, [job.id]: 'applied' }));
            }
        }
    };



    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (job.description && job.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = filterType === 'All' || job.type === filterType;
        const matchesOwnership = !showMyJobsOnly || (userId && job.creator_id === userId);
        return matchesSearch && matchesType && matchesOwnership;
    });

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32">
            {/* Header / Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center sticky top-0 md:top-4 z-40 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl py-2 md:py-0 px-1 -mx-1">
                <div className="relative group flex-1 w-full md:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 shadow-sm transition-all"
                        placeholder="Search jobs, internships, companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
                    {/* Type Filter Pills */}
                    {['All', 'Internship', 'Scholarship', 'Entry Level', 'Full Time'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${filterType === type
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-lg shadow-zinc-200 dark:shadow-none'
                                : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {userRole === 'org' && (
                    <>
                        <button
                            onClick={() => setShowMyJobsOnly(!showMyJobsOnly)}
                            className={`hidden md:flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all shrink-0 ${showMyJobsOnly
                                ? 'bg-stone-900 text-white shadow-md'
                                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                                }`}
                        >
                            {showMyJobsOnly ? 'All Jobs' : 'My Jobs'}
                        </button>
                        <button
                            onClick={() => {
                                if (showPostForm) handleCancelEdit();
                                else setShowPostForm(true);
                            }}
                            className="hidden md:flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all shrink-0"
                        >
                            {showPostForm ? 'Cancel' : <><Plus className="w-5 h-5" /> Post Job</>}
                        </button>
                    </>
                )}
            </div>

            {/* Moble FAB for Org Only */}
            {userRole === 'org' && (
                <button
                    onClick={() => setShowPostForm(!showPostForm)}
                    className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-xl flex items-center justify-center z-50 hover:bg-emerald-700 transition-transform active:scale-95"
                >
                    {showPostForm ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                </button>
            )}

            {/* Post Job Form (Collapsible) */}
            {showPostForm && (
                <div className="bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                        {editingJob ? <Edit2 className="w-6 h-6 text-emerald-600" /> : <Briefcase className="w-6 h-6 text-emerald-600" />}
                        {editingJob ? 'Edit Opportunity' : 'Post a New Opportunity'}
                    </h2>
                    <form onSubmit={handleCreateJob} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <input
                                placeholder="Job Title"
                                required
                                className="w-full bg-white rounded-xl px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                value={newJob.title}
                                onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                            />
                            <input
                                placeholder="Company Name"
                                required
                                className="w-full bg-white rounded-xl px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                value={newJob.company}
                                onChange={e => setNewJob({ ...newJob, company: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <select
                                className="w-full bg-white rounded-xl px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                value={newJob.type}
                                onChange={e => setNewJob({ ...newJob, type: e.target.value as 'Internship' | 'Entry Level' | 'Full Time' | 'Scholarship' })}
                            >
                                <option>Internship</option>
                                <option>Scholarship</option>
                                <option>Entry Level</option>
                                <option>Full Time</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="relative">
                                <Search className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
                                <input
                                    placeholder="Location (e.g. Lagos, Remote)"
                                    className="w-full bg-white rounded-xl pl-11 pr-4 py-3 border border-stone-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    value={newJob.location}
                                    onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
                                <input
                                    placeholder="Salary Range (e.g. ₦150k - ₦200k)"
                                    className="w-full bg-white rounded-xl pl-11 pr-4 py-3 border border-stone-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    value={newJob.salary_range}
                                    onChange={e => setNewJob({ ...newJob, salary_range: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="relative">
                                <Clock className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
                                <input
                                    type="date"
                                    placeholder="Deadline"
                                    className="w-full bg-white rounded-xl pl-11 pr-4 py-3 border border-stone-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    value={newJob.deadline}
                                    onChange={e => setNewJob({ ...newJob, deadline: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Globe className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
                                <input
                                    placeholder="Application Link (http://...)"
                                    className="w-full bg-white rounded-xl pl-11 pr-4 py-3 border border-stone-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    value={newJob.application_link}
                                    onChange={e => setNewJob({ ...newJob, application_link: e.target.value })}
                                />
                            </div>
                        </div>
                        <textarea
                            placeholder="Description"
                            rows={4}
                            className="w-full bg-white rounded-xl px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                            value={newJob.description}
                            onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                        />
                        <div className="flex gap-3">
                            {editingJob && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="flex-1 bg-stone-100 text-stone-600 py-3.5 rounded-xl font-bold hover:bg-stone-200 transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isPosting}
                                className="flex-1 bg-stone-900 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-all disabled:opacity-50"
                            >
                                {isPosting ? 'Saving...' : (editingJob ? 'Update Job Post' : 'Create Job Post')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Job List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredJobs.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg">No opportunities found</p>
                        <p className="text-zinc-400 dark:text-zinc-500 text-sm">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    filteredJobs.map((job) => (
                        <div key={job.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-xl hover:shadow-zinc-200/40 dark:hover:border-zinc-700 transition-all group flex flex-col justify-between h-full relative overflow-hidden">
                            {/* Management Actions (Only for Creator) */}
                            {userId && job.creator_id === userId && (
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setViewApplicantsJob(job);
                                            fetchApplicants(job.id);
                                        }}
                                        className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-900 transition-colors"
                                        title="View Applicants"
                                    >
                                        <Users className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleEditJob(job);
                                        }}
                                        className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-900 transition-colors"
                                        title="Edit Job"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDeleteJob(job.id);
                                        }}
                                        className="p-2.5 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                        title="Delete Job Post"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between items-start mb-5">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform duration-500">
                                        <Building2 className="w-7 h-7" />
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 pt-1">
                                        <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                                            {job.type}
                                        </span>
                                        {job.status === 'closed' && (
                                            <span className="bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                                                Expired
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-1.5 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{job.title}</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 font-bold mb-4 flex items-center gap-1.5">
                                    {job.company}
                                </p>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {job.location && (
                                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="truncate">{job.location}</span>
                                        </div>
                                    )}
                                    {job.salary_range && (
                                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="truncate">{job.salary_range}</span>
                                        </div>
                                    )}
                                    {job.deadline && (
                                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold col-span-2">
                                            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 w-full mt-auto">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openJobDetails(job);
                                    }}
                                    className="flex-[2] py-3.5 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black text-xs uppercase tracking-widest text-center hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:hover:text-white transition-all shadow-lg shadow-zinc-200 dark:shadow-none active:scale-[0.98]"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={(e) => handleShareJob(job, e)}
                                    className="flex-1 py-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all flex items-center justify-center active:scale-[0.98]"
                                    title="Share Opportunity"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Job Details Modal */}
            <Modal
                isOpen={!!selectedJob}
                onClose={closeJobDetails}
                title="Opportunity Details"
                size="lg"
                footer={selectedJob && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={closeJobDetails}
                            className="order-2 sm:order-1 flex-1 py-4 px-6 rounded-2xl font-black text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors uppercase tracking-widest text-xs"
                        >
                            Back to List
                        </button>
                        {selectedJob.status !== 'closed' && (
                            <div className="order-1 sm:order-2 flex-[2]">
                                {myApplications[selectedJob.id] ? (
                                    <button
                                        disabled
                                        className="w-full py-4 px-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-black flex items-center justify-center gap-2 cursor-default border border-emerald-100 dark:border-emerald-800/50 uppercase tracking-widest text-xs"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        {myApplications[selectedJob.id]}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleApply(selectedJob)}
                                        className="w-full py-4 px-8 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-200 dark:shadow-none uppercase tracking-widest text-xs"
                                    >
                                        <Globe className="w-5 h-5" />
                                        Submit Application
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            >
                {selectedJob && (
                    <div className="flex flex-col">
                        <div className="p-6 md:p-8 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800/50">
                            <div className="flex gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight mb-2">{selectedJob.title}</h2>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-zinc-500 dark:text-zinc-400 font-bold text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <Building2 className="w-4 h-4 text-emerald-500" />
                                            <span>{selectedJob.company}</span>
                                        </div>
                                        {selectedJob.location && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-emerald-500" />
                                                <span>{selectedJob.location}</span>
                                            </div>
                                        )}
                                        {selectedJob.salary_range && (
                                            <div className="flex items-center gap-1.5">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                <span>{selectedJob.salary_range}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <span className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                            {selectedJob.type}
                                        </span>
                                        {selectedJob.deadline && (
                                            <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                                Closes: {new Date(selectedJob.deadline).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-4">
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white">Job Description</h3>
                            <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap font-medium">
                                {selectedJob.description}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Applicants Modal (Org Only) */}
            <Modal
                isOpen={!!viewApplicantsJob}
                onClose={() => setViewApplicantsJob(null)}
                title="Management Panel"
                size="xl"
            >
                {viewApplicantsJob && (
                    <div className="flex flex-col min-h-[400px]">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-widest">Managing Applicants For</p>
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white">{viewApplicantsJob.title}</h2>
                        </div>

                        <div className="flex-1 bg-white dark:bg-zinc-900">
                            {loadingApplicants ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading talent pool...</p>
                                </div>
                            ) : applicants.length === 0 ? (
                                <div className="text-center py-20 px-6">
                                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
                                        <Users className="w-8 h-8 text-zinc-400" />
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 font-black text-lg">No Applications Found</p>
                                    <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">Share this job to attract more students!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {applicants.map((app) => (
                                        <div key={app.user_id} className="p-4 md:p-6 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 overflow-hidden border-2 border-white dark:border-zinc-900 shadow-sm group-hover:scale-105 transition-transform">
                                                    {app.profiles?.avatar_url ? (
                                                        <img src={app.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-black text-xl">
                                                            {app.profiles?.name?.[0] || '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors">{app.profiles?.name || 'Anonymous Student'}</h3>
                                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold">{app.profiles?.university || 'University Student'}</p>
                                                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="w-full md:w-auto pl-14 md:pl-0">
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => updateApplicantStatus(viewApplicantsJob.id, app.user_id, e.target.value)}
                                                    className={`
                                                        w-full md:w-40 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border-2 outline-none cursor-pointer transition-all appearance-none
                                                        ${app.status === 'applied' ? 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400' : ''}
                                                        ${app.status === 'interviewing' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400' : ''}
                                                        ${app.status === 'offer' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' : ''}
                                                        ${app.status === 'rejected' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400' : ''}
                                                    `}
                                                >
                                                    <option value="applied">Applied</option>
                                                    <option value="interviewing">Interviewing</option>
                                                    <option value="offer">Offer Sent</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
