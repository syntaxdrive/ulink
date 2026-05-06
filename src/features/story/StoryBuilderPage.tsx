import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Save, Play, Trash2, ArrowRight, Sparkles, 
  Image as ImageIcon, Type, Layout, ChevronLeft,
  Loader2, Check, X, HelpCircle, Info, Book, MousePointer2, Zap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthModalStore } from '../../stores/useAuthModalStore';

interface Scene {
  id: string;
  name: string;
  text: string;
  coverPrompt: string;
  artStyle: string;
  choices: {
    text: string;
    nextNodeId: string;
  }[];
}

const ART_STYLES = [
  'Digital Art', 'Anime / Manga', 'Cyberpunk', 
  'Oil Painting', 'Comic Book', 'Pixel Art', 'Realistic'
];

export default function StoryBuilderPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState(() => {
    const saved = localStorage.getItem('ulink_story_draft');
    if (saved) return JSON.parse(saved).title || '';
    return '';
  });
  const [description, setDescription] = useState(() => {
    const saved = localStorage.getItem('ulink_story_draft');
    if (saved) return JSON.parse(saved).description || '';
    return '';
  });
  const [genre, setGenre] = useState(() => {
    const saved = localStorage.getItem('ulink_story_draft');
    if (saved) return JSON.parse(saved).genre || 'Drama';
    return 'Drama';
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [scenes, setScenes] = useState<Scene[]>(() => {
    const saved = localStorage.getItem('ulink_story_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.scenes) && parsed.scenes.length > 0) return parsed.scenes;
      } catch {}
    }
    return [
      {
        id: 'start',
        name: 'Start',
        text: 'You wake up in your hostel room. The sun is shining.',
        coverPrompt: 'university hostel room morning sun',
        artStyle: 'Digital Art',
        choices: []
      }
    ];
  });

  const [activeSceneId, setActiveSceneId] = useState('start');
  const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0];

  // 1. Autosave Logic
  useEffect(() => {
    const draft = { title, description, genre, scenes };
    localStorage.setItem('ulink_story_draft', JSON.stringify(draft));
    setLastSaved(new Date());
  }, [title, description, genre, scenes]);

  // 2. Tutorial check
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('ulink_story_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const addScene = () => {
    const newId = `scene_${Date.now()}`;
    const newScene: Scene = {
      id: newId,
      name: `Scene ${scenes.length + 1}`,
      text: '',
      coverPrompt: '',
      artStyle: 'Digital Art',
      choices: []
    };
    setScenes([...scenes, newScene]);
    setActiveSceneId(newId);
  };

  const updateActiveScene = (updates: Partial<Scene>) => {
    setScenes(prev => prev.map(s => s.id === activeSceneId ? { ...s, ...updates } : s));
  };

  const addChoice = () => {
    const newChoices = [...activeScene.choices, { text: '', nextNodeId: '' }];
    updateActiveScene({ choices: newChoices });
  };

  const updateChoice = (index: number, updates: { text?: string; nextNodeId?: string }) => {
    const newChoices = activeScene.choices.map((c, i) => i === index ? { ...c, ...updates } : c);
    updateActiveScene({ choices: newChoices });
  };

  const removeChoice = (index: number) => {
    const newChoices = activeScene.choices.filter((_, i) => i !== index);
    updateActiveScene({ choices: newChoices });
  };

  const deleteScene = (id: string) => {
    if (scenes.length === 1) return;
    if (id === activeSceneId) {
      const remaining = scenes.filter(s => s.id !== id);
      setActiveSceneId(remaining[0].id);
      setScenes(remaining);
    } else {
      setScenes(scenes.filter(s => s.id !== id));
    }
  };

  const handleSave = async () => {
    if (!title || scenes.length === 0) return;
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        useAuthModalStore.getState().openAuthModal('Sign in to save your story');
        return;
      }

      // Format for the database
      const nodes: any = {};
      scenes.forEach(s => {
        nodes[s.id] = {
          text: s.text,
          choices: s.choices.filter(c => c.text && c.nextNodeId),
          art_style: s.artStyle,
          cover_prompt: s.coverPrompt
        };
      });

      const { error } = await supabase.from('stories').insert({
        creator_id: user.id,
        title,
        description,
        genre,
        story_type: 'simple',
        nodes,
        art_style: scenes[0].artStyle,
        is_published: true
      });

      if (error) throw error;
      localStorage.removeItem('ulink_story_draft');
      navigate('/app/story');
    } catch (err) {
      console.error(err);
      alert('Failed to save story');
    } finally {
      setIsSaving(false);
    }
  };

  const generateAIStory = async () => {
    const topic = prompt("What should the story be about? (e.g. 'A mystery during exams' or 'A romance in the cafeteria')");
    if (!topic) return;

    setIsGenerating(true);
    try {
      const systemPrompt = `[STRICT JSON ONLY] Story for university students. 
      Topic: ${topic}. 
      Format: [ { "id": "start", "name": "..", "text": "..", "coverPrompt": "..", "choices": [ { "text": "..", "nextNodeId": ".." } ] } ] 
      Output ONLY the array of 4-6 scenes.`;

      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(systemPrompt)}?model=openai&json=true&seed=${Date.now()}`);
      if (!response.ok) throw new Error('AI service unavailable');
      
      const content = await response.text();
      // Improved JSON extraction: find the first '[' and last ']'
      const startIdx = content.indexOf('[');
      const endIdx = content.lastIndexOf(']');
      
      if (startIdx === -1 || endIdx === -1) throw new Error('Invalid AI response format');
      
      const jsonStr = content.substring(startIdx, endIdx + 1);
      const aiScenes = JSON.parse(jsonStr);
      
      if (!Array.isArray(aiScenes)) throw new Error('Empty story generated');

      // Ensure art style is present
      const processedScenes = aiScenes.map(s => ({
        ...s,
        artStyle: s.artStyle || 'Digital Art'
      }));

      setScenes(processedScenes);
      setTitle(`${topic.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`);
      setActiveSceneId('start');
    } catch (err) {
      console.error(err);
      alert('UAI is a bit busy right now. Please try again or write your own mystery!');
    } finally {
      setIsGenerating(false);
    }
  };

  const refineSceneWithAI = async () => {
    const instruction = prompt("How should UAI refine this scene? (e.g. 'Make it more mysterious', 'Add more dialogue', 'Set it at night')");
    if (!instruction) return;

    setIsGenerating(true);
    try {
      const systemPrompt = `You are a creative writing assistant. 
      Refine the following story scene based on this instruction: "${instruction}".
      
      Current Scene Content:
      "${activeScene.text}"
      
      Return ONLY the refined text content. No other chat or explanation. Keep it immersive.`;

      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(systemPrompt)}?seed=${Math.floor(Math.random() * 1000)}`);
      if (!response.ok) throw new Error('AI service unavailable');
      
      const refinedText = await response.text();
      updateActiveScene({ text: refinedText.trim() });
    } catch (err) {
      console.error(err);
      alert('Failed to refine scene. Try a simpler instruction!');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col">
      {/* Top Header */}
      <header className="h-16 md:h-20 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <button onClick={() => navigate('/app/story')} className="p-1.5 md:p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <input 
              type="text" 
              placeholder="Untilted Story"
              className="text-lg md:text-xl font-bold bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white p-0 w-full md:w-64 truncate"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest hidden sm:block">Story Builder</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Draft Saved</span>
            <span className="text-[10px] text-slate-400 font-medium">{lastSaved?.toLocaleTimeString()}</span>
          </div>
          <button 
            onClick={() => setShowTutorial(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-slate-400 transition-colors"
            title="Help & Tutorial"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button 
            onClick={generateAIStory}
            disabled={isGenerating}
            className="flex items-center gap-2 p-2 md:px-4 md:py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs md:text-sm hover:bg-indigo-100 transition-all disabled:opacity-50"
            title="AI Generate"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span className="hidden md:inline">{isGenerating ? 'UAI is writing...' : 'AI Generate'}</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 md:px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">Save & Publish</span>
            <span className="sm:hidden">Save</span>
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 bg-slate-100 dark:bg-zinc-800 rounded-xl text-slate-600 dark:text-slate-400"
          >
            <Layout className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Scene List */}
        <aside className={`fixed md:relative inset-y-0 left-0 w-72 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col z-[70] transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Story Scenes</h3>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <button 
              onClick={() => { addScene(); setIsMobileMenuOpen(false); }}
              className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400 hover:text-emerald-600 hover:border-emerald-600 dark:hover:text-emerald-400 dark:hover:border-emerald-400 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" /> Add New Scene
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {scenes.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => { setActiveSceneId(scene.id); setIsMobileMenuOpen(false); }}
                className={`w-full text-left p-4 rounded-2xl transition-all group relative ${activeSceneId === scene.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${activeSceneId === scene.id ? 'text-slate-400' : 'text-slate-400'}`}>Node {idx + 1}</span>
                    <h4 className="font-bold text-sm line-clamp-1">{scene.name || 'Untitled Scene'}</h4>
                  </div>
                  {scenes.length > 1 && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); deleteScene(scene.id); }}
                      className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${activeSceneId === scene.id ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-red-50 text-red-500'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Editor Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-8 pb-20">
            {/* Scene Basic Info */}
            <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-zinc-800 space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 rounded-xl">
                  <Layout className="w-5 h-5" />
                </div>
                <h3 className="text-base md:text-lg font-bold">Scene Content</h3>
                <button 
                  onClick={refineSceneWithAI}
                  disabled={isGenerating}
                  className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Refine with AI
                </button>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Scene Name (e.g., The Confrontation)"
                  className="w-full px-4 py-2.5 md:py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-base md:text-lg"
                  value={activeScene.name}
                  onChange={e => updateActiveScene({ name: e.target.value })}
                />
                <textarea 
                  rows={6}
                  placeholder="What happens in this scene? Describe the setting and action..."
                  className="w-full px-4 md:px-6 py-4 md:py-5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-serif text-base md:text-lg leading-relaxed resize-none"
                  value={activeScene.text}
                  onChange={e => updateActiveScene({ text: e.target.value })}
                />
              </div>
            </section>

            {/* Visuals */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-zinc-800 space-y-4 md:space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-100 dark:bg-amber-950/30 text-amber-600 rounded-xl">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold">Visual Theme</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Art Style</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                      value={activeScene.artStyle}
                      onChange={e => updateActiveScene({ artStyle: e.target.value })}
                    >
                      {ART_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">AI Image Prompt</label>
                    <input 
                      type="text" 
                      placeholder="e.g. dramatic laboratory lighting"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                      value={activeScene.coverPrompt}
                      onChange={e => updateActiveScene({ coverPrompt: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-zinc-800 space-y-4 md:space-y-6 flex flex-col">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-950/30 text-blue-600 rounded-xl">
                      <Play className="w-5 h-5" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold">Story Settings</h3>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Genre</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                        value={genre}
                        onChange={e => setGenre(e.target.value)}
                      >
                        <option>Drama</option>
                        <option>Horror</option>
                        <option>Mystery</option>
                        <option>Romance</option>
                        <option>Sci-Fi</option>
                      </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Story Description</label>
                       <textarea 
                         rows={2}
                         className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none text-sm"
                         value={description}
                         onChange={e => setDescription(e.target.value)}
                       />
                    </div>
                  </div>
              </div>
            </section>

            {/* Choices */}
            <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-zinc-800 space-y-4 md:space-y-6 mb-20">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-950/30 text-purple-600 rounded-xl">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold">Player Choices</h3>
                </div>
                <button 
                  onClick={addChoice}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Choice
                </button>
              </div>

              <div className="space-y-3">
                {activeScene.choices.length === 0 && (
                  <div className="py-8 md:py-12 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 italic text-sm text-center px-4">
                    <p>No choices added. This scene will be the end of the story.</p>
                  </div>
                )}
                {activeScene.choices.map((choice, idx) => (
                  <div key={idx} className="flex flex-col lg:flex-row items-center gap-3 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl animate-in slide-in-from-left duration-300">
                    <div className="flex-1 w-full">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Decision Label</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Open the door"
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm"
                        value={choice.text}
                        onChange={e => updateChoice(idx, { text: e.target.value })}
                      />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 hidden lg:block mt-4" />
                    <div className="flex-1 w-full">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Leads To...</label>
                      <select 
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                        value={choice.nextNodeId}
                        onChange={e => updateChoice(idx, { nextNodeId: e.target.value })}
                      >
                        <option value="">Select a scene</option>
                        {scenes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <button 
                      onClick={() => removeChoice(idx)}
                      className="w-full lg:w-auto p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors mt-0 lg:mt-4 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="lg:hidden ml-2 font-bold text-xs uppercase tracking-widest">Delete Choice</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowTutorial(false)} />
        <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[32px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">
          {/* Decorative Side */}
          <div className="w-full md:w-1/3 bg-emerald-600 p-8 flex flex-col justify-between text-white shrink-0">
            <div>
              <Zap className="w-10 h-10 mb-4 opacity-50" />
              <h2 className="text-2xl font-black leading-tight uppercase tracking-tighter italic">Create Your Story</h2>
            </div>
            <p className="text-xs font-bold opacity-80 leading-relaxed uppercase tracking-widest">A visual guide to building choice-based narratives on UniLink.</p>
          </div>

          {/* Content Side */}
          <div className="flex-1 p-8 md:p-10 space-y-8 overflow-y-auto max-h-[80vh]">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 rounded-2xl shrink-0">
                  <Layout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Create Scenes</h4>
                  <p className="text-[13px] text-slate-500 dark:text-zinc-400 mt-1">Each scene is a "node" in your story. Think of it like a page in a book. Describe what happens in the text area.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-950/30 text-blue-600 rounded-2xl shrink-0">
                  <MousePointer2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Add Choices</h4>
                  <p className="text-[13px] text-slate-500 dark:text-zinc-400 mt-1">Choices are how players move between scenes. Add a choice and select which scene it "Leads To".</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-950/30 text-amber-600 rounded-2xl shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Use UAI Co-Pilot</h4>
                  <p className="text-[13px] text-slate-500 dark:text-zinc-400 mt-1">Stuck on an idea? Click "AI Generate" and describe your topic. UAI will build the entire structure for you!</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-950/30 text-purple-600 rounded-2xl shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">4. Save & Publish</h4>
                  <p className="text-[13px] text-slate-500 dark:text-zinc-400 mt-1">We autosave your draft every second. Once you're ready, hit Publish to share your story with the campus.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowTutorial(false);
                localStorage.setItem('ulink_story_tutorial_seen', 'true');
              }}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
            >
              Got it, let's build!
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
    </>
  );
}
