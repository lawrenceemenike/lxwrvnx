import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audioEngine';

interface WaveformCanvasProps {
  width?: number;
  height?: number;
  barColor?: string;
  glowColor?: string;
  className?: string;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  width = 560,
  height = 90,
  barColor = '#FFA14A',
  glowColor = 'rgba(255, 107, 26, 0.65)',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);

      const isPlaying = audioEngine.isPlaying;
      const data = audioEngine.getWaveformData();
      const freqData = audioEngine.getFrequencyData();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bufferLength = data.length;
      const barWidth = 4;
      const gap = 3;
      const totalBars = Math.floor(canvas.width / (barWidth + gap));
      const step = Math.max(1, Math.floor(bufferLength / totalBars));

      const centerY = canvas.height / 2;

      // Draw subtle grid line behind
      ctx.strokeStyle = 'rgba(255, 107, 26, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();

      for (let i = 0; i < totalBars; i++) {
        const dataIndex = Math.min((i * step) % bufferLength, bufferLength - 1);
        const freqIndex = Math.min((i * 2) % freqData.length, freqData.length - 1);

        let amplitude = 0.08;
        if (isPlaying) {
          // Normalize wave form -128 to 128
          const waveVal = Math.abs((data[dataIndex] - 128) / 128);
          const freqVal = freqData[freqIndex] / 255;
          amplitude = Math.max(0.12, (waveVal * 0.7 + freqVal * 0.8) * 1.4);
        } else {
          // Subtle idle breathing pulse
          amplitude = 0.08 + Math.sin(Date.now() * 0.003 + i * 0.15) * 0.04;
        }

        const barHeight = Math.min(canvas.height * 0.95, amplitude * (canvas.height * 0.9));
        const x = i * (barWidth + gap);
        const y = centerY - barHeight / 2;

        // Draw bar with glow
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isPlaying ? 10 : 3;

        // Gradient for each bar
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#FFD199');
        gradient.addColorStop(0.3, barColor);
        gradient.addColorStop(0.7, '#FF6B1A');
        gradient.addColorStop(1, '#8C3100');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [barColor, glowColor]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`w-full max-w-full ${className}`}
    />
  );
};
