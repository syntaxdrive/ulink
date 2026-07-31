import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Play, Pause, FastForward, Rewind, Volume2, Heart } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { colors } from '../../theme/colors';

export default function PodcastScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { podcastId } = (route.params || {}) as { podcastId: string };

  const [podcast, setPodcast] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState<any>(null);

  useEffect(() => {
    fetchPodcastData();
  }, [podcastId]);

  const fetchPodcastData = async () => {
    try {
      setLoading(true);
      const [podRes, epiRes] = await Promise.all([
        apiClient.get(`/podcasts/${podcastId}`),
        apiClient.get(`/podcasts/${podcastId}/episodes`),
      ]);
      setPodcast(podRes.data);
      setEpisodes(epiRes.data.data || epiRes.data || []);
      
      if ((epiRes.data.data || epiRes.data)?.length > 0) {
        setActiveEpisode((epiRes.data.data || epiRes.data)[0]);
      }
    } catch (error) {
      console.error('Failed to load podcast:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePlayEpisode = (episode: any) => {
    setActiveEpisode(episode);
    setIsPlaying(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!podcast) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Podcast not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity style={styles.actionBtn}>
          <Volume2 size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Artwork */}
        <View style={styles.artworkContainer}>
          <Image
            source={{ uri: podcast.cover_url || 'https://via.placeholder.com/300' }}
            style={styles.artwork}
          />
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.podcastTitle}>{podcast.title}</Text>
          <Text style={styles.creatorName}>{podcast.creator?.name || 'Campus Creator'}</Text>
          <Text style={styles.episodeTitle} numberOfLines={2}>
            {activeEpisode ? activeEpisode.title : 'Select an episode'}
          </Text>
        </View>

        {/* Progress Bar Placeholder */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>12:34</Text>
            <Text style={styles.timeText}>-34:56</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlBtn}>
            <Rewind size={32} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause}>
            {isPlaying ? (
              <Pause size={36} color={colors.background} fill={colors.background} />
            ) : (
              <Play size={36} color={colors.background} fill={colors.background} style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn}>
            <FastForward size={32} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Episodes List */}
        <View style={styles.episodesSection}>
          <Text style={styles.sectionTitle}>Episodes ({episodes.length})</Text>
          {episodes.map((epi) => (
            <TouchableOpacity 
              key={epi.id} 
              style={[
                styles.episodeCard,
                activeEpisode?.id === epi.id && styles.activeEpisodeCard
              ]}
              onPress={() => handlePlayEpisode(epi)}
            >
              <View style={styles.episodePlayIcon}>
                {activeEpisode?.id === epi.id && isPlaying ? (
                  <Pause size={16} color={colors.primary} />
                ) : (
                  <Play size={16} color={colors.textSecondary} />
                )}
              </View>
              <View style={styles.episodeInfo}>
                <Text style={styles.epiTitle} numberOfLines={1}>{epi.title}</Text>
                <Text style={styles.epiDuration}>45 mins • {new Date(epi.created_at).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    padding: 5,
  },
  actionBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  artworkContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  artwork: {
    width: 320,
    height: 320,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  infoContainer: {
    paddingHorizontal: 25,
    alignItems: 'center',
    marginBottom: 30,
  },
  podcastTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  creatorName: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 10,
  },
  episodeTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressContainer: {
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 3,
    marginBottom: 10,
  },
  progressFill: {
    width: '35%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 40,
  },
  controlBtn: {
    padding: 10,
  },
  playBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  episodesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 15,
  },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 10,
  },
  activeEpisodeCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  episodePlayIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  episodeInfo: {
    flex: 1,
  },
  epiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  epiDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
