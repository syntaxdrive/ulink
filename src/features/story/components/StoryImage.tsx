import { useState, useEffect } from 'react';
import { STORY_PROMPTS } from '../constants/storyPrompts';

interface StoryImageProps {
  prompt: string;
  artStyle?: string;
  coverUrl?: string;
}

export function StoryImage({ prompt, artStyle, coverUrl }: StoryImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(coverUrl || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function generateImage() {
      if (coverUrl) {
        setImageUrl(coverUrl);
        setLoading(false);
        return;
      }
      if (!prompt) return;
      
      setLoading(true);
      setError(false);

      // 1. Try local asset first (Instant and 100% reliable)
      const localUrl = `/stories/images/${prompt}.png`;
      const img = new Image();
      img.src = localUrl;

      img.onload = () => {
        if (isMounted) {
          setImageUrl(localUrl);
          setLoading(false);
        }
      };

      img.onerror = () => {
        // 2. If no local asset exists, generate with AI (Stable bridge URL)
        // Using STORY_PROMPTS for rich context or defaulting to a basic prompt
        const stylePrefix = artStyle ? `${artStyle} style, ` : 'darkest dungeon style grimdark 2d comic art, ';
        const hfPrompt = STORY_PROMPTS[prompt] || `${stylePrefix} ${prompt.replace(/_/g, ' ')}`;
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(hfPrompt)}?width=800&height=400&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
        
        const aiImg = new Image();
        aiImg.src = pollinationsUrl;
        
        aiImg.onload = () => {
          if (isMounted) {
            setImageUrl(pollinationsUrl);
            setLoading(false);
          }
        };

        aiImg.onerror = () => {
          if (isMounted) {
            setError(true);
            setLoading(false);
          }
        };
      };
    }

    generateImage();

    return () => {
      isMounted = false;
    };
  }, [prompt]);

  if (loading) {
    return (
      <div className="w-full aspect-[2/1] rounded-2xl bg-slate-100 dark:bg-zinc-800/50 flex flex-col items-center justify-center gap-3 animate-pulse border-2 border-dashed border-slate-200 dark:border-zinc-700">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
          Generating Illustration...
        </span>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="w-full aspect-[2/1] rounded-2xl bg-slate-50 dark:bg-zinc-900 flex flex-col items-center justify-center gap-2 border-2 border-slate-100 dark:border-zinc-800">
        <span className="text-lg opacity-50 text-slate-400">🖼️</span>
        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
          Image Unavailable
        </span>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-transparent animate-in zoom-in-95 duration-700">
      <img
        src={imageUrl}
        alt="Story illustration"
        className="w-full h-auto max-h-[400px] object-cover"
      />
    </div>
  );
}
