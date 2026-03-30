import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    // Default to light mode as requested
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) return saved === 'dark';
            return false; // Force light default
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }

        // Broadcast theme change to child iframes (Clinical Companion)
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'THEME_CHANGE', isDark }, '*');
            }
        });
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-surface border border-border hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary shadow-sm"
            aria-label="Toggle Theme"
        >
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
        </button>
    );
};

export default ThemeToggle;
