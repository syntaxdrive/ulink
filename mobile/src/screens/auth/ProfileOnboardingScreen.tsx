import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  Check,
  ChevronRight,
  BookOpen,
  GraduationCap,
  MapPin,
  User,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { uploadService } from '../../services/uploadService';
import { notificationService } from '../../services/notificationService';
import { useAuthStore } from '../../store/authStore';

const POPULAR_UNIVERSITIES = [
  'University of Lagos (UNILAG)',
  'Lagos State University (LASU)',
  'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU)',
  'University of Benin (UNIBEN)',
  'Federal University of Tech, Akure (FUTA)',
  'Covenant University',
  'Babcock University',
  'Landmark University',
  'Other Campus',
];

const SKILL_OPTIONS = [
  '💻 Coding',
  '🎨 UI/UX Design',
  '🎙️ Podcasts',
  '🤖 AI & ML',
  '📈 Finance & Business',
  '🎵 Music & Arts',
  '⚽ Sports',
  '✍️ Writing',
  '🔬 Research',
  '🎮 Gaming',
];

export default function ProfileOnboardingScreen({ navigation, route }: any) {
  const { userId: routeUserId } = (route?.params || {}) as { userId?: string };
  const checkToken = useAuthStore((state) => state.checkToken);

  const [userId, setUserId] = useState<string | null>(routeUserId || null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [university, setUniversity] = useState('');
  const [customUni, setCustomUni] = useState('');
  const [department, setDepartment] = useState('');
  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = routeUserId || session?.user?.id;
        if (uid) {
          setUserId(uid);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .single();

          if (profile) {
            setName(profile.name || '');
            setUsername(profile.username || '');
            setUniversity(profile.university || '');
            setDepartment(profile.department || '');
            setHeadline(profile.headline || '');
            setAbout(profile.about || '');
            setAvatarUri(profile.avatar_url || null);
            if (Array.isArray(profile.skills)) {
              setSelectedSkills(profile.skills);
            }
          }
        }
      } catch (e) {
        console.warn('Error loading initial profile:', e);
      } finally {
        setFetchingExisting(false);
      }
    };
    loadCurrentUser();
  }, [routeUserId]);

  const handlePickAvatar = async () => {
    try {
      const media = await uploadService.pickImages(1);
      if (media.length > 0) {
        setAvatarUri(media[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Photo Error', e.message || 'Could not choose avatar photo.');
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills((prev) => prev.filter((s) => s !== skill));
    } else {
      setSelectedSkills((prev) => [...prev, skill]);
    }
  };

  const handleSaveAndComplete = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter your full name.');
      return;
    }

    const chosenUni = (university === 'Other Campus' ? customUni : university).trim();
    if (!chosenUni) {
      Alert.alert('Missing University', 'Please select or enter your university.');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = userId || session?.user?.id;

      if (!uid) {
        throw new Error('User session not found. Please log in again.');
      }

      let uploadedAvatarUrl = avatarUri;
      if (avatarUri && !avatarUri.startsWith('http')) {
        uploadedAvatarUrl = await uploadService.uploadFile(
          { uri: avatarUri, type: 'image' },
          'avatars'
        );
      }

      const generatedUsername =
        username.trim() ||
        name.trim().toLowerCase().replace(/\s+/g, '') + '_' + Math.random().toString(36).substring(2, 6);

      const updates = {
        name: name.trim(),
        username: generatedUsername,
        university: chosenUni,
        department: department.trim() || null,
        headline: headline.trim() || `${department ? `${department} at ` : 'Student at '}${chosenUni}`,
        about: about.trim() || null,
        skills: selectedSkills,
        avatar_url: uploadedAvatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', uid);

      if (error) throw error;

      // Dispatch native push notification, in-app notification, and welcome DM
      notificationService.dispatchWelcomeFlow(uid, name.trim(), chosenUni).catch(() => {});
      notificationService.registerForPushNotificationsAsync(uid).catch(() => {});

      await checkToken();
      Alert.alert('Profile Complete 🎉', 'Welcome to UniLink! You are now connected to your campus.');
    } catch (err: any) {
      console.error('Profile setup error:', err);
      Alert.alert('Setup Error', err.message || 'Could not complete profile setup.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingExisting) {
    return (
      <SafeAreaView style={styles.loadingBox}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.stepBadge}>ONBOARDING · PROFILE SETUP</Text>
            <Text style={styles.title}>Welcome to UniLink</Text>
          </View>
          <GraduationCap size={24} color={colors.primary} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Set up your student profile to meet classmates, join campus podcasts, and share study materials.
          </Text>

          {/* Avatar Upload Box */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.avatarTouchable}
              onPress={handlePickAvatar}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={38} color="#ffffff" />
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Camera size={14} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to upload your student photo</Text>
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. johndoe"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          {/* University Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Your University *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {POPULAR_UNIVERSITIES.map((uni) => {
                const isSelected = university === uni;
                return (
                  <TouchableOpacity
                    key={uni}
                    style={[styles.uniChip, isSelected && styles.uniChipActive]}
                    onPress={() => setUniversity(uni)}
                  >
                    <BookOpen
                      size={12}
                      color={isSelected ? '#ffffff' : colors.textSecondary}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.uniChipText, isSelected && styles.uniChipTextActive]}>
                      {uni}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {university === 'Other Campus' && (
              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                placeholder="Enter your campus name..."
                placeholderTextColor={colors.textSecondary}
                value={customUni}
                onChangeText={setCustomUni}
              />
            )}
          </View>

          {/* Department / Major */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Department / Major</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Computer Science '27"
              placeholderTextColor={colors.textSecondary}
              value={department}
              onChangeText={setDepartment}
            />
          </View>

          {/* Headline */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Headline / Status</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. AI & Mobile Dev Enthusiast | UNILAG '27"
              placeholderTextColor={colors.textSecondary}
              value={headline}
              onChangeText={setHeadline}
            />
          </View>

          {/* Interests & Skills */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Campus Interests & Skills</Text>
            <View style={styles.skillsWrap}>
              {SKILL_OPTIONS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <TouchableOpacity
                    key={skill}
                    style={[styles.skillChip, isSelected && styles.skillChipActive]}
                    onPress={() => toggleSkill(skill)}
                  >
                    <Text style={[styles.skillText, isSelected && styles.skillTextActive]}>
                      {skill}
                    </Text>
                    {isSelected && <Check size={12} color="#ffffff" style={{ marginLeft: 4 }} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* About Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Short Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell other students about yourself, your hobbies, and projects..."
              placeholderTextColor={colors.textSecondary}
              value={about}
              onChangeText={setAbout}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSaveAndComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Complete Profile & Enter Campus</Text>
                <ChevronRight size={20} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginTop: 2,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000000',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  uniChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  uniChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  uniChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  uniChipTextActive: {
    color: '#ffffff',
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  skillTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
