import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mic2,
  Plus,
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  Clock,
  Music,
  Camera,
  X,
  FileAudio,
  Radio,
  AlertCircle,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors, useTheme } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { uploadService } from '../services/uploadService';

const CATEGORIES = [
  'Education',
  'Technology',
  'Business',
  'Entertainment',
  'Health',
  'Comedy',
  'Arts',
  'Campus Life',
  'Other',
];

interface PodcastStudioModalProps {
  visible: boolean;
  onClose: () => void;
  onPodcastCreatedOrUpdated?: () => void;
}

export function PodcastStudioModal({ visible, onClose, onPodcastCreatedOrUpdated }: PodcastStudioModalProps) {
  const { colors, isDark } = useTheme();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('Campus Creator');

  const [activeTab, setActiveTab] = useState<'my_shows' | 'create_show' | 'add_episode'>('my_shows');
  const [myPodcasts, setMyPodcasts] = useState<any[]>([]);
  const [loadingPodcasts, setLoadingPodcasts] = useState(true);

  // Create Podcast Form
  const [podTitle, setPodTitle] = useState('');
  const [podDesc, setPodDesc] = useState('');
  const [podCategory, setPodCategory] = useState('Campus Life');
  const [podCoverUrl, setPodCoverUrl] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submittingPod, setSubmittingPod] = useState(false);

  // Add Episode Form
  const [selectedPodcast, setSelectedPodcast] = useState<any>(null);
  const [epTitle, setEpTitle] = useState('');
  const [epDesc, setEpDesc] = useState('');
  const [epNumber, setEpNumber] = useState('1');
  const [epAudioUrl, setEpAudioUrl] = useState('');
  const [epAudioFileName, setEpAudioFileName] = useState('');
  const [epCoverUrl, setEpCoverUrl] = useState<string | null>(null);
  const [epDurationSec, setEpDurationSec] = useState('180');
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingEpCover, setUploadingEpCover] = useState(false);
  const [submittingEp, setSubmittingEp] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        fetchMyPodcasts(session.user.id);
        supabase
          .from('profiles')
          .select('name, username')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setCurrentUserName(data.name || data.username || 'Campus Creator');
          });
      }
    });
  }, [visible]);

  const fetchMyPodcasts = async (userId: string) => {
    try {
      setLoadingPodcasts(true);
      const { data, error } = await supabase
        .from('podcasts')
        .select(`
          *,
          episodes:podcast_episodes(*)
        `)
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyPodcasts(data || []);
    } catch (e) {
      console.warn('Error fetching my podcasts:', e);
    } finally {
      setLoadingPodcasts(false);
    }
  };

  // Pick Cover Image for Podcast
  const handlePickPodCover = async () => {
    try {
      setUploadingCover(true);
      const images = await uploadService.pickImages(1);
      if (images.length > 0) {
        const url = await uploadService.uploadFile(images[0], 'podcast-covers');
        setPodCoverUrl(url);
      }
    } catch (e: any) {
      Alert.alert('Upload Error', e.message || 'Failed to upload cover image.');
    } finally {
      setUploadingCover(false);
    }
  };

  // Pick Cover Image for Episode
  const handlePickEpCover = async () => {
    try {
      setUploadingEpCover(true);
      const images = await uploadService.pickImages(1);
      if (images.length > 0) {
        const url = await uploadService.uploadFile(images[0], 'podcast-covers');
        setEpCoverUrl(url);
      }
    } catch (e: any) {
      Alert.alert('Upload Error', e.message || 'Failed to upload episode cover image.');
    } finally {
      setUploadingEpCover(false);
    }
  };

  // Pick Audio File for Episode
  const handlePickAudioFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/aac'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        setEpAudioFileName(asset.name || 'episode_audio.mp3');
        setUploadingAudio(true);

        const url = await uploadService.uploadFile(
          {
            uri: asset.uri,
            type: 'video', // handles binary upload to storage
            fileName: asset.name || `audio_${Date.now()}.mp3`,
            mimeType: asset.mimeType || 'audio/mpeg',
            fileSize: asset.size,
          },
          'podcast-audio'
        );

        setEpAudioUrl(url);
        Alert.alert('Audio Uploaded', `Successfully uploaded ${asset.name}!`);
      }
    } catch (e: any) {
      Alert.alert('Audio Pick Error', e.message || 'Could not pick or upload audio file.');
    } finally {
      setUploadingAudio(false);
    }
  };

  // Submit New Podcast
  const handleCreatePodcast = async () => {
    if (!podTitle.trim()) {
      Alert.alert('Required', 'Please provide a podcast show title.');
      return;
    }
    if (!currentUserId) return;

    try {
      setSubmittingPod(true);
      const { data, error } = await supabase
        .from('podcasts')
        .insert({
          creator_id: currentUserId,
          title: podTitle.trim(),
          description: podDesc.trim() || null,
          category: podCategory,
          cover_url: podCoverUrl,
          status: 'pending', // Awaiting Admin Approval
          followers_count: 0,
          episodes_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      Alert.alert(
        'Show Submitted! 🎉',
        'Your podcast has been submitted for admin approval. Once verified by campus admins, it will appear publicly for everyone on campus!'
      );

      // Reset form
      setPodTitle('');
      setPodDesc('');
      setPodCoverUrl(null);
      if (currentUserId) fetchMyPodcasts(currentUserId);
      if (onPodcastCreatedOrUpdated) onPodcastCreatedOrUpdated();
      setActiveTab('my_shows');
    } catch (e: any) {
      Alert.alert('Creation Failed', e.message || 'Could not submit podcast.');
    } finally {
      setSubmittingPod(false);
    }
  };

  // Submit New Episode & Notify Followers
  const handlePublishEpisode = async () => {
    if (!selectedPodcast) {
      Alert.alert('Required', 'Please choose a podcast to publish this episode under.');
      return;
    }
    if (!epTitle.trim()) {
      Alert.alert('Required', 'Please enter an episode title.');
      return;
    }
    if (!epAudioUrl.trim()) {
      Alert.alert('Required', 'Please select or provide an audio file for this episode.');
      return;
    }
    if (!currentUserId) return;

    try {
      setSubmittingEp(true);
      const dur = parseInt(epDurationSec, 10) || 180;
      const num = parseInt(epNumber, 10) || ((selectedPodcast.episodes_count || 0) + 1);

      // 1. Insert Episode
      const { data: episode, error: epErr } = await supabase
        .from('podcast_episodes')
        .insert({
          podcast_id: selectedPodcast.id,
          title: epTitle.trim(),
          description: epDesc.trim() || null,
          audio_url: epAudioUrl.trim(),
          cover_url: epCoverUrl || selectedPodcast.cover_url || null,
          duration_seconds: dur,
          episode_number: num,
          plays_count: 0,
          is_published: true,
        })
        .select()
        .single();

      if (epErr) throw epErr;

      // 2. Increment episodes_count on podcast
      await supabase
        .from('podcasts')
        .update({
          episodes_count: (selectedPodcast.episodes_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedPodcast.id);

      // 3. Notify all Followers of this Creator!
      try {
        const { data: followers } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', currentUserId);

        if (followers && followers.length > 0) {
          const notificationsToInsert = followers.map((f) => ({
            user_id: f.follower_id,
            type: 'podcast_episode',
            title: `New Episode from ${currentUserName}`,
            message: `${currentUserName} just dropped a new episode: "${epTitle.trim()}" on ${selectedPodcast.title}!`,
            action_url: `/podcasts/${selectedPodcast.id}`,
            read: false,
          }));

          await supabase.from('notifications').insert(notificationsToInsert);
        }
      } catch (notifErr) {
        console.warn('Could not broadcast follower notifications:', notifErr);
      }

      Alert.alert(
        'Episode Published! 🚀',
        `"${epTitle}" is now live on ${selectedPodcast.title}! Your followers have been notified.`
      );

      // Reset form
      setEpTitle('');
      setEpDesc('');
      setEpAudioUrl('');
      setEpAudioFileName('');
      setEpCoverUrl(null);
      if (currentUserId) fetchMyPodcasts(currentUserId);
      if (onPodcastCreatedOrUpdated) onPodcastCreatedOrUpdated();
      setActiveTab('my_shows');
    } catch (e: any) {
      Alert.alert('Publish Error', e.message || 'Could not publish episode.');
    } finally {
      setSubmittingEp(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleRow}>
            <Mic2 size={20} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Creator Podcast Studio</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'my_shows' && styles.tabItemActive]}
            onPress={() => setActiveTab('my_shows')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'my_shows' ? colors.primary : colors.textSecondary }]}>
              My Shows ({myPodcasts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'create_show' && styles.tabItemActive]}
            onPress={() => setActiveTab('create_show')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'create_show' ? colors.primary : colors.textSecondary }]}>
              + Create Show
            </Text>
          </TouchableOpacity>

          {myPodcasts.length > 0 && (
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'add_episode' && styles.tabItemActive]}
              onPress={() => {
                if (!selectedPodcast) setSelectedPodcast(myPodcasts[0]);
                setActiveTab('add_episode');
              }}
            >
              <Text style={[styles.tabText, { color: activeTab === 'add_episode' ? colors.primary : colors.textSecondary }]}>
                + Add Episode
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {/* ── TAB 1: MY SHOWS ────────────────────────────────────── */}
          {activeTab === 'my_shows' && (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {loadingPodcasts ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
              ) : myPodcasts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Radio size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Podcasts Created Yet</Text>
                  <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                    Start your own campus podcast, share ideas, interview guests, and connect with fellow students!
                  </Text>
                  <TouchableOpacity
                    style={styles.primaryActionBtn}
                    onPress={() => setActiveTab('create_show')}
                  >
                    <Plus size={18} color="#000000" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryActionBtnText}>Create Your First Show</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                myPodcasts.map((pod) => {
                  const isApproved = pod.status === 'approved';
                  const isPending = pod.status === 'pending';
                  const isRejected = pod.status === 'rejected';

                  return (
                    <View
                      key={pod.id}
                      style={[styles.podcastCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                    >
                      <View style={styles.podCardHeader}>
                        {pod.cover_url ? (
                          <Image source={{ uri: pod.cover_url }} style={styles.podCardCover} />
                        ) : (
                          <View style={[styles.podCardCover, styles.placeholderCover]}>
                            <Mic2 size={24} color={colors.primary} />
                          </View>
                        )}

                        <View style={styles.podCardMeta}>
                          <Text style={[styles.podCardTitle, { color: colors.text }]} numberOfLines={1}>
                            {pod.title}
                          </Text>
                          <Text style={[styles.podCardCategory, { color: colors.textSecondary }]}>
                            {pod.category} · {pod.episodes?.length || pod.episodes_count || 0} episodes
                          </Text>

                          {/* Status Badge */}
                          <View style={styles.statusBadgeRow}>
                            {isApproved && (
                              <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
                                <CheckCircle2 size={12} color="#059669" style={{ marginRight: 4 }} />
                                <Text style={[styles.statusBadgeText, { color: '#059669' }]}>LIVE & APPROVED</Text>
                              </View>
                            )}
                            {isPending && (
                              <View style={[styles.statusBadge, { backgroundColor: '#FFFBEB', borderColor: '#F59E0B' }]}>
                                <Clock size={12} color="#D97706" style={{ marginRight: 4 }} />
                                <Text style={[styles.statusBadgeText, { color: '#D97706' }]}>PENDING ADMIN REVIEW</Text>
                              </View>
                            )}
                            {isRejected && (
                              <View style={[styles.statusBadge, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
                                <AlertCircle size={12} color="#DC2626" style={{ marginRight: 4 }} />
                                <Text style={[styles.statusBadgeText, { color: '#DC2626' }]}>CHANGES REQUESTED</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>

                      {pod.description ? (
                        <Text style={[styles.podCardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                          {pod.description}
                        </Text>
                      ) : null}

                      {/* Add Episode Shortcut */}
                      <TouchableOpacity
                        style={styles.addEpisodeBtn}
                        onPress={() => {
                          setSelectedPodcast(pod);
                          setActiveTab('add_episode');
                        }}
                      >
                        <Plus size={16} color={colors.primary} style={{ marginRight: 4 }} />
                        <Text style={[styles.addEpisodeBtnText, { color: colors.primary }]}>
                          Drop New Episode
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}

          {/* ── TAB 2: CREATE PODCAST SHOW ─────────────────────────── */}
          {activeTab === 'create_show' && (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <Text style={[styles.formSectionTitle, { color: colors.text }]}>Show Details</Text>

              {/* Cover Artwork Picker */}
              <TouchableOpacity style={styles.coverPicker} onPress={handlePickPodCover} activeOpacity={0.8}>
                {podCoverUrl ? (
                  <Image source={{ uri: podCoverUrl }} style={styles.coverPreview} />
                ) : (
                  <View style={styles.coverPickerPlaceholder}>
                    {uploadingCover ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Camera size={28} color={colors.primary} />
                        <Text style={[styles.coverPickerText, { color: colors.textSecondary }]}>
                          Upload Show Cover (Square)
                        </Text>
                      </>
                    )}
                  </View>
                )}
              </TouchableOpacity>

              {/* Title Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Podcast Title *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. Unilag Tech Talks, The Law Review..."
                  placeholderTextColor={colors.textSecondary}
                  value={podTitle}
                  onChangeText={setPodTitle}
                />
              </View>

              {/* Description Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                  placeholder="What is your podcast about? Tell campus students what to expect..."
                  placeholderTextColor={colors.textSecondary}
                  value={podDesc}
                  onChangeText={setPodDesc}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Category Pills */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = podCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.catPill,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceElevated,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setPodCategory(cat)}
                      >
                        <Text style={[styles.catPillText, { color: isSelected ? '#000000' : colors.textSecondary }]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Notice */}
              <View style={styles.infoBanner}>
                <AlertCircle size={16} color="#059669" style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={styles.infoBannerText}>
                  Podcasts require a quick one-time admin approval to ensure safety and quality standards before public broadcast.
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreatePodcast}
                disabled={submittingPod}
              >
                {submittingPod ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Podcast for Approval</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ── TAB 3: ADD NEW EPISODE ─────────────────────────────── */}
          {activeTab === 'add_episode' && (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <Text style={[styles.formSectionTitle, { color: colors.text }]}>
                Publish to: {selectedPodcast?.title || 'Select Show'}
              </Text>

              {/* Select Show Picker if multiple */}
              {myPodcasts.length > 1 && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Select Podcast Show</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {myPodcasts.map((p) => {
                      const isSel = selectedPodcast?.id === p.id;
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[
                            styles.showPill,
                            {
                              backgroundColor: isSel ? colors.primary : colors.surfaceElevated,
                              borderColor: isSel ? colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => setSelectedPodcast(p)}
                        >
                          <Text style={[styles.showPillText, { color: isSel ? '#000' : colors.text }]}>
                            {p.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Audio File Picker */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Audio File (MP3, M4A, WAV) *</Text>
                <TouchableOpacity style={styles.audioPickerBox} onPress={handlePickAudioFile} activeOpacity={0.8}>
                  {uploadingAudio ? (
                    <View style={styles.uploadingBox}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={[styles.uploadingText, { color: colors.textSecondary }]}>
                        Uploading audio to Cloud Storage...
                      </Text>
                    </View>
                  ) : epAudioUrl ? (
                    <View style={styles.audioSelectedRow}>
                      <FileAudio size={24} color="#10B981" />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.audioFileName, { color: colors.text }]} numberOfLines={1}>
                          {epAudioFileName || 'Audio Ready'}
                        </Text>
                        <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '700' }}>✓ UPLOADED</Text>
                      </View>
                      <TouchableOpacity onPress={() => { setEpAudioUrl(''); setEpAudioFileName(''); }}>
                        <X size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.audioPrompt}>
                      <UploadCloud size={28} color={colors.primary} />
                      <Text style={[styles.audioPromptTitle, { color: colors.text }]}>Choose Audio Track</Text>
                      <Text style={[styles.audioPromptSub, { color: colors.textSecondary }]}>
                        Tap to select MP3 or M4A from your device files
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Episode Title */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Episode Title *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. Ep 1: Welcome to Campus, Midterm Advice..."
                  placeholderTextColor={colors.textSecondary}
                  value={epTitle}
                  onChangeText={setEpTitle}
                />
              </View>

              {/* Episode Description */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Episode Description</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                  placeholder="Tell listeners what happened in this episode..."
                  placeholderTextColor={colors.textSecondary}
                  value={epDesc}
                  onChangeText={setEpDesc}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Episode Number & Duration */}
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Episode #</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                    placeholder="1"
                    placeholderTextColor={colors.textSecondary}
                    value={epNumber}
                    onChangeText={setEpNumber}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Duration (Seconds)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                    placeholder="180"
                    placeholderTextColor={colors.textSecondary}
                    value={epDurationSec}
                    onChangeText={setEpDurationSec}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Broadcast Notice */}
              <View style={styles.infoBanner}>
                <Radio size={16} color="#059669" style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={styles.infoBannerText}>
                  When you publish, all of your campus followers will receive an instant notification to tune in!
                </Text>
              </View>

              {/* Submit Episode */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handlePublishEpisode}
                disabled={submittingEp || uploadingAudio}
              >
                {submittingEp ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text style={styles.submitBtnText}>Publish Episode & Notify Followers</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 14,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 24,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  primaryActionBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  podcastCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  podCardHeader: {
    flexDirection: 'row',
  },
  podCardCover: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  placeholderCover: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podCardMeta: {
    flex: 1,
    marginLeft: 12,
  },
  podCardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  podCardCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  podCardDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 10,
  },
  addEpisodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  addEpisodeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
  },
  coverPicker: {
    width: 140,
    height: 140,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  coverPreview: {
    width: '100%',
    height: '100%',
  },
  coverPickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  coverPickerText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  showPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  showPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  audioPickerBox: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
  },
  uploadingBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  uploadingText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  audioSelectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  audioFileName: {
    fontSize: 13,
    fontWeight: '700',
  },
  audioPrompt: {
    alignItems: 'center',
  },
  audioPromptTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
  },
  audioPromptSub: {
    fontSize: 12,
    marginTop: 2,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    lineHeight: 16,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
});
