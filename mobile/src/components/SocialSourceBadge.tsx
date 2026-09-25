import React from 'react';
import { StyleSheet, Text, View, Linking, TouchableOpacity } from 'react-native';
import {
  MessageCircle,
  Camera,
  AtSign,
  Play,
  Film,
  Globe,
  Send,
} from 'lucide-react-native';
import { detectSocialSource, SocialSourceInfo } from '../utils/socialUtils';
import { useTheme } from '../theme/colors';

interface Props {
  text?: string | null;
  explicitSource?: string | null;
  linkUrl?: string | null;
}

export function SocialSourceBadge({ text, explicitSource, linkUrl }: Props) {
  const { isDark } = useTheme();
  const sourceInfo = detectSocialSource(text, explicitSource);

  if (!sourceInfo) return null;

  const getIcon = () => {
    const iconProps = { size: 12, color: sourceInfo.badgeTextColor };
    switch (sourceInfo.platform) {
      case 'whatsapp':
        return <MessageCircle {...iconProps} />;
      case 'instagram':
        return <Camera {...iconProps} />;
      case 'twitter':
        return <AtSign {...iconProps} />;
      case 'youtube':
        return <Play {...iconProps} />;
      case 'tiktok':
        return <Film {...iconProps} />;
      case 'facebook':
        return <Globe {...iconProps} />;
      case 'telegram':
        return <Send {...iconProps} />;
      default:
        return <Globe {...iconProps} />;
    }
  };

  const handlePress = () => {
    if (linkUrl) {
      Linking.openURL(linkUrl).catch(() => {});
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={linkUrl ? 0.75 : 1}
      onPress={linkUrl ? handlePress : undefined}
      style={[
        styles.badgeContainer,
        {
          backgroundColor: isDark ? sourceInfo.badgeBgDark : sourceInfo.badgeBgLight,
        },
      ]}
    >
      {getIcon()}
      <Text style={[styles.badgeText, { color: sourceInfo.badgeTextColor }]}>
        {sourceInfo.badgeLabel}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
