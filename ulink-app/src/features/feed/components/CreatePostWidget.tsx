import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Modal, Alert, ScrollView } from 'react-native';
import { GlassCard } from '../../../components/GlassCard';
import { colors } from '../../../theme/colors';
import { supabase } from '../../../services/supabase';
import { Image as ImageIcon, Video, X } from 'lucide-react-native';
// import { launchImageLibrary } from 'react-native-image-picker'; // Need to install if not present

interface CreatePostProps {
    onSuccess: () => void;
    user: any;
}

export const CreatePostModal = ({ onSuccess, user }: CreatePostProps) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    // Placeholder for image/video logic
    const handlePost = async () => {
        if (!content.trim()) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('posts')
            .insert({
                author_id: user.id,
                content: content,
                community_id: null // Unless specified
            })
            .select()
            .single();

        setLoading(false);
        if (error) {
            Alert.alert('Error', 'Failed to create post');
        } else {
            setContent('');
            onSuccess(); // Close modal or refresh feed
        }
    };

    return (
        <GlassCard style={styles.container}>
            <View style={styles.header}>
                <Image source={{ uri: user?.avatar_url }} style={styles.avatar} />
                <TextInput
                    style={styles.input}
                    placeholder="What's on your mind?"
                    placeholderTextColor={colors.light.muted}
                    multiline
                    value={content}
                    onChangeText={setContent}
                />
            </View>

            <View style={styles.footer}>
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.iconButton}>
                        <ImageIcon size={24} color={colors.light.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Video size={24} color={colors.light.primary} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.postButton, (!content.trim() || loading) && styles.disabledButton]}
                    onPress={handlePost}
                    disabled={!content.trim() || loading}
                >
                    <Text style={styles.postButtonText}>
                        {loading ? 'Posting...' : 'Post'}
                    </Text>
                </TouchableOpacity>
            </View>
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: colors.light.border
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.light.text,
        fontFamily: 'Outfit_400Regular',
        minHeight: 40,
        paddingTop: 8, // Align with avatar
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.light.border,
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
    },
    iconButton: {
        padding: 4,
    },
    postButton: {
        backgroundColor: colors.light.primary,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    disabledButton: {
        opacity: 0.5,
    },
    postButtonText: {
        color: '#FFF',
        fontFamily: 'Outfit_700Bold',
        fontSize: 14,
    }
});
