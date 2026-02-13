import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useChatMessages } from './hooks/useChatMessages';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ChatScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { chatId, chatName, chatAvatar } = route.params;
    const insets = useSafeAreaInsets();

    const { messages, loading, userId, sendMessage } = useChatMessages(chatId);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
        }
    }, [messages]);

    const handleSend = () => {
        if (inputText.trim()) {
            sendMessage(inputText.trim());
            setInputText('');
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMyMessage = item.sender_id === userId;
        return (
            <View style={[styles.messageContainer, isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer]}>
                {!isMyMessage && (
                    <Image
                        source={{ uri: chatAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName || 'User')}&background=random` }}
                        style={styles.messageAvatar}
                    />
                )}
                <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble]}>
                    <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.theirMessageText]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.messageTime, isMyMessage ? styles.myMessageTime : styles.theirMessageTime]}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.light.text} />
                </TouchableOpacity>
                <Image
                    source={{ uri: chatAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName || 'User')}&background=random` }}
                    style={styles.headerAvatar}
                />
                <Text style={styles.headerTitle}>{chatName}</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.light.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                style={styles.inputWrapper}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.light.muted}
                        multiline
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={!inputText.trim()}>
                        <Send size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
        backgroundColor: colors.light.background,
    },
    backButton: {
        marginRight: 12,
    },
    headerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
        backgroundColor: colors.light.border,
    },
    headerTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        color: colors.light.text,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    messageContainer: {
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    myMessageContainer: {
        justifyContent: 'flex-end',
    },
    theirMessageContainer: {
        justifyContent: 'flex-start',
    },
    messageAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 8,
        marginBottom: 4,
        backgroundColor: colors.light.border,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
    },
    myMessageBubble: {
        backgroundColor: colors.light.primary,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 4,
    },
    theirMessageBubble: {
        backgroundColor: '#F3F4F6',
    },
    messageText: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 16,
        lineHeight: 22,
    },
    myMessageText: {
        color: '#FFF',
    },
    theirMessageText: {
        color: colors.light.text,
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myMessageTime: {
        color: 'rgba(255,255,255,0.7)',
    },
    theirMessageTime: {
        color: colors.light.muted,
    },
    inputWrapper: {
        borderTopWidth: 1,
        borderTopColor: colors.light.border,
        backgroundColor: colors.light.background,
        padding: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        fontFamily: 'Outfit_400Regular',
        fontSize: 16,
        color: colors.light.text,
        maxHeight: 100,
        marginRight: 8,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
