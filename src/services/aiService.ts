// AI Service — OpenAI-compatible streaming API

const BASE_URL     = import.meta.env.VITE_AI_BASE_URL      || '';
const API_KEY      = import.meta.env.VITE_AI_API_KEY       || '';
const MODEL        = import.meta.env.VITE_AI_MODEL         || 'llama-3.3-70b-versatile';
const VISION_MODEL = import.meta.env.VITE_AI_VISION_MODEL  || 'meta-llama/llama-4-scout-17b-16e-instruct';

// TTS — defaults to main API if no separate key/url is set.
// Groq (free): VITE_TTS_BASE_URL=https://api.groq.com/openai/v1, VITE_TTS_MODEL=playai-tts, VITE_TTS_VOICE=Celeste-PlayAI
// OpenAI (paid): VITE_TTS_BASE_URL=https://api.openai.com/v1, VITE_TTS_MODEL=tts-1, VITE_TTS_VOICE=nova
const TTS_BASE_URL = import.meta.env.VITE_TTS_BASE_URL || BASE_URL;
const TTS_API_KEY  = import.meta.env.VITE_TTS_API_KEY  || API_KEY;
const TTS_MODEL    = import.meta.env.VITE_TTS_MODEL    || 'playai-tts';
const TTS_VOICE    = import.meta.env.VITE_TTS_VOICE    || 'Celeste-PlayAI';

// ElevenLabs TTS — most natural-sounding free tier (10,000 chars/month).
// Sign up at elevenlabs.io, copy your API key, pick a voice ID from the library.
// Default voice: "Rachel" (warm, natural female) — ID: 21m00Tcm4TlvDq8ikWAM
const ELEVENLABS_API_KEY  = import.meta.env.VITE_ELEVENLABS_API_KEY  || '';
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

export type MessageContentPart =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string; detail?: 'low' | 'high' | 'auto' } };

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | MessageContentPart[];
}

export interface StreamCallbacks {
    onChunk: (text: string) => void;
    onDone: () => void;
    onError: (err: Error) => void;
}

function hasImages(messages: ChatMessage[]): boolean {
    return messages.some(
        m => Array.isArray(m.content) && m.content.some(p => p.type === 'image_url')
    );
}

export async function streamChatCompletion(
    messages: ChatMessage[],
    { onChunk, onDone, onError }: StreamCallbacks,
    signal?: AbortSignal
) {
    if (!BASE_URL || !API_KEY) {
        onError(new Error('AI service not configured. Please set VITE_AI_BASE_URL and VITE_AI_API_KEY.'));
        return;
    }

    const model = hasImages(messages) ? VISION_MODEL : MODEL;

    try {
        const res = await fetch(`${BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model,
                messages,
                stream: true,
                max_tokens: 2048,
            }),
            signal,
        });

        if (!res.ok) {
            const text = await res.text().catch(() => res.statusText);
            throw new Error(`AI API error ${res.status}: ${text}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('data:')) continue;
                const data = trimmed.slice(5).trim();
                if (data === '[DONE]') { onDone(); return; }
                if (!data) continue;
                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) onChunk(content);
                } catch { /* ignore malformed chunks */ }
            }
        }

        onDone();
    } catch (err: any) {
        if (err?.name === 'AbortError') return;
        onError(err instanceof Error ? err : new Error(String(err)));
    }
}

/**
 * Synthesize speech. Priority order:
 *   1. ElevenLabs (most natural) — if VITE_ELEVENLABS_API_KEY is set
 *   2. OpenAI-compatible endpoint (Groq PlayAI, OpenAI, etc.)
 *   3. Returns null → caller falls back to browser speechSynthesis
 */
