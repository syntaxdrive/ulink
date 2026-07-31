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
  SafeAreaView,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { apiClient } from '../../api/client';

// Required for Expo web auth session completion
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((state) => state.setToken);

  /**
   * Google Sign-In using Android Client ID (package: host.exp.exponent).
   * Android Client IDs authenticate via package name + SHA-1 fingerprint —
   * no redirect URI configuration needed, works natively in Expo Go.
   */
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
      '565981659026-q80que64vph4p593d7f8mo7ev3uu6jk8.apps.googleusercontent.com',
    webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
      '565981659026-t7odr503s7pjj8c4jv0o09878lcukk01.apps.googleusercontent.com',
  });

  // Handle Google Auth response when it changes
  useEffect(() => {
    if (response?.type === 'success') {
      const accessToken = response.authentication?.accessToken || response.params?.access_token;
      const idToken = response.authentication?.idToken || response.params?.id_token;

      console.log('[Google Auth] Success. Has idToken:', !!idToken, 'Has accessToken:', !!accessToken);
      handleGoogleToken({ accessToken, idToken });
    } else if (response?.type === 'error') {
      Alert.alert('Google Sign-In Error', response.error?.message || 'Authentication failed.');
    }
  }, [response]);

  /**
   * Exchange Google token for a UniLink JWT via NestJS backend.
   */
  const handleGoogleToken = async ({
    accessToken,
    idToken,
  }: {
    accessToken?: string | null;
    idToken?: string | null;
  }) => {
    setLoading(true);
    try {
      // Attempt 1: Verify ID Token on NestJS backend
      if (idToken) {
        try {
          const res = await apiClient.post('/auth/google', { idToken });
          await setToken(res.data.access_token);
          return;
        } catch {
          console.warn('[Google Auth] ID token verification failed, trying UserInfo fallback...');
        }
      }

      // Attempt 2: Fetch Google UserInfo with Access Token and authenticate profile
      if (accessToken) {
        const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userInfo = await userInfoRes.json();

        if (userInfo?.email) {
          const res = await apiClient.post('/auth/google-profile', {
            email: userInfo.email,
            name: userInfo.name,
            avatarUrl: userInfo.picture,
          });
          await setToken(res.data.access_token);
          return;
        }
      }

      Alert.alert('Google Sign-In Error', 'Could not retrieve profile from Google. Please try again.');
    } catch (err: any) {
      const serverMsg = Array.isArray(err.response?.data?.message)
        ? err.response?.data?.message.join('\n')
        : err.response?.data?.message;
      Alert.alert('Google Sign-In Error', serverMsg || err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Email / password sign-in or registration via NestJS backend.
   */
  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin ? { email, password } : { email, password, name };
      const res = await apiClient.post(endpoint, body);
      await setToken(res.data.access_token);
    } catch (error: any) {
      const serverMessage = Array.isArray(error.response?.data?.message)
        ? error.response?.data?.message.join('\n')
        : error.response?.data?.message;
      Alert.alert(
        'Authentication Failed',
        serverMessage || error.message || 'Unable to connect. Check your network.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.logo}>UniLink</Text>
            <Text style={styles.subtitle}>University Social Network</Text>
          </View>

          <View style={styles.formContainer}>
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.buttonText}>{isLogin ? 'Log in' : 'Sign up'}</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Continue with Google Button */}
            <TouchableOpacity
              style={[styles.googleButton, (!request || loading) && styles.buttonDisabled]}
              onPress={() => promptAsync()}
              disabled={!request || loading}
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.linkText}>{isLogin ? 'Sign up' : 'Log in'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.text,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
