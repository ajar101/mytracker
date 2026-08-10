'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, TrendingUp, CheckCircle2, ChevronRight, Dumbbell, BookOpen, Star } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';
import ThemeToggle from '@/components/shared/ThemeToggle';
import ProgressRing from '@/components/shared/ProgressRing';
import { getDay, todayStr, formatDate } from '@/lib/storage';
import { scoreDa, calculateStreaks, getWeeklySummary } from '@/lib/scoring';
import type { DayScore, StreakInfo } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const today = todayStr();
  const [score, setScore] = useState<DayScore | null>(null);
  const [streaks, setStreaks] = useState<StreakInfo[]>([]);
  const [weekly, setWeekly] = useState({ stepsAchieved: 0, totalDays: 7, ibadahJamaah: 0, totalPrayers: 0 });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const record = getDay(today);
    setScore(scoreDa(record));
    setStreaks(calculateStreaks());
    setWeekly(getWeeklySummary());

    const h = new Date().getHours();
    if (h < 6)  setGreeting('Selamat Malam 🌙');
    else if (h < 12) setGreeting('Selamat Pagi ☀️');
    else if (h < 15) setGreeting('Selamat Siang 🌤️');
    else if (h < 19) setGreeting('Selamat Sore 🌅');
    else             setGreeting('Selamat Malam 🌙');
  }, [today]);

  const rings = score
    ? [
        { label: 'Ibadah', score: score.ibadah.score, color: 'var(--primary)',     sublabel: `${score.ibadah.achieved}/${score.ibadah.total} pts` },
        { label: 'Gym',    score: score.gym.score,    color: 'var(--accent-blue)', sublabel: `${score.gym.score}% tercapai` },
        { label: 'Custom', score: score.custom.score, color: 'var(--accent-gold)', sublabel: `${score.custom.achieved}/${score.custom.total} item` },
      ]
    : [];

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="safe-top"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '1rem',
          paddingTop: 'max(env(safe-area-inset-top), 1rem)',
        }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{greeting}</p>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>MyTracker</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="page-content">
        {/* Date */}
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', marginTop: '0.25rem' }}>
          {formatDate(today)}
        </p>

        {/* Progress Rings */}
        <div className="card animate-fade-up" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Star size={15} color="var(--accent-gold)" />
            <span className="section-title">Progres Hari Ini</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            {rings.map(r => (
              <ProgressRing
                key={r.label}
                score={r.score}
                size={90}
                strokeWidth={7}
                color={r.color}
                label={r.label}
                sublabel={r.sublabel}
              />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card animate-fade-up-1" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <TrendingUp size={15} color="var(--accent-blue)" />
            <span className="section-title">Minggu Ini</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="card-sm">
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Shalat Berjamaah</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                {weekly.ibadahJamaah}
                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>/{weekly.totalPrayers}</span>
              </p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>waktu shalat</p>
            </div>
            <div className="card-sm">
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Steps Tercapai</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                {weekly.stepsAchieved}
                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>/{weekly.totalDays}</span>
              </p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>hari</p>
            </div>
          </div>
        </div>

        {/* Streaks */}
        {streaks.length > 0 && (
          <div className="card animate-fade-up-2" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Flame size={15} color="var(--accent-rose)" />
              <span className="section-title">Streak Aktif</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {streaks.map(s => (
                <div
                  key={s.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'var(--surface-2)',
                    borderRadius: '0.875rem',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🔥</span>
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>{s.label}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>beruntun</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    {s.days}
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}> hari</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Streak State */}
        {streaks.length === 0 && (
          <div
            className="card animate-fade-up-2"
            style={{ marginBottom: '1rem', textAlign: 'center', padding: '2rem 1.25rem' }}
          >
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>Mulai streak pertamamu!</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Isi ibadah & aktivitas hari ini untuk mulai membangun kebiasaan
            </p>
          </div>
        )}

        {/* Quick Access */}
        <div className="card animate-fade-up-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CheckCircle2 size={15} color="var(--primary)" />
            <span className="section-title">Aksi Cepat</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { icon: '🕌', label: 'Isi Ibadah Hari Ini', sub: 'Shalat & amalan', onClick: () => router.push('/today') },
              { icon: '💪', label: 'Catat Workout', sub: 'Steps & latihan', onClick: () => router.push('/today') },
              { icon: '📅', label: 'Lihat Histori', sub: 'Kalender bulan ini', onClick: () => router.push('/history') },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: 'var(--surface-2)',
                  borderRadius: '0.875rem',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{item.label}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.sub}</p>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
