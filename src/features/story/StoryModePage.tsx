import { useState, useCallback, useRef, useEffect } from 'react';
import { Story } from 'inkjs';
import { 
  BookOpen, Battery, Wallet, Award,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StoryImage } from './components/StoryImage';

interface StoryInfo {
  id: string;
  title: string;
  episode: string;
  description: string;
  filename: string;
  theme: string;
  icon: string;
  estimatedTime: string;
  coverPrompt: string;
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
    coverPrompt: 'waking_up' // Uses public/stories/images/waking_up.png
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
    coverPrompt: 'mutant_cafeteria' // Uses public/stories/images/mutant_cafeteria.png
  }
];

type StoryState = 'select' | 'loading' | 'playing' | 'ended';

interface DialogueLine {
  speaker: string;
  text: string;
  isPlayer: boolean;
  image?: string;
}

export default function StoryModePage() {
  const [appState, setAppState] = useState<StoryState>('select');
  const [savedStories, setSavedStories] = useState<Record<string, boolean>>({});
  
  // Game state
  const storyRef = useRef<InstanceType<typeof Story> | null>(null);
  const activeStoryId = useRef<string>('');
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([]);
  const [choices, setChoices] = useState<{text: string, index: number}[]>([]);
  const [currentSceneImg, setCurrentSceneImg] = useState<string | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState<{name: string, expression?: string} | null>(null);
  
  // Player metrics
  const [totalXp, setTotalXp] = useState(0);
  const [naira, setNaira] = useState(500);
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
  const selectStory = async (storyInfo: typeof STORIES[0], resume: boolean = false) => {
    setAppState('loading');
    
    try {
      const res = await fetch(`${storyInfo.filename}?t=${Date.now()}`);
      if (!res.ok) throw new Error('Failed to load story data');
      const json = await res.text();
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
    if (inkVars['naira'] !== undefined) setNaira(Number(inkVars['naira']) || 0);
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

    // We only pull ONE chunk of text until choices arrive to allow reading step-by-step
    // Or we pull all available text if we're advancing fast.
    // For a traditional VN style, we pull everything available up to the next choice.
    
    while (s.canContinue) {
      const rawText = s.Continue()?.trim() || '';
      
      // Handle tags BEFORE checking if text is empty!
      const tags = s.currentTags || [];
      tags.forEach(t => {
        if (t.startsWith('xp_')) {
          const val = parseInt(t.split('_')[1]);
          showToast(`+${val} XP`, 'success');
        } else if (t.startsWith('achievement_')) {
          triggerConfetti();
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

      // Parse Speaker
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

    setDialogueLines(lines);

    // Get current Knot to display location/chapter title if needed (Advanced feature, simplified here)
    // The path contains knot names. 
    // setCurrentKnot(s.state.currentPathString || '');

    let currentChoices: {text: string, index: number}[] = [];
    if (s.currentChoices.length > 0) {
      currentChoices = s.currentChoices.map(c => ({ text: c.text, index: c.index }));
      setChoices(currentChoices);
    } else {
      // End of story!
      setChoices([]);
      if (!s.canContinue) {
         isEnding = true;
      }
    }

    // Auto-save
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
    
    // Auto-scroll logic
    setTimeout(() => {
      const decisionBlocks = document.querySelectorAll('.decision-block');
      const mainEl = document.querySelector('main.main-scroll');
      
      if (chosenText && decisionBlocks.length > 0) {
        // Scroll slightly above the latest decision
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
        // Default scroll to bottom
        if (mainEl) {
          mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      }
    }, 50);

  }, [dialogueLines, showToast, syncVariables]);

  const handleChoice = (idx: number) => {
    if (!storyRef.current) return;
    storyRef.current.ChooseChoiceIndex(idx);
    
    // Extract chosen text
    const chosenText = choices.find(c => c.index === idx)?.text || '(Selected Option)';
    
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
        <header className="mb-16 text-center space-y-4">
          <BookOpen className="w-8 h-8 mx-auto text-slate-800 dark:text-zinc-200 opacity-80" />
          <h1 className="text-3xl md:text-5xl font-serif text-slate-900 dark:text-white tracking-tight">
            The Reading Room
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 max-w-lg mx-auto text-sm md:text-base font-serif italic">
            Immersive, choice-driven stories. Every decision permanently alters the narrative.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {STORIES.map(story => {
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
                  <div className="mb-4">
                     <div className="text-[10px] font-sans font-black tracking-[0.2em] uppercase text-indigo-500 dark:text-indigo-400 mb-1">
                        {story.episode}
                     </div>
                     <h3 className="text-2xl font-serif text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
      </div>
    );
  }

  const activeStory = STORIES.find(s => s.id === activeStoryId.current);

  return (
    <div className={`relative min-h-screen font-serif transition-colors duration-1000 ${activeStory?.theme ? `bg-gradient-to-br ${activeStory.theme}` : 'bg-white dark:bg-zinc-950'}`}>
      {/* Immersive Background Illustration */}
      {currentSceneImg && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 z-10" />
          <div className="absolute inset-0 opacity-40 blur-xl scale-110">
            <StoryImage prompt={currentSceneImg} />
          </div>
          <div className="absolute inset-0 opacity-20 bg-grid-white/[0.05]" />
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

      <div className="relative z-20 max-w-2xl mx-auto px-4 md:px-0 pt-4 pb-12 min-h-full">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="px-5 py-2.5 rounded-full font-sans font-bold text-xs tracking-widest uppercase shadow-xl flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            {toast.msg}
          </div>
        </div>
      )}

      {/* Minimal Header */}
      <header className="shrink-0 py-4 mb-8 flex items-center justify-between border-b mx-4 md:mx-0 border-white/10 backdrop-blur-md bg-black/10 rounded-2xl px-6">
        <button onClick={restartStory} className="text-white hover:text-indigo-200 transition-colors flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest group">
          <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        
        <div className="flex items-center gap-4 sm:gap-6 font-sans text-xs font-bold text-white/80">
          <div className="flex items-center gap-1.5" title="XP">
            <Award className="w-3.5 h-3.5" /> {totalXp}
          </div>
          <div className="flex items-center gap-1.5" title="Naira">
            <Wallet className="w-3.5 h-3.5" /> ₦{naira}
          </div>
          <div className="flex items-center gap-1.5" title="Battery">
            <Battery className="w-3.5 h-3.5" /> {battery}%
          </div>
        </div>
      </header>

      {/* Elegant Novel Reading Area */}
      <div 
        id="story-dialogue-container"
        className="px-4 md:px-8 space-y-6 pb-2"
      >
        <div className="w-full h-px bg-white/10 mb-8" />
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
            return (
              <div key={i} className="py-10 text-center animate-in zoom-in-95 duration-700">
                {line.image && (
                  <div className="w-full mb-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 transition-transform hover:scale-[1.01] duration-500">
                    <StoryImage prompt={line.image} />
                  </div>
                )}
                <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-sans text-[11px] font-black tracking-[0.25em] uppercase shadow-xl">
                  {line.text.replace(/^[📍⏰]\s*/, '')}
                </div>
              </div>
            );
          }

          if (line.speaker === 'Decision') {
            return (
              <div key={i} className="decision-block my-10 p-6 pl-8 border-l-4 border-indigo-400 bg-white/10 backdrop-blur-md border-y border-r border-white/10 rounded-r-3xl shadow-2xl animate-in slide-in-from-left duration-700">
                <div className="text-indigo-400 font-sans font-black text-[11px] tracking-widest uppercase mb-2 opacity-90 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></div>
                  Your Choice
                </div>
                <div className="text-xl md:text-2xl font-serif text-white font-medium italic">
                  {line.text}
                </div>
              </div>
            );
          }

          if (line.speaker === 'System' || !line.speaker) {
            return (
              <div key={i} className="py-4 text-white/90 md:text-xl leading-relaxed md:leading-[1.9] drop-shadow-sm font-medium">
                 {line.image && (
                   <div className="w-full my-8 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 transition-transform hover:scale-[1.01] duration-500">
                     <StoryImage prompt={line.image} />
                   </div>
                 )}
                {line.text}
              </div>
            );
          }

          // Spoken dialogue formatting
          return (
            <div key={i} className="py-4 leading-relaxed md:leading-[1.9] md:text-xl text-white drop-shadow-md animate-in fade-in duration-500">
              <span className="font-sans font-black text-[12px] uppercase tracking-widest text-indigo-300 mr-4 inline-flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-0.5 overflow-hidden shadow-lg">
                  <img 
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${line.speaker.replace(/\s+/g, '')}&backgroundColor=transparent`} 
                    alt={line.speaker} 
                    className="w-full h-full pointer-events-none select-none"
                    loading="lazy"
                  />
                </div>
                {line.speaker}
              </span> 
              <span className="font-medium italic leading-relaxed">
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
                className="w-full text-left py-4 px-6 rounded-2xl border border-white/10 hover:border-white/30 text-white/90 hover:text-white transition-all font-sans text-base flex justify-between items-center group
                           focus:outline-none focus:ring-2 focus:ring-white/20 bg-white/10 backdrop-blur-xl hover:bg-white/20 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-y-0 left-0 bg-white/5 pointer-events-none group-hover:w-full transition-all duration-700" style={{ width: '0%' }} />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-2 h-2 rounded-full bg-white/30 group-hover:bg-white transition-colors"></div>
                  <span className="font-bold">{c.text}</span>
                </div>
                <div className="flex items-center gap-2 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="text-[10px] font-sans font-black uppercase tracking-widest text-indigo-300">Community: {mockPercent}%</div>
                   <ChevronRight className="w-4 h-4 text-indigo-300" />
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
