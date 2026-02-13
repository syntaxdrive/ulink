import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    intensity = 30,
    tint = 'light'
}) => {
    return (
        <BlurView intensity={intensity} style={[styles.container, style]} tint={tint}>
            {children}
        </BlurView>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        backgroundColor: '#FFFFFF', // Solid white
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2, // Android shadow
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)', // Very subtle border
    },
});
