/**
 * Video Utilities for extracting YouTube IDs and direct video links from post content.
 */

export function extractYouTubeId(text: string): string | null {
  if (!text) return null;

  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function cleanVideoUrlsFromText(text: string): string {
  if (!text) return '';

  return text
    .replace(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:[^\s]+)/gi, '')
    .replace(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/[a-zA-Z0-9_-]{11}[^\s]*/gi, '')
    .replace(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{11}[^\s]*/gi, '')
    .replace(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/[a-zA-Z0-9_-]{11}[^\s]*/gi, '')
    .trim();
}

export function isDirectVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(mp4|webm|mov|m4v|m3u8)(\?.*)?$/i.test(url);
}
