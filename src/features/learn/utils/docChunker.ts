/**
 * In-browser keyword-based document retrieval.
 * Replaces dumping the full document into every prompt with sending only the
 * chunks most relevant to the user's current query — zero extra API cost.
 */

const STOPWORDS = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'what', 'how', 'are',
    'was', 'can', 'from', 'have', 'not', 'but', 'all', 'its', 'does',
    'did', 'been', 'will', 'would', 'could', 'should', 'may', 'might',
    'about', 'into', 'also', 'when', 'where', 'which', 'who', 'they',
    'their', 'there', 'then', 'than', 'these', 'those', 'them', 'had',
    'has', 'her', 'him', 'his', 'she', 'our', 'out', 'one', 'two',
    'use', 'used', 'using', 'just', 'like', 'get', 'got', 'make',
]);

function extractQueryWords(query: string): string[] {
    return query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

/** Split text into overlapping chunks so context isn't cut mid-sentence. */
function chunkText(text: string, size = 600, overlap = 80): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
        chunks.push(text.slice(i, i + size));
        i += size - overlap;
    }
    return chunks;
}

/**
 * Returns true when the query is a whole-document operation (summarize,
 * outline, quiz). These need a large slice of the document, not targeted chunks.
 */
export function isWholeDocumentQuery(query: string): boolean {
    const lower = query.toLowerCase();
    return [
        'summarize', 'summary', 'outline', 'key point', 'takeaway',
        'practice question', 'quiz', 'entire document', 'whole document',
        'this document', 'all topic', 'main topic', 'overview',
        'explain simply', 'explain the most', 'most important',
    ].some(kw => lower.includes(kw));
}

/**
 * Score document chunks against the user query and return the most relevant
 * portion, capped at maxChars.
 *
 * - Whole-document queries (summarize / outline / quiz) → first 5 000 chars
 * - Specific queries → top 4 keyword-matched chunks joined with ellipsis
 * - No keyword match → first maxChars chars (safe fallback)
 */
export function findRelevantChunks(
    text: string,
    query: string,
    maxChars = 2500,
): string {
    if (!text) return '';

    // Short documents — just send them whole (already small)
    if (text.length <= maxChars) return text;

    // Whole-document operations need breadth, not precision
    if (isWholeDocumentQuery(query)) {
        return text.slice(0, Math.max(maxChars, 5000));
    }

    const chunks = chunkText(text);
    const queryWords = extractQueryWords(query);

    if (queryWords.length === 0) return text.slice(0, maxChars);

    const scored = chunks.map((chunk, idx) => {
        const lower = chunk.toLowerCase();
        let score = 0;
        for (const word of queryWords) {
            if (lower.includes(word)) score += 2;
            // Partial stem match for longer words (e.g. "photosynthes" ↔ "photosynthesis")
            if (word.length > 5 && lower.includes(word.slice(0, -2))) score += 1;
        }
        // Small boost for the first chunk — usually contains definitions / intro
        if (idx === 0) score += 0.5;
        return { chunk, score, idx };
    });

    const top = scored
        .filter(c => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

    // No keyword match at all — fall back to beginning of document
    if (top.length === 0) return text.slice(0, maxChars);

    // Re-sort by original position so the returned text reads coherently
    top.sort((a, b) => a.idx - b.idx);

    return top.map(c => c.chunk).join('\n…\n').slice(0, maxChars);
}

/**
 * Returns true if an "other" course document has enough keyword overlap with
 * the query to be worth including in the prompt.
 * Filters out irrelevant docs so we don't waste tokens on them.
 */
export function isDocumentRelevant(
    docName: string,
    docText: string,
    query: string,
): boolean {
    const queryLower = query.toLowerCase();

    // Explicit mention of document name (minus extension)
    const nameLower = docName.toLowerCase().replace(/\.[^.]+$/, '');
    const nameWords = nameLower.split(/[\s_\-]+/).filter(w => w.length > 3);
    if (nameWords.some(w => queryLower.includes(w))) return true;

    const queryWords = extractQueryWords(query);
    if (queryWords.length === 0) return false;

    const docLower = docText.toLowerCase();
    const matchCount = queryWords.filter(w => docLower.includes(w)).length;

    // Require at least 40% of meaningful query words to appear in the doc
    return matchCount >= Math.min(2, Math.ceil(queryWords.length * 0.4));
}
