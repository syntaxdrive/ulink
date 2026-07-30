import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Settings, Grid, UserSquare } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const imageSize = (width - 4) / 3; // 3 columns with 2px gap

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerUsername}>alex_j</Text>
        <TouchableOpacity>
          <Settings color={colors.text} size={24} />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarLarge} />
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>348</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>421</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bioContainer}>
          <Text style={styles.name}>Alex Johnson</Text>
          <Text style={styles.bioText}>CS @ Stanford 🌲</Text>
          <Text style={styles.bioText}>Building things with code.</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Grid color={colors.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <UserSquare color={colors.textSecondary} size={24} />
          </TouchableOpacity>
        </View>

        {/* Grid */}
        <View style={styles.gridContainer}>
          {Array.from({ length: 12 }).map((_, index) => (
            <View key={index} style={styles.gridImage} />
          ))}
        </View>
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
  },
  headerUsername: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  avatarContainer: {
    marginRight: 24,
  },
  avatarLarge: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.surface,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: colors.text,
    marginTop: 2,
  },
  bioContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  name: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  bioText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  editButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: colors.text,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridImage: {
    width: imageSize,
    height: imageSize,
    backgroundColor: colors.surface,
    marginBottom: 2,
  },
});
