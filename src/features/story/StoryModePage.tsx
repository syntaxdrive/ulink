import { useState, useCallback, useRef, useEffect } from 'react';
import { Story } from 'inkjs';
import { 
  BookOpen, Battery, Award,
  ChevronRight, Volume2, VolumeX, Plus, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StoryImage } from './components/StoryImage';
import { supabase } from '../../lib/supabase';
import { useAuthModalStore } from '../../stores/useAuthModalStore';

interface StoryInfo {
  id: string;
  title: string;
  episode?: string;
  description: string;
  filename?: string;
  ink_json?: any;
  theme: string;
  icon: string;
  estimatedTime: string;
  coverPrompt: string;
  genre: string;
  creator_id?: string;
}

// Story configurations
const STORIES: StoryInfo[] = [
  {
    id: 'ui_exam_chaos',
    title: 'The Great UI Exam Emergency',
    episode: 'Episode 1',
    description: 'Survive a chaotic morning at the University of Ibadan. Will you make it to the exam hall?',
    filename: '/stories/ui_exam_chaos.json',
    theme: 'from-blue-600 to-indigo-800',
    icon: '🏃🏾‍♂️',
    estimatedTime: '45-60 min',
    coverPrompt: 'waking_up',
    genre: 'Drama / Mystery'
  },
  {
    id: 'mutant_outbreak',
    title: 'The Buka Outbreak',
    episode: 'Episode 2',
    description: 'A terrifying biological experiment has turned the campus into a warzone. Survive the night, and protect your notes.',
    filename: '/stories/mutant_outbreak.json',
    theme: 'from-orange-600 to-red-800',
    icon: '🧟',
    estimatedTime: '30-45 min',
    coverPrompt: 'mutant_cafeteria',
    genre: 'Horror / Survival'
  }
];

// ─── Synthetic Audio Engine ──────────────────────────────────────────────────
const novel_audio = {
  ctx: null as AudioContext | null,
  
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  },

  play(type: 'page' | 'choice' | 'choice_danger' | 'choice_heart' | 'xp') {
    if (!this.ctx) this.init();
    const ctx = this.ctx!;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'page': // Soft paper rustle sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.start(); osc.stop(now + 0.15);
        break;
      case 'choice_danger': // Low, sharp, alerting tone
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(); osc.stop(now + 0.15);
        break;
      case 'choice_heart': // Multi-tonal soft chime
        [659, 880].forEach((f, i) => {
           const o = ctx.createOscillator();
           const g = ctx.createGain();
           o.connect(g); g.connect(ctx.destination);
           o.frequency.setValueAtTime(f, now + (i * 0.03));
           g.gain.setValueAtTime(0.03, now + (i * 0.03));
           g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
           o.start(now + (i * 0.03)); o.stop(now + 0.35);
        });
        break;
      case 'xp': // High chime chord
        [659, 880, 1318].forEach((f, i) => {
           const o = ctx.createOscillator();
           const g = ctx.createGain();
           o.connect(g); g.connect(ctx.destination);
           o.frequency.setValueAtTime(f, now + (i * 0.05));
           g.gain.setValueAtTime(0.04, now + (i * 0.05));
           g.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + (i * 0.1));
           o.start(now + (i * 0.05)); o.stop(now + 0.6);
        });
        break;
    }
  }
};

type StoryState = 'select' | 'loading' | 'playing' | 'ended';

interface DialogueLine {
  speaker: string;
  text: string;
  isPlayer: boolean;
  image?: string;
}

