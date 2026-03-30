/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "rgb(var(--background) / <alpha-value>)",
                surface: "rgb(var(--surface) / <alpha-value>)",
                border: "rgb(var(--border) / <alpha-value>)",
                "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
                "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
                primary: "rgb(var(--primary) / <alpha-value>)",
                accent: "rgb(var(--accent) / <alpha-value>)",
                danger: "rgb(var(--danger) / <alpha-value>)",
                success: "rgb(var(--success) / <alpha-value>)",
                warning: "rgb(var(--warning) / <alpha-value>)"
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a8af620 0deg, #a853ba20 180deg, #2a8af620 360deg)',
            },
            backdropBlur: {
                xs: '2px',
                md: '12px',
                lg: '16px',
                xl: '24px',
            },
            boxShadow: {
                'glow': '0 0 20px -5px rgba(59, 130, 246, 0.4)',
                'glow-lg': '0 0 30px -5px rgba(59, 130, 246, 0.5)',
            }
        },
    },
    plugins: [
        require('tailwind-scrollbar-hide')
    ],
}
