import React, { useState, useEffect } from 'react';
import {
  Image,
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

interface AutoHeightImageProps {
  uri: string;
  horizontalPadding?: number;
  maxHeight?: number;
  borderRadius?: number;
}

/**
 * AutoHeightImage — Renders remote images in their natural, true aspect ratio
 * without distortion or forced cropping, with optional tap-to-fullscreen preview.
 */
export const AutoHeightImage: React.FC<AutoHeightImageProps> = ({
  uri,
  horizontalPadding = 32, // Default: 16px left + 16px right
  maxHeight = 520,
  borderRadius = 14,
}) => {
  const containerWidth = screenWidth - horizontalPadding;
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);
  const [loading, setLoading] = useState<boolean>(true);
  const [fullscreenVisible, setFullscreenVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!uri) return;

    let isMounted = true;
    setLoading(true);

    Image.getSize(
      uri,
      (width, height) => {
        if (isMounted && width > 0 && height > 0) {
          const ratio = width / height;
          // Clamp ratio between 0.6 (tall portrait) and 2.2 (ultra-wide) for best feed layout
          const clampedRatio = Math.max(0.6, Math.min(2.2, ratio));
          setAspectRatio(clampedRatio);
          setLoading(false);
        }
      },
      (error) => {
        if (isMounted) {
          console.warn('Image.getSize error for uri:', uri, error);
          setAspectRatio(16 / 9);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [uri]);

  const calculatedHeight = Math.min(maxHeight, containerWidth / aspectRatio);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => setFullscreenVisible(true)}
        style={[
          styles.container,
          {
            width: containerWidth,
            height: calculatedHeight,
            borderRadius,
          },
        ]}
      >
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: containerWidth,
              height: calculatedHeight,
              borderRadius,
            },
          ]}
          resizeMode="cover"
        />

        {loading && (
          <View style={[styles.loadingOverlay, { borderRadius }]}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        )}
      </TouchableOpacity>

      {/* Fullscreen Zoom Modal */}
      <Modal visible={fullscreenVisible} transparent animationType="fade">
        <SafeAreaView style={styles.fullscreenContainer}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setFullscreenVisible(false)}
          >
            <X size={26} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.fullscreenImageWrapper}>
            <Image
              source={{ uri }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
    alignSelf: 'center',
    marginVertical: 8,
  },
  image: {
    backgroundColor: colors.surface,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 24,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: screenWidth,
    height: '100%',
  },
});
