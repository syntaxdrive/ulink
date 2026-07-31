import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image as ImageIcon, Send, X } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { apiClient } from '../../api/client';

export default function CreatePostScreen({ navigation }: any) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreatePost = async () => {
    if (!content.trim() && !imageUrl.trim()) {
      Alert.alert('Empty Post', 'Please type some content or add an image link to publish.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/posts', {
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
      });

      Alert.alert('Post Published', 'Your post is live on the UniLink campus feed!');
      setContent('');
      setImageUrl('');
      navigation?.navigate('Home');
    } catch (error: any) {
      Alert.alert('Publish Error', error.response?.data?.message || 'Unable to publish post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Post</Text>
          <TouchableOpacity
            style={[styles.publishBtn, loading && styles.publishBtnDisabled]}
            onPress={handleCreatePost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <>
                <Send size={14} color={colors.background} />
                <Text style={styles.publishText}>Publish</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Input Card */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.contentInput}
            placeholder="What's on your mind on campus? Share course updates, project ideas, or questions..."
            placeholderTextColor={colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.imageInputRow}>
            <ImageIcon size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.imageInput}
              placeholder="Optional image URL..."
              placeholderTextColor={colors.textSecondary}
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
            />
            {imageUrl ? (
              <TouchableOpacity onPress={() => setImageUrl('')}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  publishBtnDisabled: {
    opacity: 0.6,
  },
  publishText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  inputCard: {
    flex: 1,
    padding: 20,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  imageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  imageInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
});
