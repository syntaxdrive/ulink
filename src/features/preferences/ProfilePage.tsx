import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { type Profile, type Project, type Certificate } from '../../types';
import {
    Loader2, Mail, School, Save, Camera, Plus, X, Trash2, Github, Linkedin,
    Globe, MapPin, Briefcase, BadgeCheck, Upload, Share, Instagram, Twitter,
    Facebook, Youtube, MessageCircle, FileText, Download, Eye
} from 'lucide-react';
import ImageCropper from '../../components/ImageCropper';
import ProfileCompletion from '../../components/ProfileCompletion';

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
    const [bgUrl, setBgUrl] = useState('');

    // Skills
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');

    // Projects & Certificates
    const [projects, setProjects] = useState<Project[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showCertificateForm, setShowCertificateForm] = useState(false);
    const [newProject, setNewProject] = useState<Project>({ title: '', description: '', link: '' });
    const [newCertificate, setNewCertificate] = useState<Partial<Certificate>>({
        title: '',
        issuing_org: '',
        issue_date: ''
    });

    // Social Links
    const [website, setWebsite] = useState('');
    const [github, setGithub] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [instagram, setInstagram] = useState('');
    const [twitter, setTwitter] = useState('');
    const [facebook, setFacebook] = useState('');
    const [youtube, setYoutube] = useState('');
    const [tiktok, setTiktok] = useState('');
    const [whatsapp, setWhatsapp] = useState('');

    // Resume
    const [resumeUrl, setResumeUrl] = useState('');
    const [resumeUploading, setResumeUploading] = useState(false);

    // Image Cropping
    const [showAvatarCropper, setShowAvatarCropper] = useState(false);
    const [showBgCropper, setShowBgCropper] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState('');

    // File refs
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);
    const resumeInputRef = useRef<HTMLInputElement>(null);
    const certPdfInputRef = useRef<HTMLInputElement>(null);

    // Certificate PDF state
    const [uploadingCertId, setUploadingCertId] = useState<string | null>(null);

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
        setWebsite(data.website || data.website_url || '');
        setGithub(data.github_url || '');
        setLinkedin(data.linkedin_url || '');
        setInstagram(data.instagram_url || '');
        setTwitter(data.twitter_url || '');
        setFacebook(data.facebook_url || '');
        setBgUrl(data.background_image_url || '');
        setResumeUrl(data.resume_url || '');
        // New social links
        setYoutube((data as any).youtube_url || '');
        setTiktok((data as any).tiktok_url || '');
        setWhatsapp((data as any).whatsapp_url || '');
    };

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code === 'PGRST116') {
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
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Image Cropping Handlers
    const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('Image must be less than 10MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImageUrl(reader.result as string);
                setShowAvatarCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBgFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('Image must be less than 10MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImageUrl(reader.result as string);
                setShowBgCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarCropComplete = async (croppedBlob: Blob) => {
        if (!profile) return;

        try {
            setSaving(true);
            const fileName = `${profile.id}/avatar_${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, croppedBlob, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            setAvatarUrl(publicUrl);

            // Save to database
            await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', profile.id);

            setShowAvatarCropper(false);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload avatar');
        } finally {
            setSaving(false);
        }
    };

    const handleBgCropComplete = async (croppedBlob: Blob) => {
        if (!profile) return;

        try {
            setSaving(true);
            const fileName = `backgrounds/${profile.id}_${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(fileName, croppedBlob, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(fileName);

            setBgUrl(publicUrl);

            // Save to database
            await supabase
                .from('profiles')
                .update({ background_image_url: publicUrl })
                .eq('id', profile.id);

            setShowBgCropper(false);
        } catch (error) {
            console.error('Error uploading background:', error);
            alert('Failed to upload background image');
        } finally {
            setSaving(false);
        }
    };

    // Resume Upload Handler
    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('Resume must be less than 10MB');
            return;
        }

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        try {
            setResumeUploading(true);
            const fileName = `${profile.id}/resume_${Date.now()}.pdf`;
            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('resumes')
                .getPublicUrl(fileName);

            setResumeUrl(publicUrl);

            // Save to database
            await supabase
                .from('profiles')
                .update({ resume_url: publicUrl })
                .eq('id', profile.id);

            alert('Resume uploaded successfully!');
        } catch (error) {
            console.error('Error uploading resume:', error);
            alert('Failed to upload resume');
        } finally {
            setResumeUploading(false);
        }
    };

    // Certificate PDF Upload
    const handleCertificatePdfUpload = async (certId: string, file: File) => {
        if (!profile) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('Certificate must be less than 10MB');
            return;
        }

        try {
            setUploadingCertId(certId);
            const fileName = `${profile.id}/cert_${certId}_${Date.now()}.pdf`;
            const { error: uploadError } = await supabase.storage
                .from('certificates')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('certificates')
                .getPublicUrl(fileName);

            // Update certificate in array
            setCertificates(prev => prev.map(cert =>
                cert.id === certId
                    ? { ...cert, certificate_pdf_url: publicUrl }
                    : cert
            ));

        } catch (error) {
            console.error('Error uploading certificate:', error);
            alert('Failed to upload certificate PDF');
        } finally {
            setUploadingCertId(null);
        }
    };

    const handleSave = async () => {
        if (!profile) return;

        setSaving(true);
        try {
            const updates: any = {
                name,
                headline,
                location,
                avatar_url: avatarUrl,
                background_image_url: bgUrl,
                about,
                skills,
                projects,
                certificates,
                website_url: website,
                github_url: github,
                linkedin_url: linkedin,
                instagram_url: instagram,
                twitter_url: twitter,
                facebook_url: facebook,
                resume_url: resumeUrl,
                youtube_url: youtube,
                tiktok_url: tiktok,
                whatsapp_url: whatsapp,
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
            alert('Profile updated successfully!');

            // Award profile completion bonus if applicable
            await supabase.rpc('award_profile_completion_bonus', { p_user_id: profile.id });
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    // Skills Management
    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    // Projects Management
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

    // Certificates Management
    const addCertificate = () => {
        if (newCertificate.title && newCertificate.issuing_org) {
            const cert: Certificate = {
                id: `cert-${Date.now()}`,
                user_id: profile!.id,
                title: newCertificate.title,
                issuing_org: newCertificate.issuing_org,
                issue_date: newCertificate.issue_date,
                credential_url: newCertificate.credential_url,
                credential_id: newCertificate.credential_id
            };
            setCertificates([...certificates, cert]);
            setNewCertificate({ title: '', issuing_org: '', issue_date: '' });
            setShowCertificateForm(false);
        }
    };

    const removeCertificate = (id: string) => {
        setCertificates(certificates.filter(c => c.id !== id));
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!profile) return null;
    const isStudent = profile.role === 'student';

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-stone-900 dark:text-zinc-100">Edit Profile</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const profileIdentifier = profile?.username || profile?.id;
                            const publicUrl = `${window.location.origin}/app/profile/${profileIdentifier}`;
                            navigator.clipboard.writeText(publicUrl);
                            alert('Profile link copied!');
                        }}
                        className="px-4 py-2.5 bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 font-medium rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2"
                    >
                        <Share className="w-4 h-4" />
                        Share
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg disabled:opacity-70 flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Completion */}
                    <ProfileCompletion profile={profile} />

                    {/* Profile Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
                        {/* Background Image */}
                        <div
                            className="relative h-32 bg-gradient-to-br from-emerald-500 to-teal-600 group cursor-pointer"
                            onClick={() => bgInputRef.current?.click()}
                        >
                            {bgUrl && (
                                <img src={bgUrl} alt="Background" className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={bgInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleBgFileSelect}
                        />

                        {/* Avatar & Info */}
                        <div className="px-6 pb-6 relative">
                            <div className="flex flex-col items-center text-center -mt-16">
                                {/* Avatar */}
                                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden mb-4 relative group shadow-lg bg-white">
                                    <img
                                        src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                    <div
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarFileSelect}
                                />

                                {/* Form Fields */}
                                <div className="w-full space-y-3">
                                    <div>
                                        <label className="text-xs font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 justify-center">
                                            {isStudent ? 'Full Name' : 'Company Name'}
                                            {profile?.gold_verified && <BadgeCheck className="w-4 h-4 text-yellow-500 fill-yellow-50" />}
                                            {profile?.is_verified && !profile?.gold_verified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" />}
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-stone-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 mt-1"
                                            placeholder={isStudent ? "Your Name" : "Company Name"}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">
                                            {isStudent ? 'Headline' : 'Industry'}
                                        </label>
                                        <input
                                            type="text"
                                            value={headline}
                                            onChange={(e) => setHeadline(e.target.value)}
                                            className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm text-stone-600 dark:text-zinc-400 focus:outline-none focus:border-emerald-500 mt-1"
                                            placeholder={isStudent ? "Software Engineer | Designer" : "FinTech | EdTech"}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">Location</label>
                                        <div className="relative mt-1">
                                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm text-stone-600 dark:text-zinc-400 focus:outline-none focus:border-emerald-500"
                                                placeholder="Lagos, Nigeria"
                                            />
                                        </div>
                                    </div>

                                    {isStudent && (
                                        <div>
                                            <label className="text-xs font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">University</label>
                                            <div className="relative mt-1">
                                                <School className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                                <input
                                                    type="text"
                                                    value={university}
                                                    onChange={(e) => setUniversity(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm text-stone-600 dark:text-zinc-400 focus:outline-none focus:border-emerald-500"
                                                    placeholder="University Name"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800">
                        <h3 className="text-lg font-semibold text-stone-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-emerald-600" />
                            Social Links
                        </h3>
                        <div className="space-y-3">
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-100 dark:border-zinc-800 rounded-lg text-sm text-stone-400 dark:text-zinc-600 cursor-not-allowed"
                                />
                            </div>
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                <input
                                    type="url"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm text-stone-600 dark:text-zinc-400 focus:outline-none focus:border-emerald-500"
                                    placeholder="LinkedIn URL"
                                />
                            </div>
                            <div className="relative">
                                <Github className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                <input
                                    type="url"
                                    value={github}
                                    onChange={(e) => setGithub(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm text-stone-600 dark:text-zinc-400 focus:outline-none focus:border-emerald-500"
                                    placeholder="GitHub URL"
                                />
                            </div>
                            <div className="relative">
                                <Twitter className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                <input
                                    type="url"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm text-stone-600 dark:text-zinc-400 focus:outline-none focus:border-emerald-500"
                                    placeholder="X (Twitter) URL"
                                />
                            </div>
                            <div className="relative">
                                <Instagram className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                <input
                                    type="url"
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm text-stone-600 dark:text-zinc-400 focus:outline-none focus:border-emerald-500"
                                    placeholder="Instagram URL"
                                />
                            </div>
                            <div className="relative">
                                <Facebook className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                <input
                                    type="url"
                                    value={facebook}
                                    onChange={(e) => setFacebook(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm text-stone-600 dark:text-zinc-400 focus:outline-none focus:border-emerald-500"
                                    placeholder="Facebook URL"
                                />
                            </div>
                            <div className="relative">
                                <Youtube className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                <input
                                    type="url"
                                    value={youtube}
                                    onChange={(e) => setYoutube(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm text-stone-600 dark:text-zinc-400 focus:outline-none focus:border-emerald-500"
                                    placeholder="YouTube URL"
                                />
                            </div>
                            <div className="relative">
                                <MessageCircle className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                <input
                                    type="url"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm text-stone-600 dark:text-zinc-400 focus:outline-none focus:border-emerald-500"
                                    placeholder="WhatsApp URL"
                                />
                            </div>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                <input
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm text-stone-600 dark:text-zinc-400 focus:outline-none focus:border-emerald-500"
                                    placeholder="Portfolio Website"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800">
                        <h3 className="text-lg font-semibold text-stone-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-emerald-600" />
                            {isStudent ? 'Skills' : 'Specialties'}
                        </h3>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {skills.map(skill => (
                                <span key={skill} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium flex items-center gap-1">
                                    {skill}
                                    <button onClick={() => removeSkill(skill)} className="hover:text-red-500">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                className="flex-1 px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                placeholder="Add skill..."
                            />
                            <button
                                onClick={addSkill}
                                className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-stone-200 dark:border-zinc-800">
                        <h3 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-4">
                            {isStudent ? 'About Me' : 'About Us'}
                        </h3>
                        <textarea
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                            className="w-full h-32 p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-600 dark:text-zinc-400 focus:outline-none focus:border-emerald-500 resize-none"
                            placeholder={isStudent ? "Tell your story..." : "Describe your company mission..."}
                        />
                    </div>

                    {/* Resume Upload */}
                    {isStudent && (
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-stone-200 dark:border-zinc-800">
                            <h3 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-emerald-600" />
                                Resume
                            </h3>

                            {resumeUrl ? (
                                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                                        <div>
                                            <p className="font-medium text-stone-900 dark:text-zinc-100">Resume.pdf</p>
                                            <p className="text-xs text-stone-500 dark:text-zinc-500">Uploaded</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={resumeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                                        >
                                            <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                                        </a>
                                        <a
                                            href={resumeUrl}
                                            download
                                            className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                                        >
                                            <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                                        </a>
                                        <button
                                            onClick={() => resumeInputRef.current?.click()}
                                            className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                                        >
                                            <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => resumeInputRef.current?.click()}
                                    disabled={resumeUploading}
                                    className="w-full p-6 border-2 border-dashed border-stone-300 dark:border-zinc-700 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-600 transition-colors flex flex-col items-center gap-3"
                                >
                                    {resumeUploading ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-stone-400 dark:text-zinc-600" />
                                            <div className="text-center">
                                                <p className="font-medium text-stone-900 dark:text-zinc-100">Upload Resume</p>
                                                <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">PDF only, max 5MB</p>
                                            </div>
                                        </>
                                    )}
                                </button>
                            )}
                            <input
                                type="file"
                                ref={resumeInputRef}
                                className="hidden"
                                accept="application/pdf"
                                onChange={handleResumeUpload}
                            />
                        </div>
                    )}

                    {/* Projects */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-stone-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
                                {isStudent ? 'Projects & Experience' : 'Company Highlights'}
                            </h3>
                            <button
                                onClick={() => setShowProjectForm(true)}
                                className="text-sm text-emerald-600 dark:text-emerald-500 font-medium hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Project
                            </button>
                        </div>

                        {showProjectForm && (
                            <div className="mb-8 p-6 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 space-y-4">
                                <input
                                    type="text"
                                    placeholder="Project Title"
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                />
                                <textarea
                                    placeholder="Description"
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    className="w-full h-20 px-4 py-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500 resize-none"
                                />
                                <input
                                    type="url"
                                    placeholder="Project Link (Optional)"
                                    value={newProject.link}
                                    onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowProjectForm(false)}
                                        className="px-4 py-2 text-sm text-stone-500 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addProject}
                                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
                                    >
                                        Add Project
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            {projects.map((project, idx) => (
                                <div key={idx} className="group relative p-5 border border-stone-100 dark:border-zinc-800 rounded-xl hover:border-emerald-100 dark:hover:border-emerald-900 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-stone-900 dark:text-zinc-100 text-lg">{project.title}</h4>
                                            <p className="text-stone-600 dark:text-zinc-400 text-sm mt-1">{project.description}</p>
                                            {project.link && (
                                                <a href={project.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-500 mt-3 hover:underline">
                                                    View Project <Globe className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeProject(idx)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-stone-400 dark:text-zinc-600 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {projects.length === 0 && !showProjectForm && (
                                <div className="text-center py-10 text-stone-400 dark:text-zinc-600 text-sm">
                                    No projects added yet. Share your work!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Certificates */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-stone-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-stone-900 dark:text-zinc-100">Certifications</h3>
                            <button
                                onClick={() => setShowCertificateForm(true)}
                                className="text-sm text-emerald-600 dark:text-emerald-500 font-medium hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Certificate
                            </button>
                        </div>

                        {showCertificateForm && (
                            <div className="mb-8 p-6 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 space-y-4">
                                <input
                                    type="text"
                                    placeholder="Certificate Title"
                                    value={newCertificate.title}
                                    onChange={(e) => setNewCertificate({ ...newCertificate, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Issuing Organization"
                                    value={newCertificate.issuing_org}
                                    onChange={(e) => setNewCertificate({ ...newCertificate, issuing_org: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="date"
                                        value={newCertificate.issue_date}
                                        onChange={(e) => setNewCertificate({ ...newCertificate, issue_date: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Credential ID"
                                        value={newCertificate.credential_id}
                                        onChange={(e) => setNewCertificate({ ...newCertificate, credential_id: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <input
                                    type="url"
                                    placeholder="Credential URL (Optional)"
                                    value={newCertificate.credential_url}
                                    onChange={(e) => setNewCertificate({ ...newCertificate, credential_url: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowCertificateForm(false)}
                                        className="px-4 py-2 text-sm text-stone-500 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addCertificate}
                                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
                                    >
                                        Add Certificate
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {certificates.map((cert) => (
                                <div key={cert.id} className="group relative p-4 border border-stone-100 dark:border-zinc-800 rounded-xl hover:border-emerald-100 dark:hover:border-emerald-900 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                            <BadgeCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-stone-900 dark:text-zinc-100">{cert.title}</h4>
                                            <p className="text-sm text-stone-600 dark:text-zinc-400">{cert.issuing_org}</p>
                                            {cert.issue_date && (
                                                <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">
                                                    Issued: {new Date(cert.issue_date).toLocaleDateString()}
                                                </p>
                                            )}
                                            {cert.credential_url && (
                                                <a
                                                    href={cert.credential_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-emerald-600 dark:text-emerald-500 hover:underline mt-2 inline-block"
                                                >
                                                    View Credential
                                                </a>
                                            )}

                                            {/* Certificate PDF Upload */}
                                            <div className="mt-3">
                                                {cert.certificate_pdf_url ? (
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={cert.certificate_pdf_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-emerald-600 dark:text-emerald-500 hover:underline flex items-center gap-1"
                                                        >
                                                            <FileText className="w-3 h-3" />
                                                            View Certificate PDF
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.accept = 'application/pdf,image/*';
                                                            input.onchange = (e) => {
                                                                const file = (e.target as HTMLInputElement).files?.[0];
                                                                if (file) handleCertificatePdfUpload(cert.id, file);
                                                            };
                                                            input.click();
                                                        }}
                                                        disabled={uploadingCertId === cert.id}
                                                        className="text-xs text-stone-500 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-500 flex items-center gap-1"
                                                    >
                                                        {uploadingCertId === cert.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Upload className="w-3 h-3" />
                                                        )}
                                                        Upload Certificate PDF
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeCertificate(cert.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-stone-400 dark:text-zinc-600 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {certificates.length === 0 && !showCertificateForm && (
                                <div className="text-center py-10 text-stone-400 dark:text-zinc-600 text-sm">
                                    No certificates added yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Croppers */}
            {showAvatarCropper && (
                <ImageCropper
                    imageUrl={tempImageUrl}
                    onCropComplete={handleAvatarCropComplete}
                    onCancel={() => setShowAvatarCropper(false)}
                    aspectRatio={1}
                />
            )}

            {showBgCropper && (
                <ImageCropper
                    imageUrl={tempImageUrl}
                    onCropComplete={handleBgCropComplete}
                    onCancel={() => setShowBgCropper(false)}
                    aspectRatio={16 / 9}
                />
            )}
        </div>
    );
}
