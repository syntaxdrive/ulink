import { useState, useRef, useEffect, useCallback } from 'react';
import {
    X, Send, Brain, RotateCcw, History, ImagePlus, Mic, Volume2, Square,
    Phone, PhoneOff, Clock, ChevronLeft, Trash2, MessageSquare,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { streamChatCompletion, buildCourseSystemPrompt, synthesizeSpeech } from '../../../services/aiService';
import type { ChatMessage, MessageContentPart } from '../../../services/aiService';
import type { Course } from '../../../types/courses';
import { findRelevantChunks, isDocumentRelevant } from '../utils/docChunker';

interface Props {
    course: Course;
    onClose: () => void;
    documentName?: string;
    documentText?: string | null;
    initialPrompt?: string;
    embedded?: boolean;          // render inline (no fixed positioning)
    externalPrompt?: string;     // prompt to send from parent
    externalPromptKey?: number;  // increment to trigger a new send
    otherDocuments?: { name: string; text: string }[]; // other course docs for cross-reference
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatSession {
    id: string;
    timestamp: number;
    preview: string;
    messageCount: number;
    messages: ChatMessage[];
}

// ─── Speech API detection ─────────────────────────────────────────────────────
const SpeechRecognitionAPI =
    typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;
const hasSpeechRecognition = !!SpeechRecognitionAPI;
const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;

function getBestVoice(): SpeechSynthesisVoice | null {
    if (!hasSpeechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const matchers: ((v: SpeechSynthesisVoice) => boolean)[] = [
        v => /google us english/i.test(v.name),
        v => /google uk english female/i.test(v.name),
        v => /google uk english/i.test(v.name),
        v => /google/i.test(v.name) && v.lang.startsWith('en'),
        v => /microsoft.*aria/i.test(v.name),
        v => /microsoft.*jenny/i.test(v.name),
        v => /microsoft.*natasha/i.test(v.name),
        v => /microsoft/i.test(v.name) && v.lang.startsWith('en'),
        v => /(premium|enhanced|neural|natural)/i.test(v.name) && v.lang.startsWith('en'),
        v => v.lang === 'en-US' && !v.localService,
        v => v.lang.startsWith('en') && !v.localService,
        v => v.lang.startsWith('en'),
    ];
    for (const match of matchers) {
        const found = voices.find(match);
        if (found) return found;
    }
    return voices[0] ?? null;
}

function stripMarkdown(text: string): string {
    return text
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*(.+?)\*\*/gs, '$1')
        .replace(/\*(.+?)\*/gs, '$1')
        .replace(/`{3}[\s\S]*?`{3}/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[(.+?)\]\(.+?\)/g, '$1')
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        .replace(/^>\s+/gm, '')
        .replace(/\n{2,}/g, '\n')
        .trim();
}

// Soft two-tone ascending chime played the instant the mic opens.
// Signals "you can speak now" and covers the ~200 ms browser mic-init window.
function playReadyChime() {
    try {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (!AC) return;
        const ctx = new AC() as AudioContext;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
        // C6 (1047 Hz) → G6 (1568 Hz): friendly ascending interval
        [1047, 1568].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(gain);
            osc.start(ctx.currentTime + i * 0.13);
            osc.stop(ctx.currentTime + i * 0.13 + 0.22);
        });
        // Auto-close context after chime finishes to free resources
        setTimeout(() => ctx.close().catch(() => {}), 600);
    } catch {}
}

function relativeTime(ts: number): string {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 172800000) return 'yesterday';
    return new Date(ts).toLocaleDateString();
}

function getSuggestedQuestions(course: Course): string[] {
    const title = course.title;
    const topic = course.tags?.[0] || course.category;
    const suggestions = [
        `Give me a simple overview of "${title}"`,
        `What are the key concepts in ${topic}?`,
        `Quiz me with 3 questions about ${topic}`,
        `What real-world applications does ${topic} have?`,
        `What should I know before starting this course?`,
        `Summarize the most important things from this course`,
    ];
    if (course.level === 'Beginner') return [suggestions[0], suggestions[4], suggestions[1], suggestions[3]];
    return [suggestions[1], suggestions[2], suggestions[3], suggestions[5]];
}

