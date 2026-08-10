'use client';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('mytracker_theme');
    const dark = saved !== 'light';
    setIsDark(dark);
    if (!dark) document.documentElement.classList.add('light');
  }, []);

  const toggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('mytracker_theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('mytracker_theme', 'light');
    }
  };

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: '0.625rem',
        border: '1px solid var(--border)',
        background: 'var(--surface-2)',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
      }}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
