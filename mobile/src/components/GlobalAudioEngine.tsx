import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { audioService } from '../services/audioService';

const WebViewComponent = WebView as any;

const AUDIO_ENGINE_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="background: transparent;">
    <audio id="globalAudio" preload="auto" playsinline webkit-playsinline></audio>
    <script>
      (function() {
        var audio = document.getElementById('globalAudio');

        function post(msg) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify(msg));
          }
        }

        audio.addEventListener('timeupdate', function() {
          post({
            type: 'timeupdate',
            currentTime: audio.currentTime || 0,
            duration: audio.duration || 0
          });
        });

        audio.addEventListener('playing', function() {
          post({ type: 'playing' });
        });

        audio.addEventListener('pause', function() {
          post({ type: 'pause' });
        });

        audio.addEventListener('ended', function() {
          post({ type: 'ended' });
        });

        audio.addEventListener('error', function(e) {
          post({ type: 'error', code: audio.error ? audio.error.code : 0 });
        });

        window.playTrack = function(uri, rate) {
          if (audio.src !== uri) {
            audio.src = uri;
            audio.load();
          }
          if (rate) audio.playbackRate = rate;
          var p = audio.play();
          if (p !== undefined) {
            p.catch(function(err) {
              post({ type: 'play_error', message: err.message });
            });
          }
        };

        window.pauseTrack = function() {
          audio.pause();
        };

        window.resumeTrack = function() {
          var p = audio.play();
          if (p !== undefined) {
            p.catch(function(err) {});
          }
        };

        window.seekTrack = function(seconds) {
          audio.currentTime = seconds;
        };

        window.setRate = function(rate) {
          audio.playbackRate = rate;
        };

        window.stopTrack = function() {
          audio.pause();
          audio.src = '';
        };
      })();
    </script>
  </body>
</html>
`;

export const GlobalAudioEngine: React.FC = () => {
  const webViewRef = useRef<any>(null);

  useEffect(() => {
    const unsubscribe = audioService.subscribeCommands((cmd) => {
      if (!webViewRef.current) return;

      if (cmd.action === 'play') {
        const uri = cmd.payload?.uri;
        const rate = cmd.payload?.rate || 1.0;
        webViewRef.current.injectJavaScript(`
          if (window.playTrack) { window.playTrack("${uri}", ${rate}); }
          true;
        `);
      } else if (cmd.action === 'pause') {
        webViewRef.current.injectJavaScript(`
          if (window.pauseTrack) { window.pauseTrack(); }
          true;
        `);
      } else if (cmd.action === 'resume') {
        webViewRef.current.injectJavaScript(`
          if (window.resumeTrack) { window.resumeTrack(); }
          true;
        `);
      } else if (cmd.action === 'seek') {
        const sec = (cmd.payload?.positionMillis || 0) / 1000;
        webViewRef.current.injectJavaScript(`
          if (window.seekTrack) { window.seekTrack(${sec}); }
          true;
        `);
      } else if (cmd.action === 'rate') {
        const rate = cmd.payload?.rate || 1.0;
        webViewRef.current.injectJavaScript(`
          if (window.setRate) { window.setRate(${rate}); }
          true;
        `);
      } else if (cmd.action === 'stop') {
        webViewRef.current.injectJavaScript(`
          if (window.stopTrack) { window.stopTrack(); }
          true;
        `);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'timeupdate') {
        audioService.onTimeUpdate(data.currentTime, data.duration);
      } else if (data.type === 'ended') {
        audioService.onEnded();
      } else if (data.type === 'playing') {
        audioService.updateState({ isPlaying: true, isLoading: false });
      } else if (data.type === 'pause') {
        audioService.updateState({ isPlaying: false });
      }
    } catch {}
  };

  return (
    <View style={styles.hiddenContainer} pointerEvents="none">
      <WebViewComponent
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: AUDIO_ENGINE_HTML }}
        onMessage={handleMessage}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.hiddenWebView}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hiddenContainer: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  hiddenWebView: {
    width: 1,
    height: 1,
  },
});