// ─── Animated AI Sphere ───────────────────────────────────────────────────────
function AISphere({ size = 56, speaking = false, listening = false, thinking = false }: {
    size?: number; speaking?: boolean; listening?: boolean; thinking?: boolean;
}) {
    const bg = speaking
        ? 'radial-gradient(ellipse at 33% 30%, #6ee7b7, #10b981 35%, #047857 65%, #022c22 90%)'
        : listening
        ? 'radial-gradient(ellipse at 33% 30%, #6ee7b7, #10b981 35%, #047857 65%, #022c22 90%)'
        : 'radial-gradient(ellipse at 33% 30%, #9ca3af, #4b5563 30%, #1f2937 60%, #030712 90%)';

    const glowColor = speaking
        ? 'rgba(16, 185, 129, 0.4)'
        : listening
        ? 'rgba(16, 185, 129, 0.4)'
        : 'rgba(31, 41, 55, 0.3)';

    const isActive = speaking || listening || thinking;

    return (
        <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
            {/* Outer pulse rings */}
            {isActive && (
                <>
                    <div className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`, animationDuration: '2s' }} />
                    <div className="absolute -inset-1 rounded-full animate-pulse opacity-30"
                        style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 60%)`, animationDuration: '1.5s' }} />
                </>
            )}
            {/* Sphere body */}
            <div className="absolute inset-0 rounded-full"
                style={{
                    background: bg,
                    boxShadow: `0 ${size / 4}px ${size / 1.5}px ${glowColor}, inset 0 ${size / 10}px ${size / 5}px rgba(255,255,255,0.2)`,
                }}>
                {/* Specular highlight */}
                <div style={{
                    position: 'absolute', top: '10%', left: '14%',
                    width: '38%', height: '26%', borderRadius: '50%',
                    background: 'radial-gradient(ellipse, rgba(255,255,255,0.45), transparent)',
                    transform: 'rotate(-15deg)',
                }} />
                {/* Bottom depth */}
                <div style={{
                    position: 'absolute', bottom: '6%', right: '10%',
                    width: '25%', height: '18%', borderRadius: '50%',
                    background: 'radial-gradient(ellipse, rgba(0,0,0,0.25), transparent)',
                }} />
            </div>
            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
                {thinking
                    ? <div className="flex gap-0.5">
                        {[0, 150, 300].map(d => (
                            <div key={d} className="w-1 h-1 bg-white rounded-full animate-bounce"
                                style={{ animationDelay: `${d}ms`, animationDuration: '1s' }} />
                        ))}
                    </div>
                    : <Brain style={{ width: size * 0.38, height: size * 0.38, color: 'white', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }} />
                }
            </div>
        </div>
    );
}

// ─── History Panel ─────────────────────────────────────────────────────────────
function HistoryPanel({ sessions, onLoad, onDelete, onClose }: {
    sessions: ChatSession[];
    onLoad: (s: ChatSession) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}) {
    return (
        <div className="absolute inset-0 z-10 flex flex-col bg-white dark:bg-zinc-950 animate-in slide-in-from-right duration-200">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex-shrink-0">
                <button onClick={onClose}
                    className="p-2 rounded-xl text-slate-500 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-500" />
                    <span className="font-semibold text-slate-800 dark:text-zinc-100 text-sm">Past Conversations</span>
                </div>
                <span className="ml-auto text-xs text-slate-400 dark:text-zinc-600">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
            </div>

            {sessions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
                    <MessageSquare className="w-10 h-10 text-slate-200 dark:text-zinc-800" />
                    <p className="text-sm text-slate-500 dark:text-zinc-500">No past conversations yet</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-900">
                    {sessions.slice().reverse().map(s => (
                        <div key={s.id}
                            className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-zinc-900/50 cursor-pointer group transition-colors"
                            onClick={() => onLoad(s)}>
                            <div className="mt-0.5">
                                <AISphere size={32} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-700 dark:text-zinc-200 truncate font-medium">{s.preview}</p>
                                <p className="text-xs text-slate-400 dark:text-zinc-600 mt-0.5">
                                    {s.messageCount} messages · {relativeTime(s.timestamp)}
                                </p>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); onDelete(s.id); }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all flex-shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function MarkdownContent({ content }: { content: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>,
                em: ({ children }) => <em className="italic text-slate-600 dark:text-zinc-300">{children}</em>,
                h1: ({ children }) => <h1 className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1.5 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5 first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-200 mt-2 mb-1 first:mt-0">{children}</h3>,
                ul: ({ children }) => <ul className="my-2 space-y-1 pl-5 list-disc marker:text-slate-400 dark:marker:text-zinc-500">{children}</ul>,
                ol: ({ children }) => <ol className="my-2 space-y-1 pl-5 list-decimal marker:text-slate-400 dark:marker:text-zinc-500">{children}</ol>,
                li: ({ children }) => <li className="text-slate-700 dark:text-zinc-200 leading-relaxed pl-1">{children}</li>,
                code: ({ children, className }) => {
                    const isBlock = className?.startsWith('language-');
                    if (isBlock) {
                        return (
                            <code className="block bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 font-mono overflow-x-auto my-2 whitespace-pre">
                                {children}
                            </code>
                        );
                    }
                    return <code className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-xs text-zinc-700 dark:text-zinc-300 font-mono">{children}</code>;
                },
                pre: ({ children }) => <pre className="my-2">{children}</pre>,
                blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-zinc-400 dark:border-zinc-600 pl-3 my-2 text-slate-500 dark:text-zinc-400 italic">{children}</blockquote>
                ),
                a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                        className="text-zinc-800 dark:text-zinc-200 underline underline-offset-2 hover:text-black dark:hover:text-white font-medium">{children}</a>
                ),
                table: ({ children }) => (
                    <div className="overflow-x-auto my-2">
                        <table className="text-xs border-collapse w-full">{children}</table>
                    </div>
                ),
                th: ({ children }) => <th className="border border-slate-200 dark:border-zinc-700 px-2 py-1 bg-slate-100 dark:bg-zinc-800 font-semibold text-left text-slate-700 dark:text-zinc-200">{children}</th>,
                td: ({ children }) => <td className="border border-slate-200 dark:border-zinc-700 px-2 py-1 text-slate-600 dark:text-zinc-300">{children}</td>,
                hr: () => <hr className="border-slate-200 dark:border-zinc-700 my-3" />,
            }}
        >
            {content}
        </ReactMarkdown>
    );
}

