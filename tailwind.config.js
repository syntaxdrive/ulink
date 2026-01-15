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
                    DEFAULT: '#FAFAFA',
                    card: '#FFFFFF',
                    hover: '#F1F5F9',
                },
                primary: {
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                },
                text: {
                    main: '#0f172a',
                    muted: '#64748b',
                }
            },
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, rgba(203, 213, 225, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(203, 213, 225, 0.4) 1px, transparent 1px)",
            }
        },
    },
    plugins: [],
}
