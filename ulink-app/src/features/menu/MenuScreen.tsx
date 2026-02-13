import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LayoutGrid, Users, MessageCircle, Briefcase, Bell, User, Settings, LogOut, X, Globe, GraduationCap, Shield } from 'lucide-react-native';
import { useAuth } from '../auth/AuthContext';
import { colors } from '../../theme/colors';
import { supabase } from '../../services/supabase';

export const MenuScreen = () => {
    const navigation = useNavigation<any>();
    const { signOut } = useAuth();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setProfile(data);
        }
    };

    const menuItems = [
        { icon: LayoutGrid, label: 'Home', screen: 'Feed' },
        { icon: Users, label: 'Network', screen: 'Network' },
        { icon: Globe, label: 'Communities', screen: 'Communities', comingSoon: true },
        { icon: MessageCircle, label: 'Messages', screen: 'Messages' },
        { icon: Briefcase, label: 'Career', screen: 'Jobs' },
        { icon: GraduationCap, label: 'Courses', screen: 'Courses', comingSoon: true },
        { icon: Bell, label: 'Notifications', screen: 'Notifications' },
        { icon: User, label: 'Profile', screen: 'Profile' },
        { icon: Settings, label: 'Settings', screen: 'Settings' },
    ];

    if (profile?.is_admin) {
        menuItems.push({ icon: Shield, label: 'Admin Panel', screen: 'Admin' });
    }

    const handleNavigation = (item: any) => {
        if (item.comingSoon) return;

        if (['Feed', 'Notifications', 'Profile', 'Communities'].includes(item.screen)) {
            // These are tabs, need to navigate to 'App' then screen
            // Actually AppNavigator handles these. If I am in a Modal, I should navigate to the Tab.
            navigation.navigate('App', { screen: item.screen });
        } else {
            navigation.navigate(item.screen);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>UniLink</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <X size={24} color={colors.light.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.menuList}>
                    <Text style={styles.sectionTitle}>MENU</Text>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.menuItem,
                                item.comingSoon && styles.disabledItem
                            ]}
                            onPress={() => handleNavigation(item)}
                            disabled={item.comingSoon}
                        >
                            <item.icon
                                size={20}
                                color={item.comingSoon ? colors.light.muted : colors.light.text}
                                style={{ opacity: item.comingSoon ? 0.5 : 1 }}
                            />
                            <Text style={[
                                styles.menuText,
                                item.comingSoon && styles.disabledText
                            ]}>
                                {item.label}
                            </Text>
                            {item.comingSoon && (
                                <View style={styles.comingSoonBadge}>
                                    <Text style={styles.comingSoonText}>Soon</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* User Profile Section at Bottom */}
                <View style={styles.footer}>
                    <View style={styles.profileRow}>
                        <Image
                            source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/50' }}
                            style={styles.avatar}
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{profile?.name || 'User'}</Text>
                            <Text style={styles.profileRole} numberOfLines={1}>
                                {profile?.role === 'org' ? 'Organization' : profile?.university || 'Student'}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                        <LogOut size={20} color="#DC2626" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
    },
    logo: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 24,
        color: colors.light.text,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    menuList: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 12,
        color: colors.light.muted,
        marginBottom: 16,
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 4,
    },
    menuText: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 16,
        color: colors.light.text,
        marginLeft: 12,
    },
    disabledItem: {
        backgroundColor: colors.light.background,
        opacity: 0.7,
    },
    disabledText: {
        color: colors.light.muted,
    },
    comingSoonBadge: {
        marginLeft: 'auto',
        backgroundColor: colors.light.border,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    comingSoonText: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 10,
        color: colors.light.muted,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: colors.light.border,
        paddingTop: 20,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: colors.light.border,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 14,
        color: colors.light.text,
    },
    profileRole: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: colors.light.muted,
        textTransform: 'capitalize',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
        justifyContent: 'center',
    },
    logoutText: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 14,
        color: '#DC2626',
        marginLeft: 8,
    }
});
