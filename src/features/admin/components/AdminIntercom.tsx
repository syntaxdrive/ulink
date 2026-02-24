import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Radio, Mic, MicOff, Volume2, Wifi } from 'lucide-react';

export default function AdminIntercom() {
    const [isConnecting, setIsConnecting] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentSpeaker, setCurrentSpeaker] = useState<{ name: string; id: string } | null>(null);
    const [onlineAdmins, setOnlineAdmins] = useState<number>(0);

    const channelRef = useRef<any>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Sound effects
    const chirpStart = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    const chirpEnd = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');

    useEffect(() => {
        const setupIntercom = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Initialize Presence & Broadcast channel
            channelRef.current = supabase.channel('admin_intercom', {
                config: {
                    presence: { key: user.id },
                },
            });

            channelRef.current
                .on('presence', { event: 'sync' }, () => {
                    const newState = channelRef.current.presenceState();
                    setOnlineAdmins(Object.keys(newState).length);
                })
                .on('broadcast', { event: 'voice_burst' }, async ({ payload }: any) => {
                    if (payload.senderId === user.id) return; // Don't play own audio

                    setCurrentSpeaker({ name: payload.senderName, id: payload.senderId });
                    playAudioBurst(payload.audioBase64);
                })
                .on('broadcast', { event: 'transmission_end' }, () => {
                    setCurrentSpeaker(null);
                })
                .subscribe(async (status: string) => {
                    if (status === 'SUBSCRIBED') {
                        setIsConnecting(false);
                        await channelRef.current.track({ online_at: new Date().toISOString(), name: user.email?.split('@')[0] });
                    }
                });
        };

        setupIntercom();

        return () => {
            if (channelRef.current) channelRef.current.unsubscribe();
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    const playAudioBurst = (base64: string) => {
        const audio = new Audio(`data:audio/webm;base64,${base64}`);
        audio.play().catch(e => console.error('Audio play failed', e));

        audio.onended = () => {
            // Logic to clear speaker if needed
        };
    };

    const startTransmission = async () => {
        if (isMuted) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64data = (reader.result as string).split(',')[1];
                    const { data: { user } } = await supabase.auth.getUser();

                    channelRef.current.send({
                        type: 'broadcast',
                        event: 'voice_burst',
                        payload: {
                            audioBase64: base64data,
                            senderId: user?.id,
                            senderName: user?.email?.split('@')[0] || 'Admin'
                        }
                    });

                    channelRef.current.send({
                        type: 'broadcast',
                        event: 'transmission_end'
                    });
                };

                stream.getTracks().forEach(track => track.stop());
            };

            chirpStart.volume = 0.2;
            chirpStart.play();

            setIsActive(true);
            mediaRecorder.start();

        } catch (err) {
            console.error('Intercom error', err);
            alert('Could not access microphone');
        }
    };

    const stopTransmission = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsActive(false);
            chirpEnd.volume = 0.2;
            chirpEnd.play();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] group">
            {/* Live Indicator */}
            {currentSpeaker && (
                <div className="absolute -top-12 right-0 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold animate-pulse flex items-center gap-2 shadow-lg border border-red-500 whitespace-nowrap">
                    <Volume2 className="w-3 h-3" />
                    INCOMING: {currentSpeaker.name.toUpperCase()}...
                </div>
            )}

            <div className={`p-4 rounded-[2.5rem] bg-stone-900 border-4 ${isActive ? 'border-red-500 animate-pulse' : 'border-stone-800'} shadow-2xl transition-all duration-300 flex flex-col items-center gap-3 w-20 group-hover:w-48 overflow-hidden`}>

                {/* Status Section (Hidden when collapsed) */}
                <div className="hidden group-hover:flex items-center gap-2 w-full justify-center border-b border-stone-800 pb-2">
                    <div className={`w-2 h-2 rounded-full ${isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className="text-[10px] text-stone-400 font-bold tracking-widest uppercase">
                        {isConnecting ? 'Syncing...' : 'Mission Control'}
                    </span>
                </div>

                {/* Main PTT Button */}
                <button
                    onMouseDown={startTransmission}
                    onMouseUp={stopTransmission}
                    onMouseLeave={stopTransmission}
                    onTouchStart={startTransmission}
                    onTouchEnd={stopTransmission}
                    disabled={isConnecting}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isActive
                            ? 'bg-red-600 scale-110 shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                            : 'bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300'
                        } disabled:opacity-50`}
                >
                    {isActive ? <Mic className="w-6 h-6 text-white" /> : <Radio className="w-6 h-6" />}
                </button>

                {/* Info Text */}
                <div className="hidden group-hover:flex flex-col items-center text-center">
                    <p className="text-[10px] text-white font-black uppercase tracking-tighter">
                        {isActive ? 'Transmitting' : 'Hold to Talk'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <Wifi className="w-3 h-3 text-stone-500" />
                        <span className="text-[9px] text-stone-500 font-bold uppercase">{onlineAdmins} Admins Link</span>
                    </div>
                </div>

                {/* Mute Toggle */}
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="hidden group-hover:block p-1 text-stone-600 hover:text-stone-400 transition-colors"
                >
                    {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
            </div>

            {/* Visual Static / Waveform Overlay when active */}
            {isActive && (
                <div className="fixed inset-0 pointer-events-none z-[-1] bg-red-500/5 transition-opacity duration-300" />
            )}
        </div>
    );
}
