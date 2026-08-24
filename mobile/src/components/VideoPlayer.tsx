import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Play, Maximize2 } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { extractYouTubeId } from '../utils/videoUtils';

const { width: screenWidth } = Dimensions.get('window');
const WebViewComponent = WebView as any;

interface VideoPlayerProps {
  url?: string | null;
  content?: string | null;
  horizontalPadding?: number;
  borderRadius?: number;
  isVisibleInViewport?: boolean;
  onDoubleTap?: () => void;
}

/**
 * Universal VideoPlayer component — Handles BOTH YouTube videos and native MP4/video files
 * with 9:16 vertical dimensions, auto-play on scroll, Shorts expand button, and reliable double-tap.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  content,
  horizontalPadding = 32,
  borderRadius = 14,
  isVisibleInViewport = true,
  onDoubleTap,
}) => {
  const videoSource = (url || '').trim();
  const rawContent = (content || '').trim();
  const youtubeId = extractYouTubeId(videoSource) || extractYouTubeId(rawContent);
  const isShorts = rawContent.includes('/shorts/') || videoSource.includes('/shorts/');

  // 1. YouTube Video
  if (youtubeId) {
    return (
      <InternalYouTubePlayer
        videoId={youtubeId}
        isShorts={isShorts}
        horizontalPadding={horizontalPadding}
        borderRadius={borderRadius}
        isVisibleInViewport={isVisibleInViewport}
        onDoubleTap={onDoubleTap}
      />
    );
  }

  // 2. Direct Video (MP4 / WebM / Cloudinary / Supabase Storage)
  if (!videoSource) return null;

  return (
    <InternalNativeMP4Player
      src={videoSource}
      horizontalPadding={horizontalPadding}
      borderRadius={borderRadius}
      isVisibleInViewport={isVisibleInViewport}
      onDoubleTap={onDoubleTap}
    />
  );
};

export default VideoPlayer;

/* ─── Internal YouTube Player ─── */
interface InternalYouTubePlayerProps {
  videoId: string;
  isShorts?: boolean;
  horizontalPadding?: number;
  borderRadius?: number;
  isVisibleInViewport?: boolean;
  onDoubleTap?: () => void;
}

