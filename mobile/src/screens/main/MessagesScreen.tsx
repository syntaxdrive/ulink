import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  MessageSquare,
  CheckCircle2,
  ArrowLeft,
  Send,
  User,
  Plus,
  Search,
  X,
  Camera,
  Image as ImageIcon,
  UserCheck,
  UserPlus,
  Lock,
  Users,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { uploadService } from '../../services/uploadService';

interface ChatUser {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_verified?: boolean;
}

interface MessageItem {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  read_at?: string | null;
}

interface ConversationItem {
  user: ChatUser;
  lastMessage: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount: number;
}

export default function MessagesScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { targetUser } = (route.params || {}) as { targetUser?: ChatUser };

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Connection Tracking State
  const [connectedUserIds, setConnectedUserIds] = useState<Set<string>>(new Set());
  const [connectedProfiles, setConnectedProfiles] = useState<ChatUser[]>([]);
  const [sendingConnectionRequest, setSendingConnectionRequest] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  // Active Chat State
  const [activeChat, setActiveChat] = useState<ChatUser | null>(targetUser || null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [attachedImageUri, setAttachedImageUri] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // New Chat Modal State
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConnections, setLoadingConnections] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // 1. Load current user session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
    });
  }, []);

  // 2. Fetch User's Accepted Connections
  const fetchConnections = useCallback(async (uid: string) => {
    setLoadingConnections(true);
    try {
      const { data: conns, error } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${uid},recipient_id.eq.${uid}`);

      if (error) throw error;

      const partnerIds = (conns || []).map((c: any) =>
        c.requester_id === uid ? c.recipient_id : c.requester_id
      );

      const idSet = new Set<string>(partnerIds);
      setConnectedUserIds(idSet);

      if (partnerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url, is_verified')
          .in('id', partnerIds);

        setConnectedProfiles((profiles as ChatUser[]) || []);
      } else {
        setConnectedProfiles([]);
      }
    } catch (err) {
      console.warn('Error loading connections:', err);
    } finally {
      setLoadingConnections(false);
    }
  }, []);

  // 3. Fetch Inbox Conversations
  const fetchInbox = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUid = session?.user?.id || currentUserId;

      if (!currentUid) {
        setLoading(false);
        return;
      }

      // Refresh connections alongside inbox
      fetchConnections(currentUid);

      const { data: msgs, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          recipient_id,
          read_at
        `)
        .or(`sender_id.eq.${currentUid},recipient_id.eq.${currentUid}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by counterpart user ID
      const convoMap = new Map<string, { lastMsg: any; unread: number }>();

      (msgs || []).forEach((msg) => {
        const partnerId =
          msg.sender_id === currentUid ? msg.recipient_id : msg.sender_id;

        const isUnread = msg.recipient_id === currentUid && !msg.read_at;

        if (!convoMap.has(partnerId)) {
          convoMap.set(partnerId, {
            lastMsg: msg,
            unread: isUnread ? 1 : 0,
          });
        } else {
          if (isUnread) {
            const current = convoMap.get(partnerId)!;
            current.unread += 1;
          }
        }
      });

      const partnerIds = Array.from(convoMap.keys());
      if (partnerIds.length === 0) {
        setConversations([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, is_verified')
        .in('id', partnerIds);

      const profileMap = new Map<string, ChatUser>();
      (profiles || []).forEach((p) => profileMap.set(p.id, p));

      const convoList: ConversationItem[] = [];
      convoMap.forEach((val, partnerId) => {
        const partnerProfile = profileMap.get(partnerId) || {
          id: partnerId,
          name: 'Student',
          username: 'user',
          avatar_url: null,
        };

        convoList.push({
          user: partnerProfile,
          lastMessage: val.lastMsg,
          unreadCount: val.unread,
        });
      });

      // Sort by newest message
      convoList.sort(
        (a, b) =>
          new Date(b.lastMessage.created_at).getTime() -
          new Date(a.lastMessage.created_at).getTime()
      );

      setConversations(convoList);
    } catch (e) {
      console.warn('Error loading inbox:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId, fetchConnections]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  // 4. Check active chat connection status
  useEffect(() => {
    if (activeChat && currentUserId) {
      const isConnected = connectedUserIds.has(activeChat.id);
      if (!isConnected) {
        // Check if there is a pending connection request
        supabase
          .from('connections')
          .select('id, status, requester_id')
          .or(
            `and(requester_id.eq.${currentUserId},recipient_id.eq.${activeChat.id}),and(requester_id.eq.${activeChat.id},recipient_id.eq.${currentUserId})`
          )
          .single()
          .then(({ data }) => {
            if (data?.status === 'pending') {
              setHasPendingRequest(true);
            } else if (data?.status === 'accepted') {
              setConnectedUserIds((prev) => new Set([...prev, activeChat.id]));
              setHasPendingRequest(false);
            } else {
              setHasPendingRequest(false);
            }
          });
      }
    }
  }, [activeChat, currentUserId, connectedUserIds]);

  // 5. Fetch active chat message thread
  const fetchThread = useCallback(async () => {
    if (!activeChat || !currentUserId) return;
    setLoadingMessages(true);

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},recipient_id.eq.${activeChat.id}),and(sender_id.eq.${activeChat.id},recipient_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark received unread messages as read with timestamp
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', activeChat.id)
        .eq('recipient_id', currentUserId)
        .is('read_at', null);
    } catch (err) {
      console.warn('Error fetching thread:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [activeChat, currentUserId]);

  useEffect(() => {
    if (activeChat) {
      fetchThread();

      const channel = supabase
        .channel(`chat_${activeChat.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const newMsg = payload.new as MessageItem;
            if (
              (newMsg.sender_id === activeChat.id && newMsg.recipient_id === currentUserId) ||
              (newMsg.sender_id === currentUserId && newMsg.recipient_id === activeChat.id)
            ) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeChat, currentUserId, fetchThread]);

  // 6. Send Connection Request to Active Chat Partner
  const handleSendConnectionRequest = async () => {
    if (!activeChat || !currentUserId || sendingConnectionRequest) return;
    setSendingConnectionRequest(true);
    try {
      const { error } = await supabase.from('connections').insert({
        requester_id: currentUserId,
        recipient_id: activeChat.id,
        status: 'pending',
      });
      if (error) throw error;
      setHasPendingRequest(true);
      Alert.alert(
        'Request Sent! 🤝',
        `Connection request sent to @${activeChat.username || 'student'}. You will be able to message once they accept!`
      );
    } catch (e: any) {
      Alert.alert('Notice', e.message || 'Could not send connection request.');
    } finally {
      setSendingConnectionRequest(false);
    }
  };

  // 7. Send Message
  const handleSendMessage = async () => {
    const isConnected = activeChat ? connectedUserIds.has(activeChat.id) : false;
    if (!isConnected) {
      Alert.alert(
        'Connections Only 🔒',
        'You must be connected with this student before you can send direct messages.'
      );
      return;
    }

    const hasText = inputText.trim().length > 0;
    const hasImage = !!attachedImageUri;

    if ((!hasText && !hasImage) || !activeChat || !currentUserId || sending) return;

    const content = inputText.trim();
    const localImg = attachedImageUri;
    setInputText('');
    setAttachedImageUri(null);
    setSending(true);

    const tempMsg: MessageItem = {
      id: `temp_${Date.now()}`,
      sender_id: currentUserId,
      recipient_id: activeChat.id,
      content: content || '📷 Photo',
      image_url: localImg,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    try {
      let uploadedImageUrl: string | null = null;
      if (localImg) {
        uploadedImageUrl = await uploadService.uploadFile(
          { uri: localImg, type: 'image' },
          'chat-images'
        );
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          recipient_id: activeChat.id,
          content: content || '📷 Photo',
          image_url: uploadedImageUrl,
        })
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? (data as MessageItem) : m))
        );
      }
    } catch (e) {
      console.warn('Error sending message:', e);
    } finally {
      setSending(false);
    }
  };

  const startChatWith = (user: ChatUser) => {
    setActiveChat(user);
    setIsNewChatModalOpen(false);
    setSearchQuery('');
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInbox();
  };

  const filteredConnections = connectedProfiles.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.username && p.username.toLowerCase().includes(q))
    );
  });

  // ── Render Active Chat Window ─────────────────────────────────────────────
  if (activeChat) {
    const isConnected = connectedUserIds.has(activeChat.id);

    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              setActiveChat(null);
              fetchInbox();
            }}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.chatHeaderUser}>
            {activeChat.avatar_url ? (
              <Image source={{ uri: activeChat.avatar_url }} style={styles.chatAvatar} />
            ) : (
              <View style={[styles.chatAvatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {(activeChat.name || activeChat.username || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.chatHeaderMeta}>
              <View style={styles.nameRow}>
                <Text style={styles.chatHeaderName} numberOfLines={1}>
                  {activeChat.name || activeChat.username || 'Student'}
                </Text>
                {activeChat.is_verified && (
                  <CheckCircle2 size={13} color={colors.primary} style={{ marginLeft: 3 }} />
                )}
              </View>
              <Text style={styles.chatHeaderUsername}>@{activeChat.username || 'user'}</Text>
            </View>
          </View>
        </View>

        {/* Lock Notice if Not Connected */}
        {!isConnected && (
          <View style={styles.notConnectedNotice}>
            <Lock size={18} color="#000000" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.notConnectedTitle}>Connection Required</Text>
              <Text style={styles.notConnectedText}>
                Only accepted connections can exchange direct messages on UniLink.
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.connectActionBtn,
                hasPendingRequest && styles.connectActionPending,
              ]}
              onPress={handleSendConnectionRequest}
              disabled={hasPendingRequest || sendingConnectionRequest}
            >
              {sendingConnectionRequest ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : hasPendingRequest ? (
                <Text style={styles.connectActionText}>Pending</Text>
              ) : (
                <>
                  <UserPlus size={13} color="#000000" style={{ marginRight: 4 }} />
                  <Text style={styles.connectActionText}>Connect</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Message Thread + Bottom Chatbox */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
          style={styles.chatKeyboardArea}
        >
          {loadingMessages ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.centerContainer}>
              <MessageSquare size={36} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                {isConnected
                  ? `Say hello to ${activeChat.name || activeChat.username || 'your classmate'}!`
                  : `Connect with ${activeChat.name || activeChat.username || 'this student'} to start chatting.`}
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              renderItem={({ item }) => {
                const isMe = item.sender_id === currentUserId;
                return (
                  <View
                    style={[
                      styles.messageBubbleWrapper,
                      isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isMe ? styles.myMessageBubble : styles.theirMessageBubble,
                      ]}
                    >
                      {item.image_url ? (
                        <Image
                          source={{ uri: item.image_url }}
                          style={styles.chatBubbleImage}
                          resizeMode="cover"
                        />
                      ) : null}
                      <Text
                        style={[
                          styles.messageText,
                          isMe ? styles.myMessageText : styles.theirMessageText,
                        ]}
                      >
                        {item.content}
                      </Text>
                      <Text
                        style={[
                          styles.messageTime,
                          isMe ? styles.myMessageTime : styles.theirMessageTime,
                        ]}
                      >
                        {new Date(item.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}

          {/* Attached Image Preview */}
          {attachedImageUri && (
            <View style={styles.attachedImageBar}>
              <Image source={{ uri: attachedImageUri }} style={styles.attachedImgThumb} />
              <TouchableOpacity
                style={styles.removeAttachedBtn}
                onPress={() => setAttachedImageUri(null)}
              >
                <X size={12} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Chat Input Bar */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={async () => {
                if (!isConnected) {
                  Alert.alert('Notice', 'Connect first to send photos.');
                  return;
                }
                const media = await uploadService.pickImages(1);
                if (media.length > 0) setAttachedImageUri(media[0].uri);
              }}
              disabled={!isConnected}
            >
              <ImageIcon
                size={20}
                color={isConnected ? colors.textSecondary : colors.border}
              />
            </TouchableOpacity>

            <TextInput
              style={[styles.textInput, !isConnected && styles.textInputDisabled]}
              placeholder={
                isConnected
                  ? 'Type a message...'
                  : 'Connect to message this student...'
              }
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              editable={isConnected}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!inputText.trim() && !attachedImageUri) || sending || !isConnected
                  ? styles.sendBtnDisabled
                  : {},
              ]}
              onPress={handleSendMessage}
              disabled={(!inputText.trim() && !attachedImageUri) || sending || !isConnected}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Send size={16} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Render Inbox List View ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Direct Messages</Text>
        <TouchableOpacity
          style={styles.newChatHeaderBtn}
          onPress={() => setIsNewChatModalOpen(true)}
        >
          <Plus size={16} color="#000000" />
          <Text style={styles.newChatBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centerContainer}>
          <MessageSquare size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>
            Connect with your campus peers to start exchanging direct messages!
          </Text>
          <TouchableOpacity
            style={styles.startNewBtn}
            onPress={() => setIsNewChatModalOpen(true)}
          >
            <Plus size={16} color="#000000" style={{ marginRight: 6 }} />
            <Text style={styles.startNewBtnText}>Message a Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.user.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.convoItem}
              activeOpacity={0.7}
              onPress={() => setActiveChat(item.user)}
            >
              {item.user.avatar_url ? (
                <Image source={{ uri: item.user.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>
                    {(item.user.name || item.user.username || 'U')[0].toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.convoContent}>
                <View style={styles.convoTopRow}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {item.user.name || item.user.username || 'Student'}
                    </Text>
                    {item.user.is_verified && (
                      <CheckCircle2 size={13} color={colors.primary} style={{ marginLeft: 4 }} />
                    )}
                  </View>
                  <Text style={styles.timeText}>
                    {new Date(item.lastMessage.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>

                <View style={styles.convoBottomRow}>
                  <Text
                    style={[
                      styles.lastMessageText,
                      item.unreadCount > 0 && styles.unreadSnippet,
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage.sender_id === currentUserId ? 'You: ' : ''}
                    {item.lastMessage.content}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ── New Message / Connected Classmates Selection Modal ──────── */}
      <Modal
        visible={isNewChatModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsNewChatModalOpen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsNewChatModalOpen(false)}
              style={styles.modalCloseBtn}
            >
              <X size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Message Connection</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.modalSearchBox}>
            <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search your connections..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loadingConnections ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
          ) : connectedProfiles.length === 0 ? (
            <View style={styles.noConnectionsBox}>
              <Users size={42} color={colors.textSecondary} />
              <Text style={styles.noConnTitle}>No Connections Yet</Text>
              <Text style={styles.noConnDesc}>
                To chat directly with classmates, connect with them first on campus.
              </Text>
              <TouchableOpacity
                style={styles.findPeersBtn}
                onPress={() => {
                  setIsNewChatModalOpen(false);
                  navigation?.navigate('Network');
                }}
              >
                <UserPlus size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.findPeersBtnText}>Find Classmates in Network</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.studentResultsScroll}>
              <Text style={styles.connectionSectionLabel}>
                YOUR CONNECTIONS ({filteredConnections.length})
              </Text>
              {filteredConnections.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.studentResultCard}
                  onPress={() => startChatWith(u)}
                >
                  {u.avatar_url ? (
                    <Image source={{ uri: u.avatar_url }} style={styles.resultAvatar} />
                  ) : (
                    <View style={[styles.resultAvatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarInitial}>
                        {(u.name || u.username || 'U')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.resultMeta}>
                    <View style={styles.nameRow}>
                      <Text style={styles.resultName}>{u.name || 'Student'}</Text>
                      {u.is_verified && (
                        <CheckCircle2 size={12} color={colors.primary} style={{ marginLeft: 3 }} />
                      )}
                    </View>
                    <Text style={styles.resultUsername}>@{u.username || 'user'}</Text>
                  </View>
                  <View style={styles.connectedBadgePill}>
                    <UserCheck size={12} color={colors.primary} />
                    <Text style={styles.connectedBadgeText}>Connected</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  newChatHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sunYellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#000000',
    gap: 4,
  },
  newChatBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  convoItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  convoContent: {
    flex: 1,
    marginLeft: 12,
  },
  convoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  convoBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessageText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  unreadSnippet: {
    color: colors.text,
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: colors.coral,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  startNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sunYellow,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  startNewBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },

  // Active Chat Window Styles
  chatKeyboardArea: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatHeaderUser: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  chatHeaderMeta: {
    marginLeft: 10,
  },
  chatHeaderName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  chatHeaderUsername: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  notConnectedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF08A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.sunYellow,
  },
  notConnectedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  notConnectedText: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.7)',
  },
  connectActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#000000',
    marginLeft: 8,
  },
  connectActionPending: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  connectActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
  messagesList: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  messageBubbleWrapper: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  myBubbleWrapper: {
    justifyContent: 'flex-end',
  },
  theirBubbleWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  myMessageBubble: {
    backgroundColor: '#000000',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: colors.surfaceElevated,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatBubbleImage: {
    width: 200,
    height: 140,
    borderRadius: 10,
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#ffffff',
  },
  theirMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 9,
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
  theirMessageTime: {
    color: colors.textSecondary,
  },
  attachedImageBar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachedImgThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  removeAttachedBtn: {
    position: 'absolute',
    top: 2,
    left: 50,
    backgroundColor: colors.danger,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: 8,
  },
  attachBtn: {
    padding: 6,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
  },
  textInputDisabled: {
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },

  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  connectionSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  studentResultsScroll: {
    paddingHorizontal: 16,
  },
  studentResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  resultMeta: {
    marginLeft: 12,
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  resultUsername: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  connectedBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lilacLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  connectedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  noConnectionsBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  noConnTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
  },
  noConnDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  findPeersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 18,
  },
  findPeersBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
