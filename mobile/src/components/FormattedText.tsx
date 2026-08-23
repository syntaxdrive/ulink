import React from 'react';
import {
  Text,
  TextStyle,
  StyleSheet,
  View,
  Linking,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';

interface FormattedTextProps {
  content: string;
  style?: TextStyle | TextStyle[];
  onHashtagPress?: (hashtag: string) => void;
  onMentionPress?: (mention: string) => void;
}

/**
 * FormattedText — Full Markdown and Campus Tag Parser & Renderer
 * Supports:
 * - ***bold italic*** (3 asterisks)
 * - **bold** / __bold__ (2 asterisks/underscores)
 * - *italic* / _italic_ (1 asterisk/underscore)
 * - `code` (inline monospace code pills)
 * - ~~strikethrough~~
 * - [Link Label](https://url)
 * - #hashtags and @mentions
 * - # Header 1, ## Header 2, ### Header 3
 * - > Blockquotes
 * - - Bullet points
 */
export const FormattedText: React.FC<FormattedTextProps> = ({
  content,
  style,
  onHashtagPress,
  onMentionPress,
}) => {
  if (!content) return null;

  // Split into lines to process block elements (headings, blockquotes, lists)
  const lines = content.split('\n');

  return (
    <View style={styles.container}>
      {lines.map((line, lineIndex) => {
        // 1. Heading 1 (# Heading)
        if (line.startsWith('# ') && line.length > 2) {
          return (
            <Text key={lineIndex} style={[styles.h1, style]}>
              {parseInlineMarkdown(
                line.substring(2),
                onHashtagPress,
                onMentionPress,
                styles.h1
              )}
            </Text>
          );
        }

        // 2. Heading 2 (## Heading)
        if (line.startsWith('## ') && line.length > 3) {
          return (
            <Text key={lineIndex} style={[styles.h2, style]}>
              {parseInlineMarkdown(
                line.substring(3),
                onHashtagPress,
                onMentionPress,
                styles.h2
              )}
            </Text>
          );
        }

        // 3. Heading 3 (### Heading)
        if (line.startsWith('### ') && line.length > 4) {
          return (
            <Text key={lineIndex} style={[styles.h3, style]}>
              {parseInlineMarkdown(
                line.substring(4),
                onHashtagPress,
                onMentionPress,
                styles.h3
              )}
            </Text>
          );
        }

        // 4. Blockquote (> Quote)
        if (line.startsWith('> ') && line.length > 2) {
          return (
            <View key={lineIndex} style={styles.blockquoteContainer}>
              <View style={styles.blockquoteBar} />
              <Text style={[styles.blockquoteText, style]}>
                {parseInlineMarkdown(
                  line.substring(2),
                  onHashtagPress,
                  onMentionPress,
                  styles.blockquoteText
                )}
              </Text>
            </View>
          );
        }

        // 5. Bullet List (- Item or * Item)
        const bulletMatch = line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
        if (bulletMatch) {
          const bullet = bulletMatch[2].includes('.') ? bulletMatch[2] : '•';
          const textContent = bulletMatch[3];
          return (
            <View key={lineIndex} style={styles.listItemRow}>
              <Text style={styles.bulletSymbol}>{bullet}</Text>
              <Text style={[styles.listItemText, style]}>
                {parseInlineMarkdown(
                  textContent,
                  onHashtagPress,
                  onMentionPress,
                  style
                )}
              </Text>
            </View>
          );
        }

        // 6. Normal Line
        return (
          <Text key={lineIndex} style={[styles.baseText, style]}>
            {parseInlineMarkdown(
              line,
              onHashtagPress,
              onMentionPress,
              style
            )}
          </Text>
        );
      })}
    </View>
  );
};

/**
 * Tokenizes and styles inline markdown (bold, italic, code, links, hashtags, mentions)
 */
function parseInlineMarkdown(
  text: string,
  onHashtagPress?: (tag: string) => void,
  onMentionPress?: (mention: string) => void,
  inheritedStyle?: any
): React.ReactNode[] {
  if (!text) return [];

  // Match Markdown tokens:
  // 1. Links: [label](url)
  // 2. Bold Italic: ***text*** or ___text___
  // 3. Bold: **text** or __text__
  // 4. Italic: *text* or _text_
  // 5. Code: `code`
  // 6. Strikethrough: ~~text~~
  // 7. Hashtags: #tag
  // 8. Mentions: @user
  // 9. Plain URLs: https://...
  const tokenRegex =
    /(\[[^\]]+\]\([^)]+\)|\*\*\*[^*]+\*\*\*|___[^_]+___|\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|~~[^~]+~~|\*[^*]+\*|_[^_]+_|#[A-Za-z0-9_]+|@[A-Za-z0-9_.]+|https?:\/\/[^\s]+)/g;

  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. Markdown Link: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const label = linkMatch[1];
      const url = linkMatch[2];
      return (
        <Text
          key={index}
          style={styles.link}
          onPress={() => {
            Linking.openURL(url).catch(() => {});
          }}
        >
          {label}
        </Text>
      );
    }

    // 2. Plain URL
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <Text
          key={index}
          style={styles.link}
          onPress={() => {
            Linking.openURL(part).catch(() => {});
          }}
        >
          {part}
        </Text>
      );
    }

    // 3. Bold + Italic: ***text*** or ___text___
    if (
      (part.startsWith('***') && part.endsWith('***') && part.length > 6) ||
      (part.startsWith('___') && part.endsWith('___') && part.length > 6)
    ) {
      const inner = part.slice(3, -3);
      return (
        <Text key={index} style={styles.boldItalic}>
          {inner}
        </Text>
      );
    }

    // 4. Bold: **text** or __text__
    if (
      (part.startsWith('**') && part.endsWith('**') && part.length > 4) ||
      (part.startsWith('__') && part.endsWith('__') && part.length > 4)
    ) {
      const inner = part.slice(2, -2);
      return (
        <Text key={index} style={styles.bold}>
          {inner}
        </Text>
      );
    }

    // 5. Italic: *text* or _text_
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length > 2) ||
      (part.startsWith('_') && part.endsWith('_') && part.length > 2)
    ) {
      const inner = part.slice(1, -1);
      return (
        <Text key={index} style={styles.italic}>
          {inner}
        </Text>
      );
    }

    // 6. Inline Code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const inner = part.slice(1, -1);
      return (
        <Text key={index} style={styles.inlineCode}>
          {inner}
        </Text>
      );
    }

    // 7. Strikethrough: ~~text~~
    if (part.startsWith('~~') && part.endsWith('~~') && part.length > 4) {
      const inner = part.slice(2, -2);
      return (
        <Text key={index} style={styles.strikethrough}>
          {inner}
        </Text>
      );
    }

    // 8. Hashtags: #tag
    if (part.startsWith('#') && part.length > 1) {
      return (
        <Text
          key={index}
          style={styles.hashtag}
          onPress={() => onHashtagPress?.(part)}
        >
          {part}
        </Text>
      );
    }

    // 9. Mentions: @username
    if (part.startsWith('@') && part.length > 1) {
      return (
        <Text
          key={index}
          style={styles.mention}
          onPress={() => onMentionPress?.(part)}
        >
          {part}
        </Text>
      );
    }

    // Plain Text
    return <Text key={index}>{part}</Text>;
  });
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  baseText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '800',
    color: colors.text,
  },
  italic: {
    fontStyle: 'italic',
  },
  boldItalic: {
    fontWeight: '800',
    fontStyle: 'italic',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#F3F4F6',
    color: '#D97706', // Warm amber
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  link: {
    color: '#2563EB', // Blue link
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  hashtag: {
    color: colors.primary,
    fontWeight: '800',
  },
  mention: {
    color: '#0284C7', // Sky Blue
    fontWeight: '800',
  },
  h1: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginVertical: 4,
    lineHeight: 26,
  },
  h2: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginVertical: 3,
    lineHeight: 23,
  },
  h3: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginVertical: 2,
    lineHeight: 21,
  },
  blockquoteContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingLeft: 4,
  },
  blockquoteBar: {
    width: 3.5,
    backgroundColor: colors.sunYellow,
    borderRadius: 2,
    marginRight: 8,
  },
  blockquoteText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 1,
    paddingLeft: 4,
  },
  bulletSymbol: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginRight: 6,
    lineHeight: 22,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});
