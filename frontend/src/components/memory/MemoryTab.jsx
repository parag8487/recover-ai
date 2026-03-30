import React, { useRef, useEffect } from 'react';

const MemoryTab = () => {
    const iframeRef = useRef(null);

    // Push current theme and API key to the iframe once it has loaded
    const handleIframeLoad = () => {
        const isDark = document.documentElement.classList.contains('dark');
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                { type: 'SYNC_CONFIG', isDark, apiKey },
                '*'
            );
        }
    };

    // Also re-sync whenever something changes (MutationObserver)
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.classList.contains('dark');
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage(
                    { type: 'SYNC_CONFIG', isDark, apiKey },
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
                src="/clinical_companion/index.html"
                className="w-full h-full border-none"
                title="Clinical Companion"
                allow="microphone; camera"
                onLoad={handleIframeLoad}
            />
        </div>
    );
};

export default MemoryTab;