// ─── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
    const isUser = msg.role === 'user';

    if (Array.isArray(msg.content)) {
        const parts = msg.content as MessageContentPart[];
        const image = parts.find(p => p.type === 'image_url');
        const text = parts.find(p => p.type === 'text');
        return (
            <div className={`max-w-[85%] flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
                {image && (
                    <img src={(image as any).image_url.url} alt="Uploaded"
                        className="rounded-2xl max-h-52 max-w-full object-contain border border-white/10 shadow-lg" />
                )}
                {text?.text && (
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isUser
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-tr-sm shadow-sm whitespace-pre-wrap'
                            : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 rounded-tl-sm border border-slate-200 dark:border-zinc-800 shadow-sm'
                    }`}>
                        {isUser ? text.text : <MarkdownContent content={text.text} />}
                    </div>
                )}
            </div>
        );
    }

    if (isUser) {
        return (
            <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed whitespace-pre-wrap bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm">
                {msg.content as string}
            </div>
        );
    }

    const content = msg.content as string;
    if (!content) {
        return (
            <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
                <span className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
            </div>
        );
    }

    return (
        <div className="max-w-[82%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <MarkdownContent content={content} />
        </div>
    );
}

// ─── Voice Call Panel ─────────────────────────────────────────────────────────
function VoiceCallPanel({
    isListening, isSpeaking, isThinking, isInterruptible, interimText, onEnd, onInterrupt,
}: {
    isListening: boolean; isSpeaking: boolean; isThinking: boolean;
    isInterruptible: boolean; interimText: string;
    onEnd: () => void; onInterrupt: () => void;
}) {
    const status = isSpeaking
        ? (isInterruptible ? 'Tap to interrupt' : 'UAI is speaking…')
        : isThinking ? 'Thinking…'
        : isListening ? 'Listening…'
        : 'Preparing connection, please wait…';

    return (
        <div className="flex-shrink-0 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 pt-5 pb-6">
            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={isSpeaking ? onInterrupt : undefined}
                    disabled={!isSpeaking}
                    className={`focus:outline-none transition-transform ${isSpeaking ? 'active:scale-95 cursor-pointer' : ''}`}>
                    <AISphere size={80} speaking={isSpeaking} listening={isListening} thinking={isThinking} />
                </button>

                <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">{status}</p>
                    {interimText && (
                        <p className="text-xs text-slate-400 dark:text-zinc-500 italic mt-1 max-w-xs text-center">
                            "{interimText}"
                        </p>
                    )}
                </div>

                <button onClick={onEnd}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-2xl transition-colors shadow-lg shadow-red-500/30">
                    <PhoneOff className="w-4 h-4" />
                    End Call
                </button>
            </div>
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function CourseAIChat({ course, onClose, documentName, documentText, initialPrompt, embedded, externalPrompt, externalPromptKey, otherDocuments }: Props) {
    const storageKey = `ulink_chat_${course.id}${documentName ? `_${documentName.replace(/\W/g, '_')}` : ''}`;
    const historyKey = `${storageKey}_history`;

    const loadHistory = (): ChatSession[] => {
        try { return JSON.parse(localStorage.getItem(historyKey) ?? '[]'); } catch { return []; }
    };
    const saveHistory = (h: ChatSession[]) => {
        try { localStorage.setItem(historyKey, JSON.stringify(h.slice(-20))); } catch {}
    };

    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) return JSON.parse(stored) as ChatMessage[];
        } catch {}
        return [];
    });
    const [sessions, setSessions] = useState<ChatSession[]>(loadHistory);
    const [showHistory, setShowHistory] = useState(false);
    const [input, setInput] = useState('');
    const [imageData, setImageData] = useState<string | null>(null);
    const [streaming, setStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
    const [voiceMode, setVoiceMode] = useState(false);
    const [interimText, setInterimText] = useState('');
    const [isInterruptible, setIsInterruptible] = useState(false);

    // Stable refs
    const voiceLoopRef = useRef(false);
    const streamingRef = useRef(false);
    const listeningActiveRef = useRef(false);
    const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const interruptRecognitionRef = useRef<any>(null);
    const abortRef = useRef<AbortController | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);  // OpenAI TTS audio
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);
    const messagesRef = useRef<ChatMessage[]>(messages);
    const hasHistory = useRef(messages.length > 0);
    const sendRef = useRef<(text: string) => void>(() => {});

    useEffect(() => { messagesRef.current = messages; }, [messages]);
    useEffect(() => { streamingRef.current = streaming; }, [streaming]);

    const archiveCurrentSession = useCallback(() => {
        const msgs = messagesRef.current;
        if (msgs.length < 2) return;
        const firstUser = msgs.find(m => m.role === 'user');
        const preview = typeof firstUser?.content === 'string'
            ? firstUser.content.slice(0, 80)
            : 'Conversation';
        const session: ChatSession = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            preview,
            messageCount: msgs.length,
            messages: msgs,
        };
        const updated = [...loadHistory(), session];
        setSessions(updated);
        saveHistory(updated);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const scheduleRestart = (delayMs: number) => {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
            restartTimerRef.current = null;
            if (voiceLoopRef.current && !streamingRef.current && !listeningActiveRef.current) {
                beginListeningVoice(true);
            }
        }, delayMs);
    };

    const stopInterruptListener = () => {
        if (interruptRecognitionRef.current) {
            try { interruptRecognitionRef.current.stop(); } catch {}
            interruptRecognitionRef.current = null;
        }
        setIsInterruptible(false);
    };

    // ── Per-query prompt refs ─────────────────────────────────────────────────
    // Keep mutable state in refs so send() always reads the latest values
    // without needing them in its dependency array (avoids stale closures).
    const documentTextRef = useRef(documentText);
    const otherDocumentsRef = useRef(otherDocuments);
    const voiceModeRef = useRef(voiceMode);
    const promptBaseRef = useRef({
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        tags: course.tags,
        authorName: course.profiles?.name ?? null,
        documentNames: course.course_documents?.map(d => d.name),
        activeDocumentName: documentName,
    });
    useEffect(() => { documentTextRef.current = documentText; }, [documentText]);
    useEffect(() => { otherDocumentsRef.current = otherDocuments; }, [otherDocuments]);
    useEffect(() => { voiceModeRef.current = voiceMode; }, [voiceMode]);
    useEffect(() => {
        promptBaseRef.current = {
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            tags: course.tags,
            authorName: course.profiles?.name ?? null,
            documentNames: course.course_documents?.map(d => d.name),
            activeDocumentName: documentName,
        };
    }, [course, documentName]);

    const suggested = getSuggestedQuestions(course);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
        return () => {
            abortRef.current?.abort();
            voiceLoopRef.current = false;
            if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
            try { recognitionRef.current?.stop(); } catch {}
            stopInterruptListener();
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
            window.speechSynthesis?.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (initialPrompt && messages.length === 0) send(initialPrompt);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fire a new message when the parent increments externalPromptKey
    const prevExtKeyRef = useRef<number | undefined>(undefined);
    useEffect(() => {
        if (externalPromptKey !== undefined && externalPromptKey !== prevExtKeyRef.current && externalPrompt) {
            prevExtKeyRef.current = externalPromptKey;
            send(externalPrompt);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [externalPromptKey]);

    // ── Voice loop ────────────────────────────────────────────────────────────
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const beginListeningVoice = useCallback((silentStart = false) => {
        if (!hasSpeechRecognition || !voiceLoopRef.current || streamingRef.current) return;
        if (listeningActiveRef.current) return;
        stopInterruptListener();

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        let finalTranscript = '';
        let latestInterim = '';   // last interim segment seen
        let capturedText = '';    // snapshot taken at commit() before stop()
        // 4.0 s of silence before committing — gives generous time for natural speech pauses
        const SILENCE_MS = 4000;
        const MIN_WORDS  = 2;
        let silenceTimer: ReturnType<typeof setTimeout> | null = null;
        let committed = false;

        const commit = () => {
            if (committed) return;
            committed = true;
            // Capture interim text NOW, before stop() causes the engine to drop it
            capturedText = (finalTranscript + ' ' + latestInterim).trim();
            if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
            try { recognition.stop(); } catch {}
        };


        recognition.onstart = () => {
            setIsListening(true);
            if (!silentStart) playReadyChime();
        };

        recognition.onresult = (e: any) => {
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const r = e.results[i];
                if (r.isFinal) {
                    // Accept all final results — confidence varies wildly across
                    // browsers/devices; filtering by threshold drops too much speech.
                    finalTranscript += r[0].transcript + ' ';
                } else {
                    interim += r[0].transcript;
                }
            }
            latestInterim = interim;
            setInterimText((finalTranscript + interim).trim());

            // Reset silence timer on any vocal activity
            if (finalTranscript || interim) {
                if (silenceTimer) clearTimeout(silenceTimer);
                silenceTimer = setTimeout(commit, SILENCE_MS);
            }
        };

        recognition.onend = () => {
            if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
            listeningActiveRef.current = false;
            setIsListening(false);
            setInterimText('');
            // Use snapshot (includes interim captured at commit time) if available
            const toSend = (capturedText || finalTranscript).trim();
            capturedText = '';
            finalTranscript = '';
            const wordCount = toSend.split(/\s+/).filter(Boolean).length;
            if (toSend && wordCount >= MIN_WORDS && voiceLoopRef.current) {
                sendRef.current(toSend);
            } else if (toSend && wordCount === 1 && voiceLoopRef.current) {
                scheduleRestart(400);
            } else if (voiceLoopRef.current && !streamingRef.current) {
                scheduleRestart(500);
            }
        };

        recognition.onerror = (e: any) => {
            if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
            listeningActiveRef.current = false;
            setIsListening(false);
            setInterimText('');
            if (e.error === 'aborted') return;
            scheduleRestart(e.error === 'no-speech' ? 400 : 1500);
        };

        recognitionRef.current = recognition;
        listeningActiveRef.current = true;
        try { recognition.start(); }
        catch { listeningActiveRef.current = false; scheduleRestart(800); }
    }, []);

    const startInterruptListener = useCallback(() => {
        if (!hasSpeechRecognition || !voiceLoopRef.current || listeningActiveRef.current) return;
        if (interruptRecognitionRef.current) return;
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onresult = () => {
            // Stop both OpenAI audio and browser TTS
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
            window.speechSynthesis?.cancel();
            setSpeakingIndex(null);
            setIsInterruptible(false);
            try { recognition.stop(); } catch {}
            interruptRecognitionRef.current = null;
            setTimeout(() => { if (voiceLoopRef.current) beginListeningVoice(true); }, 150);
        };
        recognition.onend = () => {
            if (interruptRecognitionRef.current === recognition) { interruptRecognitionRef.current = null; setIsInterruptible(false); }
        };
        recognition.onerror = () => {
            if (interruptRecognitionRef.current === recognition) { interruptRecognitionRef.current = null; setIsInterruptible(false); }
        };
        try { recognition.start(); interruptRecognitionRef.current = recognition; setIsInterruptible(true); } catch {}
    }, [beginListeningVoice]);

    const handleManualInterrupt = useCallback(() => {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        window.speechSynthesis?.cancel();
        setSpeakingIndex(null);
        stopInterruptListener();
        setTimeout(() => { if (voiceLoopRef.current) beginListeningVoice(true); }, 150);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [beginListeningVoice]);

    const speakForVoice = useCallback(async (text: string, onComplete: () => void) => {
        // Stop any existing playback
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        window.speechSynthesis?.cancel();

        const stripped = stripMarkdown(text);
        setSpeakingIndex(messagesRef.current.length - 1);

        // Safety: if neither TTS path fires onComplete within 12 s, restart listening.
        // 12 s covers 2-4 sentence responses at normal speech rate.
        let done = false;
        const safeComplete = () => { if (done) return; done = true; clearTimeout(safetyTimer); setSpeakingIndex(null); stopInterruptListener(); onComplete(); };
        const safetyTimer = setTimeout(safeComplete, 12_000);

        // ── Browser TTS fallback ──────────────────────────────────────────────
        const browserFallback = () => {
            if (!hasSpeechSynthesis) { clearTimeout(safetyTimer); safeComplete(); return; }
            const utterance = new SpeechSynthesisUtterance(stripped);
            utterance.rate = 1.08; utterance.pitch = 1.0; utterance.volume = 1.0;
            let utteranceStarted = false;
            const doSpeak = () => {
                if (done || utteranceStarted) return; // prevent double-call
                utteranceStarted = true;
                const voice = getBestVoice();
                if (voice) utterance.voice = voice;
                const t = setTimeout(() => startInterruptListener(), 600);
                const finish = () => { clearTimeout(t); clearTimeout(safetyTimer); stopInterruptListener(); safeComplete(); };
                utterance.onend = finish;
                utterance.onerror = finish;
                window.speechSynthesis.speak(utterance);
            };
            if (window.speechSynthesis.getVoices().length > 0) {
                doSpeak();
            } else {
                // Start after short delay; cancel the timeout if voiceschanged fires first
                const voicesTimer = setTimeout(doSpeak, 250);
                window.speechSynthesis.addEventListener('voiceschanged', () => { clearTimeout(voicesTimer); doSpeak(); }, { once: true });
            }
        };

        // ── Try OpenAI TTS (neural, human-sounding) ──────────────────────────
        const buffer = await synthesizeSpeech(stripped);
        if (!voiceLoopRef.current) { clearTimeout(safetyTimer); return; } // call ended during fetch
        if (buffer) {
            const blob = new Blob([buffer], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;
            const t = setTimeout(() => startInterruptListener(), 600);
            const cleanup = () => {
                clearTimeout(t);
                URL.revokeObjectURL(url);
                audioRef.current = null;
            };
            audio.onended = () => { cleanup(); safeComplete(); };
            audio.onerror = () => { cleanup(); browserFallback(); };
            audio.play().catch(() => { cleanup(); browserFallback(); });
            return;
        }

        // OpenAI TTS unavailable — use browser voice
        browserFallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startInterruptListener]);

    const startVoiceCall = useCallback(() => {
        if (!hasSpeechRecognition) return;
        window.speechSynthesis?.cancel();
        setSpeakingIndex(null);
        voiceLoopRef.current = true;
        setVoiceMode(true);
        beginListeningVoice(false);
    }, [beginListeningVoice]);

    const stopVoiceCall = useCallback(() => {
        voiceLoopRef.current = false;
        setVoiceMode(false);
        setIsListening(false);
        setInterimText('');
        setIsInterruptible(false);
        listeningActiveRef.current = false;
        if (restartTimerRef.current) { clearTimeout(restartTimerRef.current); restartTimerRef.current = null; }
        try { recognitionRef.current?.stop(); } catch {}
        stopInterruptListener();
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        window.speechSynthesis?.cancel();
        setSpeakingIndex(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startListening = () => {
        if (!hasSpeechRecognition) return;
        if (isListening) { try { recognitionRef.current?.stop(); } catch {} return; }
        const r = new SpeechRecognitionAPI();
        r.continuous = false; r.interimResults = false; r.lang = 'en-US';
        r.onresult = (e: any) => {
            const t = Array.from(e.results as any[]).map((r: any) => r[0].transcript).join(' ');
            setInput(prev => (prev ? prev + ' ' : '') + t);
        };
        r.onend = () => setIsListening(false);
        r.onerror = () => setIsListening(false);
        recognitionRef.current = r;
        try { r.start(); setIsListening(true); } catch {}
    };

    const speak = async (text: string, index: number) => {
        // Toggle off if already speaking this message
        if (audioRef.current && speakingIndex === index) {
            audioRef.current.pause(); audioRef.current = null;
            window.speechSynthesis?.cancel(); setSpeakingIndex(null); return;
        }
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        window.speechSynthesis?.cancel();

        const stripped = stripMarkdown(text);
        setSpeakingIndex(index);

        const browserFallback = () => {
            if (!hasSpeechSynthesis) { setSpeakingIndex(null); return; }
            const utterance = new SpeechSynthesisUtterance(stripped);
            utterance.rate = 1.05; utterance.pitch = 1.0; utterance.volume = 1.0;
            const doSpeak = () => {
                const voice = getBestVoice();
                if (voice) utterance.voice = voice;
                utterance.onend = () => setSpeakingIndex(null);
                utterance.onerror = () => setSpeakingIndex(null);
                window.speechSynthesis.speak(utterance);
            };
            if (window.speechSynthesis.getVoices().length > 0) doSpeak();
            else window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
        };

        const buffer = await synthesizeSpeech(stripped);
        if (buffer) {
            const blob = new Blob([buffer], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => { URL.revokeObjectURL(url); audioRef.current = null; setSpeakingIndex(null); };
            audio.onerror = () => { URL.revokeObjectURL(url); audioRef.current = null; browserFallback(); };
            audio.play().catch(() => { URL.revokeObjectURL(url); audioRef.current = null; browserFallback(); });
            return;
        }
        browserFallback();
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setImageData(reader.result as string);
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const send = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if ((!trimmed && !imageData) || streaming) return;
        setError(null); setInput('');

        let userContent: ChatMessage['content'];
        if (imageData) {
            const parts: MessageContentPart[] = [
                { type: 'image_url', image_url: { url: imageData, detail: 'auto' } },
                { type: 'text', text: trimmed || 'What is in this image? Explain it in the context of my studies.' },
            ];
            userContent = parts; setImageData(null);
        } else { userContent = trimmed; }

        const userMsg: ChatMessage = { role: 'user', content: userContent };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setStreaming(true); streamingRef.current = true;
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        const controller = new AbortController();
        abortRef.current = controller;
        let fullResponseText = '';

        // Build a per-query system prompt — send only the document chunks that
        // are relevant to this specific message, not the entire document every time.
        const isVoice = voiceModeRef.current;
        const activeText = documentTextRef.current;
        const others = otherDocumentsRef.current ?? [];

        const relevantActiveText = activeText
            ? findRelevantChunks(activeText, trimmed, isVoice ? 20000 : 100000)
            : null;

        // Skip other-doc lookup in voice mode (conversations run long, save tokens)
        const relevantOthers = (!isVoice && others.length > 0)
            ? others
                .filter(d => isDocumentRelevant(d.name, d.text, trimmed))
                .map(d => ({ name: d.name, text: findRelevantChunks(d.text, trimmed, 1200) }))
                .slice(0, 3)
            : [];

        const dynamicPrompt = buildCourseSystemPrompt({
            ...promptBaseRef.current,
            activeDocumentText: relevantActiveText,
            otherDocuments: relevantOthers.length > 0 ? relevantOthers : undefined,
            isVoiceMode: isVoice,
        });

        await streamChatCompletion(
            [{ role: 'system', content: dynamicPrompt }, ...updatedMessages],
            {
                onChunk: (chunk) => {
                    fullResponseText += chunk;
                    setMessages(prev => {
                        const next = [...prev];
                        const last = next[next.length - 1];
                        next[next.length - 1] = { ...last, content: (last.content as string) + chunk };
                        return next;
                    });
                },
                onDone: () => {
                    setStreaming(false); streamingRef.current = false;
                    try { localStorage.setItem(storageKey, JSON.stringify(messagesRef.current)); } catch {}
                    if (voiceLoopRef.current && fullResponseText) {
                        speakForVoice(fullResponseText, () => { if (voiceLoopRef.current) beginListeningVoice(); });
                    } else if (voiceLoopRef.current) {
                        beginListeningVoice();
                    }
                },
                onError: (err) => {
                    setStreaming(false); streamingRef.current = false;
                    setError(err.message);
                    setMessages(prev => prev[prev.length - 1]?.content === '' ? prev.slice(0, -1) : prev);
                    if (voiceLoopRef.current) scheduleRestart(1000);
                },
            },
            controller.signal
        );
    }, [messages, streaming, imageData, storageKey, speakForVoice, beginListeningVoice]);

    sendRef.current = send;

    const reset = () => {
        archiveCurrentSession();
        abortRef.current?.abort();
        stopVoiceCall();
        setMessages([]); setInput(''); setImageData(null); setError(null); setStreaming(false);
        try { localStorage.removeItem(storageKey); } catch {}
        hasHistory.current = false;
    };

    const loadSession = (session: ChatSession) => {
        archiveCurrentSession();
        setMessages(session.messages);
        try { localStorage.setItem(storageKey, JSON.stringify(session.messages)); } catch {}
        setShowHistory(false);
        hasHistory.current = true;
    };

    const deleteSession = (id: string) => {
        const updated = sessions.filter(s => s.id !== id);
        setSessions(updated);
        saveHistory(updated);
    };

    const isSpeaking = speakingIndex !== null;

    return (
        <div className={embedded ? 'flex flex-col h-full bg-white dark:bg-zinc-950' : 'fixed inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950'}>

            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-zinc-900 dark:bg-black flex-shrink-0">
                <AISphere size={40} speaking={isSpeaking && voiceMode} listening={isListening && voiceMode} thinking={streaming && voiceMode} />
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-base leading-tight">UAI ✦</p>
                    <p className={`text-xs truncate transition-colors font-medium ${voiceMode ? 'text-emerald-300' : 'text-violet-200'}`}>
                        {voiceMode ? '● Voice call active' : (documentName ?? course.title)}
                    </p>
                </div>

                {/* History */}
                <button onClick={() => setShowHistory(true)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Conversation history">
                    <Clock className="w-4 h-4" />
                </button>

                {/* Voice call */}
                {hasSpeechRecognition && hasSpeechSynthesis && (
                    <button
                        onClick={voiceMode ? stopVoiceCall : startVoiceCall}
                        className={`p-2 rounded-xl transition-colors ${
                            voiceMode
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : 'text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={voiceMode ? 'End voice call' : 'Start voice call'}>
                        {voiceMode ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    </button>
                )}

                {/* New chat */}
                {messages.length > 0 && !voiceMode && (
                    <button onClick={reset}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                        title="New conversation">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                )}

                <button onClick={onClose}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 min-h-0 relative bg-slate-50 dark:bg-zinc-950">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
                        {/* Hero orb */}
                        <div className="flex flex-col items-center gap-4">
                            <AISphere size={88} />
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Hey, I'm UAI ✦</h3>
                                <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-[280px] leading-relaxed">
                                    Your AI study companion for{' '}
                                    <span className="text-violet-600 dark:text-violet-400 font-semibold">{course.title}</span>
                                    {hasSpeechRecognition && (
                                        <>. Tap <Phone className="w-3.5 h-3.5 inline mx-0.5 text-emerald-500" /> to talk hands-free</>
                                    )}.
                                </p>
                            </div>
                        </div>

                        {/* Suggestion chips */}
                        <div className="flex flex-col gap-2.5 w-full max-w-sm">
                            <p className="text-xs font-semibold text-slate-400 dark:text-zinc-600 uppercase tracking-widest text-center">Try asking</p>
                            {suggested.map((q, i) => (
                                <button key={i} onClick={() => send(q)}
                                    className="text-left px-4 py-3.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-2xl text-sm text-slate-700 dark:text-zinc-300 transition-all shadow-sm font-medium">
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {hasHistory.current && (
                            <div className="flex items-center gap-2 py-1">
                                <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-800" />
                                <span className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-600 px-2">
                                    <History className="w-3 h-3" />
                                    Previous session
                                </span>
                                <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-800" />
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="flex-shrink-0 mt-0.5">
                                        <AISphere size={30} speaking={speakingIndex === i} thinking={streaming && i === messages.length - 1} />
                                    </div>
                                )}
                                <div className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <MessageBubble msg={msg} />
                                    {msg.role === 'assistant' && typeof msg.content === 'string' && msg.content && hasSpeechSynthesis && !voiceMode && (
                                        <button
                                            onClick={() => speak(msg.content as string, i)}
                                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                                                speakingIndex === i
                                                    ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800'
                                                    : 'text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-400'
                                            }`}>
                                            {speakingIndex === i
                                                ? <><Square className="w-2.5 h-2.5" /> Stop</>
                                                : <><Volume2 className="w-2.5 h-2.5" /> Listen</>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {error && (
                    <div className="px-4 py-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                        <span className="text-base leading-none mt-0.5">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* ── Voice call panel OR input ── */}
            {voiceMode ? (
                <VoiceCallPanel
                    isListening={isListening} isSpeaking={isSpeaking} isThinking={streaming}
                    isInterruptible={isInterruptible} interimText={interimText}
                    onEnd={stopVoiceCall} onInterrupt={handleManualInterrupt}
                />
            ) : (
                <div className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
                    {/* Quick suggestion chips */}
                    {messages.length > 0 && !streaming && (
                        <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto scrollbar-none">
                            {suggested.slice(0, 3).map((q, i) => (
                                <button key={i} onClick={() => send(q)}
                                    className="flex-shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors whitespace-nowrap">
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="px-4 pb-4 pt-2 space-y-2">
                        {imageData && (
                            <div className="relative inline-flex mb-1">
                                <img src={imageData} alt="Attached" className="h-20 rounded-2xl object-cover border border-slate-200 dark:border-zinc-700 shadow-sm" />
                                <button onClick={() => setImageData(null)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-600 dark:bg-zinc-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors shadow">
                                    <X className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        )}

                        {/* Input row */}
                        <div className="flex items-end gap-2.5">
                            <div className="flex items-end gap-1.5 flex-1 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2.5 focus-within:border-violet-400 dark:focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-400/20 transition-all">
                                <button onClick={() => imageInputRef.current?.click()}
                                    className="p-1 text-slate-400 dark:text-zinc-500 hover:text-violet-500 transition-colors flex-shrink-0 mb-0.5"
                                    title="Attach image">
                                    <ImagePlus className="w-4 h-4" />
                                </button>
                                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

                                {hasSpeechRecognition && (
                                    <button onClick={startListening}
                                        className={`p-1 transition-colors flex-shrink-0 mb-0.5 rounded-lg ${
                                            isListening
                                                ? 'text-red-500 bg-red-50 dark:bg-red-950/30 animate-pulse'
                                                : 'text-slate-400 dark:text-zinc-500 hover:text-violet-500'
                                        }`}
                                        title={isListening ? 'Stop' : 'Speak'}>
                                        <Mic className="w-4 h-4" />
                                    </button>
                                )}

                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                                    placeholder={imageData ? 'Ask about this image…' : 'Ask UAI anything…'}
                                    rows={1}
                                    disabled={streaming}
                                    className="flex-1 bg-transparent text-slate-800 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-500 resize-none outline-none leading-relaxed max-h-36 overflow-y-auto disabled:opacity-50"
                                    style={{ minHeight: '28px' }}
                                />
                            </div>

                            <button onClick={() => send(input)}
                                disabled={(!input.trim() && !imageData) || streaming}
                                className="w-11 h-11 rounded-2xl bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 disabled:opacity-30 flex items-center justify-center transition-all shadow-sm flex-shrink-0 active:scale-95"
                                aria-label="Send">
                                {streaming ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>

                        <p className="text-center text-slate-400 dark:text-zinc-700 text-[10px]">UAI can make mistakes — always verify important information.</p>
                    </div>
                </div>
            )}

            {/* ── History panel ── */}
            {showHistory && (
                <HistoryPanel
                    sessions={sessions}
                    onLoad={loadSession}
                    onDelete={deleteSession}
                    onClose={() => setShowHistory(false)}
                />
            )}
        </div>
    );
}
