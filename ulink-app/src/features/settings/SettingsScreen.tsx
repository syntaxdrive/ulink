import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { useAuth } from '../auth/AuthContext';
import { ChevronRight, LogOut, User, Bell, Shield, Moon } from 'lucide-react-native';

export const SettingsScreen = () => {
    const navigation = useNavigation();
    const { signOut, user } = useAuth();

    const handleSignOut = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut();
                            // Navigation to Login is handled by AuthContext state change in RootNavigator
                        } catch (error) {
                            Alert.alert("Error", "Failed to sign out");
                        }
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon: Icon, label, onPress, value, isSwitch = false }: any) => (
        <TouchableOpacity
            style={styles.item}
            onPress={onPress}
            disabled={isSwitch}
        >
            <View style={styles.itemLeft}>
                <View style={styles.iconContainer}>
                    <Icon size={20} color={colors.light.text} />
                </View>
                <Text style={styles.itemLabel}>{label}</Text>
            </View>
            {isSwitch ? (
                <Switch
                    value={value}
                    onValueChange={onPress}
                    trackColor={{ false: colors.light.border, true: colors.light.primary }}
                />
            ) : (
                <ChevronRight size={20} color={colors.light.muted} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronRight size={24} color={colors.light.text} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Account Section */}
                <Text style={styles.sectionHeader}>Account</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon={User}
                        label="Edit Profile"
                        onPress={() => navigation.navigate('EditProfile' as never)}
                    />
                    <SettingItem
                        icon={Shield}
                        label="Security & Privacy"
                        onPress={() => { }}
                    />
                </View>

                {/* Preferences Section */}
                <Text style={styles.sectionHeader}>Preferences</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon={Bell}
                        label="Notifications"
                        isSwitch
                        value={true}
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon={Moon}
                        label="Dark Mode"
                        isSwitch
                        value={false}
                        onPress={() => { }}
                    />
                </View>

                {/* Sign Out Section */}
                <View style={styles.section}>
                    <TouchableOpacity style={[styles.item, styles.signOutItem]} onPress={handleSignOut}>
                        <View style={styles.itemLeft}>
                            <View style={[styles.iconContainer, styles.signOutIcon]}>
                                <LogOut size={20} color="#EF4444" />
                            </View>
                            <Text style={[styles.itemLabel, styles.signOutText]}>Sign Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.versionText}>Version 1.0.0 (Build 2024)</Text>
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
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: colors.light.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 20,
        color: colors.light.text,
    },
    content: {
        padding: 20,
    },
    sectionHeader: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 14,
        color: colors.light.muted,
        marginBottom: 8,
        marginTop: 16,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    section: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.light.border,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
        backgroundColor: '#FFF',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemLabel: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 16,
        color: colors.light.text,
    },
    signOutItem: {
        borderBottomWidth: 0,
        marginTop: 20,
        marginBottom: 0,
        borderRadius: 16,
    },
    signOutIcon: {
        backgroundColor: '#FEF2F2',
    },
    signOutText: {
        color: '#EF4444',
    },
    versionText: {
        textAlign: 'center',
        color: colors.light.muted,
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        marginTop: 32,
        marginBottom: 40,
    }
});
