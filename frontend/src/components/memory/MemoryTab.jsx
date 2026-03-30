import React, { useRef, useEffect } from 'react';

const MemoryTab = () => {
    const iframeRef = useRef(null);

    // Push current theme to the iframe once it has loaded
    const handleIframeLoad = () => {
        const isDark = document.documentElement.classList.contains('dark');
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                { type: 'THEME_CHANGE', isDark },
                '*'
            );
        }
    };

    // Also re-sync whenever the parent theme changes (MutationObserver)
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.classList.contains('dark');
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage(
                    { type: 'THEME_CHANGE', isDark },
                    '*'
                );
            }
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        return () => observer.disconnect();
    }, []);

    return (
        <div className="w-full h-[calc(100vh-180px)] min-h-[600px] rounded-2xl overflow-hidden border border-border shadow-sm relative bg-background">
            <iframe
                ref={iframeRef}
                src="/clinical_companion/"
                className="w-full h-full border-none"
                title="Clinical Companion"
                allow="microphone; camera"
                onLoad={handleIframeLoad}
            />
        </div>
    );
};

export default MemoryTab;