const InternalYouTubePlayer: React.FC<InternalYouTubePlayerProps> = ({
  videoId,
  isShorts = false,
  horizontalPadding = 32,
  borderRadius = 14,
  isVisibleInViewport = true,
  onDoubleTap,
}) => {
  const containerWidth = screenWidth - horizontalPadding;
  const containerHeight = isShorts
    ? Math.min(480, (containerWidth * 16) / 9)
    : (containerWidth * 9) / 16;

  const [isPlaying, setIsPlaying] = useState<boolean>(isVisibleInViewport);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const webViewRef = useRef<any>(null);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    if (isVisibleInViewport) {
      setIsPlaying(true);
      const playScript = `
        try {
          var iframes = document.getElementsByTagName('iframe');
          for (var i = 0; i < iframes.length; i++) {
            iframes[i].contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          }
        } catch(e){}
        true;
      `;
      webViewRef.current?.injectJavaScript?.(playScript);
    } else {
      const pauseScript = `
        try {
          var iframes = document.getElementsByTagName('iframe');
          for (var i = 0; i < iframes.length; i++) {
            iframes[i].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
        } catch(e){}
        true;
      `;
      webViewRef.current?.injectJavaScript?.(pauseScript);
    }
  }, [isVisibleInViewport]);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      onDoubleTap?.();
    } else {
      setIsPlaying(!isPlaying);
    }
    lastTapRef.current = now;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'double_tap') {
        onDoubleTap?.();
      }
    } catch {}
  };

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const embedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; background-color: #000; }
          body, html { width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; }
          .video-container { position: relative; width: 100%; height: 100%; }
          iframe { width: 100%; height: 100%; border: none; }
        </style>
      </head>
      <body>
        <div class="video-container" id="videoBox">
          <iframe
            id="ytPlayer"
            src="https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&playsinline=1&rel=0&modestbranding=1&fs=1&origin=https://unilink.ng&widget_referrer=https://unilink.ng"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowfullscreen>
          </iframe>
        </div>
        <script>
          var lastTap = 0;
          document.addEventListener('touchend', function() {
            var now = new Date().getTime();
            if (now - lastTap < 350 && window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'double_tap' }));
            }
            lastTap = now;
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerWidth,
          height: containerHeight,
          borderRadius,
        },
      ]}
    >
      {/* Floating Shorts Expand Badge */}
      {onDoubleTap && (
        <TouchableOpacity
          style={styles.shortsBadge}
          activeOpacity={0.8}
          onPress={onDoubleTap}
        >
          <Maximize2 size={11} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.shortsBadgeText}>Full View ⛶</Text>
        </TouchableOpacity>
      )}

      {isPlaying ? (
        <View style={[styles.playerWrapper, { borderRadius }]}>
          <WebViewComponent
            ref={webViewRef}
            source={{ html: embedHtml, baseUrl: 'https://unilink.ng' }}
            style={[styles.webView, { borderRadius }]}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={true}
            userAgent="Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
            onMessage={handleMessage}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            scrollEnabled={false}
            originWhitelist={['*']}
            mixedContentMode="always"
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleTap}
          style={[styles.thumbnailContainer, { borderRadius }]}
        >
          <Image
            source={{ uri: thumbnailUrl }}
            style={[styles.thumbnail, { borderRadius }]}
            resizeMode="cover"
          />
          <View style={styles.playButtonWrapper}>
            <View style={styles.playButton}>
              <Play size={24} color="#ffffff" fill="#ffffff" style={{ marginLeft: 3 }} />
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

/* ─── Internal Native MP4 Player ─── */
interface InternalNativeMP4PlayerProps {
  src: string;
  horizontalPadding?: number;
  borderRadius?: number;
  isVisibleInViewport?: boolean;
  onDoubleTap?: () => void;
}

const InternalNativeMP4Player: React.FC<InternalNativeMP4PlayerProps> = ({
  src,
  horizontalPadding = 32,
  borderRadius = 14,
  isVisibleInViewport = true,
  onDoubleTap,
}) => {
  const containerWidth = screenWidth - horizontalPadding;
  const [aspectRatio, setAspectRatio] = useState<number>(9 / 16);
  const [isPlaying, setIsPlaying] = useState<boolean>(isVisibleInViewport);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const webViewRef = useRef<any>(null);
  const lastTapRef = useRef<number>(0);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      onDoubleTap?.();
    } else {
      setIsPlaying(!isPlaying);
    }
    lastTapRef.current = now;
  };

  const calculatedHeight = Math.min(480, containerWidth / aspectRatio);

  useEffect(() => {
    if (isVisibleInViewport) {
      setIsPlaying(true);
      const playScript = `
        try {
          var v = document.getElementById('mainVideo');
          if (v) v.play();
        } catch(e){}
        true;
      `;
      webViewRef.current?.injectJavaScript?.(playScript);
    } else {
      const pauseScript = `
        try {
          var v = document.getElementById('mainVideo');
          if (v) v.pause();
        } catch(e){}
        true;
      `;
      webViewRef.current?.injectJavaScript?.(pauseScript);
    }
  }, [isVisibleInViewport]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'video_metadata' && data.width > 0 && data.height > 0) {
        const ratio = data.width / data.height;
        const finalRatio = ratio < 1 ? Math.max(0.52, ratio) : Math.min(1.8, ratio);
        setAspectRatio(finalRatio);
      } else if (data.type === 'double_tap') {
        onDoubleTap?.();
      }
    } catch {
      // Ignore
    }
  };

  const videoHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; background-color: #000; }
          body, html { width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; }
          video { width: 100%; height: 100%; object-fit: contain; }
        </style>
      </head>
      <body>
        <video
          id="mainVideo"
          src="${src}"
          controls
          autoplay
          playsinline
          webkit-playsinline
          loop
          preload="auto"
        ></video>
        <script>
          var v = document.getElementById('mainVideo');
          function notifyDimensions() {
            if (v.videoWidth && v.videoHeight && window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'video_metadata',
                width: v.videoWidth,
                height: v.videoHeight
              }));
            }
          }
          v.addEventListener('loadedmetadata', notifyDimensions);
          v.addEventListener('canplay', notifyDimensions);

          var lastTap = 0;
          document.addEventListener('touchend', function() {
            var now = new Date().getTime();
            if (now - lastTap < 350 && window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'double_tap' }));
            }
            lastTap = now;
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerWidth,
          height: calculatedHeight,
          borderRadius,
        },
      ]}
    >
      {/* Floating Shorts Expand Badge */}
      {onDoubleTap && (
        <TouchableOpacity
          style={styles.shortsBadge}
          activeOpacity={0.8}
          onPress={onDoubleTap}
        >
          <Maximize2 size={11} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.shortsBadgeText}>Full View ⛶</Text>
        </TouchableOpacity>
      )}

      {isPlaying ? (
        <View style={[styles.playerWrapper, { borderRadius }]}>
          <WebViewComponent
            ref={webViewRef}
            source={{ html: videoHtml }}
            style={[styles.webView, { borderRadius }]}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleMessage}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            scrollEnabled={false}
            originWhitelist={['*']}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleTap}
          style={[styles.thumbnailContainer, { borderRadius }]}
        >
          <View style={styles.playButtonWrapper}>
            <View style={styles.playButton}>
              <Play size={26} color="#ffffff" fill="#ffffff" style={{ marginLeft: 3 }} />
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    overflow: 'hidden',
    alignSelf: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  shortsBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 50,
  },
  shortsBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  playerWrapper: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  webView: {
    backgroundColor: '#000000',
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playButtonWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
