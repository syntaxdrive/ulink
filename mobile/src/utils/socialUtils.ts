export interface SocialSourceInfo {
  platform: 'whatsapp' | 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'facebook' | 'linkedin' | 'telegram' | 'web';
  name: string;
  badgeLabel: string;
  badgeBgLight: string;
  badgeBgDark: string;
  badgeTextColor: string;
  iconName: string;
}

export function detectSocialSource(text?: string | null, explicitSource?: string | null): SocialSourceInfo | null {
  if (explicitSource) {
    const s = explicitSource.toLowerCase();
    if (s.includes('whatsapp') || s.includes('wa.me')) {
      return {
        platform: 'whatsapp',
        name: 'WhatsApp',
        badgeLabel: 'Posted from WhatsApp',
        badgeBgLight: '#DCFCE7',
        badgeBgDark: '#052E16',
        badgeTextColor: '#15803D',
        iconName: 'MessageCircle',
      };
    }
    if (s.includes('instagram')) {
      return {
        platform: 'instagram',
        name: 'Instagram',
        badgeLabel: 'Posted from Instagram',
        badgeBgLight: '#FCE7F3',
        badgeBgDark: '#500724',
        badgeTextColor: '#BE185D',
        iconName: 'Camera',
      };
    }
    if (s.includes('twitter') || s.includes('x.com')) {
      return {
        platform: 'twitter',
        name: 'X (Twitter)',
        badgeLabel: 'Posted from X',
        badgeBgLight: '#F3F4F6',
        badgeBgDark: '#1F2937',
        badgeTextColor: '#111827',
        iconName: 'AtSign',
      };
    }
    if (s.includes('youtube') || s.includes('youtu.be')) {
      return {
        platform: 'youtube',
        name: 'YouTube',
        badgeLabel: 'Posted from YouTube',
        badgeBgLight: '#FEE2E2',
        badgeBgDark: '#450A0A',
        badgeTextColor: '#B91C1C',
        iconName: 'Play',
      };
    }
    if (s.includes('tiktok')) {
      return {
        platform: 'tiktok',
        name: 'TikTok',
        badgeLabel: 'Posted from TikTok',
        badgeBgLight: '#F1F5F9',
        badgeBgDark: '#0F172A',
        badgeTextColor: '#0F172A',
        iconName: 'Film',
      };
    }
    if (s.includes('facebook') || s.includes('fb.watch') || s.includes('fb.me')) {
      return {
        platform: 'facebook',
        name: 'Facebook',
        badgeLabel: 'Posted from Facebook',
        badgeBgLight: '#EFF6FF',
        badgeBgDark: '#172554',
        badgeTextColor: '#1D4ED8',
        iconName: 'Globe',
      };
    }
    if (s.includes('telegram') || s.includes('t.me')) {
      return {
        platform: 'telegram',
        name: 'Telegram',
        badgeLabel: 'Posted from Telegram',
        badgeBgLight: '#E0F2FE',
        badgeBgDark: '#082F49',
        badgeTextColor: '#0369A1',
        iconName: 'Send',
      };
    }
  }

  if (!text) return null;

  const lower = text.toLowerCase();

  if (lower.includes('chat.whatsapp.com') || lower.includes('wa.me') || lower.includes('whatsapp.com')) {
    return {
      platform: 'whatsapp',
      name: 'WhatsApp',
      badgeLabel: 'Posted from WhatsApp',
      badgeBgLight: '#DCFCE7',
      badgeBgDark: '#052E16',
      badgeTextColor: '#15803D',
      iconName: 'MessageCircle',
    };
  }

  if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
    return {
      platform: 'instagram',
      name: 'Instagram',
      badgeLabel: 'Posted from Instagram',
      badgeBgLight: '#FCE7F3',
      badgeBgDark: '#500724',
      badgeTextColor: '#BE185D',
      iconName: 'Camera',
    };
  }

  if (lower.includes('twitter.com') || lower.includes('x.com')) {
    return {
      platform: 'twitter',
      name: 'X (Twitter)',
      badgeLabel: 'Posted from X',
      badgeBgLight: '#F3F4F6',
      badgeBgDark: '#1F2937',
      badgeTextColor: '#111827',
      iconName: 'AtSign',
    };
  }

  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    return {
      platform: 'youtube',
      name: 'YouTube',
      badgeLabel: 'Posted from YouTube',
      badgeBgLight: '#FEE2E2',
      badgeBgDark: '#450A0A',
      badgeTextColor: '#B91C1C',
      iconName: 'Play',
    };
  }

  if (lower.includes('tiktok.com')) {
    return {
      platform: 'tiktok',
      name: 'TikTok',
      badgeLabel: 'Posted from TikTok',
      badgeBgLight: '#F1F5F9',
      badgeBgDark: '#0F172A',
      badgeTextColor: '#0F172A',
      iconName: 'Film',
    };
  }

  if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.me')) {
    return {
      platform: 'facebook',
      name: 'Facebook',
      badgeLabel: 'Posted from Facebook',
      badgeBgLight: '#EFF6FF',
      badgeBgDark: '#172554',
      badgeTextColor: '#1D4ED8',
      iconName: 'Globe',
    };
  }

  if (lower.includes('t.me') || lower.includes('telegram.me')) {
    return {
      platform: 'telegram',
      name: 'Telegram',
      badgeLabel: 'Posted from Telegram',
      badgeBgLight: '#E0F2FE',
      badgeBgDark: '#082F49',
      badgeTextColor: '#0369A1',
      iconName: 'Send',
    };
  }

  return null;
}
