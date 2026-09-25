import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

interface VerifiedBadgeProps {
  size?: number;
  color?: string;
  badgeColor?: string;
  isGold?: boolean;
}

export function VerifiedBadge({
  size = 15,
  isGold = true, // Default to royal gold seal
}: VerifiedBadgeProps) {
  const gradientId = isGold ? 'goldSealGrad' : 'blueSealGrad';
  const innerRingId = isGold ? 'innerGoldRing' : 'innerBlueRing';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
          {isGold ? (
            <>
              {/* Premium Metallic Gold Multi-Stop Radial/Linear Shimmer */}
              <LinearGradient id="goldSealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#F59E0B" />
                <Stop offset="25%" stopColor="#FDE047" />
                <Stop offset="50%" stopColor="#D97706" />
                <Stop offset="75%" stopColor="#FBBF24" />
                <Stop offset="100%" stopColor="#B45309" />
              </LinearGradient>
              <LinearGradient id="innerGoldRing" x1="0%" y1="100%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
                <Stop offset="100%" stopColor="#78350F" stopOpacity="0.4" />
              </LinearGradient>
            </>
          ) : (
            <>
              {/* Royal Sapphire Blue Seal */}
              <LinearGradient id="blueSealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#60A5FA" />
                <Stop offset="30%" stopColor="#3B82F6" />
                <Stop offset="70%" stopColor="#2563EB" />
                <Stop offset="100%" stopColor="#1D4ED8" />
              </LinearGradient>
              <LinearGradient id="innerBlueRing" x1="0%" y1="100%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.3" />
              </LinearGradient>
            </>
          )}
        </Defs>

        {/* ── 1. Scalloped Royal Starburst / Rosette Seal ── */}
        <Path
          d="M12 1.2
             C13.1 1.2 14.1 2.0 15.1 2.4
             C16.3 2.9 17.6 2.8 18.5 3.6
             C19.4 4.5 19.4 5.8 20.0 6.8
             C20.7 7.9 21.8 8.6 22.1 9.8
             C22.4 11.0 21.6 12.0 21.6 13.2
             C21.6 14.4 22.4 15.5 22.1 16.7
             C21.8 17.8 20.7 18.6 20.0 19.6
             C19.4 20.7 19.4 21.9 18.5 22.8
             C17.6 23.7 16.3 23.5 15.1 24.0
             C14.1 24.5 13.1 25.2 12 25.2
             C10.9 25.2 9.9 24.5 8.9 24.0
             C7.7 23.5 6.4 23.7 5.5 22.8
             C4.6 21.9 4.6 20.7 4.0 19.6
             C3.3 18.6 2.2 17.8 1.9 16.7
             C1.6 15.5 2.4 14.4 2.4 13.2
             C2.4 12.0 1.6 11.0 1.9 9.8
             C2.2 8.6 3.3 7.9 4.0 6.8
             C4.6 5.8 4.6 4.5 5.5 3.6
             C6.4 2.8 7.7 2.9 8.9 2.4
             C9.9 2.0 10.9 1.2 12 1.2 Z"
          fill={`url(#${gradientId})`}
          transform="scale(0.92) translate(1, 0)"
        />

        {/* ── 2. Inner Engraved Filigree Ring ── */}
        <Circle
          cx="12"
          cy="12"
          r="7.2"
          fill="none"
          stroke={`url(#${innerRingId})`}
          strokeWidth="1.1"
        />

        {/* ── 3. Crisp Diamond Crest Checkmark ── */}
        <Path
          d="M8.2 12.3 L10.8 14.9 L15.9 9.6"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
