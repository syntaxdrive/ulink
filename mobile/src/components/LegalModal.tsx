import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { X, ShieldCheck, FileText, Lock, Users } from 'lucide-react-native';
import { useTheme } from '../theme/colors';

export type LegalDocType = 'terms' | 'privacy' | 'guidelines';

interface LegalModalProps {
  visible: boolean;
  initialDoc?: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  visible,
  initialDoc = 'terms',
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialDoc);

  React.useEffect(() => {
    if (visible) {
      setActiveTab(initialDoc);
    }
  }, [visible, initialDoc]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: isDark ? '#121218' : '#FFFFFF' }]}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: isDark ? '#262634' : '#E5E7EB' }]}>
              <View style={styles.headerTitleRow}>
                <ShieldCheck size={20} color="#10B981" style={{ marginRight: 8 }} />
                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Legal & Community Safety
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

          {/* Tab Selector */}
          <View style={[styles.tabBar, { borderBottomColor: isDark ? '#262634' : '#E5E7EB' }]}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'terms' && styles.tabBtnActive]}
              onPress={() => setActiveTab('terms')}
            >
              <FileText size={14} color={activeTab === 'terms' ? '#3B82F6' : '#9CA3AF'} style={{ marginRight: 4 }} />
              <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>
                Terms / EULA
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'privacy' && styles.tabBtnActive]}
              onPress={() => setActiveTab('privacy')}
            >
              <Lock size={14} color={activeTab === 'privacy' ? '#3B82F6' : '#9CA3AF'} style={{ marginRight: 4 }} />
              <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>
                Privacy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'guidelines' && styles.tabBtnActive]}
              onPress={() => setActiveTab('guidelines')}
            >
              <Users size={14} color={activeTab === 'guidelines' ? '#3B82F6' : '#9CA3AF'} style={{ marginRight: 4 }} />
              <Text style={[styles.tabText, activeTab === 'guidelines' && styles.tabTextActive]}>
                Guidelines
              </Text>
            </TouchableOpacity>
          </View>

          {/* Document Content */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {activeTab === 'terms' && (
              <View>
                <Text style={[styles.docHeading, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Terms of Service & End User License Agreement (EULA)
                </Text>
                <Text style={styles.lastUpdated}>Last Updated: August 2026</Text>

                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  1. Acceptance of Terms
                </Text>
                <Text style={[styles.bodyText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  By creating an account, downloading, or using UniLink ("the App"), you agree to be bound by these Terms of Service and End User License Agreement. If you do not agree, do not use the service.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  2. User-Generated Content & Zero-Tolerance Policy
                </Text>
                <Text style={[styles.bodyText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  UniLink allows students to post notes, discussions, podcasts, images, and messages. UniLink maintains a strict <Text style={{ fontWeight: '700' }}>ZERO-TOLERANCE policy for objectionable content</Text> including:
                </Text>
                <Text style={[styles.bulletText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  • Harassment, bullying, threats, or intimidation of any peer or student.
                </Text>
                <Text style={[styles.bulletText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  • Hate speech, discrimination based on tribe, religion, gender, or nationality.
                </Text>
                <Text style={[styles.bulletText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  • Sexually explicit content, pornography, or non-consensual imagery.
                </Text>
                <Text style={[styles.bulletText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  • Examination malpractice fraud, scams, or malicious impersonation.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  3. Content Moderation & User Reporting
                </Text>
                <Text style={[styles.bodyText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  Users can immediately report any post, comment, or user profile using the in-app "Report" button. Reported content is reviewed within 24 hours. Violating content is removed immediately, and abusive accounts are permanently banned.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  4. Account Termination & Deletion
                </Text>
                <Text style={[styles.bodyText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  You may delete your account and all associated data at any time directly through the Profile Settings menu. UniLink reserves the right to terminate accounts that violate our community safety standards.
                </Text>
              </View>
            )}

            {activeTab === 'privacy' && (
              <View>
                <Text style={[styles.docHeading, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Privacy Policy & Data Safety
                </Text>
                <Text style={styles.lastUpdated}>Last Updated: August 2026</Text>

                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  1. Information We Collect
                </Text>
                <Text style={[styles.bodyText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  We collect information necessary to provide student networking and educational collaboration:
                </Text>
                <Text style={[styles.bulletText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  • <Text style={{ fontWeight: '700' }}>Account Info</Text>: Name, email address, campus/university, username, and password.
                </Text>
                <Text style={[styles.bulletText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  • <Text style={{ fontWeight: '700' }}>User Content</Text>: Posts, study room messages, notes, and podcast uploads.
                </Text>
                <Text style={[styles.bulletText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  • <Text style={{ fontWeight: '700' }}>Device Permissions</Text>: Camera & photo library (only when uploading pictures/avatars), and microphone (only when recording audio messages or podcasts).
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  2. How We Use Your Data
                </Text>
                <Text style={[styles.bodyText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  Your data is used strictly to power campus connections, verify student status, authenticate your sessions, and deliver educational content. We do NOT sell your personal data to third parties or advertisers.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  3. Your Right to Account & Data Deletion
                </Text>
                <Text style={[styles.bodyText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  In full compliance with Google Play Data Safety requirements, you have the right to permanently erase your profile, posts, comments, and uploaded media at any time using the "Delete Account" button in your profile settings.
                </Text>
              </View>
            )}

            {activeTab === 'guidelines' && (
              <View>
                <Text style={[styles.docHeading, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Campus Community Guidelines
                </Text>
                <Text style={styles.lastUpdated}>Our commitment to a safe campus network</Text>

                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  1. Respect and Mutual Academic Support
                </Text>
                <Text style={[styles.bodyText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  UniLink is a community of ambitious Nigerian and global university students. Treat every peer, lecturer, and creator with dignity and constructive feedback.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  2. Authentic Student Identities
                </Text>
                <Text style={[styles.bodyText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  Do not create misleading accounts, spam links, or impersonate student leaders, lecturers, or departments.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  3. Protecting Your Safety & Blocking
                </Text>
                <Text style={[styles.bodyText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  If someone makes you feel uncomfortable or violates our rules, use the "Block User" and "Report" tools immediately. Our campus moderation team takes action on all reports within 24 hours.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Close Button */}
          <View style={[styles.footer, { borderTopColor: isDark ? '#262634' : '#E5E7EB' }]}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>I Understand & Agree</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  </Modal>
);
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: '88%',
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  contentScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  docHeading: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 19,
    paddingLeft: 8,
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  doneBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});