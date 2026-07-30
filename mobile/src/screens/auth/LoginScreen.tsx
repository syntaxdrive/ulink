import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, SafeAreaView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { apiClient } from '../../api/client';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin ? { email, password } : { email, password, name };

      const response = await apiClient.post(endpoint, body);
      await setToken(response.data.access_token);
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.message || 'Check your network connection and credentials.');
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
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.linkText}>
                  {isLogin ? "Sign up" : "Log in"}
                </Text>
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
    marginBottom: 48,
    alignItems: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
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
  }
});
