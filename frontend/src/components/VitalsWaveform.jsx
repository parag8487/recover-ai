import React, { useEffect, useRef } from 'react';

const VitalsWaveform = ({ color = '#00f2ff' }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let x = 0;
        const draw = () => {
            if (!ctx) return;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.moveTo(x, canvas.height / 2 + Math.sin(x * 0.05) * 20 + (Math.random() - 0.5) * 10);
            x += 2;
            ctx.lineTo(x, canvas.height / 2 + Math.sin(x * 0.05) * 20 + (Math.random() - 0.5) * 10);
            ctx.stroke();
            if (x > canvas.width) {
                x = 0;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            animationFrameId = window.requestAnimationFrame(draw);
        };
        draw();
        return () => window.cancelAnimationFrame(animationFrameId);
    }, [color]);
    return <canvas ref={canvasRef} className="w-full h-16 opacity-30 pointer-events-none" width={800} height={100} />;
};

export default VitalsWaveform;
