import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { supabase } from '../../services/supabase';
import { useNavigation } from '@react-navigation/native';
import { Users, Filter } from 'lucide-react-native';

export const CommunitiesScreen = () => {
    const navigation = useNavigation<any>();
    const [communities, setCommunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCommunities();
    }, []);

    const fetchCommunities = async () => {
        const { data, error } = await supabase
            .from('communities')
            .select('*, _count:members(count)'); // Approximate count logic depending on Supabase setup

        if (data) {
            setCommunities(data);
        }
        setLoading(false);
    };

    const renderCommunity = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => navigation.navigate('CommunityDetail', { id: item.id })}>
            <GlassCard style={styles.card}>
                <Image
                    source={{ uri: item.icon_url || 'https://via.placeholder.com/60' }}
                    style={styles.icon}
                />
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>
                    <View style={styles.meta}>
                        <Users size={14} color={colors.light.muted} />
                        <Text style={styles.memberCount}>{item.members_count || 0} members</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.joinButton}>
                    <Text style={styles.joinText}>Join</Text>
                </TouchableOpacity>
            </GlassCard>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <GlassCard style={styles.header} intensity={80}>
                <Text style={styles.screenTitle}>Communities</Text>
                <TouchableOpacity>
                    <Filter color={colors.light.primary} size={24} />
                </TouchableOpacity>
            </GlassCard>

            <FlatList
                data={communities}
                renderItem={renderCommunity}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    !loading ? <Text style={styles.emptyText}>No active communities found.</Text> : null
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
    },
    screenTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 24,
        color: colors.light.text,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        padding: 16,
    },
    icon: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: colors.light.border,
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    name: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        color: colors.light.text,
        marginBottom: 4,
    },
    description: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: colors.light.muted,
        marginBottom: 8,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    memberCount: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: colors.light.muted,
    },
    joinButton: {
        backgroundColor: colors.light.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginLeft: 8,
    },
    joinText: {
        color: '#FFF',
        fontFamily: 'Outfit_700Bold',
        fontSize: 12,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.light.muted,
        marginTop: 40,
        fontFamily: 'Outfit_400Regular',
    }
});
