'use client';
import { useEffect, useRef } from 'react';

interface ProgressRingProps {
  score: number;        // 0–100
  size?: number;        // px, default 80
  strokeWidth?: number; // default 6
  color?: string;       // CSS color/var
  label?: string;
  sublabel?: string;
  animate?: boolean;
}

export default function ProgressRing({
  score,
  size = 80,
  strokeWidth = 6,
  color = 'var(--primary)',
  label,
  sublabel,
  animate = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!animate || !circleRef.current) return;
    circleRef.current.style.strokeDashoffset = String(circumference);
    const raf = requestAnimationFrame(() => {
      if (circleRef.current) {
        circleRef.current.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)';
        circleRef.current.style.strokeDashoffset = String(offset);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [score, offset, circumference, animate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--surface-2)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animate ? circumference : offset}
            style={{
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        {/* Center text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: size < 72 ? '0.875rem' : '1.125rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
            {score}%
          </span>
        </div>
      </div>
      {(label || sublabel) && (
        <div style={{ textAlign: 'center' }}>
          {label && (
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)' }}>{label}</p>
          )}
          {sublabel && (
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
