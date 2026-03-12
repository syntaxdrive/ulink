import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Use Vite's ?url import so the worker is bundled locally (CDN doesn't carry v5.x)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

/**
 * Extracts readable text from a course document for AI context.
 * Returns null if extraction is not supported for the given type.
 */
export async function extractDocumentText(fileType: string, url: string): Promise<string | null> {
    try {
        if (fileType === 'text/plain') {
            const res = await fetch(url);
            const text = await res.text();
            return text.slice(0, 12000);
        }

        if (fileType === 'application/pdf') {
            return await extractPdfText(url);
        }

        // DOCX/PPTX/XLSX — can't extract client-side without heavy libraries
        return null;
    } catch {
        return null;
    }
}

async function extractPdfText(url: string): Promise<string> {
    const pdf = await pdfjsLib.getDocument({ url, verbosity: 0 }).promise;
    const pageCount = Math.min(pdf.numPages, 40);
    const pages: string[] = [];

    for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = (content.items as any[])
            .filter(item => 'str' in item)
            .map(item => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (pageText) pages.push(`[Page ${i}]\n${pageText}`);
    }

    return pages.join('\n\n').slice(0, 12000);
}
