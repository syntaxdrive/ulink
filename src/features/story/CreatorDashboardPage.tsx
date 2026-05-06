import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BarChart2, Plus, ArrowLeft, TrendingUp, Users, BookOpen, 
  Trash2, Edit3, Eye, Clock, Calendar, Zap, Loader2, Play
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SEO } from '../../components/SEO/SEO';

interface StoryStats {
  id: string;
  title: string;
  genre: string;
  plays_count: number;
  created_at: string;
  is_published: boolean;
  today_reads: number;
  week_reads: number;
}

export default function CreatorDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<StoryStats[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalReads: 0,
    totalStories: 0,
    activeReaders: 0,
    todayGrowth: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/app/story');
        return;
      }

      // 1. Fetch stories
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (storiesError) throw storiesError;

      // 2. Fetch all plays for these stories to calculate trends
      const storyIds = storiesData.map(s => s.id);
      let plays: any[] = [];
      
      if (storyIds.length > 0) {
        const { data: playsData } = await supabase
          .from('story_plays')
          .select('created_at, story_id')
          .in('story_id', storyIds);
        plays = playsData || [];
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const formattedStories = storiesData.map(s => {
        const storyPlays = plays.filter(p => p.story_id === s.id);
        const todayReads = storyPlays.filter(p => new Date(p.created_at) >= today).length;
        const weekReads = storyPlays.filter(p => new Date(p.created_at) >= lastWeek).length;

        return {
          ...s,
          today_reads: todayReads,
          week_reads: weekReads
        };
      });

      const totalReads = formattedStories.reduce((acc, s) => acc + (s.plays_count || 0), 0);
      const totalToday = formattedStories.reduce((acc, s) => acc + s.today_reads, 0);

      setStories(formattedStories);
      setTotalStats({
        totalReads,
        totalStories: storiesData.length,
        activeReaders: Math.ceil(totalReads * 0.15), // Mock active readers
        todayGrowth: totalToday
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteStory = async (id: string) => {
    if (!window.confirm("Delete this story and all its analytics? This cannot be undone.")) return;
    
    const { error } = await supabase.from('stories').delete().eq('id', id);
    if (!error) {
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 px-4 py-8 md:p-12">
      <SEO 
        title="Creator Dashboard"
        description="Manage your UniLink stories and track your audience engagement."
      />

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <button 
              onClick={() => navigate('/app/story')}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">The Reading Room</span>
            </button>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white">
              Creator Dashboard
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-2 font-serif italic">
              Your stories have reached {totalStats.totalReads.toLocaleString()} students across campus.
            </p>
          </div>
          <Link 
            to="/app/story/create"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-200 dark:shadow-none flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Story
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<TrendingUp className="w-5 h-5" />}
            label="Total Reads"
            value={totalStats.totalReads.toLocaleString()}
            subValue={`+${totalStats.todayGrowth} today`}
            color="emerald"
          />
          <StatCard 
            icon={<BookOpen className="w-5 h-5" />}
            label="Live Stories"
            value={totalStats.totalStories.toString()}
            subValue="Published"
            color="blue"
          />
          <StatCard 
            icon={<Users className="w-5 h-5" />}
            label="Active Readers"
            value={totalStats.activeReaders.toLocaleString()}
            subValue="Last 24h"
            color="purple"
          />
          <StatCard 
            icon={<Zap className="w-5 h-5" />}
            label="Engagement"
            value="High"
            subValue="Trending up"
            color="amber"
          />
        </div>

        {/* Story List Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <BarChart2 className="w-6 h-6 text-emerald-500" />
              Story Performance
            </h3>
            <div className="flex bg-slate-50 dark:bg-zinc-800 p-1 rounded-lg">
              <button className="px-3 py-1.5 bg-white dark:bg-zinc-700 rounded-md text-[10px] font-bold shadow-sm">Latest</button>
              <button className="px-3 py-1.5 text-[10px] font-bold text-slate-400">Popular</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-zinc-800/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Story Title</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Genre</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Reads</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Trend (7d)</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Crunching Stats...</span>
                      </div>
                    </td>
                  </tr>
                ) : stories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                       <div className="max-w-xs mx-auto space-y-4">
                          <p className="text-slate-500 dark:text-zinc-400 font-serif italic">You haven't published any stories yet. Start your journey today.</p>
                          <Link to="/app/story/create" className="inline-block text-emerald-600 font-bold hover:underline">Create First Story</Link>
                       </div>
                    </td>
                  </tr>
                ) : stories.map(story => (
                  <tr key={story.id} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{story.title}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Created {new Date(story.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
                        {story.genre}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">{story.plays_count.toLocaleString()}</span>
                        <span className="text-[9px] text-emerald-500 font-bold">+{story.today_reads} today</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-end gap-1 h-8">
                        {/* Mock mini-bar chart */}
                        {[3, 5, 2, 8, 4, 6, 9].map((h, i) => (
                          <div 
                            key={i} 
                            className={`w-1 rounded-full bg-emerald-500/20 ${i === 6 ? 'bg-emerald-500' : ''}`} 
                            style={{ height: `${h * 10}%` }}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => navigate(`/app/story/view/${story.id}`)}
                          className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-xl text-slate-400 hover:text-blue-500 transition-all border border-transparent hover:border-slate-100 shadow-sm"
                          title="View Story"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-xl text-slate-400 hover:text-emerald-500 transition-all border border-transparent hover:border-slate-100 shadow-sm"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteStory(story.id)}
                          className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all border border-transparent"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Growth Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
           <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Zap className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-4">
                 <h4 className="text-xl font-bold italic">Unlock More Features</h4>
                 <p className="text-indigo-100 text-sm leading-relaxed max-w-sm">
                   Your story is trending! Reaching 1,000 reads unlocks the **Community Choice Award** badge for your profile.
                 </p>
                 <button className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">
                   Learn More
                 </button>
              </div>
           </div>

           <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Clock className="w-5 h-5 text-amber-500" />
                 Engagement Tip
              </h4>
              <p className="text-slate-500 dark:text-zinc-400 text-sm font-serif italic">
                "Stories with at least 3 branching choices per episode see 40% higher retention rates among UniLink students."
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                 <TrendingUp className="w-3.5 h-3.5" /> Growth Insight
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, color }: { icon: any, label: string, value: string, subValue: string, color: string }) {
  const colorMap: any = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
    blue: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
    purple: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30',
    amber: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border ${colorMap[color]} shadow-sm`}>
      <div className="flex items-center gap-3 mb-4 opacity-80">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-3xl font-serif font-bold mb-1">{value}</div>
      <div className="text-[10px] font-medium opacity-60 uppercase tracking-tighter">{subValue}</div>
    </div>
  );
}
