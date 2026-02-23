import { useEffect, useState, useCallback, useRef } from 'react';
import { Tldraw, Editor, createShapeId, getSnapshot, loadSnapshot } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { supabase } from '../../../lib/supabase';
import confetti from 'canvas-confetti';
import { Save, Trash2, Users, Search } from 'lucide-react';
import type { Profile } from '../../../types';

const PERSISTENCE_KEY = 'admin-whiteboard-v1';
const STICKERS = ['🔥', '✅', '❌', '❤️', '😱', '🎉', '💩', '💯'];

export default function CollaborativeWhiteboard() {
    const [snapshot, setSnapshot] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const editorRef = useRef<Editor | null>(null);

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [users, setUsers] = useState<Profile[]>([]);
    const [search, setSearch] = useState('');

    // Load initial state & users
    useEffect(() => {
        const loadState = async () => {
            // Get Current User
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('name')
                    .eq('id', user.id)
                    .single();

                setCurrentUser({
                    id: user.id,
                    name: profile?.name || user.email?.split('@')[0] || 'Admin',
                });
            }

            // Get Whiteboard State
            const { data: boardData } = await supabase
                .from('whiteboards')
                .select('snapshot')
                .eq('name', 'Main Board')
                .single();

            if (boardData?.snapshot) {
                setSnapshot(boardData.snapshot);
            }

            // Fetch Users for Sidebar
            const { data: usersData } = await supabase
                .from('profiles')
                .select('*')
                .limit(50)
                .order('created_at', { ascending: false });

            if (usersData) setUsers(usersData);

            setLoading(false);
        };
        loadState();
    }, []);

    const filteredUsers = users.filter(u =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleMount = useCallback((editor: Editor) => {
        editorRef.current = editor;

        // Load snapshot
        if (snapshot) {
            try {
                loadSnapshot(editor.store, snapshot);
            } catch (e) {
                console.error('Failed to load snapshot', e);
            }
        }

        if (currentUser) {
            editor.user.updateUserPreferences({
                id: currentUser.id,
                name: currentUser.name,
                color: '#' + currentUser.id.slice(0, 6),
            });
        }
    }, [snapshot, currentUser]);

    const saveBoard = async () => {
        const editor = editorRef.current;
        if (!editor || !currentUser) return;

        // Use getSnapshot utility
        const currentSnapshot = getSnapshot(editor.store);

        const { error } = await supabase
            .from('whiteboards')
            .upsert({
                name: 'Main Board',
                snapshot: currentSnapshot,
                updated_at: new Date().toISOString(),
                updated_by: currentUser.id
            }, { onConflict: 'name' });

        if (error) {
            console.error('Failed to save:', error);
            alert('Failed to save!');
        } else {
            console.log('Board saved!');
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    };

    const addSticker = (emoji: string) => {
        const editor = editorRef.current;
        if (!editor) return;
        const { x, y, w, h } = editor.getViewportPageBounds();

        editor.createShape({
            id: createShapeId(),
            type: 'text',
            x: x + w / 2 - 20 + Math.random() * 40,
            y: y + h / 2 - 20 + Math.random() * 40,
            props: {
                text: emoji,
                textAlign: 'middle',
                size: 'xl', // Use size instead of scale
            },
        } as any);
    };

    const handleUserDragStart = (e: React.DragEvent, user: Profile) => {
        e.dataTransfer.setData('application/ulink-user', JSON.stringify(user));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const editor = editorRef.current;
        if (!editor) return;

        const userJson = e.dataTransfer.getData('application/ulink-user');
        if (userJson) {
            const user = JSON.parse(userJson);
            // Convert screen coords to page coords
            const pagePoint = editor.screenToPage({ x: e.clientX, y: e.clientY });

            // Create Sticky Note
            editor.createShape({
                id: createShapeId(),
                type: 'note',
                x: pagePoint.x,
                y: pagePoint.y,
                props: {
                    text: `${user.name}\n${user.role.toUpperCase()}`,
                    color: user.role === 'student' ? 'yellow' : 'blue',
                },
            } as any);

            // Success feedback
            confetti({
                particleCount: 20,
                spread: 30,
                origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
            });
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Loading Room...</div>;

    return (
        <div className="flex flex-col md:flex-row h-[calc(100dvh-200px)] md:h-[calc(100vh-200px)] w-full gap-3">
            {/* Sidebar */}
            <div className={`transition-all duration-300 flex-shrink-0 ${isSidebarOpen ? 'h-48 md:h-auto md:w-64 w-full' : 'h-0 md:h-auto md:w-0 w-full'} bg-white dark:bg-zinc-800 rounded-[2rem] border border-stone-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col`}>
                <div className="p-4 border-b border-stone-100 dark:border-zinc-700">
                    <h3 className="font-bold text-stone-900 dark:text-white mb-2">Drag Users</h3>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-sm bg-stone-50 dark:bg-zinc-900 rounded-lg outline-none focus:ring-2 ring-emerald-500"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {filteredUsers.map(user => (
                        <div
                            key={user.id}
                            draggable
                            onDragStart={(e) => handleUserDragStart(e, user)}
                            className="flex items-center gap-3 p-2 hover:bg-stone-50 dark:hover:bg-zinc-700 rounded-xl cursor-grab active:cursor-grabbing border border-transparent hover:border-stone-200 dark:hover:border-zinc-600 transition-all"
                        >
                            <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`} className="w-8 h-8 rounded-full bg-stone-200" alt="" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-stone-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-stone-500 truncate">{user.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Canvas */}
            <div
                className="flex-1 relative rounded-[2rem] overflow-hidden border border-stone-200 dark:border-zinc-700 shadow-sm bg-stone-50 dark:bg-zinc-900"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                {/* Toolbar */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-stone-200 dark:border-zinc-700 max-w-[calc(100%-1rem)]">
                    {/* Sidebar Toggle Button */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`p-2 rounded-xl transition-colors flex-shrink-0 ${isSidebarOpen ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-stone-100 dark:hover:bg-zinc-700'}`}
                        title="Toggle User List"
                    >
                        <Users className="w-5 h-5" />
                    </button>

                    <div className="w-px h-6 bg-stone-200 dark:bg-zinc-700 mx-1 flex-shrink-0" />

                    {/* Stickers — scrollable on mobile */}
                    <div className="flex gap-1 pr-3 border-r border-stone-200 dark:border-zinc-700 overflow-x-auto no-scrollbar">
                        {STICKERS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => addSticker(emoji)}
                                className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-lg hover:bg-stone-100 dark:hover:bg-zinc-700 rounded-xl transition-colors active:scale-90"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-1.5 pl-1 flex-shrink-0">
                        <button onClick={saveBoard} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl font-bold shadow-lg active:scale-95 transition-all text-sm">
                            <Save className="w-4 h-4" /> <span className="hidden sm:inline">Save</span>
                        </button>
                        <button onClick={() => {
                            if (window.confirm('Clear board?')) {
                                editorRef.current?.selectAll();
                                editorRef.current?.deleteShapes(editorRef.current?.getSelectedShapeIds());
                            }
                        }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <Tldraw
                    onMount={handleMount}
                    persistenceKey={PERSISTENCE_KEY}
                    hideUi={false}
                />
            </div>
        </div>
    );
}
