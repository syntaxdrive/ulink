import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: 1,
        title: 'Connect with Peers',
        description: 'Join a vibrant community of students. Share ideas, collaborate on projects, and build your network.',
        image: 'https://img.freepik.com/free-vector/group-people-working-together_52683-28615.jpg',
    },
    {
        id: 2,
        title: 'Share Resources',
        description: 'Access and share study materials, past questions, and helpful guides to ace your exams.',
        image: 'https://img.freepik.com/free-vector/online-learning-concept_52683-37603.jpg',
    },
    {
        id: 3,
        title: 'Grow Together',
        description: 'Find mentors, join study groups, and level up your academic journey with UniLink.',
        image: 'https://img.freepik.com/free-vector/business-team-success-concept_52683-35639.jpg',
    },
];

export const OnboardingScreen = () => {
    const navigation = useNavigation<any>();
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            navigation.navigate('Login');
        }
    };

    const handleSkip = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            {/* Background Elements (optional gradients or shapes could go here) */}

            <View style={styles.contentContainer}>
                <Animated.View
                    key={currentIndex}
                    entering={FadeInRight.duration(500)}
                    exiting={FadeOutLeft.duration(500)}
                    style={styles.slide}
                >
                    <GlassCard style={styles.card} intensity={40}>
                        <Image
                            source={{ uri: SLIDES[currentIndex].image }}
                            style={styles.illustration}
                            resizeMode="contain"
                        />

                        <Text style={styles.title}>{SLIDES[currentIndex].title}</Text>
                        <Text style={styles.description}>{SLIDES[currentIndex].description}</Text>
                    </GlassCard>
                </Animated.View>

                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentIndex && styles.activeDot
                            ]}
                        />
                    ))}
                </View>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                        <Text style={styles.nextText}>
                            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                        <ArrowRight color="#FFF" size={20} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    slide: {
        alignItems: 'center',
        marginBottom: 40,
    },
    card: {
        width: '100%',
        alignItems: 'center',
        padding: 32,
        borderRadius: 30,
        overflow: 'hidden', // Ensure image respects border radius if needed
    },
    illustration: {
        width: '100%',
        height: 250,
        marginBottom: 24,
        borderRadius: 16,
    },
    title: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 28,
        color: colors.light.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 16,
        color: colors.light.muted,
        textAlign: 'center',
        lineHeight: 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.light.border,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: colors.light.primary,
        width: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    skipButton: {
        padding: 12,
    },
    skipText: {
        fontFamily: 'Outfit_500Medium',
        color: colors.light.muted,
        fontSize: 16,
    },
    nextButton: {
        backgroundColor: colors.light.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 30,
        shadowColor: colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    nextText: {
        fontFamily: 'Outfit_700Bold',
        color: '#FFF',
        fontSize: 16,
    },
});
