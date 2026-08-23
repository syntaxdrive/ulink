import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { audioService } from '../services/audioService';

const WebViewComponent = WebView as any;

/**
 * GlobalAudioEngine — Reliable background HTML5 audio engine for Expo Go, iOS, Android & Web.
 * Runs silently in the background and controls audio playback across the entire app.
 */
export const GlobalAudioEngine: React.FC = () => {
  const webViewRef = useRef<any>(null);

  useEffect(() => {
    const unsubscribe = audioService.subscribeCommands((cmd) => {
      if (!webViewRef.current) return;

      if (cmd.action === 'play') {
        const script = `
          try {
            var a = document.getElementById('globalAudio');
            if (a) {
              if (a.src !== "${cmd.payload.uri}") {
                a.src = "${cmd.payload.uri}";
                a.load();
              }
              var playPromise = a.play();
              if (playPromise !== undefined) {
                playPromise.catch(function(error) {
                  console.log("Audio play prevented: ", error);
                });
              }
            }
          } catch(e){}
          true;
        `;
        webViewRef.current.injectJavaScript(script);
      } else if (cmd.action === 'pause') {
        const script = `
          try {
            var a = document.getElementById('globalAudio');
            if (a) a.pause();
          } catch(e){}
          true;
        `;
        webViewRef.current.injectJavaScript(script);
      } else if (cmd.action === 'seek') {
        const seconds = (cmd.payload?.positionMillis || 0) / 1000;
        const script = `
          try {
            var a = document.getElementById('globalAudio');
            if (a) a.currentTime = ${seconds};
          } catch(e){}
          true;
        `;
        webViewRef.current.injectJavaScript(script);
      } else if (cmd.action === 'stop') {
        const script = `
          try {
            var a = document.getElementById('globalAudio');
            if (a) {
              a.pause();
              a.removeAttribute('src');
              a.load();
            }
          } catch(e){}
          true;
        `;
        webViewRef.current.injectJavaScript(script);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'status') {
        audioService.updateState({
          isPlaying: data.isPlaying,
          positionMillis: Math.floor((data.currentTime || 0) * 1000),
          durationMillis: Math.floor((data.duration || 0) * 1000),
          isLoading: data.isLoading || false,
        });
      }
    } catch {
      // Ignore parse errors
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <audio id="globalAudio" playsinline preload="auto"></audio>
        <script>
          var a = document.getElementById('globalAudio');

          function postUpdate(isLoading) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'status',
                isPlaying: !a.paused && !a.ended && a.readyState > 2,
                currentTime: a.currentTime || 0,
                duration: isNaN(a.duration) ? 0 : a.duration,
                isLoading: !!isLoading
              }));
            }
          }

          a.addEventListener('timeupdate', function() { postUpdate(false); });
          a.addEventListener('loadedmetadata', function() { postUpdate(false); });
          a.addEventListener('playing', function() { postUpdate(false); });
          a.addEventListener('pause', function() { postUpdate(false); });
          a.addEventListener('waiting', function() { postUpdate(true); });
          a.addEventListener('ended', function() { postUpdate(false); });
          a.addEventListener('error', function() { postUpdate(false); });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container} pointerEvents="none">
      <WebViewComponent
        ref={webViewRef}
        source={{ html }}
        style={styles.webView}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        originWhitelist={['*']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 2,
    height: 2,
    opacity: 0.01,
    position: 'absolute',
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  webView: {
    width: 2,
    height: 2,
    backgroundColor: 'transparent',
  },
});
