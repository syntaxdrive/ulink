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
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { apiClient } from '../../api/client';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((state) => state.setToken);

  const googleClientId =
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    '565981659026-t7odr503s7pjj8c4jv0o09878lcukk01.apps.googleusercontent.com';

  // Initialize Google Auth Session using standard Expo Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: googleClientId,
    androidClientId: googleClientId,
    iosClientId: googleClientId,
  });

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      console.log('[Google Auth] Success response received:', JSON.stringify(response));
      const idToken =
        response.authentication?.idToken ||
        response.params?.id_token ||
        response.params?.access_token;

      if (idToken) {
        setLoading(true);
        apiClient
          .post('/auth/google', { idToken })
          .then(async (res) => {
            await setToken(res.data.access_token);
          })
          .catch((err) => {
            const serverMsg = Array.isArray(err.response?.data?.message)
              ? err.response?.data?.message.join('\n')
              : err.response?.data?.message;
            Alert.alert(
              'Google Auth Failed',
              serverMsg || err.message || 'Unable to authenticate with Google',
            );
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        Alert.alert('Google Auth Failed', 'No ID token received from Google.');
      }
    } else if (response?.type === 'error') {
      Alert.alert('Google Auth Error', response.error?.message || 'Authentication error');
    }
  }, [response]);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin ? { email, password } : { email, password, name };

      const response = await apiClient.post(endpoint, body);
      await setToken(response.data.access_token);
    } catch (error: any) {
      const serverMessage = Array.isArray(error.response?.data?.message)
        ? error.response?.data?.message.join('\n')
        : error.response?.data?.message;
      const errorMessage =
        serverMessage || error.message || 'Unable to connect to NestJS server. Check network connection.';
      Alert.alert('Authentication Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const clientId =
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
      '565981659026-t7odr503s7pjj8c4jv0o09878lcukk01.apps.googleusercontent.com';

    const redirectUri = 'https://auth.expo.io/@syntaxdrive/unilink';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId,
    )}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_type=token%20id_token&scope=${encodeURIComponent(
      'openid profile email',
    )}&nonce=${Math.random().toString(36).substring(2)}`;

    try {
      setLoading(true);
      console.log('[Google Web Auth] Opening auth session with URL:', authUrl);

      const res = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      console.log('[Google Web Auth] Session result:', JSON.stringify(res));

      if (res.type === 'success' && res.url) {
        const urlObj = res.url;
        const hashParams = new URLSearchParams(
          urlObj.includes('#') ? urlObj.split('#')[1] : urlObj.split('?')[1] || '',
        );

        const accessToken = hashParams.get('access_token');
        const idToken = hashParams.get('id_token');

        console.log('[Google Web Auth] Parsed tokens:', { accessToken: !!accessToken, idToken: !!idToken });

        // Attempt 1: Verify ID Token with NestJS
        if (idToken) {
          try {
            const apiRes = await apiClient.post('/auth/google', { idToken });
            await setToken(apiRes.data.access_token);
            return;
          } catch (err) {
            console.warn('[Google Web Auth] ID token verification skipped, using UserInfo fallback...');
          }
        }

        // Attempt 2: Fetch UserInfo with Access Token
        if (accessToken) {
          const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const userInfo = await userInfoRes.json();

          if (userInfo && userInfo.email) {
            const apiRes = await apiClient.post('/auth/google-profile', {
              email: userInfo.email,
              name: userInfo.name,
              avatarUrl: userInfo.picture,
            });
            await setToken(apiRes.data.access_token);
            return;
          }
        }

        Alert.alert('Google Sign-In Error', 'Unable to complete sign-in from Google response.');
      } else if (res.type === 'cancel' || res.type === 'dismiss') {
        console.log('[Google Web Auth] User cancelled sign-in session.');
      } else {
        Alert.alert('Google Sign-In Error', 'Authentication session failed.');
      }
    } catch (err: any) {
      console.error('[Google Web Auth] Exception:', err);
      Alert.alert('Google Sign-In Error', err.message || 'Failed to complete Google Sign-In');
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
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
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
    backgroundColor: colors.text, // Black background (Apple style)
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.background, // White text
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
