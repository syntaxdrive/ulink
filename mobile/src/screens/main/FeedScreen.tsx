import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Heart, MessageCircle, MoreHorizontal, Bookmark, Send } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

const MOCK_STORIES = [
  { id: '1', author: 'Your Story', isUser: true },
  { id: '2', author: 'alex_j', isUser: false },
  { id: '3', author: 'sarah_w', isUser: false },
  { id: '4', author: 'cs_squad', isUser: false },
  { id: '5', author: 'uni_news', isUser: false },
];

const MOCK_POSTS = [
  { id: '1', author: 'alex_j', university: 'Stanford University', content: 'Just started using the new mobile app. Looks clean!', likes: 42, time: '2 hours ago', comments: 12 },
  { id: '2', author: 'sarah_w', university: 'MIT', content: 'Anyone forming a study group for CS301 tonight?', likes: 128, time: '5 hours ago', comments: 45 },
  { id: '3', author: 'uni_news', university: 'Harvard', content: 'Welcome to the UniLink React Native Beta! Exciting things coming up for the student community.', likes: 892, time: '1 day ago', comments: 104 },
];

export default function FeedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>UniLink</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Heart color={colors.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MessageCircle color={colors.text} size={24} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stories */}
        <View style={styles.storiesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesList}>
            {MOCK_STORIES.map((story) => (
              <View key={story.id} style={styles.storyItem}>
                <View style={[styles.storyAvatar, story.isUser ? styles.storyAvatarUser : styles.storyAvatarOther]}>
                  {story.isUser && (
                    <View style={styles.storyAddBadge}>
                      <Text style={styles.storyAddText}>+</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.storyText} numberOfLines={1}>{story.author}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.divider} />

        {/* Feed */}
        {MOCK_POSTS.map((post) => (
          <View key={post.id} style={styles.postContainer}>
            {/* Post Header */}
            <View style={styles.postHeader}>
              <View style={styles.postHeaderLeft}>
                <View style={styles.avatarSmall} />
                <View>
                  <Text style={styles.postAuthor}>{post.author}</Text>
                  <Text style={styles.postUniversity}>{post.university}</Text>
                </View>
              </View>
              <TouchableOpacity>
                <MoreHorizontal color={colors.text} size={20} />
              </TouchableOpacity>
            </View>
            
            {/* Post Image */}
            <View style={styles.postImage} />
            
            {/* Post Actions */}
            <View style={styles.postActions}>
              <View style={styles.postActionsLeft}>
                <TouchableOpacity style={styles.actionIcon}>
                  <Heart color={colors.text} size={24} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionIcon}>
                  <MessageCircle color={colors.text} size={24} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionIcon}>
                  <Send color={colors.text} size={24} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity>
                <Bookmark color={colors.text} size={24} />
              </TouchableOpacity>
            </View>
            
            {/* Post Details */}
            <View style={styles.postDetails}>
              <Text style={styles.likesText}>{post.likes} likes</Text>
              <View style={styles.captionContainer}>
                <Text style={styles.captionText}>
                  <Text style={styles.captionAuthor}>{post.author} </Text>
                  {post.content}
                </Text>
              </View>
              <Text style={styles.commentsText}>View all {post.comments} comments</Text>
              <Text style={styles.timeText}>{post.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  storiesContainer: {
    paddingVertical: 12,
  },
  storiesList: {
    paddingHorizontal: 12,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 64,
  },
  storyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    marginBottom: 4,
    position: 'relative',
  },
  storyAvatarUser: {
    borderWidth: 0,
  },
  storyAvatarOther: {
    borderWidth: 2,
    borderColor: colors.border,
    padding: 2,
  },
  storyAddBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.info,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAddText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -1,
  },
  storyText: {
    fontSize: 12,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  postContainer: {
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginRight: 10,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  postUniversity: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  postImage: {
    width: width,
    height: width,
    backgroundColor: colors.surface,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  postActionsLeft: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginRight: 16,
  },
  postDetails: {
    paddingHorizontal: 12,
  },
  likesText: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  captionContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  captionAuthor: {
    fontWeight: '600',
    color: colors.text,
  },
  captionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  commentsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
