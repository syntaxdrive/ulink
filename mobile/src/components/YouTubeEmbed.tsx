import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Play } from 'lucide-react-native';
import { colors } from '../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

// Cast to avoid strict React 19 / RN JSX overload mismatch
const WebViewComponent = WebView as any;

interface YouTubeEmbedProps {
  videoId: string;
  horizontalPadding?: number;
  borderRadius?: number;
  autoPlay?: boolean;
  isVisibleInViewport?: boolean; // Scroll response
}

/**
 * YouTubeEmbed — Native embedded YouTube video player with responsive 16:9 ratio,
 * tap-to-play with HQ thumbnail preview, and pause response when scrolled out of view.
 */
export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  horizontalPadding = 32,
  borderRadius = 14,
  autoPlay = false,
  isVisibleInViewport = true,
}) => {
  const containerWidth = screenWidth - horizontalPadding;
  const containerHeight = (containerWidth * 9) / 16;
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const webViewRef = useRef<any>(null);

  // Pause playback when scrolled out of viewport
  useEffect(() => {
    if (!isVisibleInViewport && isPlaying) {
      // Send pause message to iframe
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
  }, [isVisibleInViewport, isPlaying]);

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
        <div class="video-container">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=1&playsinline=1&rel=0&modestbranding=1&fs=1"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowfullscreen>
          </iframe>
        </div>
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
      {isPlaying ? (
        <View style={[styles.playerWrapper, { borderRadius }]}>
          <WebViewComponent
            ref={webViewRef}
            source={{ html: embedHtml }}
            style={[styles.webView, { borderRadius }]}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
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
          onPress={() => setIsPlaying(true)}
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    overflow: 'hidden',
    alignSelf: 'center',
    marginVertical: 10,
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
    backgroundColor: '#000000',
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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
