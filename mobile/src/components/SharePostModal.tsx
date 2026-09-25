import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  ActivityIndicator,
  Share,
  Platform,
  Alert,
} from 'react-native';
import {
  X,
  Search,
  Send,
  Check,
  Copy,
  Share2,
  MessageSquare,
  Sparkles,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { FeedPost } from '../services/feedService';
import { VerifiedBadge } from './VerifiedBadge';

interface PeerUser {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_verified?: boolean;
}

interface SharePostModalProps {
  visible: boolean;
  post: FeedPost | null;
  onClose: () => void;
  currentUserId: string | null;
  navigation?: any;
}

export const SharePostModal: React.FC<SharePostModalProps> = ({
  visible,
  post,
  onClose,
  currentUserId,
  navigation,
}) => {
  const { isDark } = useTheme();
  const [peers, setPeers] = useState<PeerUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingUserIds, setSendingUserIds] = useState<Set<string>>(new Set());
  const [sentUserIds, setSentUserIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // Load connected & followed peers when modal opens
  useEffect(() => {
    if (!visible || !currentUserId) return;

    setSentUserIds(new Set());
    setSearchQuery('');
    setCopied(false);

    const loadPeers = async () => {
      setLoading(true);
      try {
        const [connsRes, followsRes] = await Promise.allSettled([
          supabase
            .from('connections')
            .select(`
              id, status, requester_id, recipient_id,
              requester:profiles!requester_id(id, name, username, avatar_url, is_verified),
              recipient:profiles!recipient_id(id, name, username, avatar_url, is_verified)
            `)
            .or(`requester_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
            .eq('status', 'accepted'),
          supabase
            .from('follows')
            .select(`
              following_id,
              following:profiles!following_id(id, name, username, avatar_url, is_verified)
            `)
            .eq('follower_id', currentUserId),
        ]);

        const peerMap = new Map<string, PeerUser>();

        if (connsRes.status === 'fulfilled' && connsRes.value.data) {
          connsRes.value.data.forEach((c: any) => {
            const other = c.requester_id === currentUserId ? c.recipient : c.requester;
            if (other && other.id && other.id !== currentUserId) {
              peerMap.set(other.id, other);
            }
          });
        }

        if (followsRes.status === 'fulfilled' && followsRes.value.data) {
          followsRes.value.data.forEach((f: any) => {
            if (f.following && f.following.id && f.following.id !== currentUserId) {
              peerMap.set(f.following.id, f.following);
            }
          });
        }

        // If user has few connections, fetch suggestions from profiles
        if (peerMap.size < 4) {
          const { data: suggestions } = await supabase
            .from('profiles')
            .select('id, name, username, avatar_url, is_verified')
            .neq('id', currentUserId)
            .limit(10);
          if (suggestions) {
            suggestions.forEach((s: any) => {
              if (!peerMap.has(s.id)) peerMap.set(s.id, s);
            });
          }
        }

        setPeers(Array.from(peerMap.values()));
      } catch (err) {
        console.warn('Error loading peers for share:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPeers();
  }, [visible, currentUserId]);

  const filteredPeers = useMemo(() => {
    if (!searchQuery.trim()) return peers;
    const q = searchQuery.toLowerCase();
    return peers.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.username && p.username.toLowerCase().includes(q))
    );
  }, [peers, searchQuery]);

  const handleSendToPeer = async (peer: PeerUser) => {
    if (!post || !currentUserId || sentUserIds.has(peer.id)) return;

    setSendingUserIds((prev) => new Set(prev).add(peer.id));

    try {
      const postShareLink = `https://unilink.ng/post/${post.id}`;
      const postImageUrl = post.image_url || (post.image_urls && post.image_urls[0]) || null;
      const snippet = post.content ? post.content.slice(0, 120) : 'Check out this post on UniLink';
      const messageContent = `${postShareLink}\n\n${snippet}`;

      const { error } = await supabase.from('messages').insert({
        sender_id: currentUserId,
        recipient_id: peer.id,
        content: messageContent,
        image_url: postImageUrl,
      });

      if (!error) {
        setSentUserIds((prev) => new Set(prev).add(peer.id));
      } else {
        // Fallback or alert
        setSentUserIds((prev) => new Set(prev).add(peer.id));
      }
    } catch {
      setSentUserIds((prev) => new Set(prev).add(peer.id));
    } finally {
      setSendingUserIds((prev) => {
        const next = new Set(prev);
        next.delete(peer.id);
        return next;
      });
    }
  };

  const handleCopyLink = async () => {
    if (!post) return;
    const postShareLink = `https://unilink.ng/post/${post.id}`;
    await Clipboard.setStringAsync(postShareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (!post) return;
    const postShareLink = `https://unilink.ng/post/${post.id}`;
    try {
      await Share.share({
        message: post.content
          ? `${post.content}\n\n${postShareLink}`
          : `Check out this post on UniLink:\n${postShareLink}`,
        url: postShareLink,
      });
    } catch {}
  };

  if (!visible || !post) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.sheetContainer,
            { backgroundColor: isDark ? '#16161E' : '#FFFFFF' },
          ]}
        >
          {/* Header */}
          <View style={[styles.sheetHeader, { borderBottomColor: isDark ? '#262633' : '#F3F4F6' }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.headerRow}>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Share Post
              </Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Post Preview Card */}
          <View
            style={[
              styles.postPreviewBox,
              { backgroundColor: isDark ? '#1F1F2C' : '#F9FAFB', borderColor: isDark ? '#2D2D3E' : '#E5E7EB' },
            ]}
          >
            {post.image_url ? (
              <Image source={{ uri: post.image_url }} style={styles.postPreviewThumb} />
            ) : null}
            <View style={{ flex: 1, marginLeft: post.image_url ? 10 : 0 }}>
              <Text style={[styles.postPreviewAuthor, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
                {post.author?.name || post.author?.username || 'Student'}
              </Text>
              <Text
                style={[styles.postPreviewText, { color: isDark ? '#A1A1AA' : '#6B7280' }]}
                numberOfLines={2}
              >
                {post.content || 'Shared campus moment'}
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View
            style={[
              styles.searchBar,
              { backgroundColor: isDark ? '#1E1E2A' : '#F3F4F6', borderColor: isDark ? '#2D2D3E' : '#E5E7EB' },
            ]}
          >
            <Search size={16} color={isDark ? '#71717A' : '#9CA3AF'} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#111827' }]}
              placeholder="Search peers to send in DM..."
              placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={14} color={isDark ? '#71717A' : '#9CA3AF'} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Peers List */}
          {loading ? (
            <View style={styles.loadingArea}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : filteredPeers.length === 0 ? (
            <View style={styles.emptyArea}>
              <Text style={[styles.emptyText, { color: isDark ? '#71717A' : '#9CA3AF' }]}>
                No peers found matching "{searchQuery}"
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredPeers}
              keyExtractor={(item) => item.id}
              style={styles.peersList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSent = sentUserIds.has(item.id);
                const isSending = sendingUserIds.has(item.id);

                return (
                  <View style={styles.peerRow}>
                    <Image
                      source={{
                        uri:
                          item.avatar_url ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
                      }}
                      style={styles.peerAvatar}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                          style={[styles.peerName, { color: isDark ? '#FFFFFF' : '#111827' }]}
                          numberOfLines={1}
                        >
                          {item.name || item.username || 'Student'}
                        </Text>
                        {item.is_verified && <VerifiedBadge size={12} isGold={false} />}
                      </View>
                      <Text
                        style={[styles.peerUsername, { color: isDark ? '#71717A' : '#9CA3AF' }]}
                        numberOfLines={1}
                      >
                        @{item.username || 'user'}
                      </Text>
                    </View>

                    {/* Send / Sent Button */}
                    <TouchableOpacity
                      style={[
                        styles.sendPeerBtn,
                        isSent
                          ? styles.sendPeerBtnSent
                          : { backgroundColor: '#3B82F6' },
                      ]}
                      onPress={() => handleSendToPeer(item)}
                      disabled={isSent || isSending}
                      activeOpacity={0.8}
                    >
                      {isSending ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : isSent ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Check size={14} color="#10B981" style={{ marginRight: 4 }} />
                          <Text style={styles.sendPeerBtnTextSent}>Sent</Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Send size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                          <Text style={styles.sendPeerBtnText}>Send</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          )}

          {/* Quick Actions Row: Copy Link & Native Share */}
          <View
            style={[
              styles.quickActionsBar,
              { borderTopColor: isDark ? '#262633' : '#F3F4F6', backgroundColor: isDark ? '#13131B' : '#F9FAFB' },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.quickActionBtn,
                { backgroundColor: isDark ? '#232332' : '#FFFFFF', borderColor: isDark ? '#2E2E42' : '#E5E7EB' },
              ]}
              onPress={handleCopyLink}
              activeOpacity={0.8}
            >
              {copied ? (
                <>
                  <Check size={18} color="#10B981" style={{ marginRight: 6 }} />
                  <Text style={[styles.quickActionBtnText, { color: '#10B981', fontWeight: '700' }]}>
                    Link Copied!
                  </Text>
                </>
              ) : (
                <>
                  <Copy size={18} color={isDark ? '#FFFFFF' : '#111827'} style={{ marginRight: 6 }} />
                  <Text style={[styles.quickActionBtnText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Copy Link
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionBtn,
                { backgroundColor: isDark ? '#232332' : '#FFFFFF', borderColor: isDark ? '#2E2E42' : '#E5E7EB' },
              ]}
              onPress={handleNativeShare}
              activeOpacity={0.8}
            >
              <Share2 size={18} color={isDark ? '#FFFFFF' : '#111827'} style={{ marginRight: 6 }} />
              <Text style={[styles.quickActionBtnText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Share via...
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    marginBottom: 10,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  postPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  postPreviewThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  postPreviewAuthor: {
    fontSize: 13,
    fontWeight: '700',
  },
  postPreviewText: {
    fontSize: 12,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  loadingArea: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyArea: {
    paddingVertical: 32,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  peersList: {
    maxHeight: 250,
    paddingHorizontal: 16,
  },
  peerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  peerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#374151',
  },
  peerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  peerUsername: {
    fontSize: 12,
    marginTop: 1,
  },
  sendPeerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendPeerBtnSent: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  sendPeerBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sendPeerBtnTextSent: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },
  quickActionsBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickActionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
