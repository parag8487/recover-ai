/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: "rgb(var(--background) / <alpha-value>)",
                surface: "rgb(var(--surface) / <alpha-value>)",
                "surface-raised": "rgb(var(--surface-raised) / <alpha-value>)",
                border: "rgb(var(--border) / <alpha-value>)",
                "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
                "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
                "text-tertiary": "rgb(var(--text-tertiary) / <alpha-value>)",
                primary: "rgb(var(--primary) / <alpha-value>)",
                accent: "rgb(var(--accent) / <alpha-value>)",
                danger: "rgb(var(--danger) / <alpha-value>)",
                success: "rgb(var(--success) / <alpha-value>)",
                warning: "rgb(var(--warning) / <alpha-value>)"
            }
        }
    },
    plugins: [],
}
