import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { type Profile, type Project, type Post, type Certificate } from '../../types';
import { Loader2, Mail, School, Save, Camera, Plus, X, Trash2, Github, Linkedin, Globe, MapPin, Briefcase, BadgeCheck, MessageCircle, Heart, Award, Upload, Share, Instagram, Twitter } from 'lucide-react';


function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [headline, setHeadline] = useState('');
    const [location, setLocation] = useState('');
    const [university, setUniversity] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [about, setAbout] = useState('');

    // Arrays
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');

    const [projects, setProjects] = useState<Project[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [newProject, setNewProject] = useState<Project>({ title: '', description: '', link: '' });
    const [newCertificate, setNewCertificate] = useState<Partial<Certificate>>({ title: '', issuing_org: '', issue_date: '' });
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showCertificateForm, setShowCertificateForm] = useState(false);

    // Socials
    const [website, setWebsite] = useState('');
    const [github, setGithub] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [instagram, setInstagram] = useState('');
    const [twitter, setTwitter] = useState('');

    // Background Image
    const [bgUrl, setBgUrl] = useState('');
    const [bgFile, setBgFile] = useState<File | null>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const certFileInputRef = useRef<HTMLInputElement>(null);
    const [certFile, setCertFile] = useState<File | null>(null);


    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Image must be less than 2MB');
                return;
            }
            setAvatarFile(file);
            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB');
                return;
            }
            setBgFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBgUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('File size must be less than 5MB');
                if (certFileInputRef.current) certFileInputRef.current.value = '';
                return;
            }
            setCertFile(file);
            setNewCertificate(prev => ({ ...prev, credential_url: '(File attached: ' + file.name + ')' }));
        }
    };

    const loadProfileData = (data: Profile) => {
        setProfile(data);
        setName(data.name || '');
        setHeadline(data.headline || '');
        setLocation(data.location || '');
        setUniversity(data.university || '');
        setAvatarUrl(data.avatar_url || '');
        setAbout(data.about || '');
        setSkills(data.skills || []);
        setProjects(data.projects || []);
        setCertificates(data.certificates || []);
        setWebsite(data.website || '');
        setGithub(data.github_url || '');
        setLinkedin(data.linkedin_url || '');
        setInstagram(data.instagram_url || '');
        setTwitter(data.twitter_url || '');
        setBgUrl(data.background_image_url || '');
    };

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Profile
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code === 'PGRST116') {
                // Fallback: Create profile if missing
                const { data: newProfile } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: user.email!,
                        name: user.user_metadata.name || user.email?.split('@')[0] || 'User',
                        role: 'student',
                        avatar_url: `https://ui-avatars.com/api/?name=${user.email}&background=random`
                    })
                    .select()
                    .single();

                if (newProfile) loadProfileData(newProfile);
            } else if (data) {
                loadProfileData(data);
            }

            // Fetch User Posts
            const { data: postsData } = await supabase
                .from('posts')
                .select(`
                    *,
                    likes (user_id),
                    comments (id)
                `)
                .eq('author_id', user.id)
                .order('created_at', { ascending: false });

            if (postsData) {
                const formattedPosts = postsData.map((post: any) => ({
                    ...post,
                    likes_count: post.likes ? post.likes.length : 0,
                    comments_count: post.comments ? post.comments.length : 0,
                    user_has_liked: false
                }));
                setUserPosts(formattedPosts);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleDeletePost = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
        setUserPosts(prev => prev.filter(p => p.id !== postId));
        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post.');
            fetchProfile();
        }
    };


    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!profile) return;

        setSaving(true);
        try {
            let finalAvatarUrl = avatarUrl;
            let finalBgUrl = bgUrl;

            // 0. Upload Background if Changed
            if (bgFile) {
                const fileExt = bgFile.name.split('.').pop();
                const fileName = `backgrounds/${profile.id}_${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(fileName, bgFile, { upsert: true });

                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage
                    .from('uploads')
                    .getPublicUrl(fileName);
                finalBgUrl = publicUrl;
            }

            // 1. Upload Avatar if Changed
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                // RLS requires folder structure: user_id/filename
                const fileName = `${profile.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, avatarFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                finalAvatarUrl = publicUrl;
            }

            const updates: any = {
                name,
                headline,
                location,
                avatar_url: finalAvatarUrl,
                background_image_url: finalBgUrl,
                about,
                skills,
                projects,
                certificates,
                website,
                github_url: github,
                linkedin_url: linkedin,
                instagram_url: instagram,
                twitter_url: twitter,
                updated_at: new Date().toISOString(),
            };

            if (profile.role === 'student') {
                updates.university = university;
            }

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', profile.id);

            if (error) throw error;

            setProfile({ ...profile, ...updates });
            setAvatarFile(null); // Reset file
            setBgFile(null);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const addProject = () => {
        if (newProject.title && newProject.description) {
            setProjects([...projects, newProject]);
            setNewProject({ title: '', description: '', link: '' });
            setShowProjectForm(false);
        }
    };

    const removeProject = (index: number) => {
        setProjects(projects.filter((_, i) => i !== index));
    };

    const addCertificate = async () => {
        if (newCertificate.title && newCertificate.issuing_org) {
            setSaving(true);
            let finalUrl = newCertificate.credential_url;

            if (certFile) {
                try {
                    const fileExt = certFile.name.split('.').pop();
                    const fileName = `certificates/${profile!.id}_${Date.now()}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from('uploads')
                        .upload(fileName, certFile);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('uploads')
                        .getPublicUrl(fileName);

                    finalUrl = publicUrl;
                } catch (err) {
                    console.error('Error uploading certificate:', err);
                    alert('Failed to upload certificate file');
                    setSaving(false);
                    return;
                }
            }

            const cert: Certificate = {
                id: `cert-${Date.now()}`,
                user_id: profile!.id,
                title: newCertificate.title,
                issuing_org: newCertificate.issuing_org,
                issue_date: newCertificate.issue_date,
                credential_url: finalUrl,
                credential_id: newCertificate.credential_id
            };
            setCertificates([...certificates, cert]);
            setNewCertificate({ title: '', issuing_org: '', issue_date: '', credential_url: '' });
            setCertFile(null);
            setShowCertificateForm(false);
            setSaving(false);
        }
    };


    const removeCertificate = (id: string) => {
        setCertificates(certificates.filter(c => c.id !== id));
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!profile) return null;
    const isStudent = profile.role === 'student';

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Edit Profile</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            // Use username if available, otherwise use ID
                            const profileIdentifier = profile?.username || profile?.id;
                            const publicUrl = `${window.location.origin}/app/profile/${profileIdentifier}`;
                            navigator.clipboard.writeText(publicUrl);
                            alert('Profile link copied to clipboard!');
                        }}
                        className="px-4 py-2.5 bg-white text-slate-600 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Share className="w-4 h-4" />
                        Share
                    </button>
                    <button
                        onClick={(e) => handleSave(e)}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-70 flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Personal Info & Skills */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Identity Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Background Image Area */}
                        <div className="relative h-32 bg-slate-100 group/bg cursor-pointer" onClick={() => bgInputRef.current?.click()}>
                            {bgUrl ? (
                                <img src={bgUrl} alt="Background" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10"></div>
                            )}
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/bg:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                        </div>
                        <input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={handleBgFileChange} />

                        {/* Avatar & Inputs Area */}
                        <div className="px-6 pb-6 relative">
                            {/* Avatar - Negative Margin to pull it up */}
                            <div className="flex flex-col items-center text-center -mt-16">
                                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden mb-4 relative group shadow-lg bg-white">
                                    <img
                                        src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                    <div onClick={handleAvatarClick} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                                <div className="w-full space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            {isStudent ? 'Full Name' : 'Company Name'}
                                            {profile?.is_verified && <BadgeCheck className="w-4 h-4 text-yellow-500 fill-yellow-100" />}
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value.replace(/\p{Extended_Pictographic}/gu, ''))}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                                            placeholder={isStudent ? "Your Name" : "Company Name"}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isStudent ? 'Headline' : 'Industry / Tagline'}</label>
                                        <input
                                            type="text"
                                            value={headline}
                                            onChange={(e) => setHeadline(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
                                            placeholder={isStudent ? "Software Engineer | Designer" : "FinTech | EdTech | Recruiting"}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
                                                placeholder="Lagos, Nigeria"
                                            />
                                        </div>
                                    </div>

                                    {isStudent && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">University</label>
                                            <div className="relative">
                                                <School className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={university}
                                                    onChange={(e) => setUniversity(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
                                                    placeholder="University Name"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact / Socials */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-500" />
                            Connect
                        </h3>
                        <div className="space-y-3">
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-400 cursor-not-allowed"
                                />
                            </div>
                            <div className="relative">
                                <Github className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="url"
                                    value={github}
                                    onChange={(e) => setGithub(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
                                    placeholder="GitHub URL"
                                />
                            </div>
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="url"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
                                    placeholder="LinkedIn URL"
                                />
                            </div>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
                                    placeholder="Portfolio Website"
                                />
                            </div>
                            <div className="relative">
                                <Instagram className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="url"
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
                                    placeholder="Instagram"
                                />
                            </div>
                            <div className="relative">
                                <Twitter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="url"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
                                    placeholder="X (Twitter)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-indigo-500" />
                            {isStudent ? 'Skills' : 'Specialties'}
                        </h3>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {skills.map(skill => (
                                <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium flex items-center gap-1 group">
                                    {skill}
                                    <button onClick={() => removeSkill(skill)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                                placeholder={isStudent ? "Add skill..." : "Add specialty..."}
                            />
                            <button
                                onClick={addSkill}
                                className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: About & Experience */}
                <div className="lg:col-span-2 space-y-6">

                    {/* About Section */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">{isStudent ? 'About Me' : 'About Us'}</h3>
                        <textarea
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                            placeholder={isStudent ? "Tell your story..." : "Describe your company mission..."}
                        />
                    </div>

                    {/* Projects Section */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">{isStudent ? 'Projects & Experience' : 'Company Highlights'}</h3>
                            <button
                                onClick={() => setShowProjectForm(true)}
                                className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> {isStudent ? "Add Project" : "Add Highlight"}
                            </button>
                        </div>

                        {showProjectForm && (
                            <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                                <input
                                    type="text"
                                    placeholder={isStudent ? "Project Title" : "Highlight Title"}
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                />
                                <textarea
                                    placeholder="Description"
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    className="w-full h-20 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
                                />
                                <input
                                    type="url"
                                    placeholder={isStudent ? "Project Link (Optional)" : "Highlight Link (Optional)"}
                                    value={newProject.link}
                                    onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowProjectForm(false)}
                                        className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addProject}
                                        className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800"
                                    >
                                        {isStudent ? 'Add Project' : 'Add Highlight'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            {projects.map((project, idx) => (
                                <div key={idx} className="group relative p-5 border border-slate-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg">{project.title}</h4>
                                            <p className="text-slate-600 text-sm mt-1">{project.description}</p>
                                            {project.link && (
                                                <a href={project.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 mt-3 hover:underline">
                                                    View {isStudent ? 'Project' : 'Details'} <Globe className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeProject(idx)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {projects.length === 0 && !showProjectForm && (
                                <div className="text-center py-10 text-slate-400 text-sm">
                                    {isStudent ? 'No projects added yet. Share your work!' : 'No highlights added yet.'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Certificates Section */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Certifications</h3>
                            <button
                                onClick={() => setShowCertificateForm(true)}
                                className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Certificate
                            </button>
                        </div>

                        {showCertificateForm && (
                            <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                                <input
                                    type="text"
                                    placeholder="Certificate Title (e.g. AWS Certified)"
                                    value={newCertificate.title}
                                    onChange={(e) => setNewCertificate({ ...newCertificate, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Issuing Organization (e.g. Amazon)"
                                    value={newCertificate.issuing_org}
                                    onChange={(e) => setNewCertificate({ ...newCertificate, issuing_org: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="date"
                                        placeholder="Issue Date"
                                        value={newCertificate.issue_date}
                                        onChange={(e) => setNewCertificate({ ...newCertificate, issue_date: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Credential ID (Optional)"
                                        value={newCertificate.credential_id}
                                        onChange={(e) => setNewCertificate({ ...newCertificate, credential_id: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <input
                                    type="url"
                                    placeholder="Credential URL (Optional)"
                                    value={newCertificate.credential_url}
                                    onChange={(e) => setNewCertificate({ ...newCertificate, credential_url: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                />

                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={certFileInputRef}
                                        className="hidden"
                                        accept="image/*,application/pdf"
                                        onChange={handleCertFileChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => certFileInputRef.current?.click()}
                                        className={`px-4 py-2 border rounded-lg text-sm flex items-center gap-2 transition-colors ${certFile ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <Upload className="w-4 h-4" />
                                        {certFile ? 'File Attached' : 'Upload Certificate (PDF/Image)'}
                                    </button>
                                    {certFile && (
                                        <button
                                            onClick={() => { setCertFile(null); setNewCertificate(prev => ({ ...prev, credential_url: '' })); if (certFileInputRef.current) certFileInputRef.current.value = ''; }}
                                            className="text-xs text-red-500 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowCertificateForm(false)}
                                        className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addCertificate}
                                        className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800"
                                    >
                                        Add Certificate
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {certificates.map((cert) => (
                                <div key={cert.id} className="group relative p-4 border border-slate-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/30 transition-all flex items-start gap-4">
                                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900">{cert.title}</h4>
                                        <p className="text-sm text-slate-600">{cert.issuing_org}</p>
                                        <div className="text-xs text-slate-400 mt-1 flex gap-2">
                                            {cert.issue_date && <span>Issued {new Date(cert.issue_date).toLocaleDateString()}</span>}
                                            {cert.credential_id && <span>• ID: {cert.credential_id}</span>}
                                        </div>
                                        {cert.credential_url && (
                                            <a href={cert.credential_url} target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs font-medium text-indigo-600 hover:underline">
                                                Show Credential
                                            </a>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeCertificate(cert.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {certificates.length === 0 && !showCertificateForm && (
                                <div className="text-center py-6 text-slate-400 text-sm">
                                    No certificates added yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* My Activity / Posts */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">My Activity</h3>
                        <div className="space-y-6">
                            {userPosts.length === 0 ? (
                                <p className="text-slate-500 text-sm">You haven't posted anything yet.</p>
                            ) : (
                                userPosts.map(post => (
                                    <div key={post.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-xs text-slate-400 font-medium">{formatTimeAgo(post.created_at)}</p>
                                            <button
                                                onClick={() => handleDeletePost(post.id)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                                                title="Delete Post"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-slate-800 text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                            <div className="flex items-center gap-1">
                                                <Heart className="w-3.5 h-3.5" />
                                                {post.likes_count}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                {post.comments_count}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
