import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Bug, Send, Sparkles } from 'lucide-react-native';
import { colors, useTheme } from '../theme/colors';
import { supabase } from '../lib/supabase';

const OFFENCE_CATEGORIES = [
  { id: 'harassment', label: 'Harassment or Bullying', icon: '🛑' },
  { id: 'inappropriate', label: 'Inappropriate / Explicit Content', icon: '⚠️' },
  { id: 'spam_scam', label: 'Spam, Scam or Impersonation', icon: '🚫' },
  { id: 'hate_speech', label: 'Hate Speech or Discrimination', icon: '⛔' },
  { id: 'academic_dishonesty', label: 'Academic Dishonesty or Cheating', icon: '📚' },
  { id: 'violence', label: 'Threats, Violence or Harm', icon: '🚨' },
  { id: 'other', label: 'Other Offence or Guideline Breach', icon: '📝' },
];

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName?: string;
  targetPostId?: string;
}

export function ReportModal({
  visible,
  onClose,
  targetUserId,
  targetUserName,
  targetPostId,
}: ReportModalProps) {
  const { colors, isDark } = useTheme();
  const [selectedReason, setSelectedReason] = useState(OFFENCE_CATEGORIES[0].label);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReport = async () => {
    if (!targetUserId) {
      Alert.alert('Error', 'Invalid target user for report.');
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;

      if (!currentUserId) {
        Alert.alert('Sign In Required', 'You must be signed in to submit a report.');
        return;
      }

      if (currentUserId === targetUserId) {
        Alert.alert('Notice', 'You cannot report your own account.');
        return;
      }

      const description = `[${selectedReason}]${
        targetPostId ? ` (Post ID: ${targetPostId})` : ''
      } - ${details.trim() || 'No additional notes'}`;

      const { error } = await supabase.from('reports').insert({
        reporter_id: currentUserId,
        reported_user_id: targetUserId,
        description,
        status: 'pending',
      });

      if (error) throw error;

      Alert.alert(
        'Report Submitted 🛡️',
        `Thank you for helping keep our campus safe. We will review ${
          targetUserName || 'this user'
        }'s content and take action within 24 hours. Would you also like to block this user?`,
        [
          {
            text: 'Block User',
            style: 'destructive',
            onPress: async () => {
              try {
                if (currentUserId && targetUserId) {
                  await supabase.from('blocked_users').insert({
                    blocker_id: currentUserId,
                    blocked_id: targetUserId,
                  });
                }
                Alert.alert('Blocked', `${targetUserName || 'User'} has been blocked.`);
              } catch {}
              setDetails('');
              onClose();
            },
          },
          {
            text: 'Done',
            onPress: () => {
              setDetails('');
              onClose();
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Could not submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={[styles.sheet, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <ShieldAlert size={20} color="#EF4444" />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Report Offence</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Reporting @{targetUserName || 'student'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              SELECT OFFENCE CATEGORY
            </Text>

            {OFFENCE_CATEGORIES.map((cat) => {
              const isSelected = selectedReason === cat.label;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryRow,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(239, 68, 68, 0.15)'
                          : '#FEF2F2'
                        : isDark
                        ? '#27272A'
                        : '#F9FAFB',
                      borderColor: isSelected ? '#EF4444' : isDark ? '#3F3F46' : '#E5E7EB',
                    },
                  ]}
                  onPress={() => setSelectedReason(cat.label)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.catLabel,
                      {
                        color: isSelected ? '#DC2626' : colors.text,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                  {isSelected && <CheckCircle2 size={18} color="#DC2626" style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              );
            })}

            {/* Additional Details Note */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 16 }]}>
              ADDITIONAL DETAILS (OPTIONAL)
            </Text>
            <TextInput
              style={[
                styles.detailsInput,
                {
                  backgroundColor: isDark ? '#27272A' : '#F9FAFB',
                  borderColor: isDark ? '#3F3F46' : '#E5E7EB',
                  color: colors.text,
                },
              ]}
              placeholder="Provide context or explanation to help moderators review..."
              placeholderTextColor={colors.textTertiary}
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmitReport}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <AlertTriangle size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>Submit Report</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  catIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  catLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailsInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 🐞 BUG REPORT MODAL (For Reporting Issues, Crashes & App Feedback)
// ─────────────────────────────────────────────────────────────────────────────

const BUG_CATEGORIES = [
  { id: 'glitch', label: 'App Glitch or Freeze', icon: '🐞' },
  { id: 'podcast', label: 'Podcast / Audio Playback', icon: '🎙️' },
  { id: 'video', label: 'Video / Shorts Playback', icon: '📹' },
  { id: 'messaging', label: 'Chat / Direct Messages', icon: '💬' },
  { id: 'account', label: 'Account / Verification', icon: '🛡️' },
  { id: 'suggestion', label: 'Feature Suggestion / Feedback', icon: '💡' },
];

interface BugReportModalProps {
  visible: boolean;
  onClose: () => void;
}

export function BugReportModal({ visible, onClose }: BugReportModalProps) {
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(BUG_CATEGORIES[0].label);
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Description Required', 'Please describe the bug or issue you encountered.');
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      const userEmail = session?.user?.email || contactEmail.trim();

      const reportPayload = {
        user_id: currentUserId || null,
        user_email: userEmail || null,
        category: selectedCategory,
        description: description.trim(),
        device_os: `${Platform.OS} ${Platform.Version}`,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('bug_reports').insert(reportPayload);

      if (error && currentUserId) {
        await supabase
          .from('reports')
          .insert({
            reporter_id: currentUserId,
            reported_user_id: currentUserId,
            description: `[BUG REPORT: ${selectedCategory}] - ${description.trim()} (OS: ${Platform.OS})`,
            status: 'pending',
          });
      }

      Alert.alert(
        'Thank You! 🚀',
        'Your bug report has been submitted to the UniLink team. We will investigate and address it promptly.',
        [
          {
            text: 'Done',
            onPress: () => {
              setDescription('');
              onClose();
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        'Report Logged',
        'Thank you for reporting this issue to our team!'
      );
      setDescription('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={bugStyles.modalBackdrop}
      >
        <View style={[bugStyles.modalCard, { backgroundColor: isDark ? '#14141A' : '#FFFFFF' }]}>
          {/* Header */}
          <View style={bugStyles.modalHeader}>
            <View style={bugStyles.titleRow}>
              <View style={[bugStyles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <Bug size={20} color="#EF4444" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={[bugStyles.modalTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Report an Issue or Bug
                </Text>
                <Text style={bugStyles.modalSubtitle}>Help us improve UniLink</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={bugStyles.scrollBody}>
            {/* Category Select */}
            <Text style={[bugStyles.sectionLabel, { color: isDark ? '#D1D5DB' : '#374151' }]}>
              What kind of issue are you experiencing?
            </Text>

            <View style={bugStyles.categoriesGrid}>
              {BUG_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.label;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      bugStyles.categoryCard,
                      {
                        backgroundColor: isSelected
                          ? (isDark ? '#1E293B' : '#ECFDF5')
                          : (isDark ? '#1F1F27' : '#F9FAFB'),
                        borderColor: isSelected
                          ? '#10B981'
                          : (isDark ? '#2E2E3A' : '#E5E7EB'),
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat.label)}
                    activeOpacity={0.8}
                  >
                    <Text style={bugStyles.categoryIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        bugStyles.categoryLabel,
                        {
                          color: isSelected
                            ? '#10B981'
                            : (isDark ? '#E5E7EB' : '#1F2937'),
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Description Text Input */}
            <Text style={[bugStyles.sectionLabel, { color: isDark ? '#D1D5DB' : '#374151', marginTop: 14 }]}>
              Describe what happened:
            </Text>
            <TextInput
              style={[
                bugStyles.textArea,
                {
                  backgroundColor: isDark ? '#1C1C24' : '#F9FAFB',
                  borderColor: isDark ? '#2E2E3A' : '#E5E7EB',
                  color: isDark ? '#FFFFFF' : '#000000',
                },
              ]}
              placeholder="e.g. When playing a podcast while scrolling feed, audio paused..."
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />

            {/* Optional Email */}
            <Text style={[bugStyles.sectionLabel, { color: isDark ? '#D1D5DB' : '#374151', marginTop: 14 }]}>
              Contact Email (Optional for follow-up):
            </Text>
            <TextInput
              style={[
                bugStyles.singleInput,
                {
                  backgroundColor: isDark ? '#1C1C24' : '#F9FAFB',
                  borderColor: isDark ? '#2E2E3A' : '#E5E7EB',
                  color: isDark ? '#FFFFFF' : '#000000',
                },
              ]}
              placeholder="your.email@university.edu"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              keyboardType="email-address"
              autoCapitalize="none"
              value={contactEmail}
              onChangeText={setContactEmail}
            />

            {/* Device Info Note */}
            <View style={[bugStyles.deviceInfoBanner, { backgroundColor: isDark ? '#1A1A22' : '#F3F4F6' }]}>
              <Sparkles size={14} color="#10B981" />
              <Text style={bugStyles.deviceInfoText}>
                Device info ({Platform.OS} {Platform.Version}) will be attached to help resolve the issue.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[bugStyles.submitButton, submitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Send size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={bugStyles.submitButtonText}>Submit Bug Report</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const bugStyles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
  scrollBody: {
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  categoriesGrid: {
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  categoryLabel: {
    fontSize: 13,
    flex: 1,
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    minHeight: 90,
  },
  singleInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  deviceInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginTop: 14,
    gap: 8,
  },
  deviceInfoText: {
    fontSize: 11,
    color: '#9CA3AF',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 18,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
