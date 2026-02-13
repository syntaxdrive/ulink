import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { supabase } from '../../services/supabase';
import { useNavigation } from '@react-navigation/native';

export const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);

            // Determine the redirect URL based on the environment
            const redirectUrl = Platform.select({
                web: typeof window !== 'undefined' ? window.location.origin : undefined,
                default: undefined // Native handles this differently with schemes usually
            });

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: false,
                }
            });

            if (error) throw error;
        } catch (error: any) {
            Alert.alert('Google Login Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            Alert.alert('Login Failed', error.message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <GlassCard style={styles.card}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>

                    {/* Google Button */}
                    <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                        {/* Placeholder for Google Icon - using generic for now but aiming for pro look */}
                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.light.text, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>G</Text>
                        </View>
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or email</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWrapper}>
                            {/* <Mail size={20} color={colors.light.muted} style={styles.inputIcon} /> */}
                            <TextInput
                                style={styles.input}
                                placeholder="name@example.com"
                                placeholderTextColor={colors.light.muted}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            {/* <Lock size={20} color={colors.light.muted} style={styles.inputIcon} /> */}
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor={colors.light.muted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.navigate('Signup')}
                    >
                        <Text style={styles.linkText}>
                            Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </GlassCard>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Clean white background
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },
    card: {
        padding: 32,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        // Removed specific shadow here as GlassCard handles container style, but we override for clean look if needed
        shadowOpacity: 0,
        elevation: 0,
        borderWidth: 0,
    },
    title: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 28,
        color: colors.light.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 16,
        color: colors.light.muted,
        marginBottom: 32,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 14,
        color: colors.light.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.background,
        borderWidth: 1,
        borderColor: colors.light.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.light.text,
        fontFamily: 'Outfit_400Regular',
        height: '100%',
    },
    button: {
        backgroundColor: colors.light.text, // Black/Dark for primary action looks more pro than green sometimes, but stick to primary if requested. Let's try dark for "pro".
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Outfit_700Bold',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: colors.light.border,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 24,
        gap: 12,
    },
    googleButtonText: {
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
        color: colors.light.text,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.light.border,
    },
    dividerText: {
        marginHorizontal: 16,
        color: colors.light.muted,
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
    },
    linkButton: {
        alignItems: 'center',
    },
    linkText: {
        color: colors.light.muted,
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
    },
    linkTextBold: {
        color: colors.light.text, // Keep it neutral/pro
        fontFamily: 'Outfit_700Bold',
        textDecorationLine: 'underline',
    },
});
