import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { uploadService, PickedMedia } from './uploadService';
import { FeedService } from './feedService';

export interface PostPublishPayload {
  userId: string;
  content: string;
  images: PickedMedia[];
  video: PickedMedia | null;
  externalUrl?: string;
  communityId?: string;
  pollOptions?: string[];
}

export type PublishStatus = 'idle' | 'uploading' | 'publishing' | 'success' | 'error';

export interface PublishState {
  status: PublishStatus;
  message: string;
  progress?: number;
  postId?: string;
}

type PublishListener = (state: PublishState) => void;

class PostPublishService {
  private listeners = new Set<PublishListener>();
  private currentState: PublishState = {
    status: 'idle',
    message: '',
  };

  public subscribe(listener: PublishListener) {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(state: PublishState) {
    this.currentState = state;
    this.listeners.forEach((listener) => listener(state));
  }

  /**
   * Dispatches background post creation task asynchronously
   */
  public async publishPostInBackground(payload: PostPublishPayload): Promise<void> {
    const { userId, content, images, video, externalUrl, communityId } = payload;

    this.notify({
      status: 'uploading',
      message: video
        ? 'Uploading video to campus feed...'
        : images.length > 0
        ? `Uploading ${images.length} photo(s)...`
        : 'Publishing your post...',
    });

    try {
      let uploadedImageUrls: string[] = [];
      let uploadedVideoUrl: string | null = null;

      // 1. Upload Images
      if (images && images.length > 0) {
        this.notify({
          status: 'uploading',
          message: `Uploading ${images.length} photo(s)...`,
        });
        uploadedImageUrls = await uploadService.uploadMultiple(images, 'posts');
      }

      // 2. Upload Video
      if (video) {
        this.notify({
          status: 'uploading',
          message: 'Uploading video (up to 100MB)...',
        });
        uploadedVideoUrl = await uploadService.uploadFile(video, 'videos');
      } else if (externalUrl?.trim()) {
        const trimmed = externalUrl.trim();
        if (trimmed.includes('youtu') || trimmed.endsWith('.mp4')) {
          uploadedVideoUrl = trimmed;
        } else {
          uploadedImageUrls.push(trimmed);
        }
      }

      // 3. Create Post in Database
      this.notify({
        status: 'publishing',
        message: 'Finishing up your post...',
      });

      const newPost: any = await FeedService.createPost({
        userId,
        content: content.trim(),
        communityId: communityId || null,
        imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
        imageUrl: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : null,
        videoUrl: uploadedVideoUrl,
        pollOptions: payload.pollOptions || null,
      });

      // 4. Success State
      this.notify({
        status: 'success',
        message: '🎉 Your post is live on the campus feed!',
        postId: newPost?.id || undefined,
      });

      // Reset to idle after 4 seconds
      setTimeout(() => {
        if (this.currentState.status === 'success') {
          this.notify({ status: 'idle', message: '' });
        }
      }, 4000);
    } catch (err: any) {
      console.error('Background publish failed:', err);
      const errMsg = err?.message || 'Could not upload media or publish post.';

      this.notify({
        status: 'error',
        message: `❌ Post failed: ${errMsg}`,
      });

      // Show alert on error
      Alert.alert('Publish Error', errMsg);

      setTimeout(() => {
        if (this.currentState.status === 'error') {
          this.notify({ status: 'idle', message: '' });
        }
      }, 6000);
    }
  }
}

export const postPublishService = new PostPublishService();
