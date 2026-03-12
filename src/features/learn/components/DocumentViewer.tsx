import { useState, useEffect, useRef, useCallback } from 'react';
import {
    X, Download, Brain, FileText, Loader,
    ChevronLeft, ZoomIn, ZoomOut,
    PenLine, AlignLeft, Lightbulb, GraduationCap, BookOpen, Camera, ExternalLink,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { CourseDocument, Course } from '../../../types/courses';
import { getDocIcon } from '../../../types/courses';
import { extractDocumentText } from '../utils/extractDocText';
import { streamChatCompletion } from '../../../services/aiService';
import type { MessageContentPart } from '../../../services/aiService';
import CourseAIChat from './CourseAIChat';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

interface Props {
    doc: CourseDocument;
    course: Course;
    onClose: () => void;
}

// ─── PDF Viewer ────────────────────────────────────────────────────────────────

function PdfViewer({ url, name: _name }: { url: string; name: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
    const renderTasksRef = useRef<any[]>([]);
    const renderedRef = useRef<Set<number>>(new Set());

    const [pdf, setPdf] = useState<any>(null);
    const [total, setTotal] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [jumpValue, setJumpValue] = useState('');
    const [jumping, setJumping] = useState(false);

    // Load PDF
    useEffect(() => {
        setLoading(true);
        setFailed(false);
        setCurrentPage(1);
        renderedRef.current.clear();
        pdfjsLib.getDocument({ url }).promise
            .then(pdfDoc => { setPdf(pdfDoc); setTotal(pdfDoc.numPages); setLoading(false); })
            .catch(() => { setFailed(true); setLoading(false); });
    }, [url]);

    // Set up IntersectionObservers — re-runs when pdf or scale changes
    useEffect(() => {
        if (!pdf || total === 0) return;
        const container = containerRef.current;
        if (!container) return;

        // Cancel any in-flight renders and reset rendered cache
        renderTasksRef.current.forEach(t => t?.cancel?.());
        renderTasksRef.current = [];
        renderedRef.current.clear();

        const renderPageNum = async (pageNum: number) => {
            if (renderedRef.current.has(pageNum)) return;
            const canvas = canvasRefs.current[pageNum - 1];
            if (!canvas) return;
            renderedRef.current.add(pageNum);
            try {
                const containerWidth = (container.clientWidth || 320) - 32;
                const pdfPage = await pdf.getPage(pageNum);
                const baseVp = pdfPage.getViewport({ scale: 1 });
                const viewport = pdfPage.getViewport({ scale: (containerWidth / baseVp.width) * scale });
                const ctx = canvas.getContext('2d')!;
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                renderTasksRef.current[pageNum - 1]?.cancel?.();
                const task = pdfPage.render({ canvasContext: ctx, viewport });
                renderTasksRef.current[pageNum - 1] = task;
                await task.promise;
            } catch (err: any) {
                if (err?.name !== 'RenderingCancelledException') renderedRef.current.delete(pageNum);
            }
        };

        // Lazy-render pages as they scroll into view (with 300px lookahead)
        const renderObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const idx = pageRefs.current.findIndex(el => el === entry.target);
                        if (idx !== -1) renderPageNum(idx + 1);
                    }
                }
            },
            { root: container, rootMargin: '300px 0px' }
        );

        // Track which page is most visible for the page counter
        const pageObserver = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible.length > 0) {
                    const idx = pageRefs.current.findIndex(el => el === visible[0].target);
                    if (idx !== -1) setCurrentPage(idx + 1);
                }
            },
            { root: container, threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0] }
        );

        pageRefs.current.forEach(el => {
            if (el) { renderObserver.observe(el); pageObserver.observe(el); }
        });

        return () => { renderObserver.disconnect(); pageObserver.disconnect(); };
    }, [pdf, total, scale]);

    const scrollToPage = (pageNum: number) => {
        pageRefs.current[pageNum - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const commitJump = () => {
        const n = parseInt(jumpValue, 10);
        if (!isNaN(n) && n >= 1 && n <= total) scrollToPage(n);
        setJumping(false);
        setJumpValue('');
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                <p className="text-sm text-stone-400 dark:text-zinc-500">Loading PDF…</p>
            </div>
        );
    }

    if (failed) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <FileText className="w-16 h-16 text-stone-300 dark:text-zinc-700" />
                <div>
                    <p className="font-semibold text-stone-800 dark:text-zinc-200 mb-1">Preview unavailable</p>
                    <p className="text-sm text-stone-500 dark:text-zinc-500 mb-4">This PDF couldn't be previewed in-app.</p>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors">
                        <Download className="w-4 h-4" /> Open PDF
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* PDF toolbar */}
            <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-950 border-b border-stone-200 dark:border-zinc-800 flex-shrink-0">
                {/* Page indicator with jump-to */}
                <div className="flex items-center gap-1">
                    {jumping ? (
                        <input
                            autoFocus
                            type="number"
                            value={jumpValue}
                            min={1}
                            max={total}
                            onChange={e => setJumpValue(e.target.value)}
                            onBlur={commitJump}
                            onKeyDown={e => { if (e.key === 'Enter') commitJump(); if (e.key === 'Escape') setJumping(false); }}
                            className="w-16 text-center text-xs px-2 py-1 bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 rounded-lg outline-none border border-emerald-500 tabular-nums"
                        />
                    ) : (
                        <button
                            onClick={() => { setJumping(true); setJumpValue(String(currentPage)); }}
                            className="text-xs text-stone-600 dark:text-zinc-400 px-2 py-1 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 min-w-[4.5rem] text-center tabular-nums transition-colors"
                            title="Click to jump to page"
                        >
                            {currentPage} / {total}
                        </button>
                    )}
                </div>
                {/* Zoom */}
                <div className="flex items-center gap-1">
                    <button onClick={() => setScale(s => Math.max(0.5, Math.round((s - 0.25) * 100) / 100))}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors">
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button onClick={() => setScale(1.0)}
                        className="px-2 py-1 rounded-lg text-xs text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors min-w-[3rem] text-center tabular-nums">
                        {Math.round(scale * 100)}%
                    </button>
                    <button onClick={() => setScale(s => Math.min(3, Math.round((s + 0.25) * 100) / 100))}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors">
                        <ZoomIn className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Continuous scrollable pages */}
            <div ref={containerRef} className="flex-1 overflow-auto bg-stone-200 dark:bg-zinc-800 py-4 flex flex-col items-center gap-3">
                {Array.from({ length: total }, (_, i) => (
                    <div
                        key={i}
                        ref={el => { pageRefs.current[i] = el; }}
                        className="shadow-2xl rounded-sm bg-white flex-shrink-0"
                        style={{ minHeight: '500px' }}
                    >
                        <canvas
                            ref={el => { canvasRefs.current[i] = el; }}
                            style={{ display: 'block' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Text viewer ───────────────────────────────────────────────────────────────

function TextViewer({ url }: { url: string }) {
    const [text, setText] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(url)
            .then(r => r.text())
            .then(t => { setText(t); setLoading(false); })
            .catch(() => { setText('Failed to load document.'); setLoading(false); });
    }, [url]);

    if (loading) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>;

    return (
        <div className="flex-1 overflow-auto p-6 bg-stone-50 dark:bg-zinc-900">
            <pre className="text-sm text-stone-800 dark:text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed max-w-3xl mx-auto">{text}</pre>
        </div>
    );
}

// ─── Google Docs viewer (Office files) ────────────────────────────────────────

function GDocsViewer({ gdocsUrl, name, fallbackUrl }: { gdocsUrl: string; name: string; fallbackUrl: string }) {
    const [loaded, setLoaded] = useState(false);
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => { if (!loaded) setTimedOut(true); }, 8000);
        return () => clearTimeout(t);
    }, [loaded]);

    if (timedOut) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <FileText className="w-16 h-16 text-stone-300 dark:text-zinc-700" />
                <div>
                    <p className="font-semibold text-stone-800 dark:text-zinc-200 mb-1">Preview unavailable</p>
                    <p className="text-sm text-stone-500 dark:text-zinc-500 mb-4">This file can't be previewed in-app.</p>
                    <a href={fallbackUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors">
                        <Download className="w-4 h-4" /> Open File
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {!loaded && <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>}
            <iframe src={gdocsUrl} className={`w-full border-0 ${loaded ? 'flex-1' : 'h-0'}`} title={name}
                onLoad={() => setLoaded(true)} onError={() => setTimedOut(true)} />
            {loaded && (
                <div className="flex-shrink-0 flex items-center justify-center py-2 border-t border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <a href={fallbackUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-zinc-400 transition-colors">
                        <Download className="w-3 h-3" /> Can't see the document? Open it directly
                    </a>
                </div>
            )}
        </div>
    );
}