export default function StoryModePage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [appState, setAppState] = useState<StoryState>('select');
  const [savedStories, setSavedStories] = useState<Record<string, boolean>>({});
  const [allStories, setAllStories] = useState<StoryInfo[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create Story State
  const [newStory, setNewStory] = useState({
    title: '',
    description: '',
    genre: 'Drama',
    ink_json: '',
    coverPrompt: ''
  });

  const fetchStories = async () => {
    setLoadingStories(true);
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Merge with hardcoded ones if needed, or just use DB
      const dbStories = data.map(s => ({
        ...s,
        estimatedTime: s.estimated_time,
        coverPrompt: s.cover_prompt
      }));
      setAllStories([...STORIES, ...dbStories]);
    } else {
      setAllStories(STORIES);
    }
    setLoadingStories(false);
  };

  useEffect(() => {
    fetchStories();
  }, []);
  
  // Game state
  const storyRef = useRef<InstanceType<typeof Story> | null>(null);
  const activeStoryId = useRef<string>('');
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([]);
  const [choices, setChoices] = useState<{text: string, index: number}[]>([]);
  const [currentSceneImg, setCurrentSceneImg] = useState<string | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState<{name: string, expression?: string} | null>(null);
  
  // Player metrics
  const [totalXp, setTotalXp] = useState(0);
  const [battery, setBattery] = useState(15);
  
  // Effects and Feedback
  const [toast, setToast] = useState<{msg: string, type: 'success'|'warning'|'error'} | null>(null);

  const showToast = useCallback((msg: string, type: 'success'|'warning'|'error') => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (appState === 'select') {
      const saves: Record<string, boolean> = {};
      STORIES.forEach(st => {
        if (localStorage.getItem(`unilink_story_${st.id}`)) saves[st.id] = true;
      });
      setSavedStories(saves);
    }
  }, [appState]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#10b981', '#f59e0b']
    });
  };

  // 1. Select Story
  const selectStory = async (storyInfo: StoryInfo, resume: boolean = false) => {
    setAppState('loading');
    
    try {
      let json: string;
      if (storyInfo.ink_json) {
        json = typeof storyInfo.ink_json === 'string' ? storyInfo.ink_json : JSON.stringify(storyInfo.ink_json);
      } else {
        const res = await fetch(`${storyInfo.filename}?t=${Date.now()}`);
        if (!res.ok) throw new Error('Failed to load story data');
        json = await res.text();
      }

      storyRef.current = new Story(json);
      activeStoryId.current = storyInfo.id;
      
      const saveKey = `unilink_story_${storyInfo.id}`;
      if (resume) {
        const savedData = localStorage.getItem(saveKey);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          storyRef.current.state.LoadJson(parsed.inkState);
          setDialogueLines(parsed.dialogueLines);
          syncVariables();
          
          if (storyRef.current.currentChoices.length > 0) {
            setChoices(storyRef.current.currentChoices.map(c => ({ text: c.text, index: c.index })));
          }
          setAppState('playing');
          
          // Auto-scroll logic applied after state paint
          setTimeout(() => {
            const mainEl = document.querySelector('main.main-scroll');
            if (mainEl) {
              mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: 'instant' });
            } else {
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
            }
          }, 50);
          return;
        }
      }
      
      // Start fresh
      localStorage.removeItem(saveKey);
      setTotalXp(0);
      setDialogueLines([]);
      setChoices([]);
      setCurrentSceneImg(storyInfo.coverPrompt);
      setCurrentCharacter(null);
      
      // Start
      setAppState('playing');
      pullInkLines();
    } catch (err) {
      console.error(err);
      showToast('Error loading story', 'error');
      setAppState('select');
    }
  };

  // Sync Global Variables
  const syncVariables = useCallback(() => {
    const s = storyRef.current;
    if (!s) return;
    
    const inkVars = s.variablesState;
    if (inkVars['total_xp'] !== undefined) setTotalXp(Number(inkVars['total_xp']) || 0);
    if (inkVars['phone_battery'] !== undefined) setBattery(Number(inkVars['phone_battery']) || 0);
  }, []);

  // Pull Text from Ink
  const pullInkLines = useCallback((chosenText?: string) => {
    const s = storyRef.current;
    if (!s) return;
    
    const lines: DialogueLine[] = [...dialogueLines]; // accumulation
    if (chosenText) {
      lines.push({ speaker: 'Decision', text: chosenText, isPlayer: true });
    }
    let isEnding = false;
    let pendingImage: string | undefined = undefined;

    while (s.canContinue) {
      const rawText = s.Continue()?.trim() || '';
      
      const tags = s.currentTags || [];
      tags.forEach(t => {
        if (t.startsWith('xp_')) {
          const val = parseInt(t.split('_')[1]);
          if (soundEnabled) novel_audio.play('xp');
          showToast(`+${val} XP`, 'success');
        } else if (t.startsWith('naira_')) {
          const val = parseInt(t.replace('naira_', ''));
          showToast(`+₦${val}`, 'success');
        } else if (t.startsWith('achievement_')) {
          triggerConfetti();
          if (soundEnabled) novel_audio.play('xp');
          showToast(`Achievement Unlocked!`, 'success');
        } else if (t.startsWith('image_')) {
          const imageName = t.replace('image_', '');
          pendingImage = imageName;
          setCurrentSceneImg(imageName);
        } else if (t.startsWith('speaker_')) {
          const name = t.replace('speaker_', '');
          setCurrentCharacter({ name });
        } else if (t === 'hide_speaker') {
          setCurrentCharacter(null);
        }
      });
      syncVariables();

      if (!rawText) continue;

      let speaker = '';
      let text = rawText;
      let isPlayer = false;

      const match = rawText.match(/^([^:]+):\s*(.*)$/);
      if (match) {
        speaker = match[1].trim();
        text = match[2].trim();
        if (speaker === 'You') isPlayer = true;
      } else if (rawText.startsWith('(') && rawText.endsWith(')')) {
        speaker = 'System';
      } else if (rawText.startsWith('📍') || rawText.startsWith('⏰')) {
        speaker = 'Location';
      }

      lines.push({ speaker, text, isPlayer, image: pendingImage });
      pendingImage = undefined;
    }

    if (soundEnabled) {
       novel_audio.play('page');
    }

    setDialogueLines(lines);

    let currentChoices: {text: string, index: number}[] = [];
    if (s.currentChoices.length > 0) {
      currentChoices = s.currentChoices.map(c => ({ text: c.text, index: c.index }));
      setChoices(currentChoices);
    } else {
      setChoices([]);
      if (!s.canContinue) {
         isEnding = true;
      }
    }

    const saveKey = `unilink_story_${activeStoryId.current}`;
    if (isEnding) {
      localStorage.removeItem(saveKey);
    } else {
      localStorage.setItem(saveKey, JSON.stringify({
        inkState: s.state.toJson(),
        dialogueLines: lines
      }));
    }

    if (isEnding) {
      setTimeout(() => setAppState('ended'), 2000);
    }
    
    setTimeout(() => {
      const decisionBlocks = document.querySelectorAll('.decision-block');
      const mainEl = document.querySelector('main.main-scroll');
      
      if (chosenText && decisionBlocks.length > 0) {
        const lastDecision = decisionBlocks[decisionBlocks.length - 1];
        const yOffset = -20;
        
        if (mainEl) {
           const y = (lastDecision as HTMLElement).offsetTop + yOffset;
           mainEl.scrollTo({ top: y, behavior: 'smooth' });
        } else {
           const y = lastDecision.getBoundingClientRect().top + window.scrollY + yOffset;
           window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else {
        if (mainEl) {
          mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      }
    }, 50);
  }, [dialogueLines, showToast, syncVariables, soundEnabled]);

  const handleChoice = (idx: number) => {
    if (!storyRef.current) return;
    
    const chosenText = choices.find(c => c.index === idx)?.text || '';
    if (soundEnabled) {
      const lower = chosenText.toLowerCase();
      if (/(run|escape|fight|shout|angry|quickly|hit|steal|danger|warning)/.test(lower)) {
        novel_audio.play('choice_danger');
      } else if (/(smile|help|kind|talk|friend|soft|love|please|quietly|peace)/.test(lower)) {
        novel_audio.play('choice_heart');
      } else if (/(buy|pay|get|receive|win|award|points)/.test(lower)) {
        novel_audio.play('xp');
      }
    }
    
    storyRef.current.ChooseChoiceIndex(idx);
    
    setChoices([]);
    pullInkLines(chosenText);
  };

  const restartStory = () => {
    setAppState('select');
    setDialogueLines([]);
    setChoices([]);
  };

  // --- Render ---

  if (appState === 'select') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-4">
          <div className="text-left">
            <h1 className="text-3xl md:text-5xl font-serif text-slate-900 dark:text-white tracking-tight">
              The Reading Room
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 max-w-lg text-sm md:text-base font-serif italic mt-2">
              Immersive, choice-driven stories. Every decision permanently alters the narrative.
            </p>
          </div>
          <button 
            onClick={() => {
              supabase.auth.getUser().then(({ data: { user } }) => {
                if (!user) {
                  useAuthModalStore.getState().openAuthModal('Sign in to create your own stories');
                } else {
                  setShowCreateModal(true);
                }
              });
            }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create Story
          </button>
        </div>

        {loadingStories ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-[400px] bg-slate-100 dark:bg-zinc-800 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {allStories.map(story => {
              const hasSave = savedStories[story.id];
              
              return (
                <div
                  key={story.id}
                  className="flex flex-col rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-300 group"
                >
                  {/* Cover Image Section */}
                  <div onClick={() => selectStory(story, hasSave)} className="cursor-pointer relative aspect-[16/10] overflow-hidden">
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                      <span className="text-xl bg-white/90 dark:bg-zinc-900/90 w-10 h-10 flex items-center justify-center rounded-xl shadow-lg border border-slate-200 dark:border-zinc-800">
                        {story.icon}
                      </span>
                      <span className="text-[10px] font-sans font-black tracking-widest uppercase text-white drop-shadow-md">
                        {story.estimatedTime}
                      </span>
                    </div>
                    <div className="h-full group-hover:scale-105 transition-transform duration-700">
                      <StoryImage prompt={story.coverPrompt || story.id} />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="flex flex-col h-full text-left">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-sm">
                          {story.genre}
                        </span>
                        {hasSave && (
                          <span className="text-[9px] font-bold text-stone-400 animate-pulse">
                            Saved
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 transition-colors mb-3">
                        {story.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-serif line-clamp-3">
                        {story.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-6 flex flex-col gap-2">
                      {hasSave ? (
                        <>
                          <button 
                            onClick={() => selectStory(story, true)}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm"
                          >
                             Resume Reading
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm("Start over? Your previous save will be overwritten.")) {
                                selectStory(story, false);
                              }
                            }}
                            className="w-full py-2.5 px-4 bg-transparent border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-colors"
                          >
                             Restart
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => selectStory(story, false)}
                          className="w-full py-3 px-4 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-colors shadow-sm"
                        >
                           Start Reading
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Story Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" /> Create a New Path
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Story Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Midnight in Lagos"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={newStory.title}
                    onChange={e => setNewStory({...newStory, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Genre</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      value={newStory.genre}
                      onChange={e => setNewStory({...newStory, genre: e.target.value})}
                    >
                      <option>Drama</option>
                      <option>Horror</option>
                      <option>Mystery</option>
                      <option>Romance</option>
                      <option>Sci-Fi</option>
                      <option>Comedy</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Cover Prompt (AI)</label>
                    <input 
                      type="text" 
                      placeholder="e.g., bustling city at night"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      value={newStory.coverPrompt}
                      onChange={e => setNewStory({...newStory, coverPrompt: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="What is this journey about?"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                    value={newStory.description}
                    onChange={e => setNewStory({...newStory, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Ink JSON Content</label>
                    <a href="https://github.com/inkle/ink" target="_blank" rel="noreferrer" className="text-[10px] text-emerald-600 hover:underline">Learn how to write in Ink</a>
                  </div>
                  <textarea 
                    rows={8}
                    placeholder="Paste your compiled Ink JSON here..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-sm"
                    value={newStory.ink_json}
                    onChange={e => setNewStory({...newStory, ink_json: e.target.value})}
                  />
                  <p className="text-[10px] text-slate-400 italic">Use Inky to write your story, then 'Export for Web' or 'Export as JSON' and paste the content here.</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-zinc-800/50 flex gap-3">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 rounded-xl font-bold text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    if (!newStory.title || !newStory.ink_json) {
                      showToast('Please fill in title and content', 'error');
                      return;
                    }
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) return;

                      let parsedJson;
                      try {
                        parsedJson = JSON.parse(newStory.ink_json);
                      } catch {
                        showToast('Invalid JSON format', 'error');
                        return;
                      }

                      const { error } = await supabase.from('stories').insert({
                        creator_id: user.id,
                        title: newStory.title,
                        description: newStory.description,
                        genre: newStory.genre,
                        cover_prompt: newStory.coverPrompt,
                        ink_json: parsedJson,
                        is_published: true
                      });

                      if (error) throw error;
                      
                      showToast('Story published successfully!', 'success');
                      setShowCreateModal(false);
                      fetchStories();
                    } catch (err) {
                      console.error(err);
                      showToast('Failed to publish story', 'error');
                    }
                  }}
                  className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 dark:shadow-none"
                >
                  Publish Story
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-serif bg-stone-50 dark:bg-zinc-950">
      {/* Immersive Background Illustration (More subtle now) */}
      {currentSceneImg && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-stone-50/90 dark:bg-black/90 z-10" />
          <div className="absolute inset-0 opacity-20 blur-3xl scale-110 grayscale">
            <StoryImage prompt={currentSceneImg} />
          </div>
        </div>
      )}

      {/* Character Portrait (Side-view) */}
      {currentCharacter && (
        <div className="fixed bottom-0 right-0 z-10 w-full max-w-sm pointer-events-none animate-in slide-in-from-right-20 duration-700">
           <img 
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${currentCharacter.name.replace(/\s+/g, '')}&backgroundColor=transparent`} 
              alt={currentCharacter.name}
              className="w-full h-auto drop-shadow-2xl translate-y-12"
           />
        </div>
      )}

      <div className="relative z-20 max-w-3xl mx-auto px-4 md:px-8 pb-12 min-h-full transition-all duration-700">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="px-5 py-2.5 rounded-full font-sans font-bold text-xs tracking-widest uppercase shadow-xl flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            {toast.msg}
          </div>
        </div>
      )}

      {/* Elegant Novel Header - Fixed at Top */}
      <div className="h-16 shrink-0" /> {/* Spacer for fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50 md:left-[280px] py-4 flex items-center justify-center border-b border-stone-200/60 dark:border-white/10 bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur-xl px-4 md:px-8">
        <div className="w-full max-w-3xl flex items-center justify-between">
          <button onClick={restartStory} className="text-stone-500 dark:text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2 text-[10px] font-sans font-black uppercase tracking-[0.3em] group">
            <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          
          <div className="flex items-center gap-4 sm:gap-6 font-sans text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500">
            <button 
               onClick={() => {
                 setSoundEnabled(!soundEnabled);
                 if (!soundEnabled) novel_audio.init();
               }}
               className="hover:text-stone-900 transition-colors flex items-center gap-1"
               title={soundEnabled ? "Disable Sounds" : "Enable Sounds"}
            >
               {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-500" /> : <VolumeX className="w-3.5 h-3.5" />} 
               {soundEnabled ? "On" : "Off"}
            </button>
            
            <div className="flex items-center gap-1.5" title="XP">
              <Award className="w-3.5 h-3.5" /> {totalXp}
            </div>
            <div className="flex items-center gap-1.5" title="Coins">
               ₦200
            </div>
            <div className={`flex items-center gap-1.5 ${battery < 20 ? 'text-red-500 animate-pulse' : ''}`} title="Battery">
               <Battery className="w-3.5 h-3.5" /> {battery}%
            </div>
          </div>
        </div>
      </header>

      <div 
        id="story-dialogue-container"
        className="px-6 md:px-14 py-8 space-y-5 pb-12 bg-[#fdfcf9] dark:bg-stone-900 shadow-[0_10px_50px_rgba(0,0,0,0.06)] dark:shadow-none rounded-sm border border-stone-200/60 dark:border-white/5 relative"
      >
        {/* Subtle Page Edge Effect */}
        <div className="absolute inset-y-0 right-0 w-px bg-stone-200/50 dark:bg-white/5" />
        
        {dialogueLines.map((line, i) => {
          if (line.text === '---') {
            return (
              <div key={i} className="my-10 flex justify-center opacity-30">
                <span className="w-1 h-1 rounded-full bg-slate-400 mx-1"></span>
                <span className="w-1 h-1 rounded-full bg-slate-400 mx-1"></span>
                <span className="w-1 h-1 rounded-full bg-slate-400 mx-1"></span>
              </div>
            );
          }

          if (line.speaker === 'Location') {
            const hasTime = line.text.includes('⏰');
            const [loc, time] = hasTime ? line.text.split('⏰') : [line.text, null];
            
            return (
              <div key={i} className="py-10 text-center animate-in fade-in zoom-in-95 duration-1000">
                {line.image && (
                  <div className="w-full mb-10 rounded-lg overflow-hidden shadow-xl border border-stone-200 dark:border-white/10 grayscale-[0.2] sepia-[0.1]">
                    <StoryImage prompt={line.image} />
                  </div>
                )}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-px bg-stone-200 dark:bg-stone-800" />
                  <div className="text-stone-500 dark:text-stone-400 font-sans text-[10px] font-black tracking-[0.4em] uppercase leading-relaxed max-w-xs mx-auto">
                    {loc.replace(/^[📍⏰]\s*/, '').trim()}
                  </div>
                  {time && (
                    <div className="text-stone-400 dark:text-stone-600 font-sans text-[9px] font-black tracking-[0.2em] uppercase italic bg-stone-50 dark:bg-stone-900 px-3 -mt-1">
                      {time.trim()}
                    </div>
                  )}
                  <div className="w-12 h-px bg-stone-200 dark:bg-stone-800" />
                </div>
              </div>
            );
          }

          if (line.speaker === 'Decision') {
            return (
              <div key={i} className="decision-block my-8 p-8 pl-10 border-l-[3px] border-stone-800 dark:border-amber-400 bg-stone-100/50 dark:bg-stone-800/40 rounded-sm italic shadow-sm animate-in slide-in-from-left duration-700">
                <div className="text-stone-400 dark:text-stone-500 font-sans font-black text-[9px] tracking-[0.3em] uppercase mb-2 opacity-90">
                  Decision
                </div>
                <div className="text-xl md:text-2xl font-serif text-stone-900 dark:text-stone-100 font-medium leading-relaxed">
                  {line.text}
                </div>
              </div>
            );
          }

          if (line.speaker === 'System' || !line.speaker) {
            return (
              <div key={i} className="py-4 text-stone-800 dark:text-stone-200 md:text-xl leading-relaxed md:leading-[1.9] drop-shadow-sm font-medium selection:bg-stone-200">
                 {line.image && (
                   <div className="w-full my-8 rounded-lg overflow-hidden shadow-xl border border-stone-200 dark:border-white/10 grayscale-[0.2] sepia-[0.1]">
                     <StoryImage prompt={line.image} />
                   </div>
                 )}
                {line.text}
              </div>
            );
          }

          // Spoken dialogue – Classic Novel Quote Style
          return (
            <div key={i} className="py-4 leading-relaxed md:leading-[1.9] md:text-xl text-stone-900 dark:text-stone-100 animate-in fade-in duration-500 border-l border-stone-200 dark:border-stone-800 pl-6">
              <span className="font-sans font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2 block">
                {line.speaker}
              </span> 
              <span className="font-medium italic leading-relaxed text-stone-800 dark:text-stone-300">
                "{line.text}"
              </span>
            </div>
          );
        })}

        {appState === 'ended' && (
          <div className="py-16 text-center animate-in fade-in duration-1000">
            <div className="w-12 h-1 bg-slate-200 dark:bg-zinc-800 mx-auto mb-8"></div>
            <h2 className="text-2xl font-serif text-slate-900 dark:text-white mb-4">Fin.</h2>
            <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto italic font-serif">
              The story ends here, but another path always exists.
            </p>
            <button 
              onClick={restartStory}
              className="font-sans font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Return to Catalog
            </button>
          </div>
        )}
      </div>

      {/* Modern Minimal Choices */}
      {choices.length > 0 && (
        <div className="mt-8 px-4 md:px-8 space-y-3 pb-12 animate-in slide-in-from-bottom-10 duration-1000">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-white/20"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Next Path</span>
            <div className="h-px flex-1 bg-white/20"></div>
          </div>
          {choices.map((c, idx) => {
            const mockPercent = Math.floor(20 + Math.random() * 60);
            return (
              <button
                key={idx}
                onClick={() => handleChoice(c.index)}
                className="w-full text-left py-4 px-8 rounded-sm border border-stone-200 dark:border-white/10 hover:border-stone-400 dark:hover:border-stone-600 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-all font-sans text-base flex justify-between items-center group
                           focus:outline-none bg-white dark:bg-stone-900 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-700 group-hover:bg-stone-600 dark:group-hover:bg-stone-300 transition-colors"></div>
                  <span className="font-bold tracking-tight">{c.text}</span>
                </div>
                <div className="flex items-center gap-2 relative z-10 opacity-30 group-hover:opacity-100 transition-opacity">
                   <div className="text-[9px] font-sans font-black uppercase tracking-widest text-stone-400">Readers: {mockPercent}%</div>
                   <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </button>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
