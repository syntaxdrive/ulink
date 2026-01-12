import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Job } from '../../types';
import { Loader2, Briefcase, Building2, Search, Plus, Globe, Trash2 } from 'lucide-react';

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<'student' | 'org' | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userCompany, setUserCompany] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handleDeleteJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) return;

        const { error } = await supabase.from('jobs').delete().eq('id', jobId);
        if (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete job.');
        } else {
            setJobs(prev => prev.filter(j => j.id !== jobId));
        }
    };

    // New Job Form State
    const [showPostForm, setShowPostForm] = useState(false);
    const [newJob, setNewJob] = useState({
        title: '',
        company: '',
        type: 'Internship',
        description: '',
        application_link: ''
    });

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('All');





    useEffect(() => {
        checkUserRole();
        fetchJobs();

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
    }, []);

    const checkUserRole = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
            const { data } = await supabase.from('profiles').select('role, name').eq('id', user.id).single();
            if (data) {
                setUserRole(data.role);
                if (data.role === 'org') {
                    setUserCompany(data.name || '');
                    setNewJob(prev => ({ ...prev, company: data.name || '' }));
                }
            }
        }
    };



    const fetchJobs = async () => {
        const { data } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setJobs(data);
        setLoading(false);
    };

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPosting(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { error } = await supabase.from('jobs').insert({
                ...newJob,
                creator_id: user.id
            });
            if (!error) {
                setShowPostForm(false);
                setNewJob({
                    title: '',
                    company: userCompany,
                    type: 'Internship',
                    description: '',
                    application_link: ''
                });
            }
        }
        setIsPosting(false);
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (job.description && job.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = filterType === 'All' || job.type === filterType;

        return matchesSearch && matchesType;
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
            {/* Header with Search and Actions */}
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
                    <button
                        onClick={() => setShowPostForm(!showPostForm)}
                        className="hidden md:flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all shrink-0"
                    >
                        {showPostForm ? 'Cancel' : <><Plus className="w-5 h-5" /> Post Job</>}
                    </button>
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
                        <Briefcase className="w-6 h-6 text-emerald-600" />
                        Post a New Opportunity
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
                                onChange={e => setNewJob({ ...newJob, type: e.target.value })}
                            >
                                <option>Internship</option>
                                <option>Entry Level</option>
                                <option>Full Time</option>
                            </select>
                            <input
                                placeholder="Application Link (http://...)"
                                className="w-full bg-white rounded-xl px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                value={newJob.application_link}
                                onChange={e => setNewJob({ ...newJob, application_link: e.target.value })}
                            />
                        </div>
                        <textarea
                            placeholder="Description"
                            rows={4}
                            className="w-full bg-white rounded-xl px-4 py-3 border border-stone-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                            value={newJob.description}
                            onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                        />
                        <button
                            type="submit"
                            disabled={isPosting}
                            className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-all disabled:opacity-50"
                        >
                            {isPosting ? 'Posting...' : 'Create Job Post'}
                        </button>
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
                            {/* Delete Button (Only for Creator) */}
                            {userId && job.creator_id === userId && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDeleteJob(job.id);
                                    }}
                                    className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                                    title="Delete Job Post"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}

                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-600 mb-2 group-hover:scale-110 transition-transform duration-500">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <span className="bg-stone-50 text-stone-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                                        {job.type}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-stone-900 mb-1 leading-snug">{job.title}</h3>
                                <p className="text-stone-500 font-medium mb-4 flex items-center gap-1">
                                    {job.company}
                                </p>

                                <div className="space-y-2 mb-6">
                                    {job.description && (
                                        <p className="text-stone-600 text-sm line-clamp-3 leading-relaxed">
                                            {job.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <a
                                href={job.application_link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 rounded-xl bg-stone-50 text-stone-900 font-bold text-center hover:bg-stone-900 hover:text-white transition-all group-hover:shadow-lg flex items-center justify-center gap-2"
                            >
                                <Globe className="w-4 h-4" />
                                Apply Now
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
