import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Send,
  X,
  Plus,
  Link as LinkIcon,
  CheckCircle2,
  Play,
  Film,
  Share2,
  BarChart2,
  Trash2,
} from 'lucide-react-native';
import { colors, useTheme } from '../../theme/colors';
import { uploadService, PickedMedia } from '../../services/uploadService';
import { postPublishService } from '../../services/postPublishService';
import { VideoPlayer } from '../../components/VideoPlayer';
import { SocialSourceBadge } from '../../components/SocialSourceBadge';
import { detectSocialSource } from '../../utils/socialUtils';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function CreatePostScreen({ navigation, route }: any) {
  const { isDark } = useTheme();
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<PickedMedia[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<PickedMedia | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Poll State
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  // Auto-fill from incoming social shares / deep links
  useEffect(() => {
    if (route?.params?.sharedText) {
      setContent(route.params.sharedText);
    }
    if (route?.params?.sharedUrl) {
      setExternalUrl(route.params.sharedUrl);
      setShowUrlInput(true);
    }
    if (route?.params?.sharedMediaUri) {
      if (route.params.sharedMediaType === 'video') {
        setSelectedVideo({
          uri: route.params.sharedMediaUri,
          type: 'video',
          mimeType: 'video/mp4',
          fileName: 'shared_video.mp4',
          fileSize: 0,
        });
      } else {
        setSelectedImages([{
          uri: route.params.sharedMediaUri,
          type: 'image',
          mimeType: 'image/jpeg',
          fileName: 'shared_image.jpg',
          fileSize: 0,
        }]);
      }
    }
  }, [route?.params]);

  // 1. Pick Multiple Images (Max 100MB per image)
  const handlePickImages = async () => {
    try {
      if (selectedVideo) {
        Alert.alert('Media Selection', 'You can either attach images or a video per post.');
        return;
      }
      const remainingSlots = 10 - selectedImages.length;
      if (remainingSlots <= 0) {
        Alert.alert('Limit Reached', 'You can attach up to 10 images per post.');
        return;
      }

      const media = await uploadService.pickImages(remainingSlots);
      if (media.length > 0) {
        setSelectedImages((prev) => [...prev, ...media]);
      }
    } catch (err: any) {
      Alert.alert('Media Error', err.message || 'Could not access device photos.');
    }
  };

  // 2. Pick Video (Max 100MB)
  const handlePickVideo = async () => {
    try {
      if (selectedImages.length > 0) {
        Alert.alert('Media Selection', 'You can either attach images or a video per post.');
        return;
      }
      const video = await uploadService.pickVideo();
      if (video) {
        setSelectedVideo(video);
      }
    } catch (err: any) {
      Alert.alert('Video Error', err.message || 'Could not select video from device.');
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
  };

  // Poll Option Handlers
  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    } else {
      setShowPollCreator(false);
      setPollOptions(['', '']);
    }
  };

  const handleUpdatePollOption = (text: string, index: number) => {
    const next = [...pollOptions];
    next[index] = text;
    setPollOptions(next);
  };

  // 3. Instant Background Publish + Instant Redirect to Feed
  const handleCreatePost = async () => {
    const validPollOptions = showPollCreator
      ? pollOptions.map((o) => o.trim()).filter((o) => o.length > 0)
      : [];

    if (showPollCreator && validPollOptions.length < 2) {
      Alert.alert('Incomplete Poll', 'Please provide at least 2 options for your campus poll.');
      return;
    }

    const hasMedia = selectedImages.length > 0 || selectedVideo || externalUrl.trim() || validPollOptions.length >= 2;
    if (!content.trim() && !hasMedia) {
      Alert.alert('Empty Post', 'Please write something, attach photos/videos, or create a poll.');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      Alert.alert('Sign In Required', 'Please sign in to publish posts.');
      return;
    }

    // Snapshot current state
    const postPayload = {
      userId,
      content,
      images: [...selectedImages],
      video: selectedVideo ? { ...selectedVideo } : null,
      externalUrl,
      pollOptions: validPollOptions.length >= 2 ? validPollOptions : undefined,
    };

    // Reset local inputs
    setContent('');
    setSelectedImages([]);
    setSelectedVideo(null);
    setExternalUrl('');
    setShowUrlInput(false);
    setShowPollCreator(false);
    setPollOptions(['', '']);

    // Instant redirect back to feed
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('Home');
    }

    // Dispatch background publish task
    postPublishService.publishPostInBackground(postPayload);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* Top Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.title}>New Post</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>Campus Feed</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.publishBtn}
            onPress={handleCreatePost}
          >
            <Send size={15} color="#ffffff" />
            <Text style={styles.publishText}>Publish</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Text Content Input */}
          <TextInput
            style={styles.contentInput}
            placeholder="What's happening on campus? Share notes, questions, thoughts, or projects..."
            placeholderTextColor={colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          {/* Social Source Badge Indicator (WhatsApp, Instagram, X, etc.) */}
          {(content || externalUrl) && (
            <View style={{ marginHorizontal: 20, marginBottom: 8 }}>
              <SocialSourceBadge text={content + ' ' + externalUrl} />
            </View>
          )}

          {/* Selected Images Grid Preview */}
          {selectedImages.length > 0 && (
            <View style={styles.mediaPreviewSection}>
              <View style={styles.previewHeaderRow}>
                <Text style={styles.previewSectionTitle}>
                  Attached Images ({selectedImages.length}/10)
                </Text>
                <Text style={styles.previewSubtext}>Tap X to remove</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imageThumbList}
              >
                {selectedImages.map((img, index) => (
                  <View key={index} style={styles.thumbWrapper}>
                    <Image source={{ uri: img.uri }} style={styles.imageThumb} />
                    <TouchableOpacity
                      style={styles.removeMediaBtn}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <X size={12} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {selectedImages.length < 10 && (
                  <TouchableOpacity style={styles.addMoreBtn} onPress={handlePickImages}>
                    <Plus size={20} color={colors.primary} />
                    <Text style={styles.addMoreText}>Add More</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          )}

          {/* Interactive Video Preview Player */}
          {selectedVideo && (
            <View style={styles.videoPreviewSection}>
              <View style={styles.previewHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Film size={15} color={colors.primary} />
                  <Text style={styles.previewSectionTitle}>Video Preview</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeVideoPill}
                  onPress={handleRemoveVideo}
                >
                  <X size={13} color={colors.danger} />
                  <Text style={styles.removeVideoText}>Remove</Text>
                </TouchableOpacity>
              </View>

              {/* Embedded Player Preview */}
              <View style={styles.videoPlayerContainer}>
                <VideoPlayer url={selectedVideo.uri} />
              </View>

              <View style={styles.videoMetaFooter}>
                <Text style={styles.videoFileName} numberOfLines={1}>
                  {selectedVideo.fileName || 'video.mp4'}
                </Text>
                <Text style={styles.videoFileSize}>
                  {formatFileSize(selectedVideo.fileSize)} · Supported up to 100MB
                </Text>
              </View>
            </View>
          )}

          {/* Poll Builder Card */}
          {showPollCreator && (
            <View style={[styles.pollBuilderCard, { backgroundColor: isDark ? '#18181B' : '#F9FAFB', borderColor: colors.border }]}>
              <View style={styles.pollBuilderHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <BarChart2 size={16} color={colors.primary} />
                  <Text style={[styles.pollBuilderTitle, { color: colors.primary }]}>Create Campus Poll</Text>
                </View>
                <TouchableOpacity onPress={() => setShowPollCreator(false)}>
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.pollOptionsContainer}>
                {pollOptions.map((opt, i) => (
                  <View key={i} style={[styles.pollInputRow, { backgroundColor: isDark ? '#27272A' : '#FFFFFF', borderColor: colors.border }]}>
                    <Text style={[styles.pollOptionNumber, { color: colors.textSecondary }]}>{i + 1}.</Text>
                    <TextInput
                      style={[styles.pollOptionInput, { color: colors.text }]}
                      placeholder={`Option ${i + 1} (e.g. ${i === 0 ? 'Yes / Agreed' : i === 1 ? 'No / Disagree' : 'Maybe'})`}
                      placeholderTextColor={colors.textSecondary}
                      value={opt}
                      onChangeText={(val) => handleUpdatePollOption(val, i)}
                      maxLength={60}
                    />
                    {pollOptions.length > 2 && (
                      <TouchableOpacity
                        style={styles.removePollOptBtn}
                        onPress={() => handleRemovePollOption(i)}
                      >
                        <Trash2 size={14} color={colors.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              {pollOptions.length < 4 && (
                <TouchableOpacity
                  style={[styles.addOptionBtn, { borderColor: colors.primary }]}
                  onPress={handleAddPollOption}
                  activeOpacity={0.8}
                >
                  <Plus size={14} color={colors.primary} />
                  <Text style={[styles.addOptionText, { color: colors.primary }]}>
                    Add Option ({pollOptions.length}/4)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* External URL Input */}
          {showUrlInput && (
            <View style={styles.urlInputSection}>
              <LinkIcon size={16} color={colors.primary} style={styles.urlIcon} />
              <TextInput
                style={styles.urlInput}
                placeholder="Paste YouTube, TikTok, or photo link..."
                placeholderTextColor={colors.textSecondary}
                value={externalUrl}
                onChangeText={setExternalUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {externalUrl ? (
                <TouchableOpacity onPress={() => setExternalUrl('')}>
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </ScrollView>

        {/* Bottom Media Action Bar */}
        <View style={styles.mediaBar}>
          <Text style={styles.mediaBarLabel}>Attach Content:</Text>

          <View style={styles.mediaButtonsRow}>
            {/* Gallery Images Button */}
            <TouchableOpacity
              style={[
                styles.mediaOptionBtn,
                selectedImages.length > 0 && styles.mediaOptionActive,
              ]}
              onPress={handlePickImages}
            >
              <ImageIcon
                size={18}
                color={selectedImages.length > 0 ? '#000000' : colors.text}
              />
              <Text
                style={[
                  styles.mediaOptionText,
                  selectedImages.length > 0 && { color: '#000000', fontWeight: '800' },
                ]}
              >
                Photos {selectedImages.length > 0 ? `(${selectedImages.length})` : ''}
              </Text>
            </TouchableOpacity>

            {/* Video Upload Button (Max 100MB) */}
            <TouchableOpacity
              style={[
                styles.mediaOptionBtn,
                selectedVideo && styles.mediaOptionActiveVideo,
              ]}
              onPress={handlePickVideo}
            >
              <VideoIcon
                size={18}
                color={selectedVideo ? '#000000' : colors.text}
              />
              <Text
                style={[
                  styles.mediaOptionText,
                  selectedVideo && { color: '#000000', fontWeight: '800' },
                ]}
              >
                {selectedVideo ? 'Video Added' : 'Video (100MB)'}
              </Text>
            </TouchableOpacity>

            {/* Poll Toggle */}
            <TouchableOpacity
              style={[styles.mediaOptionBtn, showPollCreator && styles.mediaOptionActive]}
              onPress={() => setShowPollCreator(!showPollCreator)}
            >
              <BarChart2
                size={18}
                color={showPollCreator ? colors.primary : colors.text}
              />
              <Text
                style={[
                  styles.mediaOptionText,
                  showPollCreator && { color: colors.primary, fontWeight: '700' },
                ]}
              >
                Poll
              </Text>
            </TouchableOpacity>

            {/* URL Embed Toggle */}
            <TouchableOpacity
              style={[styles.mediaOptionBtn, showUrlInput && styles.mediaOptionActive]}
              onPress={() => setShowUrlInput(!showUrlInput)}
            >
              <LinkIcon
                size={18}
                color={showUrlInput ? colors.primary : colors.text}
              />
              <Text
                style={[
                  styles.mediaOptionText,
                  showUrlInput && { color: colors.primary, fontWeight: '700' },
                ]}
              >
                Link
              </Text>
            </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sunYellow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  publishText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  contentInput: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  mediaPreviewSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  previewSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  imageThumbList: {
    gap: 10,
    paddingVertical: 4,
  },
  thumbWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageThumb: {
    width: '100%',
    height: '100%',
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreBtn: {
    width: 100,
    height: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  addMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },

  // Video Preview Styles
  videoPreviewSection: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.sunYellow,
    backgroundColor: '#FFFBEB',
    padding: 12,
  },
  removeVideoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  removeVideoText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
  },
  videoPlayerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  videoMetaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  videoFileName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  videoFileSize: {
    fontSize: 11,
    color: colors.sunYellowDark,
    fontWeight: '700',
  },

  // Poll Builder Styles
  pollBuilderCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginTop: 14,
  },
  pollBuilderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pollBuilderTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  pollOptionsContainer: {
    gap: 8,
  },
  pollInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pollOptionNumber: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 8,
  },
  pollOptionInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  removePollOptBtn: {
    padding: 6,
    marginLeft: 4,
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 10,
    gap: 6,
  },
  addOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // URL Input
  urlInputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14,
  },
  urlIcon: {
    marginRight: 8,
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14,
  },
  urlInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },

  // Bottom Media Bar
  mediaBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  mediaBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mediaButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mediaOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  mediaOptionActive: {
    backgroundColor: colors.sunYellowLight,
    borderColor: colors.sunYellow,
  },
  mediaOptionActiveVideo: {
    backgroundColor: colors.sunYellow,
    borderColor: '#000000',
  },
  mediaOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});
