import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mic2,
  Users,
  BookOpen,
  ChevronRight,
} from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const onboardingImg1 = require('../../../assets/onboarding/onboarding1.png');
const onboardingImg2 = require('../../../assets/onboarding/onboarding2.png');
const onboardingImg3 = require('../../../assets/onboarding/onboarding3.png');

interface OnboardingSlide {
  id: string;
  tag: string;
  tagIcon: any;
  title: string;
  subtitle: string;
  bgColor: string;
  accentColor: string;
  image: any;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    tag: 'Audio & Casts',
    tagIcon: Mic2,
    title: 'Speak & Connect\nWith Confidence',
    subtitle: 'Stream student podcasts, discover campus audio, and voice your ideas with fellow students.',
    bgColor: '#FDE047', // Sun Yellow
    accentColor: '#EAB308',
    image: onboardingImg1,
  },
  {
    id: '2',
    tag: 'Community',
    tagIcon: Users,
    title: 'Find Your Tribe\nOn Campus',
    subtitle: 'Join department groups, study lounges, and campus circles with verified peers.',
    bgColor: '#DDD6FE', // Lilac Purple
    accentColor: '#A78BFA',
    image: onboardingImg2,
  },
  {
    id: '3',
    tag: 'Study & Grow',
    tagIcon: BookOpen,
    title: 'Collaborate &\nLevel Up Daily',
    subtitle: 'Share study materials, ask questions, compete on leaderboards, and excel together.',
    bgColor: '#FECDD3', // Warm Coral
    accentColor: '#FB7185',
    image: onboardingImg3,
  },
];

export default function OnboardingIntroScreen({ navigation }: any) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (slideIndex !== activeIndex) {
      setActiveIndex(slideIndex);
    }
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (activeIndex + 1) * screenWidth,
        animated: true,
      });
      setActiveIndex(activeIndex + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  const currentSlide = SLIDES[activeIndex];

  return (
    <View style={[styles.container, { backgroundColor: currentSlide.bgColor }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>UniLink</Text>
            <View style={styles.sunDot} />
          </View>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Carousel Slider */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          contentContainerStyle={styles.slidesContainer}
        >
          {SLIDES.map((slide) => {
            const TagIcon = slide.tagIcon;
            return (
              <View key={slide.id} style={styles.slide}>
                {/* Header Tag Pill */}
                <View style={styles.tagPill}>
                  <Text style={styles.tagText}>{slide.tag}</Text>
                  <View style={styles.tagIconCircle}>
                    <TagIcon size={12} color="#ffffff" />
                  </View>
                </View>

                {/* Big Bold Headline */}
                <Text style={styles.slideTitle}>{slide.title}</Text>

                {/* Subtitle Description */}
                <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>

                {/* Transparent Real Human Cutout Portrait (Chest-up) */}
                <View style={styles.illustrationArea}>
                  <Image
                    source={slide.image}
                    style={styles.illustrationImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom Navigation & Action Bar */}
        <View style={styles.bottomBar}>
          {/* Pagination Indicator Dots */}
          <View style={styles.paginationRow}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeIndex === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>

          {/* Primary Action Button (Next / Get Started) */}
          <TouchableOpacity
            style={styles.primaryNextBtn}
            onPress={handleNext}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryNextText}>
              {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <View style={styles.chevronGroup}>
              <ChevronRight size={18} color="#ffffff" />
              <ChevronRight size={18} color="#ffffff" style={{ marginLeft: -10 }} />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  sunDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
    marginLeft: 3,
  },
  skipBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  slidesContainer: {
    alignItems: 'center',
  },
  slide: {
    width: screenWidth,
    paddingHorizontal: 24,
    paddingTop: 10,
    alignItems: 'flex-start',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  tagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 6,
  },
  tagIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#000000',
    lineHeight: 36,
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.75)',
    lineHeight: 19,
    marginBottom: 12,
    fontWeight: '500',
  },
  illustrationArea: {
    width: '100%',
    height: screenHeight * 0.44,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 6,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 10,
    gap: 16,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#000000',
  },
  inactiveDot: {
    width: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  primaryNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingVertical: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryNextText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 4,
  },
  chevronGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
