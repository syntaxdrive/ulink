/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                display: ['"Space Grotesk"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                bg: {
                    DEFAULT: '#F8FAFC', // Slate 50
                    card: '#FFFFFF',
                    hover: '#F1F5F9',
                    dark: '#09090B',    // Zinc 950
                    cardDark: '#18181B' // Zinc 900
                },
                primary: {
                    DEFAULT: '#10B981', // Emerald 500
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                    700: '#047857',
                    light: '#D1FAE5',
                },
                text: {
                    main: '#09090B', // Zinc 950
                    muted: '#64748b',
                    light: '#F8FAFC',
                }
            },
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, rgba(203, 213, 225, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(203, 213, 225, 0.4) 1px, transparent 1px)",
            }
        },
    },
    plugins: [],
}