export async function synthesizeSpeech(
    text: string,
    signal?: AbortSignal
): Promise<ArrayBuffer | null> {
    // ── 1. ElevenLabs ────────────────────────────────────────────────────────
    if (ELEVENLABS_API_KEY) {
        try {
            const res = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'xi-api-key': ELEVENLABS_API_KEY,
                        'Accept': 'audio/mpeg',
                    },
                    body: JSON.stringify({
                        text,
                        model_id: 'eleven_turbo_v2_5',
                        voice_settings: { stability: 0.45, similarity_boost: 0.80 },
                    }),
                    signal,
                }
            );
            if (res.ok) return await res.arrayBuffer();
        } catch { /* fall through to next provider */ }
    }

    // ── 2. OpenAI-compatible (Groq, OpenAI, etc.) ────────────────────────────
    if (!TTS_BASE_URL || !TTS_API_KEY) return null;
    try {
        const res = await fetch(`${TTS_BASE_URL}/audio/speech`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TTS_API_KEY}`,
            },
            body: JSON.stringify({
                model: TTS_MODEL,
                input: text,
                voice: TTS_VOICE,
                response_format: 'mp3',
            }),
            signal,
        });
        if (!res.ok) return null;
        return await res.arrayBuffer();
    } catch {
        return null;
    }
}

export function buildCourseSystemPrompt(course: {
    title: string;
    description?: string | null;
    category: string;
    level: string;
    tags?: string[] | null;
    authorName?: string | null;
    documentNames?: string[];
    activeDocumentName?: string;
    activeDocumentText?: string | null;
    otherDocuments?: { name: string; text: string }[];
    isVoiceMode?: boolean;
}): string {
    const appContext = [
        `You are UAI, an intelligent AI study assistant built into ULink — a university social learning platform designed for African university students.`,
        ``,
        `About ULink (know this so you can guide students within the app):`,
        `- App name: ULink`,
        `- Courses: Students enrol in courses, upload study materials (PDFs, Word docs, slides), and study them with your help`,
        `- UAI (you): AI study assistant available on every course and document. You answer questions, summarise content, quiz students, explain difficult concepts, analyse images/diagrams, and hold voice conversations`,
        `- Notes: Students take personal notes per document, and can scan handwritten notes or images using your OCR capability`,
        `- Feed: A social feed where students post updates, share resources, ask questions, and interact — similar to a campus social network`,
        `- Campus Challenge: Competitive academic and social challenges between students`,
        `- Marketplace: Students buy and sell textbooks, notes, and campus items with each other`,
        `- Jobs: A board listing part-time campus jobs, internships, and graduate opportunities relevant to students`,
        `- Study Rooms: Real-time collaborative study spaces where students join together to study`,
        `- Podcasts: Academic and campus-life podcast episodes that students can listen to`,
        `- Messages: Direct messaging between students`,
        `- Notifications: Activity alerts for posts, messages, challenges, and more`,
        `- Voice Call: Students can have a real-time spoken conversation with you (UAI) hands-free`,
        ``,
        `When students ask about app features, navigation, or "how do I...", guide them based on the above.`,
        ``,
    ].join('\n');

    const parts = [
        appContext,
        `**Current course:** ${course.title}`,
        `**Category:** ${course.category}`,
        `**Level:** ${course.level}`,
    ];

    if (course.authorName) parts.push(`**Instructor:** ${course.authorName}`);
    if (course.description) parts.push(`**Description:** ${course.description}`);
    if (course.tags?.length) parts.push(`**Topics covered:** ${course.tags.join(', ')}`);
    if (course.documentNames?.length) {
        parts.push(`**Uploaded study materials:** ${course.documentNames.join(', ')}`);
    }

    if (course.activeDocumentName) {
        parts.push(``, `The student is currently reading: **${course.activeDocumentName}**`);
        if (course.activeDocumentText) {
            parts.push(
                ``, `Here is the extracted text content of that document (may be truncated):`,
                ``, `--- DOCUMENT START: ${course.activeDocumentName} ---`,
                course.activeDocumentText,
                `--- DOCUMENT END ---`,
                ``, `Answer questions based on this document content first, then supplement with your own knowledge.`,
            );
        } else {
            parts.push(`(Document text could not be extracted — answer based on the course topic and your knowledge.)`);
        }
    }

    if (course.otherDocuments?.length) {
        parts.push(
            ``,
            `The following other course documents are also available. When the student's question is not fully answered by the active document, or they ask about something covered in another material, draw from these:`,
        );
        for (const d of course.otherDocuments) {
            parts.push(
                ``,
                `--- OTHER DOCUMENT: ${d.name} ---`,
                d.text,
                `--- END: ${d.name} ---`,
            );
        }
    }

    if (course.isVoiceMode) {
        parts.push(
            ``,
            `IMPORTANT — you are currently in VOICE CALL mode. The student is talking to you hands-free. Follow these rules:`,
            `- Respond in natural spoken English — no markdown, no bullet symbols, no asterisks, no headers`,
            `- Use short paragraphs and conversational sentences, as if speaking to a friend`,
            `- Avoid lists; instead say "First... then... and finally..."`,
            `- Keep responses concise — aim for 2 to 4 sentences unless a deeper explanation is truly needed`,
            `- Use natural filler transitions like "So," "Great question," "Alright," "Basically," where appropriate`,
            `- Speak in a warm, encouraging, and friendly tone`,
        );
    } else {
        parts.push(
            ``,
            `Your role: Help students understand this course material. You can also analyse images — diagrams, equations, handwritten notes, screenshots — that students share with you.`,
            `- Use simple language appropriate for university students`,
            `- Give practical examples and real-world applications where helpful`,
            `- When explaining concepts, use numbered steps or bullet points for clarity`,
            `- If asked to quiz the student, generate relevant multiple-choice or short-answer questions`,
            `- Be encouraging and supportive`,
            `- Keep responses focused and not overly long`,
        );
    }

    return parts.join('\n');
}
