import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radio } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }: any) {
  const setToken = useAuthStore((state) => state.setToken);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Auth & Onboarding state check
    const checkState = async () => {
      try {
        await new Promise((res) => setTimeout(res, 1200)); // Smooth splash delay

        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          navigation.replace('Onboarding');
          return;
        }

        // Check if user has profile filled in
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, university, username')
          .eq('id', session.user.id)
          .single();

        if (!profile || !profile.name || !profile.university) {
          navigation.replace('ProfileOnboarding', { userId: session.user.id });
        } else {
          await setToken(session.access_token, session.user.id);
        }
      } catch (err) {
        console.warn('Splash check error:', err);
        navigation.replace('Onboarding');
      }
    };

    checkState();
  }, [navigation, setToken]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Glowing Logo Icon */}
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>U</Text>
        </View>

        {/* Brand Text */}
        <Text style={styles.brandTitle}>UniLink</Text>
        <Text style={styles.brandSubtitle}>The Social Network for Campus</Text>

        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={{ marginTop: 32 }}
        />
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Connect · Learn · Stream · Grow</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
    marginBottom: 20,
  },
  logoBadgeText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
  },
  sparkleDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#000000',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
  },
  brandSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
