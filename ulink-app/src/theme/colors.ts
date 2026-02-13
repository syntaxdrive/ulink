const palette = {
    emerald: {
        500: '#10B981',
        400: '#34D399',
        600: '#059669',
    },
    slate: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        900: '#0F172A',
    },
    zinc: {
        900: '#18181B',
        950: '#09090B',
        500: '#71717A',
    },
};

export const colors = {
    light: {
        background: palette.slate[50], // '#F8FAFC'
        card: '#FFFFFF',
        text: palette.zinc[950], // '#09090B'
        muted: palette.zinc[500], // '#71717A'
        primary: palette.emerald[500], // '#10B981'
        border: palette.slate[100], // '#F1F5F9'
    },
    dark: {
        background: palette.zinc[950], // '#09090B'
        card: palette.zinc[900], // '#18181B'
        text: '#FFFFFF',
        muted: '#A1A1AA',
        primary: palette.emerald[500], // '#10B981'
        border: '#27272A',
    },
};