// ─── Doc content router ────────────────────────────────────────────────────────

function DocContent({ doc }: { doc: CourseDocument }) {
    const { file_type, public_url, name } = doc;
    if (file_type === 'text/plain') return <TextViewer url={public_url} />;
    if (file_type === 'application/pdf') return <PdfViewer url={public_url} name={name} />;
    const gdocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(public_url)}&embedded=true`;
    return <GDocsViewer gdocsUrl={gdocsUrl} name={name} fallbackUrl={public_url} />;
}

// ─── Quick AI action button ────────────────────────────────────────────────────

interface QuickActionProps { icon: React.ReactNode; label: string; onClick: () => void; }
function QuickAction({ icon, label, onClick }: QuickActionProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 text-xs font-medium text-stone-600 dark:text-zinc-400 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all whitespace-nowrap flex-shrink-0"
        >
            {icon}
            {label}
        </button>
    );
}

// ─── Notes types & helpers ────────────────────────────────────────────────────

interface Note {
    id: string;
    content: string;
    createdAt: number;
    updatedAt: number;
}

function getNoteTitle(content: string): string {
    const first = content.split('\n').find(l => l.trim());
    return first?.trim().slice(0, 55) || 'Untitled note';
}

function formatRelative(ts: number): string {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
}

// ─── Main DocumentViewer ──────────────────────────────────────────────────────

export default function DocumentViewer({ doc, course, onClose }: Props) {
    const [showAI, setShowAI] = useState(false);
    const [aiPrompt, setAiPrompt] = useState<string | undefined>();
    const [externalPromptKey, setExternalPromptKey] = useState(0);
    const [aiPanelFraction, setAiPanelFraction] = useState(0.52);
    const [docText, setDocText] = useState<string | null | undefined>(undefined);
    const [otherDocTexts, setOtherDocTexts] = useState<{ name: string; text: string }[]>([]);
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const editRef = useRef<HTMLTextAreaElement>(null);
    const contentAreaRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef<{ y: number; fraction: number } | null>(null);

    const notesKey = `ulink_notes_v2_${course.id}_${doc.id ?? doc.name.replace(/\W/g, '_')}`;

    const notesRef = useRef(notes);
    useEffect(() => { notesRef.current = notes; }, [notes]);

    const scanImageInputRef = useRef<HTMLInputElement>(null);
    const [scanningNoteId, setScanningNoteId] = useState<string | null>(null);

    useEffect(() => {
        extractDocumentText(doc.file_type, doc.public_url)
            .then(text => setDocText(text))
            .catch(() => setDocText(null));
    }, [doc.file_type, doc.public_url]);

    // Extract text from all other course documents in the background for cross-reference
    useEffect(() => {
        const others = (course.course_documents ?? []).filter(d => d.id !== doc.id);
        if (others.length === 0) { setOtherDocTexts([]); return; }
        let cancelled = false;
        Promise.all(
            others.slice(0, 5).map(async d => {
                try {
                    const text = await extractDocumentText(d.file_type, d.public_url);
                    return text ? { name: d.name, text: text.slice(0, 3000) } : null;
                } catch { return null; }
            })
        ).then(results => {
            if (!cancelled) setOtherDocTexts(results.filter(Boolean) as { name: string; text: string }[]);
        });
        return () => { cancelled = true; };
    }, [course.course_documents, doc.id]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(notesKey);
            if (saved) setNotes(JSON.parse(saved));
        } catch {}
    }, [notesKey]);

    useEffect(() => {
        if (editingId) setTimeout(() => editRef.current?.focus(), 50);
    }, [editingId]);

    const saveNotes = (updated: Note[]) => {
        setNotes(updated);
        try { localStorage.setItem(notesKey, JSON.stringify(updated)); } catch {}
    };

    const createNote = () => {
        const note: Note = { id: crypto.randomUUID(), content: '', createdAt: Date.now(), updatedAt: Date.now() };
        const updated = [note, ...notes];
        saveNotes(updated);
        setEditingId(note.id);
    };

    const updateNote = (id: string, content: string) => {
        saveNotes(notes.map(n => n.id === id ? { ...n, content, updatedAt: Date.now() } : n));
    };

    const deleteNote = (id: string) => {
        saveNotes(notes.filter(n => n.id !== id));
        if (editingId === id) setEditingId(null);
    };

    const handleScanImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingId) return;
        e.target.value = '';
        const targetId = editingId;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const imageUrl = reader.result as string;
            setScanningNoteId(targetId);
            let initialized = false;
            await streamChatCompletion(
                [{ role: 'user', content: [
                    { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } } as MessageContentPart,
                    { type: 'text', text: 'Extract ALL text visible in this image exactly as written. Preserve bullet points, numbering, and structure. If it is a diagram or chart with no text, describe it clearly and in detail instead.' } as MessageContentPart,
                ]}],
                {
                    onChunk: (chunk) => {
                        setNotes(prev => {
                            const updated = prev.map(n => {
                                if (n.id !== targetId) return n;
                                const newContent = initialized
                                    ? n.content + chunk
                                    : n.content + '\n\n--- Scanned Image ---\n' + chunk;
                                initialized = true;
                                return { ...n, content: newContent, updatedAt: Date.now() };
                            });
                            try { localStorage.setItem(notesKey, JSON.stringify(updated)); } catch {}
                            return updated;
                        });
                    },
                    onDone: () => setScanningNoteId(null),
                    onError: () => setScanningNoteId(null),
                }
            );
        };
    }, [editingId, notesKey]);

    const handleDownload = async () => {
        try {
            const res = await fetch(doc.public_url);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            window.open(doc.public_url, '_blank');
        }
    };

    const openAI = (prompt?: string) => {
        setShowNotes(false);
        if (prompt) {
            setAiPrompt(prompt);
            if (showAI) setExternalPromptKey(k => k + 1); // send into already-open chat
        }
        setShowAI(true);
    };

    const startDrag = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        dragStartRef.current = { y: e.clientY, fraction: aiPanelFraction };
    };
    const onDrag = (e: React.PointerEvent) => {
        if (!dragStartRef.current || !contentAreaRef.current) return;
        const totalH = contentAreaRef.current.clientHeight;
        const dy = dragStartRef.current.y - e.clientY; // drag up = panel grows
        const next = dragStartRef.current.fraction + dy / totalH;
        setAiPanelFraction(Math.min(0.88, Math.max(0.20, next)));
    };
    const endDrag = () => { dragStartRef.current = null; };

    const editingNote = notes.find(n => n.id === editingId);

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950">

            {/* ── Header ── */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-200 dark:border-zinc-800 flex-shrink-0">
                <button onClick={onClose}
                    className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">{getDocIcon(doc.file_type)}</span>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100 truncate leading-tight">{doc.name}</p>
                        <p className="text-[11px] text-stone-400 dark:text-zinc-600 truncate">{course.title}</p>
                    </div>
                </div>
                <button
                    onClick={() => { const opening = !showNotes; setShowNotes(v => !v); setEditingId(null); if (opening) setShowAI(false); }}
                    className={`relative p-2 rounded-xl transition-colors flex-shrink-0 ${showNotes ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' : 'text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800'}`}
                    title="My Notes">
                    <PenLine className="w-4 h-4" />
                    {notes.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                            {notes.length}
                        </span>
                    )}
                </button>
                <button onClick={() => openAI()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors flex-shrink-0 ${showAI ? 'bg-violet-600 dark:bg-violet-500 text-white shadow-md shadow-violet-500/30' : 'bg-violet-100 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/40'}`}>
                    <Brain className="w-4 h-4" />
                    <span className="hidden sm:inline">{showAI ? 'UAI' : 'Ask UAI'}</span>
                    {docText === undefined && <Loader className="w-3 h-3 animate-spin opacity-60" />}
                </button>
                <a href={doc.public_url} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0" title="Open in browser">
                    <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={handleDownload}
                    className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0" title="Download">
                    <Download className="w-4 h-4" />
                </button>
            </div>

            {/* ── Quick AI actions ── */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900/60 overflow-x-auto flex-shrink-0 scrollbar-none">
                <span className="text-[10px] text-stone-400 dark:text-zinc-600 uppercase tracking-wide font-semibold flex-shrink-0 mr-1">AI</span>
                <QuickAction icon={<AlignLeft className="w-3.5 h-3.5" />} label="Outline"
                    onClick={() => openAI('Generate a detailed outline of this document with all main topics and subtopics.')} />
                <QuickAction icon={<Lightbulb className="w-3.5 h-3.5" />} label="Key Points"
                    onClick={() => openAI('What are the most important key points and takeaways from this document? Use bullet points.')} />
                <QuickAction icon={<BookOpen className="w-3.5 h-3.5" />} label="Summarize"
                    onClick={() => openAI('Give me a clear and concise summary of this document in 3-5 paragraphs.')} />
                <QuickAction icon={<GraduationCap className="w-3.5 h-3.5" />} label="Practice Quiz"
                    onClick={() => openAI('Create 5 practice questions based on this document to test my understanding. Include answers.')} />
                <QuickAction icon={<Brain className="w-3.5 h-3.5" />} label="Explain Simply"
                    onClick={() => openAI('Explain the most complex or difficult concepts in this document in simple terms, as if I\'m a beginner.')} />
            </div>

            {/* ── Content + AI Panel + Notes ── */}
            <div ref={contentAreaRef} className="flex-1 flex flex-col min-h-0 relative overflow-hidden">

                {/* Document — shrinks to give room when AI panel is open */}
                <div
                    className="flex flex-col min-h-0 overflow-hidden"
                    style={showAI ? { flex: 'none', height: `${(1 - aiPanelFraction) * 100}%` } : { flex: '1 1 0' }}
                >
                    <DocContent doc={doc} />
                </div>

                {/* AI Chat Panel — resizable bottom panel */}
                {showAI && (
                    <div
                        className="flex-shrink-0 flex flex-col bg-slate-50 dark:bg-zinc-950 border-t-2 border-violet-400/60 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
                        style={{ height: `${aiPanelFraction * 100}%` }}
                    >
                        {/* Drag grip — pointer events captured so drag works outside element */}
                        <div
                            className="h-5 flex items-center justify-center cursor-row-resize flex-shrink-0 bg-violet-50 dark:bg-violet-950/30 touch-none select-none"
                            onPointerDown={startDrag}
                            onPointerMove={onDrag}
                            onPointerUp={endDrag}
                            onPointerCancel={endDrag}
                        >
                            <div className="w-10 h-1 rounded-full bg-violet-300 dark:bg-violet-600" />
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden">
                            <CourseAIChat
                                embedded
                                course={course}
                                documentName={doc.name}
                                documentText={docText ?? null}
                                otherDocuments={otherDocTexts}
                                initialPrompt={aiPrompt}
                                externalPrompt={aiPrompt}
                                externalPromptKey={externalPromptKey}
                                onClose={() => setShowAI(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Notes panel (only shown when AI is closed) */}
                {showNotes && !showAI && (
                    <div className="absolute inset-x-0 bottom-0 flex flex-col bg-white dark:bg-zinc-950 border-t-2 border-amber-400/60 shadow-2xl" style={{ height: '48%' }}>

                        {editingNote ? (
                            /* ── Edit view ── */
                            <>
                                <div className="flex items-center gap-2 px-3 py-2 border-b border-stone-200 dark:border-zinc-800 flex-shrink-0">
                                    <button onClick={() => setEditingId(null)}
                                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="flex-1 text-xs font-semibold text-stone-600 dark:text-zinc-400 truncate">
                                        {getNoteTitle(editingNote.content) || 'New note'}
                                    </span>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(editingNote.content); }}
                                        className="px-2 py-1 text-[11px] text-stone-500 hover:text-stone-800 dark:hover:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                        Copy
                                    </button>
                                    <button
                                        onClick={() => scanImageInputRef.current?.click()}
                                        disabled={scanningNoteId === editingNote.id}
                                        className="flex items-center gap-1 px-2 py-1 text-[11px] text-violet-500 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30 rounded-lg transition-colors disabled:opacity-50"
                                        title="Scan image / OCR">
                                        {scanningNoteId === editingNote.id
                                            ? <Loader className="w-3 h-3 animate-spin" />
                                            : <Camera className="w-3 h-3" />}
                                        Scan
                                    </button>
                                    <input
                                        ref={scanImageInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleScanImage}
                                    />
                                    <button onClick={() => deleteNote(editingNote.id)}
                                        className="px-2 py-1 text-[11px] text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                                        Delete
                                    </button>
                                </div>
                                <textarea
                                    ref={editRef}
                                    value={editingNote.content}
                                    onChange={e => updateNote(editingNote.id, e.target.value)}
                                    placeholder={`Write your note here…\n\nTip: Use AI Quick Actions to generate an outline, then paste it here.`}
                                    className="flex-1 p-4 resize-none bg-transparent outline-none text-sm text-stone-800 dark:text-zinc-200 placeholder:text-stone-300 dark:placeholder:text-zinc-700 leading-relaxed"
                                />
                                <div className="flex-shrink-0 px-4 py-1.5 border-t border-stone-100 dark:border-zinc-900">
                                    <p className="text-[10px] text-stone-300 dark:text-zinc-700">
                                        {editingNote.content.length} chars · saved automatically
                                    </p>
                                </div>
                            </>
                        ) : (
                            /* ── List view ── */
                            <>
                                <div className="flex items-center justify-between px-4 py-2 border-b border-stone-200 dark:border-zinc-800 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <PenLine className="w-4 h-4 text-amber-500" />
                                        <span className="text-sm font-semibold text-stone-800 dark:text-zinc-200">My Notes</span>
                                        <span className="text-[10px] text-stone-400 dark:text-zinc-600">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={createNote}
                                            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors">
                                            + New Note
                                        </button>
                                        <button onClick={() => setShowNotes(false)}
                                            className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {notes.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
                                        <PenLine className="w-10 h-10 text-stone-200 dark:text-zinc-800" />
                                        <div>
                                            <p className="text-sm font-medium text-stone-500 dark:text-zinc-500">No notes yet</p>
                                            <p className="text-xs text-stone-400 dark:text-zinc-600 mt-1">Tap "New Note" to start taking notes on this document</p>
                                        </div>
                                        <button onClick={createNote}
                                            className="mt-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors">
                                            + Create first note
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-zinc-900">
                                        {notes.map(note => (
                                            <div key={note.id}
                                                className="flex items-start gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-zinc-900/50 cursor-pointer group transition-colors"
                                                onClick={() => setEditingId(note.id)}>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-stone-800 dark:text-zinc-200 truncate">
                                                        {getNoteTitle(note.content)}
                                                    </p>
                                                    <p className="text-xs text-stone-400 dark:text-zinc-600 truncate mt-0.5">
                                                        {note.content.split('\n').slice(1).join(' ').trim().slice(0, 60) || 'Empty note'}
                                                    </p>
                                                    <p className="text-[10px] text-stone-300 dark:text-zinc-700 mt-1">{formatRelative(note.updatedAt)}</p>
                                                </div>
                                                <button onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all flex-shrink-0 mt-0.5">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
