import React from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView } from 'react-native';
import { colors } from '../../theme/colors';

const MOCK_POSTS = [
  { id: '1', author: 'Alex Johnson', content: 'Just started using the new mobile app. Looks clean!', time: '2m ago' },
  { id: '2', author: 'Sarah Williams', content: 'Anyone forming a study group for CS301 tonight?', time: '1hr ago' },
  { id: '3', author: 'UniLink Admin', content: 'Welcome to the UniLink React Native Beta!', time: '2hr ago' },
];

export default function FeedScreen() {
  const renderItem = ({ item }: { item: typeof MOCK_POSTS[0] }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar} />
        <View>
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
      </View>
      <FlatList 
        data={MOCK_POSTS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  listContent: {
    padding: 16,
  },
  postCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  postTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  }
});
