import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CheckCircle2, AlertCircle, X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { postPublishService, PublishState } from '../services/postPublishService';

export function GlobalPublishBanner() {
  const [publishState, setPublishState] = useState<PublishState>({
    status: 'idle',
    message: '',
  });

  useEffect(() => {
    const unsub = postPublishService.subscribe(setPublishState);
    return () => unsub();
  }, []);

  if (publishState.status === 'idle') {
    return null;
  }

  const isUploading = publishState.status === 'uploading' || publishState.status === 'publishing';
  const isSuccess = publishState.status === 'success';
  const isError = publishState.status === 'error';

  return (
    <View
      style={[
        styles.bannerContainer,
        isUploading && styles.uploadingBanner,
        isSuccess && styles.successBanner,
        isError && styles.errorBanner,
      ]}
    >
      <View style={styles.contentRow}>
        {isUploading && (
          <ActivityIndicator size="small" color="#000000" style={{ marginRight: 8 }} />
        )}
        {isSuccess && (
          <CheckCircle2 size={18} color="#065F46" style={{ marginRight: 8 }} />
        )}
        {isError && (
          <AlertCircle size={18} color="#991B1B" style={{ marginRight: 8 }} />
        )}

        <Text
          style={[
            styles.bannerText,
            isUploading && styles.uploadingText,
            isSuccess && styles.successText,
            isError && styles.errorText,
          ]}
          numberOfLines={2}
        >
          {publishState.message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    left: 16,
    right: 16,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 99999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1.5,
  },
  uploadingBanner: {
    backgroundColor: '#FEF08A', // Sun Yellow
    borderColor: '#000000',
  },
  successBanner: {
    backgroundColor: '#D1FAE5', // Mint emerald
    borderColor: '#10B981',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2', // Coral red
    borderColor: '#EF4444',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '800',
  },
  uploadingText: {
    color: '#000000',
  },
  successText: {
    color: '#065F46',
  },
  errorText: {
    color: '#991B1B',
  },
});
