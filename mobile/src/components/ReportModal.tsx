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
import { X, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react-native';
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
          targetUserName || 'this student'
        }'s account and take appropriate action.`,
        [{ text: 'OK', onPress: () => {
          setDetails('');
          onClose();
        }}]
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
