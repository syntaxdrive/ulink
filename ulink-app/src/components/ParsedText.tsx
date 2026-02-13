import React from 'react';
import { Text, Linking, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { colors } from '../theme/colors';

interface ParsedTextProps {
    children: string;
    style?: StyleProp<TextStyle>;
    linkColor?: string;
}

export const ParsedText = ({ children, style, linkColor = '#10B981' }: ParsedTextProps) => {
    if (!children) return null;

    return (
        <Text style={style}>
            {children.split(/(\s+)/).map((part, index) => {
                const isUrl = /^(https?:\/\/[^\s]+)/.test(part);
                if (isUrl) {
                    return (
                        <Text
                            key={index}
                            style={{ color: linkColor, textDecorationLine: 'underline' }}
                            onPress={() => Linking.openURL(part).catch(err => console.error("Couldn't load page", err))}
                        >
                            {part}
                        </Text>
                    );
                }
                return <Text key={index}>{part}</Text>;
            })}
        </Text>
    );
};
