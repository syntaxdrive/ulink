import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Job } from '../../types';
import { Loader2, Briefcase, Building2, Search, Plus, Globe, Trash2, Edit2, CheckCircle, XCircle, Users, MapPin, Calendar, DollarSign, Clock } from 'lucide-react';

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
        type: 'Internship' | 'Entry Level' | 'Full Time';
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

    const toggleJobStatus = async (jobId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'closed' : 'active';

        // Optimistic
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));

        const { error } = await supabase
            .from('jobs')
            .update({ status: newStatus })
            .eq('id', jobId);

        if (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
            fetchJobs(); // Revert
        }
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
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center sticky top-4 z-30">
                <div className="relative group flex-1 w-full md:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-md border border-stone-200/50 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 shadow-sm transition-all"
                        placeholder="Search jobs, internships, companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 px-1">
                    {/* Type Filter Pills */}
                    {['All', 'Internship', 'Entry Level', 'Full Time'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${filterType === type
                                ? 'bg-stone-900 text-white shadow-md'
                                : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200/50'
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
                                onChange={e => setNewJob({ ...newJob, type: e.target.value as 'Internship' | 'Entry Level' | 'Full Time' })}
                            >
                                <option>Internship</option>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJobs.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed border-stone-200">
                        <Briefcase className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                        <p className="text-stone-400 font-medium">No opportunities found matching your criteria.</p>
                    </div>
                ) : (
                    filteredJobs.map((job) => (
                        <div key={job.id} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all group flex flex-col justify-between h-full relative">
                            {/* Management Actions (Only for Creator) */}
                            {userId && job.creator_id === userId && (
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setViewApplicantsJob(job);
                                            fetchApplicants(job.id);
                                        }}
                                        className="p-2 bg-stone-100 text-stone-600 rounded-full hover:bg-stone-200 hover:text-stone-900 transition-colors"
                                        title="View Applicants"
                                    >
                                        <Users className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleEditJob(job);
                                        }}
                                        className="p-2 bg-stone-100 text-stone-600 rounded-full hover:bg-stone-200 hover:text-stone-900 transition-colors"
                                        title="Edit Job"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleJobStatus(job.id, job.status || 'active');
                                        }}
                                        className={`p-2 rounded-full transition-colors ${job.status === 'closed'
                                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                            : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                            }`}
                                        title={job.status === 'closed' ? 'Reopen Job' : 'Close Job'}
                                    >
                                        {job.status === 'closed' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDeleteJob(job.id);
                                        }}
                                        className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                                        title="Delete Job Post"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-600 mb-2 group-hover:scale-110 transition-transform duration-500">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        {job.status === 'closed' && (
                                            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                                                Closed
                                            </span>
                                        )}
                                        <span className="bg-stone-50 text-stone-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                                            {job.type}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-stone-900 mb-1 leading-snug">{job.title}</h3>
                                <p className="text-stone-500 font-medium mb-3 flex items-center gap-1">
                                    {job.company}
                                </p>

                                <div className="space-y-1.5 mb-4">
                                    {job.location && (
                                        <div className="flex items-center gap-2 text-stone-500 text-sm">
                                            <MapPin className="w-4 h-4 text-stone-400" />
                                            {job.location}
                                        </div>
                                    )}
                                    {job.salary_range && (
                                        <div className="flex items-center gap-2 text-stone-500 text-sm">
                                            <DollarSign className="w-4 h-4 text-stone-400" />
                                            {job.salary_range}
                                        </div>
                                    )}
                                    {job.deadline && (
                                        <div className="flex items-center gap-2 text-stone-500 text-sm">
                                            <Calendar className="w-4 h-4 text-stone-400" />
                                            Deadline: {new Date(job.deadline).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 mb-6">
                                    {job.description && (
                                        <>
                                            <p className="text-stone-600 text-sm line-clamp-3 leading-relaxed">
                                                {job.description}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    openJobDetails(job);
                                                }}
                                                className="text-emerald-600 text-xs font-bold hover:underline mt-1"
                                            >
                                                View Details
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Applied Status / Apply Button */}
                            {job.status === 'closed' ? (
                                <button
                                    disabled
                                    className="w-full py-3 rounded-xl bg-stone-100 text-stone-400 font-bold text-center cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Position Closed
                                </button>
                            ) : (
                                myApplications[job.id] ? (
                                    <div className="w-full py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-center flex items-center justify-center gap-2 cursor-default border border-emerald-100">
                                        <CheckCircle className="w-4 h-4" />
                                        {myApplications[job.id].charAt(0).toUpperCase() + myApplications[job.id].slice(1)}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleApply(job)}
                                        className="block w-full py-3 rounded-xl bg-stone-50 text-stone-900 font-bold text-center hover:bg-stone-900 hover:text-white transition-all group-hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Globe className="w-4 h-4" />
                                        Apply Now
                                    </button>
                                )
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Job Details Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="p-6 md:p-8 border-b border-stone-100 flex justify-between items-start bg-stone-50/50">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-emerald-600 shadow-sm">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-stone-900 leading-tight mb-2">{selectedJob.title}</h2>
                                    <div className="flex flex-col gap-1.5 text-stone-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            <span>{selectedJob.company}</span>
                                        </div>
                                        {selectedJob.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                <span>{selectedJob.location}</span>
                                            </div>
                                        )}
                                        {selectedJob.salary_range && (
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                <span>{selectedJob.salary_range}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="bg-stone-100 text-stone-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                                {selectedJob.type}
                                            </span>
                                            {selectedJob.deadline && (
                                                <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-md font-medium">
                                                    Deadline: {new Date(selectedJob.deadline).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={closeJobDetails}
                                className="p-2 bg-white text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-all border border-stone-200/50"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            <h3 className="text-lg font-bold text-stone-900 mb-3">About the Role</h3>
                            <p className="text-stone-600 leading-relaxed whitespace-pre-wrap text-[15px]">
                                {selectedJob.description}
                            </p>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-5 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
                            <button
                                onClick={closeJobDetails}
                                className="px-6 py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-200/50 transition-colors"
                            >
                                Close
                            </button>
                            {selectedJob.status !== 'closed' && (
                                myApplications[selectedJob.id] ? (
                                    <button
                                        disabled
                                        className="px-8 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center gap-2 cursor-default"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        {myApplications[selectedJob.id].charAt(0).toUpperCase() + myApplications[selectedJob.id].slice(1)}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleApply(selectedJob)}
                                        className="px-8 py-3 rounded-xl bg-stone-900 text-white font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-900/10 hover:shadow-emerald-500/30 transition-all flex items-center gap-2"
                                    >
                                        <Globe className="w-5 h-5" />
                                        Apply Now
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Applicants Modal (Org Only) */}
            {viewApplicantsJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-stone-900">Applicants</h2>
                                <p className="text-stone-500 text-sm font-medium">for {viewApplicantsJob.title}</p>
                            </div>
                            <button
                                onClick={() => setViewApplicantsJob(null)}
                                className="p-2 bg-white text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-all border border-stone-200/50"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-stone-50/30">
                            {loadingApplicants ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                </div>
                            ) : applicants.length === 0 ? (
                                <div className="text-center py-12 px-6">
                                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-stone-300" />
                                    </div>
                                    <p className="text-stone-500 font-medium">No applicants yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-stone-100">
                                    {applicants.map((app) => (
                                        <div key={app.user_id} className="p-4 md:p-6 bg-white hover:bg-stone-50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-stone-200 flex-shrink-0 overflow-hidden">
                                                    {app.profiles?.avatar_url ? (
                                                        <img src={app.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600 font-bold text-lg">
                                                            {app.profiles?.name?.[0] || '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-stone-900">{app.profiles?.name || 'Unknown User'}</h3>
                                                    <p className="text-stone-500 text-sm">{app.profiles?.headline || app.profiles?.university || 'No headline'}</p>
                                                    <p className="text-stone-400 text-xs mt-0.5">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 pl-[4rem] md:pl-0">
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => updateApplicantStatus(viewApplicantsJob.id, app.user_id, e.target.value)}
                                                    className={`
                                                        px-3 py-2 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer transition-all
                                                        ${app.status === 'applied' ? 'bg-stone-100 text-stone-600' : ''}
                                                        ${app.status === 'interviewing' ? 'bg-amber-100 text-amber-700' : ''}
                                                        ${app.status === 'offer' ? 'bg-emerald-100 text-emerald-700' : ''}
                                                        ${app.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                                                    `}
                                                >
                                                    <option value="applied">Applied</option>
                                                    <option value="interviewing">Interviewing</option>
                                                    <option value="offer">Offer Sent</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                                {/* <button className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors">
                                                    <MessageSquare className="w-5 h-5" />
                                                </button> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
