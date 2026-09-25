import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  ShieldCheck,
  Radio,
  Video,
  Users,
  MessageCircle,
  Share2,
  CheckCircle2,
  Play,
  Pause,
  Heart,
  QrCode,
  ArrowRight,
  ChevronDown,
  HelpCircle,
  Bug,
  Smartphone,
  Lock,
  ExternalLink,
  Shield,
  Headphones,
  FileText,
  BookOpen,
  Volume2,
  FolderDown,
  Flame,
  Layers,
  Send,
} from 'lucide-react';
import { SEO } from '../../components/SEO/SEO';

// Clean, solid gold verification seal (Matches mobile VerifiedBadge)
function GoldVerifiedBadge({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block flex-shrink-0 align-middle">
      <defs>
        <linearGradient id="goldSeal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.5L14.4 3.7L17.6 3.4L18.9 6.3L21.8 7.7L21.7 10.9L23.4 13.6L21.8 16.3L21.7 19.5L18.9 20.9L17.6 23.8L14.4 23.5L12 25.7L9.6 23.5L6.4 23.8L5.1 20.9L2.3 19.5L2.2 16.3L0.6 13.6L2.2 10.9L2.3 7.7L5.1 6.3L6.4 3.4L9.6 3.7L12 1.5Z"
        fill="url(#goldSeal)"
        transform="scale(0.9) translate(1.3, -0.5)"
      />
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" strokeDasharray="1.5,1.5" />
      <path d="M8.5 12L10.8 14.3L15.5 9.5" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'podcasts' | 'communities' | 'messages'>('feed');
  const [isPlayingPodcast, setIsPlayingPodcast] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [safetyTab, setSafetyTab] = useState<'chrome' | 'samsung' | 'ios'>('chrome');

  const APK_DOWNLOAD_URL = "https://expo.dev/artifacts/eas/QVkvgQZ3EjS7z-a5sYARVQns-Ui0YjusLZNgqyZo67Y.apk";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDownload = () => {
    setShowSafetyModal(true);
    const link = document.createElement('a');
    link.href = APK_DOWNLOAD_URL;
    link.download = 'UniLink-Student-Network.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <SEO
        title="UniLink — The Campus Student Network"
        description="The social network for university students in Nigeria. Stream student podcasts, watch campus reels, join verified departmental circles, and connect."
        keywords={['UniLink', 'Nigerian Universities', 'Student Network', 'Campus Podcasts', 'UniLink APK', 'Unilag', 'UI', 'OAU', 'UNN']}
      />

      <div className="min-h-screen bg-white dark:bg-[#0A0A0C] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-600 selection:text-white">
        
        {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
            scrolled
              ? 'bg-white/95 dark:bg-[#0A0A0C]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 py-3.5 shadow-sm'
              : 'bg-white/80 dark:bg-transparent py-4 border-b border-slate-100 dark:border-slate-900'
          }`}
        >
          <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/icon-512.png"
                alt="UniLink"
                className="w-9 h-9 rounded-xl object-contain shadow-xs"
              />
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                UniLink
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Overview</a>
              <a href="#podcasts" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Podcasts</a>
              <a href="#reels" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Reels</a>
              <a href="#communities" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Lounges</a>
              <a href="#safety-sharing" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Sharing</a>
              <a href="#download" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Download</a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/app"
                className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 px-3 py-2 transition-colors hidden sm:block"
              >
                Web App
              </Link>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Get App</span>
              </button>
            </div>
          </div>
        </nav>

        {/* ── HERO SECTION ────────────────────────────────────────────────── */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Hero Text */}
              <div className="lg:col-span-6 text-center lg:text-left">
                
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-6">
                  <GoldVerifiedBadge size={14} />
                  <span>Campus Network for Nigerian Students</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white mb-5">
                  Your campus network, all in one place.
                </h1>

                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
                  Connect with verified students from your university. Stream campus podcasts, share departmental updates, watch reels, and collaborate in study circles.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 mb-8">
                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto h-13 px-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Android APK (v1.0.0)</span>
                  </button>

                  <Link
                    to="/app"
                    className="w-full sm:w-auto h-13 px-6 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Launch Web App</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </div>

                {/* Minimal trust items */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Free
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Student Accounts
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-emerald-600" /> Offline Audio Podcasts
                  </span>
                </div>
              </div>

              {/* Right Column: Clean Phone Product Frame */}
              <div className="lg:col-span-6 flex flex-col items-center">
                
                {/* Clean Tab Switcher */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-4 max-w-sm w-full border border-slate-200 dark:border-slate-800">
                  {[
                    { id: 'feed', label: 'Feed', icon: Video },
                    { id: 'podcasts', label: 'Podcasts', icon: Radio },
                    { id: 'communities', label: 'Lounges', icon: Users },
                    { id: 'messages', label: 'Chats', icon: MessageCircle },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Clean Product Device Mockup */}
                <div className="w-full max-w-[340px] h-[580px] bg-slate-900 rounded-[36px] p-2.5 shadow-xl border border-slate-800 relative overflow-hidden">
                  
                  {/* Speaker slot */}
                  <div className="w-20 h-4 bg-black rounded-full mx-auto mb-2" />

                  {/* Screen Content */}
                  <div className="w-full h-[calc(100%-24px)] bg-white dark:bg-[#111318] rounded-[28px] overflow-hidden flex flex-col text-slate-900 dark:text-white select-none border border-slate-200/50 dark:border-slate-800">
                    
                    {/* App Header */}
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <img src="/icon-512.png" alt="UniLink" className="w-5 h-5 rounded-md object-contain" />
                        <span className="font-extrabold text-base tracking-tight">UniLink</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        UI Campus
                      </span>
                    </div>

                    {/* App Body */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      
                      {/* Feed Tab */}
                      {activeTab === 'feed' && (
                        <div className="space-y-2.5">
                          <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                                D
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold text-xs">Daniel Ayegbeni</span>
                                  <GoldVerifiedBadge size={13} />
                                </div>
                                <span className="text-[10px] text-slate-400">Computer Science</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-200 mb-2 leading-relaxed">
                              Who is joining the tech team hackathon this weekend? Working on campus study tools 💻
                            </p>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800 text-slate-400 text-xs">
                              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                                <Heart className="w-3.5 h-3.5" /> 142
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3.5 h-3.5" /> 28
                              </span>
                              <Share2 className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          <div className="rounded-xl overflow-hidden bg-slate-800 p-3 text-white">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-semibold text-emerald-400">Campus Video</span>
                              <span className="text-[10px] text-slate-400">0:45</span>
                            </div>
                            <p className="text-xs font-semibold">Surviving 8 AM Lectures at UI 😂</p>
                            <span className="text-[10px] text-slate-400">@campusgist</span>
                          </div>
                        </div>
                      )}

                      {/* Podcasts Tab */}
                      {activeTab === 'podcasts' && (
                        <div className="space-y-2.5">
                          <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800">
                            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Now Playing</span>
                            <h4 className="font-bold text-xs mt-1 mb-0.5">Healthy Living on a Student Budget</h4>
                            <p className="text-[10px] text-slate-400 mb-3">Dr. Tolu • Episode 04</p>

                            {/* Minimal Waveform */}
                            <div className="flex items-center justify-between gap-1 h-6 my-2 px-1">
                              {[35, 60, 40, 80, 50, 90, 70, 45, 85, 60, 40, 75, 90, 55, 65, 40, 80, 50, 30].map((h, i) => (
                                <div
                                  key={i}
                                  className={`w-1 rounded-full ${i < 10 ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                  style={{ height: `${h}%` }}
                                />
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                              <span>04:12 / 12:30</span>
                              <button
                                onClick={() => setIsPlayingPodcast(!isPlayingPodcast)}
                                className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white cursor-pointer"
                              >
                                {isPlayingPodcast ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                              </button>
                            </div>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Recent Episodes</span>
                            <div className="flex justify-between items-center py-1">
                              <div>
                                <p className="font-semibold text-[11px]">Semester Exam Strategy</p>
                                <p className="text-[9px] text-slate-400">Campus Banter • 15 min</p>
                              </div>
                              <Play className="w-3 h-3 text-emerald-600" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lounges Tab */}
                      {activeTab === 'communities' && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">Verified Department Lounges</span>
                          {[
                            { name: 'Computer Science Hub', members: '1,420 students' },
                            { name: 'Law Society Circle', members: '890 students' },
                            { name: 'Medical & Health Sciences', members: '2,100 students' },
                            { name: 'Engineering & Tech', members: '1,750 students' },
                          ].map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-xs">
                              <div>
                                <p className="font-semibold text-xs">{c.name}</p>
                                <p className="text-[10px] text-slate-400">{c.members}</p>
                              </div>
                              <span className="text-[10px] font-semibold text-emerald-600 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950">
                                Join
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Chats Tab */}
                      {activeTab === 'messages' && (
                        <div className="space-y-2 text-xs">
                          <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl rounded-tl-none max-w-[80%]">
                            Listen to this campus podcast before our lecture! 🎧
                          </div>
                          <div className="ml-auto bg-emerald-600 text-white p-2.5 rounded-xl rounded-tr-none max-w-[85%] space-y-1">
                            <p className="text-[10px] text-emerald-200">https://unilink.ng/post/104</p>
                            <p className="font-semibold text-[11px]">Semester Exam Strategy & Tips</p>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ── CORE FEATURES (Clean Grid) ─────────────────────────────────── */}
        <section id="features" className="py-20 border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            
            <div className="max-w-2xl mb-14">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                Built specifically for university life in Nigeria.
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                Everything you need to collaborate, study, and stay updated with your campus.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Radio,
                  title: 'Student Podcasts & Audio',
                  desc: 'Stream audio shows and student discussions. Download episodes for offline listening without consuming mobile data.',
                },
                {
                  icon: Video,
                  title: 'Campus Reels & Videos',
                  desc: 'Discover departmental projects, student humor, event recaps, and creative shorts in a dedicated video stream.',
                },
                {
                  icon: Users,
                  title: 'Department Lounges',
                  desc: 'Private discussion circles for your department and faculty. Share past questions, lecture notes, and announcements.',
                },
                {
                  icon: Share2,
                  title: 'Direct Link Previews',
                  desc: 'Share links directly to WhatsApp, X, and Telegram with rich, clickable preview cards that open inside the app.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Gold Starburst Badges',
                  desc: 'Unique gold seal emblems awarded to verified student leaders, campus organizations, and course reps.',
                },
                {
                  icon: Bug,
                  title: 'In-App Issue Reporting',
                  desc: 'Report bugs, technical glitches, or safety concerns directly inside the app with automatic device diagnostics.',
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-emerald-600 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ── 🎧 FEATURE DEEP-DIVE 1: CAMPUS PODCASTS ─────────────────────── */}
        <section id="podcasts" className="py-24 bg-white dark:bg-[#0A0A0C] border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Detailed Copy */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Student Audio & Shows</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Campus audio built for real student bandwidth.
                </h2>

                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  Listen to campus debates, academic study routines, relationship talk, and career gists hosted by students from your own university. Engineered to consume minimal mobile data.
                </p>

                <div className="space-y-4 pt-2 text-left">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Background & Screen-Off Playback</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                        Keep streaming while chatting on WhatsApp, taking lecture notes, or with your phone screen locked in transit.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                      <FolderDown className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">1-Tap Offline Downloads</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                        Download episodes over campus Wi-Fi to your device storage. Play anytime with zero active data connection.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Publish From Your Phone</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                        Any verified student creator can record, upload, and host their own campus podcast directly within the UniLink app.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                  >
                    <span>Download App to Listen</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Realistic Clean UI Card */}
              <div className="lg:col-span-6">
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl max-w-lg mx-auto">
                  <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">University Audio Player</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 font-medium">
                      128 kbps Low-Data
                    </span>
                  </div>

                  <div className="py-6 flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-emerald-400">
                      <Radio className="w-10 h-10" />
                    </div>
                    <div className="text-center sm:text-left space-y-1">
                      <div className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <span>University of Ibadan</span>
                        <span>•</span>
                        <span>Tech & Campus Life</span>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-snug">
                        Balancing Freelance Tech Work & CGPA
                      </h3>
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400">
                        <span>Host: Samuel Adeleke</span>
                        <GoldVerifiedBadge size={13} />
                      </div>
                    </div>
                  </div>

                  {/* Waveform Bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between gap-1.5 h-10 px-2 bg-slate-950/60 rounded-xl border border-slate-800">
                      {[40, 65, 30, 85, 45, 90, 75, 40, 95, 60, 35, 80, 50, 70, 45, 85, 60, 40, 90, 55, 30, 75, 60, 45, 80, 50].map((h, idx) => (
                        <div
                          key={idx}
                          className={`w-1 rounded-full transition-all ${idx < 13 ? 'bg-emerald-500' : 'bg-slate-700'}`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                      <span>06:40</span>
                      <span className="text-[11px] text-emerald-400 font-medium">Playing • Episode 08</span>
                      <span>18:25</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-800">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                      1.5x Speed
                    </span>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlayingPodcast(!isPlayingPodcast)}
                        className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        {isPlayingPodcast ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                    </div>

                    <button className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                      <FolderDown className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Offline</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 🎬 FEATURE DEEP-DIVE 2: CAMPUS VIDEO & REELS ─────────────────── */}
        <section id="reels" className="py-24 bg-slate-50 dark:bg-[#0E1015] border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: UI Preview Card */}
              <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center">
                <div className="w-full max-w-sm rounded-3xl bg-slate-900 p-3 shadow-xl border border-slate-800 text-white">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[9/14] flex flex-col justify-between p-4 border border-slate-800">
                    
                    {/* Video Top Bar */}
                    <div className="flex items-center justify-between z-10">
                      <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-xs font-semibold text-emerald-400 border border-white/10">
                        UNILAG Feed
                      </span>
                      <span className="text-xs text-slate-300">0:52</span>
                    </div>

                    {/* Play symbol placeholder */}
                    <div className="self-center w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
                      <Play className="w-6 h-6 ml-1" />
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="z-10 space-y-3">
                      <div className="flex items-end justify-between gap-3">
                        <div className="space-y-1.5 max-w-[75%]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs">@unilag_creatives</span>
                            <GoldVerifiedBadge size={13} />
                          </div>
                          <p className="text-xs text-slate-200 leading-snug">
                            Faculty of Engineering Final Year Project Exhibition Demo 🚀🤖
                          </p>
                          <span className="text-[10px] text-emerald-400 block font-medium">
                            🎵 Original Campus Sound • Faculty of Engineering
                          </span>
                        </div>

                        {/* Action buttons on side */}
                        <div className="flex flex-col items-center gap-3 text-slate-300">
                          <div className="flex flex-col items-center">
                            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                            <span className="text-[10px] mt-0.5">384</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-[10px] mt-0.5">42</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <Share2 className="w-5 h-5" />
                            <span className="text-[10px] mt-0.5">Share</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Copy */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <Video className="w-3.5 h-3.5" />
                  <span>Campus Video Stream</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Shorts and feeds tailored to your campus vibe.
                </h2>

                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  Experience campus life from your peers’ perspective. Share lab walkthroughs, student comedy, hostel chronicles, and university events without the algorithms of generic social media.
                </p>

                <div className="space-y-4 pt-2 text-left">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Campus-Filtered Exploration</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                        Toggle easily between your specific school's feed (e.g. Unilag, UI, OAU) and nationwide Nigerian student trends.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Optimized for Mobile Networks</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                        Compressed, adaptive video feeds load fast even on weaker campus cellular signals (MTN, Airtel, Glo).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Instant WhatsApp Status Sharing</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                        Share any reel straight to your WhatsApp status or course groups with 1 tap.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                  >
                    <span>Download App to Watch</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 📚 FEATURE DEEP-DIVE 3: DEPARTMENT LOUNGES & ACADEMICS ──────── */}
        <section id="communities" className="py-24 bg-white dark:bg-[#0A0A0C] border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Detailed Copy */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  <span>Academic Circles & Lounges</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Private study lounges for your department & courses.
                </h2>

                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  No more messy WhatsApp groups where important announcements get lost in spam. UniLink Lounges keep course notes, past questions, and lecture updates organized.
                </p>

                <div className="space-y-4 pt-2 text-left">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Past Questions & Notes Exchange</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                        Organized file sharing for lecture summaries, syllabus materials, and previous exam questions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Course Rep Pinned Announcements</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                        Class representatives can pin lecture venue shifts, assignment deadlines, and test dates right at the top.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cross-University Department Networks</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                        Connect with fellow Computer Science, Law, Medicine, or Economics students in other universities to compare curricula.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                  >
                    <span>Join Your Department Circle</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Realistic Department Lounge UI */}
              <div className="lg:col-span-6">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto space-y-4">
                  
                  {/* Lounge Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                        CS
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Computer Science • 300 Level</h4>
                        <span className="text-[11px] text-slate-500">148 Active Course Mates</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Verified Circle
                    </span>
                  </div>

                  {/* Pinned Announcement */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold mb-1">
                      <span>📌 Pinned by Course Rep (Tolani)</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-snug">
                      CSC 301 Test postponed to Thursday 10:00 AM at ICT Center Hall B. Please prepare your lab manuals.
                    </p>
                  </div>

                  {/* Shared File Item */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">CSC_312_Database_PQ_2019-2024.pdf</p>
                        <span className="text-[10px] text-slate-400">2.4 MB • Shared by Daniel</span>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] hover:bg-slate-200">
                      Download
                    </button>
                  </div>

                  {/* Discussion Thread */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">Emmanuel (UI Campus)</span>
                      <span className="text-[10px] text-slate-400">15m ago</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-snug">
                      Anyone having issues with Question 3 on Algorithm Complexity? Let's discuss the time complexity for MergeSort.
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <span>8 replies</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer">Reply</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 🔗 FEATURE DEEP-DIVE 4: UNIVERSAL LINK SHARING & SAFETY ──────── */}
        <section id="safety-sharing" className="py-24 bg-slate-50 dark:bg-[#0E1015] border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: UI WhatsApp Preview */}
              <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center">
                <div className="w-full max-w-sm rounded-3xl bg-slate-900 p-5 shadow-xl border border-slate-800 text-white space-y-4">
                  <div className="text-xs font-bold text-slate-400 flex items-center justify-between pb-2 border-b border-slate-800">
                    <span>WhatsApp Link Card Preview</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">https://unilink.ng/post/104</span>
                  </div>

                  {/* WhatsApp Rich Preview Box */}
                  <div className="p-3 bg-[#1F2C34] rounded-2xl border border-slate-700/60 text-xs space-y-2">
                    <div className="h-28 rounded-xl bg-slate-800 border border-slate-700 flex flex-col justify-end p-2.5 text-white">
                      <span className="text-[10px] font-bold text-emerald-400">UNILINK CAMPUS NETWORK</span>
                      <p className="font-bold text-xs line-clamp-1">Campus Podcast Episode 08: Student Exam Hacks</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">UniLink Nigeria — Where Students Connect</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Stream podcasts, connect in verified faculty lounges, and download course notes.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">unilink.ng</span>
                    </div>
                  </div>

                  {/* Gold Verified Emblem Breakdown */}
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex items-center gap-3">
                    <GoldVerifiedBadge size={28} />
                    <div>
                      <p className="font-bold text-white text-xs">Royal Gold Starburst Seal</p>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Authenticates official course reps, student union executives, and campus organizations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Copy */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Smart Link Previews & Safety</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Seamless WhatsApp sharing and verified campus trust.
                </h2>

                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  Sharing a podcast, post, or circle is effortless. Posts shared to WhatsApp or X render high-resolution clickable cards that open immediately inside the app or web player.
                </p>

                <div className="space-y-4 pt-2 text-left">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Interactive Open Graph Cards</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                        Auto-generated image and audio previews make your posts stand out on WhatsApp statuses and Telegram groups.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Anti-Impersonation Protection</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                        Gold Starburst seals prevent fake accounts from impersonating campus leaders, SUG executives, or departmental staff.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                      <Bug className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">In-App Diagnostics & 24h Moderation</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                        Students can flag violations or submit technical bug reports in 1 tap from their profile menu for rapid resolution.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                  >
                    <span>Download App & Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── DOWNLOAD & SAFETY SECTION (Direct & Clean) ─────────────────── */}
        <section id="download" className="py-20 bg-slate-50 dark:bg-[#0E1015] border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            
            {/* Download Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm mb-12">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                    <Download className="w-3.5 h-3.5" />
                    <span>Official Android Package</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Download UniLink for Android
                  </h2>

                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Install the standalone APK file. Once installed, future updates are delivered automatically over the air.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={handleDownload}
                      className="w-full sm:w-auto h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download APK (Universal Build)</span>
                    </button>

                    <Link
                      to="/app"
                      className="w-full sm:w-auto h-12 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Web Version</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>Android 7.0+ required • Scanned & verified with Google Play Protect</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="p-3 bg-white rounded-xl shadow-xs mb-3">
                    <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" fill="white" />
                      <rect x="10" y="10" width="25" height="25" fill="#059669" rx="3" />
                      <rect x="15" y="15" width="15" height="15" fill="white" rx="1.5" />
                      <rect x="18" y="18" width="9" height="9" fill="#059669" rx="1" />
                      <rect x="65" y="10" width="25" height="25" fill="#059669" rx="3" />
                      <rect x="70" y="15" width="15" height="15" fill="white" rx="1.5" />
                      <rect x="73" y="18" width="9" height="9" fill="#059669" rx="1" />
                      <rect x="10" y="65" width="25" height="25" fill="#059669" rx="3" />
                      <rect x="15" y="70" width="15" height="15" fill="white" rx="1.5" />
                      <rect x="18" y="73" width="9" height="9" fill="#059669" rx="1" />
                      <rect x="42" y="12" width="6" height="6" fill="#1E293B" />
                      <rect x="52" y="18" width="6" height="6" fill="#1E293B" />
                      <rect x="42" y="28" width="6" height="6" fill="#1E293B" />
                      <rect x="12" y="42" width="6" height="6" fill="#1E293B" />
                      <rect x="22" y="48" width="6" height="6" fill="#1E293B" />
                      <rect x="45" y="45" width="10" height="10" fill="#059669" rx="2" />
                      <rect x="65" y="42" width="6" height="6" fill="#1E293B" />
                      <rect x="78" y="48" width="6" height="6" fill="#1E293B" />
                      <rect x="42" y="65" width="6" height="6" fill="#1E293B" />
                      <rect x="52" y="75" width="6" height="6" fill="#1E293B" />
                      <rect x="65" y="65" width="6" height="6" fill="#1E293B" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" /> Scan to install on phone
                  </span>
                </div>

              </div>
            </div>

            {/* 3 Step Installation Helper */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                3-Step Installation Guide
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    Tap "Download anyway"
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Android browsers show a standard notice for any APK downloaded outside the Play Store. It is safe to proceed.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    Tap "Open" when finished
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Once the file finishes downloading, tap <strong>Open</strong> in Chrome or in your phone's notification bar.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    Allow & Tap "Install"
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    If prompted by Settings, enable <em>"Allow from this source"</em> once, then tap <strong>Install</strong>.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── FAQ SECTION ─────────────────────────────────────────────────── */}
        <section id="faq" className="py-20 border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-3xl mx-auto px-5 sm:px-8">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
              Frequently Asked Questions
            </h2>

            <div className="space-y-3">
              {[
                {
                  q: 'Is UniLink completely free for university students?',
                  a: 'Yes, UniLink is 100% free for all students. You can stream podcasts, publish posts, connect in departmental circles, and download episodes without any subscriptions.',
                },
                {
                  q: 'How does Campus Verification work?',
                  a: 'When signing up with your student email or student handle, you receive a campus badge linking you to your institution. Verified student leaders and active creators receive the Gold Starburst Emblem.',
                },
                {
                  q: 'Can I listen to podcasts offline?',
                  a: 'Yes. Simply tap the download button on any podcast episode to save it to your device storage for offline playback.',
                },
                {
                  q: 'How do I use UniLink on an iPhone (iOS)?',
                  a: 'On iOS, open Safari, visit unilink.ng, tap the Share button and select "Add to Home Screen".',
                },
                {
                  q: 'How do I report bugs or safety concerns?',
                  a: 'Under your Profile Menu, tap "Report Issue or Bug" or use the flag icon on any post. Our moderation team reviews reports within 24 hours.',
                },
              ].map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 cursor-pointer"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.q}
                      </h4>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180 text-emerald-600' : ''
                        }`}
                      />
                    </div>
                    {isOpen && (
                      <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="bg-white dark:bg-[#0A0A0C] text-slate-500 dark:text-slate-400 py-12 text-xs">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
              
              <div className="md:col-span-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/icon-512.png"
                    alt="UniLink"
                    className="w-8 h-8 rounded-xl object-contain shadow-xs"
                  />
                  <span className="font-bold text-base text-slate-900 dark:text-white">UniLink</span>
                </div>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  The campus student network connecting university students across Nigeria.
                </p>
                <div className="text-[11px] text-slate-400">
                  <span>App ID: com.syntaxdrive.unilink • v1.0.0</span>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2.5">
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Platform</h4>
                <ul className="space-y-2">
                  <li><Link to="/app" className="hover:text-emerald-600 transition-colors">Web App</Link></li>
                  <li><a href={APK_DOWNLOAD_URL} className="hover:text-emerald-600 transition-colors">Download APK</a></li>
                  <li><Link to="/about" className="hover:text-emerald-600 transition-colors">About Us</Link></li>
                </ul>
              </div>

              <div className="md:col-span-2 space-y-2.5">
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Safety</h4>
                <ul className="space-y-2">
                  <li><Link to="/legal/guidelines" className="hover:text-emerald-600 transition-colors">Community Guidelines</Link></li>
                  <li><a href="mailto:support@unilink.ng" className="hover:text-emerald-600 transition-colors">Report an Issue</a></li>
                  <li><a href="mailto:support@unilink.ng" className="hover:text-emerald-600 transition-colors">Support</a></li>
                </ul>
              </div>

              <div className="md:col-span-3 space-y-2.5">
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Legal</h4>
                <ul className="space-y-2">
                  <li><Link to="/legal/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/legal/terms" className="hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
                  <li><Link to="/legal/privacy" className="hover:text-emerald-600 transition-colors">Data Deletion</Link></li>
                </ul>
              </div>

            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
              <p>© {new Date().getFullYear()} UniLink Student Network. All rights reserved.</p>
              <p>Built for Nigerian University Students 🇳🇬</p>
            </div>
          </div>
        </footer>

        {/* ── SAFETY MODAL ────────────────────────────────────────────────── */}
        {showSafetyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowSafetyModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-3">
                <img src="/icon-512.png" alt="UniLink" className="w-6 h-6 rounded-lg object-contain shadow-xs" />
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Started • Universal APK</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                Installing UniLink
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Follow these 3 quick steps on your phone:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Tap "Download anyway"</p>
                    <p className="text-slate-500 text-[11px]">Android browsers show this notice for all direct downloads. UniLink is official and clean.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Tap "Open"</p>
                    <p className="text-slate-500 text-[11px]">Tap the downloaded file in your browser or notification bar.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Allow & Install</p>
                    <p className="text-slate-500 text-[11px]">Enable "Allow from this source" in Settings if prompted, then tap Install.</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Download Again
                </button>
                <Link
                  to="/app"
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-center font-semibold text-xs transition-colors"
                >
                  Open Web App
                </Link>
              </div>

              <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Play Protect Verified • Official SyntaxDrive Build</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
