import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, TextInput, ActivityIndicator, Image, ScrollView } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { Briefcase, MapPin, DollarSign, Search, Globe, Clock } from 'lucide-react-native';
import { supabase } from '../../services/supabase';

interface Job {
    id: string;
    title: string;
    company: string;
    type: string;
    location: string;
    salary_range: string;
    description: string;
    application_link: string;
    created_at: string;
    deadline?: string;
    logo_url?: string;
}

export const JobsScreen = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchJobs = async () => {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    const handleApply = (link: string) => {
        if (link) {
            Linking.openURL(link).catch(err => console.error("Couldn't load page", err));
        }
    };

    const [activeFilter, setActiveFilter] = useState<'all' | 'internship' | 'remote' | 'full-time'>('all');

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (activeFilter === 'all') return true;
        if (activeFilter === 'remote') return job.location.toLowerCase().includes('remote') || job.type.toLowerCase().includes('remote');
        return job.type.toLowerCase().includes(activeFilter);
    });

    const renderItem = ({ item }: { item: Job }) => (
        <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: item.logo_url ? 'transparent' : colors.light.background }]}>
                    {item.logo_url ? (
                        <Image source={{ uri: item.logo_url }} style={styles.logo} resizeMode="contain" />
                    ) : (
                        <Briefcase size={24} color={colors.light.primary} />
                    )}
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.company}>{item.company}</Text>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.type}</Text>
                </View>
            </View>

            <View style={styles.detailsRow}>
                {item.location && (
                    <View style={styles.detailItem}>
                        <MapPin size={14} color={colors.light.muted} />
                        <Text style={styles.detailText}>{item.location}</Text>
                    </View>
                )}
                {item.salary_range && (
                    <View style={styles.detailItem}>
                        <DollarSign size={14} color={colors.light.muted} />
                        <Text style={styles.detailText}>{item.salary_range}</Text>
                    </View>
                )}
            </View>

            {item.description && (
                <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
            )}

            <TouchableOpacity
                style={styles.applyButton}
                onPress={() => item.application_link && handleApply(item.application_link)}
            >
                <Globe size={18} color="#FFF" />
                <Text style={styles.applyButtonText}>Apply Now</Text>
            </TouchableOpacity>
        </GlassCard>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Career & Jobs</Text>
                <Text style={styles.headerSubtitle}>Find your next opportunity</Text>
            </View>

            <View style={styles.searchContainer}>
                <Search size={20} color={colors.light.muted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search jobs, companies..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={colors.light.muted}
                />
            </View>

            <View style={{ marginBottom: 16 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
                    {['All', 'Internship', 'Remote', 'Full-time'].map((filter) => {
                        const key = filter.toLowerCase() as any;
                        const isActive = activeFilter === key;
                        return (
                            <TouchableOpacity
                                key={key}
                                style={[styles.filterChip, isActive && styles.activeFilterChip]}
                                onPress={() => setActiveFilter(key)}
                            >
                                <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.light.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredJobs}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Briefcase size={40} color={colors.light.muted} style={styles.emptyIcon} />
                            <Text style={styles.emptyText}>No jobs found</Text>
                        </View>
                    }
                />
            )}
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
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    headerTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 28,
        color: colors.light.text,
    },
    headerSubtitle: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: colors.light.muted,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: colors.light.border,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Outfit_400Regular',
        fontSize: 16,
        color: colors.light.text,
    },
    filtersContainer: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: colors.light.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeFilterChip: {
        backgroundColor: colors.light.text,
        borderColor: colors.light.text,
    },
    filterText: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 12,
        color: colors.light.muted,
    },
    activeFilterText: {
        color: '#FFF',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        padding: 16,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        backgroundColor: colors.light.background,
        overflow: 'hidden'
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        color: colors.light.text,
        marginBottom: 4,
    },
    company: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 14,
        color: colors.light.muted,
    },
    badge: {
        backgroundColor: colors.light.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 12,
        color: colors.light.text,
    },
    detailsRow: {
        flexDirection: 'row',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 4,
    },
    detailText: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: colors.light.muted,
        marginLeft: 4,
    },
    description: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: colors.light.text,
        lineHeight: 20,
        marginBottom: 16,
    },
    applyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.light.primary,
        paddingVertical: 12,
        borderRadius: 12,
    },
    applyButtonText: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        color: '#FFF',
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 18,
        color: colors.light.muted,
    }
});
