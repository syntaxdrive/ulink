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

  // Initialize Google Auth Session with deep link redirect URI for Expo Go
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '1058293740201-unilink.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({ scheme: 'unilink' }),
  });

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        setLoading(true);
        apiClient
          .post('/auth/google', { idToken: id_token })
          .then(async (res) => {
            await setToken(res.data.access_token);
          })
          .catch((err) => {
            const serverMsg = Array.isArray(err.response?.data?.message)
              ? err.response?.data?.message.join('\n')
              : err.response?.data?.message;
            Alert.alert('Google Auth Failed', serverMsg || err.message || 'Unable to authenticate with Google');
          })
          .finally(() => {
            setLoading(false);
          });
      }
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

  const handleGoogleSignIn = () => {
    if (!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) {
      Alert.alert(
        'Google Client ID Required',
        'Please enter your Google Web Client ID from Google Cloud Console into mobile/.env under EXPO_PUBLIC_GOOGLE_CLIENT_ID.',
      );
      return;
    }

    if (request && promptAsync) {
      promptAsync();
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
