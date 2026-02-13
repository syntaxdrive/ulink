import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { supabase } from '../../services/supabase';
import { useNavigation } from '@react-navigation/native';

export const SignupScreen = () => {
    const navigation = useNavigation<any>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password || !name) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        // 1. Sign up with Supabase Auth
        const { data: { user }, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name, // Metadata
                }
            }
        });

        if (error) {
            setLoading(false);
            Alert.alert('Signup Failed', error.message);
            return;
        }

        if (user) {
            // 2. Create Profile Entry
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    name: name,
                    email: email,
                    role: 'student', // Default role
                    is_verified: false
                });

            setLoading(false);

            if (profileError) {
                console.error('Profile creation error:', profileError);
                Alert.alert('Error', 'Account created but profile setup failed. Please contact support.');
            } else {
                Alert.alert('Success', 'Account created! Please check your email for verification.');
                navigation.navigate('Login');
            }
        } else {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <GlassCard style={styles.card}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join the UniLink community</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="John Doe"
                                placeholderTextColor={colors.light.muted}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
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

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Create a password"
                                placeholderTextColor={colors.light.muted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.linkText}>
                                Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
                            </Text>
                        </TouchableOpacity>
                    </GlassCard>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    card: {
        padding: 24,
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
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
        borderColor: colors.light.border,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.light.text,
        fontFamily: 'Outfit_400Regular',
    },
    button: {
        backgroundColor: colors.light.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
        shadowColor: colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Outfit_700Bold',
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
        color: colors.light.primary,
        fontFamily: 'Outfit_700Bold',
    },
});
