import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { supabase } from '../../services/supabase';
import { useAuth } from '../auth/AuthContext';
import { MapPin, Link as LinkIcon, School, Grid, Users } from 'lucide-react-native';

export const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const { signOut } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    posts:posts(count)
                `)
                .eq('id', user.id)
                .single();

            // Connections count
            const { count: connectionsCount } = await supabase
                .from('connections')
                .select('*', { count: 'exact', head: true })
                .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
                .eq('status', 'accepted');

            if (data) {
                setProfile({ ...data, connections_count: connectionsCount || 0 });
            }
        }
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Cover Photo */}
            <View style={styles.coverContainer}>
                {profile?.background_image_url ? (
                    <Image source={{ uri: profile.background_image_url }} style={styles.coverImage} />
                ) : (
                    <View style={styles.coverPlaceholder} />
                )}
            </View>

            <View style={styles.profileHeader}>
                <Image
                    source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/150' }}
                    style={styles.avatar}
                />
                <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.name}>{profile?.name || 'User'}</Text>
                <Text style={styles.username}>@{profile?.username || 'user'}</Text>

                {profile?.headline ? (
                    <Text style={styles.headline}>{profile.headline}</Text>
                ) : null}

                <View style={styles.locationRow}>
                    {profile?.location ? (
                        <View style={styles.metaItem}>
                            <MapPin size={14} color={colors.light.muted} />
                            <Text style={styles.metaText}>{profile.location}</Text>
                        </View>
                    ) : null}

                    {profile?.university ? (
                        <View style={styles.metaItem}>
                            <School size={14} color={colors.light.muted} />
                            <Text style={styles.metaText}>{profile.university}</Text>
                        </View>
                    ) : null}
                </View>

                {profile?.website_url ? (
                    <TouchableOpacity onPress={() => Linking.openURL(profile.website_url)} style={styles.websiteRow}>
                        <LinkIcon size={14} color={colors.light.primary} />
                        <Text style={styles.websiteText}>{profile.website_url}</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            <View style={styles.statsCard}>
                <View style={[styles.statItem, { flex: 1 }]}>
                    <Text style={styles.statValue}>{profile?.posts?.[0]?.count || 0}</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.divider} />
                <View style={[styles.statItem, { flex: 1 }]}>
                    <Text style={styles.statValue}>{profile?.connections_count || 0}</Text>
                    <Text style={styles.statLabel}>Connections</Text>
                </View>
            </View>

            {/* About Section */}
            {(profile?.about || profile?.bio) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.aboutText}>{profile.about || profile.bio}</Text>
                </View>
            )}

            {/* Skills Section */}
            {profile?.skills && profile.skills.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <View style={styles.skillsContainer}>
                        {profile.skills.map((skill: string, index: number) => (
                            <View key={index} style={styles.skillTag}>
                                <Text style={styles.skillText}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <GlassCard style={styles.actionCard}>
                    <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Settings')}>
                        <Text style={styles.actionText}>Settings</Text>
                    </TouchableOpacity>
                </GlassCard>
            </View>

            <View style={styles.section}>
                <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    content: {
        paddingBottom: 40,
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 50,
        color: colors.light.muted,
        fontFamily: 'Outfit_400Regular',
    },
    coverContainer: {
        height: 150,
        width: '100%',
        backgroundColor: colors.light.border,
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    coverPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.light.border,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: -50,
        marginBottom: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: colors.light.background,
        backgroundColor: colors.light.border,
    },
    editButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: colors.light.background,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.light.border,
        marginBottom: 10,
    },
    editButtonText: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 14,
        color: colors.light.text,
    },
    infoSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    name: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 24,
        color: colors.light.text,
        marginBottom: 2,
    },
    username: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: colors.light.muted,
        marginBottom: 8,
    },
    headline: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 16,
        color: colors.light.text,
        marginBottom: 12,
        lineHeight: 22,
    },
    locationRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 13,
        color: colors.light.muted,
    },
    websiteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    websiteText: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 13,
        color: colors.light.primary,
    },
    statsCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.light.border,
        backgroundColor: '#FFF',
        marginBottom: 20,
        paddingHorizontal: 40,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        color: colors.light.text,
    },
    statLabel: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: colors.light.muted,
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: colors.light.border,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        color: colors.light.text,
        marginBottom: 12,
    },
    aboutText: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 15,
        color: colors.light.text,
        lineHeight: 24,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillTag: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: colors.light.card, // or colors.light.background
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.light.border,
    },
    skillText: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 13,
        color: colors.light.text,
    },
    actionCard: {
        padding: 0,
    },
    actionRow: {
        padding: 16,
    },
    actionText: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 16,
        color: colors.light.text,
    },
    signOutButton: {
        backgroundColor: '#FEE2E2',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    signOutText: {
        fontFamily: 'Outfit_700Bold',
        color: '#DC2626',
        fontSize: 16,
    }
});
