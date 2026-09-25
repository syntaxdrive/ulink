/**
 * downloadService.ts
 * Handles real audio file downloads using expo-file-system v2 API.
 * Persists download metadata to AsyncStorage so ProfileScreen
 * can read it and show the user's actual offline library.
 */

import { File, Directory, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DOWNLOADS_STORAGE_KEY = 'unilink_offline_downloads';

export interface OfflineEpisode {
  id: string;
  title: string;
  showTitle: string;
  cover_url: string;
  audio_url: string;       // original remote URL
  local_uri: string;       // local file URI after download
  duration_seconds: number;
  file_size: string;
  downloaded_at: string;
}

/** Load all saved offline episodes from AsyncStorage */
export async function getOfflineDownloads(): Promise<OfflineEpisode[]> {
  try {
    const raw = await AsyncStorage.getItem(DOWNLOADS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OfflineEpisode[];
  } catch {
    return [];
  }
}

/** Persist offline episodes list to AsyncStorage */
async function saveOfflineDownloads(list: OfflineEpisode[]): Promise<void> {
  await AsyncStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(list));
}

/** Returns true if episode is already downloaded */
export async function isEpisodeDownloaded(episodeId: string): Promise<boolean> {
  const list = await getOfflineDownloads();
  return list.some((ep) => ep.id === episodeId);
}

/**
 * Download an episode audio file to local device storage.
 * Calls onProgress(0..1) as download progresses.
 * Returns the local URI on success.
 */
export async function downloadEpisode(
  episode: {
    id: string;
    title: string;
    audio_url: string;
    cover_url?: string;
    duration_seconds?: number;
    showTitle?: string;
  },
  onProgress?: (progress: number) => void
): Promise<string> {
  // Ensure podcasts subdirectory exists inside documentDirectory
  const podcastsDir = new Directory(Paths.document, 'podcasts');
  if (!podcastsDir.exists) {
    podcastsDir.create();
  }

  const destFile = new File(podcastsDir, `episode_${episode.id}.mp3`);

  // If already on disk return immediately
  if (destFile.exists) {
    return destFile.uri;
  }

  // Use DownloadTask for progress tracking
  const task = File.createDownloadTask(episode.audio_url, destFile, {
    onProgress: ({ bytesWritten, totalBytes }) => {
      if (totalBytes > 0) {
        onProgress?.(bytesWritten / totalBytes);
      }
    },
  });

  const downloadedFile = await task.downloadAsync();
  if (!downloadedFile) throw new Error('Download cancelled or failed');

  // Estimate file size label
  let fileSizeStr = 'Unknown size';
  try {
    // File size via reading bytes is expensive; we estimate from totalBytes in progress
    // or just use a generic label — exact size not critical
    fileSizeStr = 'Saved offline';
  } catch {}

  // Persist metadata to AsyncStorage
  const existing = await getOfflineDownloads();
  const alreadySaved = existing.some((e) => e.id === episode.id);
  if (!alreadySaved) {
    const newEntry: OfflineEpisode = {
      id: episode.id,
      title: episode.title,
      showTitle: episode.showTitle || 'Podcast',
      cover_url: episode.cover_url || '',
      audio_url: episode.audio_url,
      local_uri: downloadedFile.uri,
      duration_seconds: episode.duration_seconds || 0,
      file_size: fileSizeStr,
      downloaded_at: 'Just now',
    };
    await saveOfflineDownloads([...existing, newEntry]);
  }

  return downloadedFile.uri;
}

/** Remove a downloaded episode from disk and from AsyncStorage */
export async function removeDownloadedEpisode(episodeId: string): Promise<void> {
  try {
    const podcastsDir = new Directory(Paths.document, 'podcasts');
    const file = new File(podcastsDir, `episode_${episodeId}.mp3`);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Ignore if file doesn't exist
  }

  const existing = await getOfflineDownloads();
  await saveOfflineDownloads(existing.filter((ep) => ep.id !== episodeId));
}
