import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  KeyRound,
  CheckCircle2,
  X,
  ShieldCheck,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { apiClient } from '../../api/client';
import { colors } from '../../theme/colors';

export default function LoginScreen({ navigation }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password Reset / 6-Digit OTP Modal State
  const [passwordSetupVisible, setPasswordSetupVisible] = useState(false);
  const [passwordSetupStep, setPasswordSetupStep] = useState<'prompt' | 'otp'>('otp');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);

  // Real-time Account Auto-Detection for Google Auth / Existing Users
  const [detectedAccount, setDetectedAccount] = useState<{ id: string; name: string; username: string; avatar_url: string; email: string } | null>(null);
  const [checkingAccount, setCheckingAccount] = useState(false);

  // Auto-scan email against registered profiles
  useEffect(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.') || !isLogin) {
      setDetectedAccount(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingAccount(true);
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url, email')
          .ilike('email', trimmed)
          .maybeSingle();

        if (data) {
          setDetectedAccount(data);
        } else {
          setDetectedAccount(null);
        }
      } catch {
        // Ignore
      } finally {
        setCheckingAccount(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [email, isLogin]);

  const setToken = useAuthStore((state) => state.setToken);

  // 2. Email & Password Sign-In / Sign-Up
  const handleSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    if (!isLogin && !name.trim()) {
      Alert.alert('Missing Fields', 'Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Supabase Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (error) {
          // Fallback to NestJS API
          try {
            const res = await apiClient.post('/auth/login', {
              email: trimmedEmail,
              password: trimmedPassword,
            });
            if (res.data?.access_token) {
              await setToken(res.data.access_token);
              return;
            }
          } catch {
            throw new Error('Invalid email or password. If you forgot your password or previously used Google, tap "Forgot Password?" below.');
          }
        }

        if (data?.session && data?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('university, name')
            .eq('id', data.user.id)
            .single();

          if (!profile?.university) {
            navigation.navigate('ProfileOnboarding', { userId: data.user.id });
          } else {
            await setToken(data.session.access_token, data.user.id);
          }
        }
      } else {
        // Supabase Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
          options: {
            data: {
              name: name.trim(),
              full_name: name.trim(),
            },
          },
        });

        if (error) {
          try {
            const res = await apiClient.post('/auth/register', {
              email: trimmedEmail,
              password: trimmedPassword,
              name: name.trim(),
            });
            if (res.data?.access_token) {
              await setToken(res.data.access_token);
              return;
            }
          } catch {
            throw error;
          }
        }

        if (data.session && data.user) {
          navigation.navigate('ProfileOnboarding', { userId: data.user.id });
        } else if (data.user && !data.session) {
          Alert.alert(
            'Check Your Email ✉️',
            'We sent a confirmation code to your email address. Please verify to log in!'
          );
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert(
        isLogin ? 'Login Failed' : 'Registration Failed',
        error.message || 'Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 3. Request 6-Digit Password Reset Code (Only when clicking Forgot Password)
  const handleRequestPasswordOtp = async () => {
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      Alert.alert('Email Required', 'Please enter your email address first.');
      return;
    }

    setSettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail);
      if (error) throw error;
      setPasswordSetupStep('otp');
      setPasswordSetupVisible(true);
      Alert.alert(
        '6-Digit Code Sent ✉️',
        `We sent a 6-digit confirmation code to ${targetEmail}. Check your inbox and enter it below!`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send verification code.');
    } finally {
      setSettingPassword(false);
    }
  };

  // 4. Verify 6-Digit Code & Set Permanent Password
  const handleVerifyOtpAndSetPassword = async () => {
    const targetEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();
    const cleanPass = newPassword.trim();

    if (!cleanOtp) {
      Alert.alert('Missing Code', 'Please enter the 6-digit code sent to your email.');
      return;
    }
    if (cleanPass.length < 6) {
      Alert.alert('Short Password', 'Your password must be at least 6 characters.');
      return;
    }

    setSettingPassword(true);
    try {
      let session = null;

      // 1. Verify OTP 6-digit code (tries recovery type first, then email type)
      const { data: sessionData, error: otpErr } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: cleanOtp,
        type: 'recovery',
      });

      if (sessionData?.session) {
        session = sessionData.session;
      } else {
        const { data: emailData, error: emailErr } = await supabase.auth.verifyOtp({
          email: targetEmail,
          token: cleanOtp,
          type: 'email',
        });
        if (emailData?.session) {
          session = emailData.session;
        } else {
          throw otpErr || emailErr;
        }
      }

      // 2. Set the user's permanent password
      const { error: passErr } = await supabase.auth.updateUser({
        password: cleanPass,
      });
      if (passErr) throw passErr;

      // 3. Log user in
      if (session) {
        await setToken(session.access_token, session.user.id);
        setPasswordSetupVisible(false);
        Alert.alert(
          'Password Saved 🎉',
          'Your password has been updated! You are now logged in.'
        );
      }
    } catch (err: any) {
      Alert.alert('Verification Error', err.message || 'Invalid code. Please check your email and try again.');
    } finally {
      setSettingPassword(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <View style={styles.brandRow}>
            <Text style={styles.brandLogo}>UniLink</Text>
            <View style={styles.greenDot} />
          </View>
          <TouchableOpacity
            style={styles.onboardingBtn}
            onPress={() => navigation.navigate('Onboarding')}
          >
            <Text style={styles.onboardingBtnText}>About App</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.heading}>
              {isLogin ? 'Welcome Back!' : 'Join Your Campus.'}
            </Text>

            <Text style={styles.subheading}>
              {isLogin
                ? 'Sign in to access student communities, study groups, podcasts, and campus chats.'
                : 'Create your account to connect with verified classmates and collaborate.'}
            </Text>

            {/* Form Container */}
            <View style={styles.formContainer}>
              {/* Full Name (Sign Up only) */}
              {!isLogin && (
                <View style={styles.inputWrapper}>
                  <User size={18} color="rgba(0, 0, 0, 0.5)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name (e.g. Alex Johnson)"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Mail size={18} color="rgba(0, 0, 0, 0.5)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Student Email (e.g. name@gmail.com)"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  importantForAutofill="yes"
                />
              </View>

              {/* Quick Domain Suggestions (e.g. @gmail.com) */}
              {email.length > 1 && !email.includes('@') && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.domainPillsScroll}
                >
                  {['@gmail.com', '@yahoo.com', '@outlook.com', '@icloud.com'].map((domain) => (
                    <TouchableOpacity
                      key={domain}
                      style={styles.domainPill}
                      onPress={() => setEmail(email.trim() + domain)}
                    >
                      <Text style={styles.domainPillText}>{domain}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Real-time Account Auto-Detection (Google Auth / Existing User helper) */}
              {detectedAccount && isLogin && (
                <View style={styles.detectedInlineCard}>
                  <View style={styles.detectedInlineHeader}>
                    <View style={styles.accountPill}>
                      <CheckCircle2 size={12} color="#059669" />
                      <Text style={styles.accountPillText}>ACCOUNT DETECTED</Text>
                    </View>
                    <Text style={styles.detectedStudentName} numberOfLines={1}>
                      {detectedAccount.name || detectedAccount.username || 'Student'}
                    </Text>
                  </View>
                  <Text style={styles.detectedInlineNotice}>
                    👋 Previously logged in with Google on the web or need to set your mobile password? Tap below to get a 6-digit confirmation code and sign in!
                  </Text>
                  <TouchableOpacity
                    style={styles.inlinePasswordActionBtn}
                    onPress={() => handleRequestPasswordOtp()}
                    disabled={settingPassword}
                    activeOpacity={0.85}
                  >
                    {settingPassword ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <KeyRound size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.inlinePasswordActionText}>
                          Request 6-Digit Code & Set Password
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Lock size={18} color="rgba(0, 0, 0, 0.5)" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  placeholder="Password"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  textContentType="password"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="rgba(0, 0, 0, 0.5)" />
                  ) : (
                    <Eye size={18} color="rgba(0, 0, 0, 0.5)" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Forgot Password Link */}
              {isLogin && (
                <TouchableOpacity
                  style={styles.forgotPasswordBtn}
                  onPress={() => {
                    const targetEmail = email.trim().toLowerCase();
                    if (!targetEmail) {
                      Alert.alert(
                        'Email Required',
                        'Please enter your email address first so we can send you your 6-digit recovery code.'
                      );
                      return;
                    }
                    handleRequestPasswordOtp();
                  }}
                  disabled={settingPassword}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              {/* Action Button (Solid Black / Emerald) */}
              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>
                      {isLogin ? 'Log In' : 'Create Account'}
                    </Text>
                    <View style={styles.chevronGroup}>
                      <ChevronRight size={18} color="#ffffff" />
                      <ChevronRight size={18} color="#ffffff" style={{ marginLeft: -10 }} />
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom Footer Switch */}
            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>
                {isLogin ? 'New to UniLink?' : 'Already have an account?'}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.footerActionText}>
                  {isLogin ? 'Create Account' : 'Log In'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ── 🌟 6-Digit Code & Password Setup Modal (White, Green & Black) ── */}
      <Modal
        visible={passwordSetupVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordSetupVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detectedCard}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setPasswordSetupVisible(false)}
            >
              <X size={20} color="#000000" />
            </TouchableOpacity>

            <View style={styles.detectedHeaderBadge}>
              <KeyRound size={16} color="#059669" style={{ marginRight: 6 }} />
              <Text style={styles.detectedBadgeText}>Set Account Password</Text>
            </View>

            <Text style={styles.detectedTitle}>
              Reset / Set Password
            </Text>

            <Text style={styles.detectedSubtitle}>
              Enter the 6-digit code sent to{' '}
              <Text style={{ fontWeight: '800', color: '#000000' }}>
                {email}
              </Text>{' '}
              to create your password:
            </Text>

            {passwordSetupStep === 'prompt' ? (
              <View style={{ gap: 10, width: '100%', marginTop: 8 }}>
                <TouchableOpacity
                  style={styles.setPasswordBtn}
                  onPress={handleRequestPasswordOtp}
                  disabled={settingPassword}
                >
                  {settingPassword ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Mail size={17} color="#ffffff" style={{ marginRight: 8 }} />
                      <Text style={styles.setPasswordBtnText}>Send 6-Digit Code to Email</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* Step 2: Enter 6-digit OTP and New Password */
              <View style={{ gap: 12, width: '100%', marginTop: 8 }}>
                <View style={styles.modalInputWrapper}>
                  <Mail size={16} color="rgba(0,0,0,0.5)" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter 6-Digit Code"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    value={otpCode}
                    onChangeText={setOtpCode}
                    keyboardType="number-pad"
                    maxLength={8}
                  />
                </View>

                <View style={styles.modalInputWrapper}>
                  <Lock size={16} color="rgba(0,0,0,0.5)" style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.modalInput, { paddingRight: 36 }]}
                    placeholder="Create New Password (min 6 chars)"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtnModal}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff size={16} color="rgba(0,0,0,0.5)" />
                    ) : (
                      <Eye size={16} color="rgba(0,0,0,0.5)" />
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.setPasswordBtn}
                  onPress={handleVerifyOtpAndSetPassword}
                  disabled={settingPassword}
                >
                  {settingPassword ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <CheckCircle2 size={17} color="#ffffff" style={{ marginRight: 8 }} />
                      <Text style={styles.setPasswordBtnText}>Save Password & Log In</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ alignSelf: 'center', marginTop: 4 }}
                  onPress={handleRequestPasswordOtp}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#059669' }}>
                    Resend 6-Digit Code
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#059669',
    marginLeft: 3,
  },
  onboardingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  onboardingBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 30,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.65)',
    lineHeight: 20,
    marginBottom: 20,
  },

  // Form Container
  formContainer: {
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    paddingVertical: 12,
    fontWeight: '500',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  domainPillsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 2,
    marginBottom: 12,
    marginTop: -4,
  },
  domainPill: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  domainPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },

  // Real-time Detected Account Inline Card (Emerald Green Theme)
  detectedInlineCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#10B981',
    padding: 14,
    marginTop: -2,
    marginBottom: 4,
  },
  detectedInlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    gap: 4,
  },
  accountPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669',
  },
  detectedStudentName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
    flex: 1,
  },
  detectedInlineNotice: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.7)',
    lineHeight: 17,
    marginBottom: 10,
  },
  inlinePasswordActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 20,
    paddingVertical: 11,
    paddingHorizontal: 16,
    gap: 6,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  inlinePasswordActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },

  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 8,
    marginTop: -4,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingVertical: 15,
    marginTop: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 4,
  },
  chevronGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  footerPrompt: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  footerActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    textDecorationLine: 'underline',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detectedCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    padding: 4,
  },
  detectedHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  detectedBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#059669',
  },
  detectedTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 8,
  },
  detectedSubtitle: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 19,
    marginBottom: 16,
  },
  setPasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 24,
    paddingVertical: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  setPasswordBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  modalInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    paddingVertical: 10,
    fontWeight: '600',
  },
  eyeBtnModal: {
    position: 'absolute',
    right: 10,
    padding: 4,
  },
});
