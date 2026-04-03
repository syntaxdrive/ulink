import { useState } from 'react';
import { Maximize2, Minimize2, Gamepad2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function ArcadePage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameUrl = "https://smashkarts.io/";

  return (
    <div className={`transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-[100] bg-black' : ''}`}>
      <Helmet>
        <title>Arcade | UniLink</title>
      </Helmet>

      {/* Header Area */}
      {!isFullscreen && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
             <div className="p-3 bg-indigo-600/20 text-indigo-500 dark:text-indigo-400 rounded-xl">
                <Gamepad2 size={28} />
             </div>
             <div>
               <h1 className="text-3xl font-bold text-slate-900 dark:text-white">UniLink Arcade</h1>
               <p className="text-slate-500 dark:text-zinc-400">SmashKarts Multiplayer Lounge</p>
             </div>
          </div>
        </div>
      )}

      {/* Game Embed Container */}
      <div className={`relative w-full rounded-2xl overflow-hidden shadow-2xl ${isFullscreen ? 'h-full rounded-none' : 'h-[70vh] md:h-[80vh] ring-1 ring-slate-200 dark:ring-white/10'}`}>
        
        {/* Fullscreen Toggle Button */}
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-4 right-4 z-10 p-2.5 bg-black/50 hover:bg-black/80 text-white rounded-xl backdrop-blur-md transition-colors shadow-lg"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>

        {/* The Game */}
        <iframe 
          src={gameUrl}
          className="w-full h-full border-0"
          title="SmashKarts"
          allow="autoplay; fullscreen; gamepad"
          scrolling="no"
        />
      </div>
    </div>
  );
}
