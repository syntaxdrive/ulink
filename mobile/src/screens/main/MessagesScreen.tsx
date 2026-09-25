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
  Plus,
  Search,
  X,
  Image as ImageIcon,
  Lock,
  ChevronDown,
  SquarePen,
  Sparkles,
  UserPlus,
} from 'lucide-react-native';
import { colors, useTheme } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { uploadService } from '../../services/uploadService';
import { VerifiedBadge } from '../../components/VerifiedBadge';
import { getChatSocket } from '../../lib/socket';

interface ChatUser {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_verified?: boolean;
  online?: boolean;
  status_note?: string | null;
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
  const { isDark } = useTheme();
  const { targetUser } = (route.params || {}) as { targetUser?: ChatUser };

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('student');
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');

  // Real Dynamic Online Peers for Status Tray
  const [onlinePeers, setOnlinePeers] = useState<ChatUser[]>([]);

  // Pending Incoming Connection / Message Requests
  const [pendingRequests, setPendingRequests] = useState<
    { connectionId: string; user: ChatUser; createdAt: string }[]
  >([]);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

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

  // User Note State
  const [myNoteText, setMyNoteText] = useState('Studying at campus 📚');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [tempNoteText, setTempNoteText] = useState('');

  // New Chat Modal State
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConnections, setLoadingConnections] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // 1. Load current user session & profile
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, name, avatar_url, headline')
          .eq('id', session.user.id)
          .single();
        if (profile?.username) {
          setCurrentUsername(profile.username);
        }
        if (profile?.avatar_url) {
          setCurrentUserAvatar(profile.avatar_url);
        }
        if (profile?.headline) {
          setMyNoteText(profile.headline);
        }

        // Fetch real active campus peers from database (no dummy mock data)
        const { data: peers } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url, is_verified, headline')
          .neq('id', session.user.id)
          .limit(8);

        if (peers && peers.length > 0) {
          setOnlinePeers(
            peers.map((p) => ({
              ...p,
              online: true,
              status_note: p.headline || 'Active on UniLink',
            }))
          );
        }
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

      // Fetch incoming pending connection requests for the Requests tab
      const { data: reqs } = await supabase
        .from('connections')
        .select('id, requester_id, status, created_at')
        .eq('recipient_id', currentUid)
        .eq('status', 'pending');

      if (reqs && reqs.length > 0) {
        const requesterIds = reqs.map((r: any) => r.requester_id);
        const { data: reqProfiles } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url, is_verified, headline')
          .in('id', requesterIds);

        const pMap = new Map((reqProfiles || []).map((p: any) => [p.id, p]));
        const formatted = reqs.map((r: any) => ({
          connectionId: r.id,
          user: (pMap.get(r.requester_id) as ChatUser) || {
            id: r.requester_id,
            name: 'Student',
            username: 'student',
            avatar_url: null,
          },
          createdAt: r.created_at,
        }));
        setPendingRequests(formatted);
      } else {
        setPendingRequests([]);
      }

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

  const handleAcceptConnection = async (connId: string, partnerId: string) => {
    try {
      setProcessingRequestId(connId);
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connId);
      if (error) throw error;
      setConnectedUserIds((prev) => new Set([...prev, partnerId]));
      setPendingRequests((prev) => prev.filter((r) => r.connectionId !== connId));
      Alert.alert('Connected! 🎉', 'You are now connected and can chat directly.');
      fetchInbox();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not accept connection.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleDeclineConnection = async (connId: string) => {
    try {
      setProcessingRequestId(connId);
      await supabase.from('connections').delete().eq('id', connId);
      setPendingRequests((prev) => prev.filter((r) => r.connectionId !== connId));
    } catch {} finally {
      setProcessingRequestId(null);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  // 4. Check active chat connection status
  useEffect(() => {
    if (activeChat && currentUserId) {
      const isConnected = connectedUserIds.has(activeChat.id);
      if (!isConnected) {
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

      let activeSocket: any = null;
      let channel: any = null;

      // 1. Primary: Socket.io Realtime Delivery (NestJS Backend)
      getChatSocket()
        .then((socket) => {
          activeSocket = socket;
          socket.on('newMessage', (newMsg: any) => {
            if (
              (newMsg.sender_id === activeChat.id && newMsg.recipient_id === currentUserId) ||
              (newMsg.sender_id === currentUserId && newMsg.recipient_id === activeChat.id)
            ) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            }
          });
        })
        .catch((err) => {
          console.warn('Socket.io connection failed, relying on Supabase fallback:', err);
        });

      // 2. Fallback: Supabase Realtime Channel
      channel = supabase
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
        if (activeSocket) {
          activeSocket.off('newMessage');
        }
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [activeChat, currentUserId, fetchThread]);

  // 6. Send Connection Request
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
        `Connection request sent to @${activeChat.username || 'student'}.`
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchInbox();
  };

  const filteredConversations = conversations.filter((c) => {
    const isConn = connectedUserIds.has(c.user.id);
    const isSentByMe = c.lastMessage.sender_id === currentUserId;

    if (activeTab === 'messages') {
      // Primary: connected users or conversations initiated by user
      if (!isConn && !isSentByMe) return false;
    } else {
      // Requests: incoming conversations from non-connected users
      if (isConn || isSentByMe) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.user.name && c.user.name.toLowerCase().includes(q)) ||
      (c.user.username && c.user.username.toLowerCase().includes(q)) ||
      (c.lastMessage.content && c.lastMessage.content.toLowerCase().includes(q))
    );
  });

  // ── Render Active Chat Window ─────────────────────────────────────────────
  if (activeChat) {
    const isConnected = connectedUserIds.has(activeChat.id);

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
        {/* Chat Header */}
        <View style={[styles.chatHeader, { borderBottomColor: isDark ? '#1F1F23' : '#F3F4F6' }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              setActiveChat(null);
              fetchInbox();
            }}
          >
            <ArrowLeft size={22} color={isDark ? '#FFFFFF' : '#000000'} />
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
                <Text style={[styles.chatHeaderName, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
                  {activeChat.name || activeChat.username || 'Student'}
                </Text>
                {activeChat.is_verified && (
                  <VerifiedBadge size={14} />
                )}
              </View>
              <Text style={styles.chatHeaderUsername}>@{activeChat.username || 'user'}</Text>
            </View>
          </View>
        </View>

        {/* Lock Notice if Not Connected */}
        {!isConnected && (
          <View style={styles.notConnectedNotice}>
            <Lock size={16} color="#000000" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.notConnectedTitle}>Connection Required</Text>
              <Text style={styles.notConnectedText}>
                Only accepted connections can exchange direct messages.
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
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.centerContainer}>
              <MessageSquare size={36} color={isDark ? '#52525B' : '#9CA3AF'} />
              <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                {isConnected
                  ? `Say hello to ${activeChat.name || activeChat.username}!`
                  : `Connect with ${activeChat.name || activeChat.username} to start chatting.`}
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
                        isMe
                          ? [styles.myMessageBubble, { backgroundColor: '#3B82F6' }]
                          : [styles.theirMessageBubble, { backgroundColor: isDark ? '#26262B' : '#E4E6EB' }],
                      ]}
                    >
                      {(() => {
                        const isPostShare = item.content?.includes('unilink://post/') || item.content?.includes('unilink.ng/post/');
                        const postSnippet = isPostShare
                          ? item.content.replace(/(https?:\/\/unilink\.ng\/post\/|unilink:\/\/post\/)[^\s]+/g, '').trim()
                          : item.content;

                        if (isPostShare) {
                          return (
                            <TouchableOpacity
                              style={[
                                styles.sharedPostCard,
                                {
                                  backgroundColor: isMe
                                    ? 'rgba(255,255,255,0.18)'
                                    : (isDark ? '#1C1C24' : '#FFFFFF'),
                                  borderColor: isMe ? 'rgba(255,255,255,0.3)' : (isDark ? '#2E2E3E' : '#E5E7EB'),
                                },
                              ]}
                              activeOpacity={0.88}
                              onPress={() => navigation.navigate('Feed' as never)}
                            >
                              <View style={styles.sharedPostBadgeRow}>
                                <Sparkles size={12} color={isMe ? '#FFFFFF' : '#3B82F6'} style={{ marginRight: 4 }} />
                                <Text
                                  style={[
                                    styles.sharedPostBadgeText,
                                    { color: isMe ? '#FFFFFF' : '#3B82F6' },
                                  ]}
                                >
                                  Shared Campus Post
                                </Text>
                              </View>

                              {item.image_url ? (
                                <Image
                                  source={{ uri: item.image_url }}
                                  style={styles.sharedPostImage}
                                  resizeMode="cover"
                                />
                              ) : null}

                              {postSnippet ? (
                                <Text
                                  style={[
                                    styles.sharedPostContent,
                                    { color: isMe ? '#FFFFFF' : (isDark ? '#E4E4E7' : '#1F2937') },
                                  ]}
                                  numberOfLines={3}
                                >
                                  {postSnippet}
                                </Text>
                              ) : null}

                              <View style={styles.sharedPostFooter}>
                                <Text
                                  style={[
                                    styles.sharedPostActionText,
                                    { color: isMe ? '#FFFFFF' : '#3B82F6' },
                                  ]}
                                >
                                  View Post in Feed →
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        }

                        return (
                          <>
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
                                isMe
                                  ? styles.myMessageText
                                  : [styles.theirMessageText, { color: isDark ? '#FFFFFF' : '#000000' }],
                              ]}
                            >
                              {item.content}
                            </Text>
                          </>
                        );
                      })()}
                      <Text
                        style={[
                          styles.messageTime,
                          isMe
                            ? styles.myMessageTime
                            : [styles.theirMessageTime, { color: isDark ? '#A1A1AA' : '#65676B' }],
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
          <View style={[styles.inputContainer, { backgroundColor: isDark ? '#121214' : '#F3F4F6' }]}>
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
                size={22}
                color={isConnected ? (isDark ? '#A1A1AA' : '#6B7280') : '#9CA3AF'}
              />
            </TouchableOpacity>

            <TextInput
              style={[
                styles.textInput,
                { color: isDark ? '#FFFFFF' : '#000000' },
                !isConnected && styles.textInputDisabled,
              ]}
              placeholder={
                isConnected
                  ? 'Message...'
                  : 'Connect to message this student...'
              }
              placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
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

  // ── Render Instagram-Style Direct Messages Inbox ──────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      {/* ── 1. Top Header ────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.usernameDropdownRow} activeOpacity={0.7}>
          <Text style={[styles.usernameText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {currentUsername}
          </Text>
          <ChevronDown size={18} color={isDark ? '#FFFFFF' : '#000000'} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.composeIconBtn}
          onPress={() => setIsNewChatModalOpen(true)}
          activeOpacity={0.8}
        >
          <SquarePen size={22} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {/* ── 2. Search Bar ───────────────────────────────────────────── */}
        <View
          style={[
            styles.igSearchBar,
            { backgroundColor: isDark ? '#1C1C1E' : '#EFEFEF' },
          ]}
        >
          <Search size={18} color={isDark ? '#8E8E93' : '#8E8E93'} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.igSearchInput, { color: isDark ? '#FFFFFF' : '#000000' }]}
            placeholder="Search or ask Meta AI"
            placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* ── 3. Notes / Status Tray (Real Database Data) ─────────────── */}
        <View style={styles.notesTrayWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.notesTrayContent}
          >
            {/* Self Note Circle */}
            <TouchableOpacity
              style={styles.noteItem}
              activeOpacity={0.85}
              onPress={() => {
                setTempNoteText(myNoteText);
                setIsNoteModalOpen(true);
              }}
            >
              {/* Floating Note Thought Bubble */}
              <View
                style={[
                  styles.thoughtBubble,
                  {
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.thoughtBubbleText,
                    { color: isDark ? '#FFFFFF' : '#000000' },
                  ]}
                  numberOfLines={1}
                >
                  {myNoteText || 'Share a thought...'}
                </Text>
              </View>

              <View style={styles.noteAvatarWrap}>
                {currentUserAvatar ? (
                  <Image source={{ uri: currentUserAvatar }} style={styles.noteAvatar} />
                ) : (
                  <View style={[styles.noteAvatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitial}>
                      {(currentUsername || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.noteAddBadge}>
                  <Plus size={10} color="#FFFFFF" strokeWidth={3} />
                </View>
              </View>
              <Text style={[styles.noteUserLabel, { color: isDark ? '#8E8E93' : '#737373' }]}>
                Your note
              </Text>
            </TouchableOpacity>

            {/* Real Online / Active Campus Peers Notes */}
            {onlinePeers.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.noteItem}
                activeOpacity={0.85}
                onPress={() => setActiveChat(item)}
              >
                {/* Note Bubble */}
                <View
                  style={[
                    styles.thoughtBubble,
                    {
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                      borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.thoughtBubbleText,
                      { color: isDark ? '#FFFFFF' : '#000000' },
                    ]}
                    numberOfLines={1}
                  >
                    {item.status_note || 'Active now'}
                  </Text>
                </View>

                <View style={styles.noteAvatarWrap}>
                  {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} style={styles.noteAvatar} />
                  ) : (
                    <View style={[styles.noteAvatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarInitial}>
                        {(item.name || item.username || 'U')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {item.online && <View style={styles.onlineDot} />}
                </View>
                <Text
                  style={[styles.noteUserLabel, { color: isDark ? '#8E8E93' : '#737373' }]}
                  numberOfLines={1}
                >
                  {item.name || item.username}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── 4. Section Title & Requests Link ────────────────────────── */}
        <View style={styles.messagesSectionHeader}>
          <Text style={[styles.messagesSectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {activeTab === 'messages' ? 'Messages' : 'Message Requests'}
          </Text>

          <TouchableOpacity
            style={[
              styles.requestsTabPill,
              activeTab === 'requests' && { backgroundColor: isDark ? '#27272A' : '#E5E7EB' },
            ]}
            onPress={() => setActiveTab(activeTab === 'messages' ? 'requests' : 'messages')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={[
                styles.requestsLinkText,
                activeTab === 'requests' && { fontWeight: '800', color: isDark ? '#FFFFFF' : '#000000' },
              ]}
            >
              {activeTab === 'messages'
                ? `Requests ${pendingRequests.length > 0 ? `(${pendingRequests.length})` : ''}`
                : '← All Messages'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 5. Pending Connection Requests (When on Requests Tab) ─────── */}
        {activeTab === 'requests' && pendingRequests.length > 0 && (
          <View style={styles.requestsSectionWrap}>
            <Text style={[styles.requestsSubheading, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              PENDING CONNECTION REQUESTS ({pendingRequests.length})
            </Text>
            {pendingRequests.map((req) => (
              <View
                key={req.connectionId}
                style={[
                  styles.requestCard,
                  {
                    backgroundColor: isDark ? '#18181B' : '#F9FAFB',
                    borderColor: isDark ? '#27272A' : '#E5E7EB',
                  },
                ]}
              >
                <View style={styles.requestUserRow}>
                  {req.user.avatar_url ? (
                    <Image source={{ uri: req.user.avatar_url }} style={styles.requestAvatar} />
                  ) : (
                    <View style={[styles.requestAvatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarInitial}>
                        {(req.user.name || req.user.username || 'U')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.nameRow}>
                      <Text
                        style={[styles.requestName, { color: isDark ? '#FFFFFF' : '#000000' }]}
                        numberOfLines={1}
                      >
                        {req.user.name || req.user.username || 'Student'}
                      </Text>
                      {req.user.is_verified && (
                        <VerifiedBadge size={13} />
                      )}
                    </View>
                    <Text style={styles.requestUsername}>@{req.user.username || 'student'}</Text>
                    <Text style={styles.requestPromptText}>wants to connect with you.</Text>
                  </View>
                </View>

                <View style={styles.requestActionRow}>
                  <TouchableOpacity
                    style={[styles.reqDeclineBtn, { backgroundColor: isDark ? '#27272A' : '#E5E7EB' }]}
                    onPress={() => handleDeclineConnection(req.connectionId)}
                    disabled={processingRequestId === req.connectionId}
                  >
                    <Text style={[styles.reqDeclineBtnText, { color: isDark ? '#FFFFFF' : '#374151' }]}>
                      Decline
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.reqAcceptBtn, { backgroundColor: '#3B82F6' }]}
                    onPress={() => handleAcceptConnection(req.connectionId, req.user.id)}
                    disabled={processingRequestId === req.connectionId}
                  >
                    {processingRequestId === req.connectionId ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.reqAcceptBtnText}>Accept</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── 6. Conversations List ───────────────────────────────────── */}
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        ) : filteredConversations.length === 0 && (activeTab === 'messages' || pendingRequests.length === 0) ? (
          <View style={styles.emptyInboxBox}>
            <MessageSquare size={44} color={isDark ? '#3F3F46' : '#D1D5DB'} />
            <Text style={[styles.emptyInboxTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              {activeTab === 'requests' ? 'No message requests' : 'No messages yet'}
            </Text>
            <Text style={styles.emptyInboxSub}>
              {activeTab === 'requests'
                ? 'When someone not in your connections messages or invites you, it will appear here.'
                : 'Connect with classmates and friends to chat.'}
            </Text>
            {activeTab === 'messages' && (
              <TouchableOpacity
                style={styles.messageNewBtn}
                onPress={() => setIsNewChatModalOpen(true)}
              >
                <Text style={styles.messageNewBtnText}>New Message</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredConversations.map((item) => {
            const hasUnread = item.unreadCount > 0;

            return (
              <TouchableOpacity
                key={item.user.id}
                style={styles.convoRow}
                activeOpacity={0.7}
                onPress={() => setActiveChat(item.user)}
              >
                <View style={styles.avatarWithOnlineWrap}>
                  {item.user.avatar_url ? (
                    <Image source={{ uri: item.user.avatar_url }} style={styles.convoAvatar} />
                  ) : (
                    <View style={[styles.convoAvatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarInitial}>
                        {(item.user.name || item.user.username || 'U')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {item.user.online && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.convoMainMeta}>
                  <View style={styles.nameRow}>
                    <Text
                      style={[
                        styles.convoName,
                        { color: isDark ? '#FFFFFF' : '#000000' },
                        hasUnread && styles.convoNameUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {item.user.name || item.user.username || 'Student'}
                    </Text>
                    {item.user.is_verified && (
                      <VerifiedBadge size={13} />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.convoSnippet,
                      { color: isDark ? '#A1A1AA' : '#737373' },
                      hasUnread && { color: isDark ? '#FFFFFF' : '#000000', fontWeight: '700' },
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage.content || 'Active now'} •{' '}
                    {new Date(item.lastMessage.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>

                {hasUnread ? (
                  <View style={styles.unreadDot} />
                ) : null}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ── Note Edit Modal ─────────────────────────────────────────── */}
      <Modal
        visible={isNoteModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsNoteModalOpen(false)}
      >
        <View style={styles.noteModalOverlay}>
          <View style={[styles.noteModalSheet, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.noteModalHeader}>
              <TouchableOpacity onPress={() => setIsNoteModalOpen(false)}>
                <Text style={{ color: '#737373', fontSize: 15 }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.noteModalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>New Note</Text>
              <TouchableOpacity
                onPress={() => {
                  setMyNoteText(tempNoteText);
                  setIsNoteModalOpen(false);
                }}
              >
                <Text style={{ color: '#3B82F6', fontSize: 15, fontWeight: '700' }}>Share</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.noteTextInput, { color: isDark ? '#FFFFFF' : '#000000' }]}
              placeholder="Share what's on your mind..."
              placeholderTextColor="#8E8E93"
              value={tempNoteText}
              onChangeText={setTempNoteText}
              maxLength={60}
              autoFocus
            />
          </View>
        </View>
      </Modal>

      {/* ── New Message / Connections Selection Modal ───────────────── */}
      <Modal
        visible={isNewChatModalOpen}
        animationType="slide"
        onRequestClose={() => setIsNewChatModalOpen(false)}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsNewChatModalOpen(false)} style={styles.backBtn}>
              <X size={22} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>New Message</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={[styles.igSearchBar, { marginHorizontal: 16, marginVertical: 10, backgroundColor: isDark ? '#1C1C1E' : '#EFEFEF' }]}>
            <Search size={18} color="#8E8E93" style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.igSearchInput, { color: isDark ? '#FFFFFF' : '#000000' }]}
              placeholder="Search connections..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loadingConnections ? (
            <ActivityIndicator color="#3B82F6" style={{ marginTop: 30 }} />
          ) : (
            <FlatList
              data={connectedProfiles}
              keyExtractor={(p) => p.id}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.convoRow}
                  onPress={() => {
                    setActiveChat(item);
                    setIsNewChatModalOpen(false);
                  }}
                >
                  {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} style={styles.convoAvatar} />
                  ) : (
                    <View style={[styles.convoAvatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarInitial}>
                        {(item.name || item.username || 'U')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.convoMainMeta}>
                    <Text style={[styles.convoName, { color: isDark ? '#FFFFFF' : '#000000' }]}>{item.name}</Text>
                    <Text style={{ color: '#8E8E93', fontSize: 12 }}>@{item.username}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  usernameDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  composeIconBtn: {
    padding: 6,
  },
  igSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  igSearchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  notesTrayWrapper: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  notesTrayContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  noteItem: {
    alignItems: 'center',
    width: 78,
  },
  thoughtBubble: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    maxWidth: 80,
  },
  thoughtBubbleText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  noteAvatarWrap: {
    position: 'relative',
  },
  noteAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#E5E7EB',
  },
  noteAddBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  noteUserLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  messagesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  messagesSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  requestsLinkText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '700',
  },
  convoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatarWithOnlineWrap: {
    position: 'relative',
  },
  convoAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  convoMainMeta: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  convoName: {
    fontSize: 14,
    fontWeight: '600',
  },
  convoNameUnread: {
    fontWeight: '800',
  },
  blueCheckWrap: {
    marginLeft: 4,
  },
  convoSnippet: {
    fontSize: 13,
    marginTop: 3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  emptyInboxBox: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyInboxTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyInboxSub: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  messageNewBtn: {
    marginTop: 18,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageNewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Active Chat Screen
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  chatHeaderUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  chatHeaderMeta: {
    marginLeft: 10,
  },
  chatHeaderName: {
    fontSize: 15,
    fontWeight: '700',
  },
  chatHeaderUsername: {
    fontSize: 11,
    color: '#8E8E93',
  },
  notConnectedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF08A',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  notConnectedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  notConnectedText: {
    fontSize: 11,
    color: '#000000',
  },
  connectActionBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectActionPending: {
    backgroundColor: '#A3A3A3',
  },
  connectActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  chatKeyboardArea: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  messageBubbleWrapper: {
    marginVertical: 2,
    maxWidth: '75%',
  },
  myBubbleWrapper: {
    alignSelf: 'flex-end',
  },
  theirBubbleWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
  },
  myMessageBubble: {
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  chatBubbleImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {},
  messageTime: {
    fontSize: 10,
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirMessageTime: {},
  attachedImageBar: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
  },
  attachedImgThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  removeAttachedBtn: {
    position: 'absolute',
    top: 2,
    left: 56,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    padding: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 24,
  },
  attachBtn: {
    padding: 6,
  },
  textInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    maxHeight: 80,
  },
  textInputDisabled: {
    opacity: 0.5,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 30,
  },

  // Note Modal
  noteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  noteModalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  noteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  noteModalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  noteTextInput: {
    fontSize: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F46',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  requestsTabPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  requestsSectionWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  requestsSubheading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  requestCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  requestUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  requestName: {
    fontSize: 15,
    fontWeight: '700',
  },
  requestUsername: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 1,
  },
  requestPromptText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  requestActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  reqDeclineBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqDeclineBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  reqAcceptBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqAcceptBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Shared Post Card in Chat Bubble
  sharedPostCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    width: 230,
    marginVertical: 3,
  },
  sharedPostBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sharedPostBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sharedPostImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    backgroundColor: '#374151',
    marginBottom: 8,
  },
  sharedPostContent: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  sharedPostFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.25)',
    paddingTop: 6,
  },
  sharedPostActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
