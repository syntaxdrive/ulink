import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Check, BarChart2 } from 'lucide-react-native';
import { useTheme } from '../theme/colors';

interface Props {
  options: string[];
  counts?: number[] | null;
  userVote?: number | null;
  onVote: (optionIndex: number) => void;
  isVoting?: boolean;
}

export function PollCard({
  options,
  counts,
  userVote,
  onVote,
  isVoting = false,
}: Props) {
  const { colors, isDark } = useTheme();

  if (!options || options.length < 2) return null;

  const safeCounts = options.map((_, i) => (counts && counts[i]) || 0);
  const totalVotes = safeCounts.reduce((acc, curr) => acc + curr, 0);
  const hasVoted = userVote !== null && userVote !== undefined;

  return (
    <View
      style={[
        styles.pollContainer,
        {
          backgroundColor: isDark ? '#18181B' : '#F9FAFB',
          borderColor: isDark ? '#27272A' : '#E5E7EB',
        },
      ]}
    >
      <View style={styles.pollHeader}>
        <BarChart2 size={15} color={colors.primary} />
        <Text style={[styles.pollHeaderTitle, { color: colors.primary }]}>Campus Poll</Text>
      </View>

      <View style={styles.optionsList}>
        {options.map((option, index) => {
          const voteCount = safeCounts[index] || 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isSelected = userVote === index;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionRow,
                {
                  backgroundColor: isDark ? '#27272A' : '#FFFFFF',
                  borderColor: isSelected ? colors.primary : (isDark ? '#3F3F46' : '#E5E7EB'),
                },
                isSelected && { borderWidth: 1.5 },
              ]}
              onPress={() => onVote(index)}
              activeOpacity={0.75}
              disabled={isVoting}
            >
              {/* Animated Progress Bar fill */}
              {hasVoted && (
                <View
                  style={[
                    styles.percentageFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: isSelected
                        ? (isDark ? '#064E3B' : '#D1FAE5')
                        : (isDark ? '#3F3F46' : '#F3F4F6'),
                    },
                  ]}
                />
              )}

              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                      <Check size={11} color="#FFFFFF" />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? (isDark ? '#34D399' : '#065F46') : colors.text },
                      isSelected && { fontWeight: '700' },
                    ]}
                    numberOfLines={2}
                  >
                    {option}
                  </Text>
                </View>

                {hasVoted && (
                  <Text
                    style={[
                      styles.percentageText,
                      { color: isSelected ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {percentage}%
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.pollFooter}>
        <Text style={[styles.pollFooterText, { color: colors.textTertiary }]}>
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} · {hasVoted ? 'Your vote is recorded' : 'Tap an option to vote'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pollContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
    marginBottom: 6,
    marginHorizontal: 16,
  },
  pollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  pollHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 42,
    justifyContent: 'center',
  },
  percentageFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 10,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '800',
  },
  pollFooter: {
    marginTop: 8,
    paddingTop: 6,
  },
  pollFooterText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
