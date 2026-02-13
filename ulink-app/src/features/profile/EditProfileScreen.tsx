import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { supabase } from '../../services/supabase';
import { useAuth } from '../auth/AuthContext';
import { Camera, ChevronLeft, Upload, X, Globe, MapPin, School, Hash } from 'lucide-react-native';

export const EditProfileScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();

    // Form State
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [headline, setHeadline] = useState('');
    const [about, setAbout] = useState('');
    const [location, setLocation] = useState('');
    const [university, setUniversity] = useState('');
    const [website, setWebsite] = useState('');

    // Images
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

    // Skills
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');

    // Loading States
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBg, setUploadingBg] = useState(false);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (error) throw error;

            if (data) {
                setName(data.name || '');
                setUsername(data.username || '');
                setHeadline(data.headline || '');
                setAbout(data.about || data.bio || ''); // Handle both naming conventions if necessary
                setLocation(data.location || '');
                setUniversity(data.university || '');
                setWebsite(data.website_url || '');
                setAvatarUrl(data.avatar_url);
                setBackgroundUrl(data.background_image_url);
                setSkills(data.skills || []);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async (type: 'avatar' | 'background') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: type === 'avatar' ? [1, 1] : [3, 1], // Aspect ratio for bg
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0], type);
        }
    };

    const uploadImage = async (asset: ImagePicker.ImagePickerAsset, type: 'avatar' | 'background') => {
        try {
            const setUploading = type === 'avatar' ? setUploadingAvatar : setUploadingBg;
            setUploading(true);

            if (!asset.base64) throw new Error('No image data');

            const bucket = 'uploads'; // Using 'uploads' bucket to match web app, or verify functionality
            const folder = type === 'avatar' ? 'avatars' : 'backgrounds';
            const filePath = `${folder}/${user?.id}_${new Date().getTime()}.jpg`;
            const contentType = 'image/jpeg';

            // Decode base64
            const arrayBuffer = decode(asset.base64);

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, arrayBuffer, {
                    contentType,
                    upsert: true,
                });

            if (uploadError) {
                // Fallback to 'avatars' bucket if 'uploads' doesn't exist or permission denied
                if (bucket === 'uploads') {
                    // Try standard buckets if needed, but assuming 'uploads' based on web code
                    throw uploadError;
                }
            }

            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            if (type === 'avatar') {
                setAvatarUrl(data.publicUrl);
            } else {
                setBackgroundUrl(data.publicUrl);
            }
        } catch (error: any) {
            Alert.alert('Upload Error', error.message);
        } finally {
            const setUploading = type === 'avatar' ? setUploadingAvatar : setUploadingBg;
            setUploading(false);
        }
    };

    const decode = (base64: string) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // Validate username
            if (username.length < 3) {
                throw new Error('Username must be at least 3 characters');
            }
            if (!/^[a-z0-9_]+$/.test(username)) {
                // For simplicity, converting to lowercase automatically or alerting
            }

            const updates = {
                id: user?.id,
                name,
                username: username.toLowerCase().replace(/\s/g, ''), // Enforce format
                headline,
                about,
                location,
                university,
                website_url: website,
                skills,
                avatar_url: avatarUrl,
                background_image_url: backgroundUrl,
                updated_at: new Date(),
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) {
                if (error.code === '23505') throw new Error('Username taken');
                throw error;
            }

            Alert.alert('Success', 'Profile updated successfully');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={28} color={colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading || uploadingAvatar || uploadingBg}>
                    <Text style={[styles.saveText, (loading || uploadingAvatar || uploadingBg) && styles.disabledText]}>
                        {loading ? 'Saving...' : 'Save'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Background Image */}
                <View style={styles.backgroundContainer}>
                    <TouchableOpacity onPress={() => pickImage('background')} style={styles.backgroundWrapper}>
                        {backgroundUrl ? (
                            <Image source={{ uri: backgroundUrl }} style={styles.backgroundImage} />
                        ) : (
                            <View style={[styles.backgroundImage, styles.backgroundPlaceholder]}>
                                <Text style={styles.placeholderText}>Add Cover Photo</Text>
                            </View>
                        )}
                        <View style={styles.editIconOverlay}>
                            {uploadingBg ? <ActivityIndicator color="#FFF" /> : <Camera size={16} color="#FFF" />}
                        </View>
                    </TouchableOpacity>

                    {/* Avatar (Overlapping) */}
                    <TouchableOpacity onPress={() => pickImage('avatar')} style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: avatarUrl || 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                        />
                        <View style={styles.avatarEditIcon}>
                            {uploadingAvatar ? <ActivityIndicator size="small" color="#FFF" /> : <Camera size={14} color="#FFF" />}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Basic Info */}
                <GlassCard style={styles.sectionCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="John Doe"
                            placeholderTextColor={colors.light.muted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="johndoe"
                            autoCapitalize="none"
                            placeholderTextColor={colors.light.muted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Headline</Text>
                        <TextInput
                            style={styles.input}
                            value={headline}
                            onChangeText={setHeadline}
                            placeholder="Student at University | Developer"
                            placeholderTextColor={colors.light.muted}
                        />
                    </View>
                </GlassCard>

                {/* About Section */}
                <GlassCard style={styles.sectionCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>About</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={about}
                            onChangeText={setAbout}
                            placeholder="Tell us about yourself..."
                            placeholderTextColor={colors.light.muted}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </GlassCard>

                {/* Details Section */}
                <GlassCard style={styles.sectionCard}>
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <MapPin size={14} color={colors.light.muted} />
                            <Text style={styles.labelWithIcon}>Location</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="Lagos, Nigeria"
                            placeholderTextColor={colors.light.muted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <School size={14} color={colors.light.muted} />
                            <Text style={styles.labelWithIcon}>University / Org</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={university}
                            onChangeText={setUniversity}
                            placeholder="University of Lagos"
                            placeholderTextColor={colors.light.muted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Globe size={14} color={colors.light.muted} />
                            <Text style={styles.labelWithIcon}>Website</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={website}
                            onChangeText={setWebsite}
                            placeholder="https://portfolio.com"
                            autoCapitalize="none"
                            placeholderTextColor={colors.light.muted}
                        />
                    </View>
                </GlassCard>

                {/* Skills Section */}
                <GlassCard style={styles.sectionCard}>
                    <View style={styles.labelRow}>
                        <Hash size={14} color={colors.light.muted} />
                        <Text style={styles.labelWithIcon}>Skills</Text>
                    </View>

                    <View style={styles.skillsContainer}>
                        {skills.map((skill, index) => (
                            <View key={index} style={styles.skillTag}>
                                <Text style={styles.skillText}>{skill}</Text>
                                <TouchableOpacity onPress={() => removeSkill(skill)}>
                                    <X size={12} color={colors.light.text} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <View style={styles.addSkillRow}>
                        <TextInput
                            style={[styles.input, styles.skillInput]}
                            value={newSkill}
                            onChangeText={setNewSkill}
                            placeholder="Add a skill (e.g. React)"
                            placeholderTextColor={colors.light.muted}
                            onSubmitEditing={addSkill}
                        />
                        <TouchableOpacity onPress={addSkill} style={styles.addButton}>
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </GlassCard>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
        backgroundColor: colors.light.background,
        zIndex: 10,
    },
    headerTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 20,
        color: colors.light.text,
    },
    backButton: {
        padding: 4,
    },
    saveText: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        color: colors.light.primary,
    },
    disabledText: {
        color: colors.light.muted,
    },
    content: {
        paddingBottom: 40,
    },
    backgroundContainer: {
        marginBottom: 60, // Space for avatar overlap
        position: 'relative',
    },
    backgroundWrapper: {
        height: 150,
        width: '100%',
        backgroundColor: colors.light.border,
        position: 'relative',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    backgroundPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E5E7EB',
    },
    placeholderText: {
        fontFamily: 'Outfit_500Medium',
        color: colors.light.muted,
    },
    editIconOverlay: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
        borderRadius: 20,
    },
    avatarWrapper: {
        position: 'absolute',
        bottom: -50,
        left: 20,
        borderWidth: 4,
        borderColor: colors.light.background,
        borderRadius: 50,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.light.border,
    },
    avatarEditIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.light.primary,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.light.background,
    },
    sectionCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#FFF',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 13,
        color: colors.light.text,
        marginBottom: 8,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    labelWithIcon: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 13,
        color: colors.light.text,
    },
    input: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 15,
        color: colors.light.text,
        borderWidth: 1,
        borderColor: colors.light.border,
        borderRadius: 12,
        padding: 12,
        backgroundColor: colors.light.background,
    },
    textArea: {
        minHeight: 100,
        paddingTop: 12,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    skillTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.background,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: colors.light.border,
    },
    skillText: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 13,
        color: colors.light.text,
    },
    addSkillRow: {
        flexDirection: 'row',
        gap: 10,
    },
    skillInput: {
        flex: 1,
    },
    addButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.light.primary,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    addButtonText: {
        fontFamily: 'Outfit_700Bold',
        color: '#FFF',
        fontSize: 14,
    }
});
