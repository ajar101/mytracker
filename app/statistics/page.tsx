'use client';
import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import BottomNav from '@/components/shared/BottomNav';
import ThemeToggle from '@/components/shared/ThemeToggle';
import {
  getDailyChartData, getPrayerBreakdownWeek, getDetailedStreaks,
  type DailyChartPoint, type PrayerBreakdownDay, type DetailedStreak,
} from '@/lib/scoring';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '0.75rem',
      padding: '0.625rem 0.875rem',
      fontSize: '0.75rem',
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.375rem', fontWeight: 600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, marginBottom: '0.125rem' }}>
          {p.name}: <strong>{p.value}</strong>
          {p.name !== 'Shalat' ? '%' : ''}
        </p>
      ))}
    </div>
  );
}

function PrayerTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  const labels: Record<string, string> = { 0: '-', 1: 'S.Rumah', 2: 'S.Masjid', 3: 'J.Rumah', 4: 'J.Masjid' };
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '0.75rem',
      padding: '0.625rem 0.875rem',
      fontSize: '0.75rem',
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.375rem', fontWeight: 600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, marginBottom: '0.125rem' }}>
          {p.name}: <strong>{labels[p.value] ?? p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ─── Streak Ring ──────────────────────────────────────────────────────────────
function StreakCard({ s }: { s: DetailedStreak }) {
  const maxStreak = Math.max(s.best, 1);
  const progress = Math.min(s.current / maxStreak, 1);
  const size = 72;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '1rem',
        padding: '1rem 0.875rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        position: 'relative',
      }}
    >
      {s.current > 0 && (
        <div style={{
          position: 'absolute', top: '0.5rem', right: '0.625rem',
          fontSize: '0.6rem', fontWeight: 700, background: s.colorVar,
          color: s.colorVar === 'var(--accent-gold)' ? '#000' : '#fff',
          padding: '0.125rem 0.375rem', borderRadius: '999px',
        }}>
          🔥 AKTIF
        </div>
      )}
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={s.colorVar} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: '1.1rem', fill: 'currentColor' }}
        >
          {s.emoji}
        </text>
      </svg>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.current > 0 ? s.colorVar : 'var(--text-muted)', lineHeight: 1 }}>
          {s.current}
        </p>
        <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 500 }}>hari sekarang</p>
      </div>

      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text)', textAlign: 'center', lineHeight: 1.3 }}>
        {s.label}
      </p>
      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
        Terbaik: <strong style={{ color: 'var(--accent-gold)' }}>{s.best}</strong> hari
      </p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StatisticsPage() {
  const [period, setPeriod] = useState<7 | 30>(7);
  const [chartData, setChartData] = useState<DailyChartPoint[]>([]);
  const [prayerData, setPrayerData] = useState<PrayerBreakdownDay[]>([]);
  const [streaks, setStreaks] = useState<DetailedStreak[]>([]);

  useEffect(() => {
    setChartData(getDailyChartData(period));
    setPrayerData(getPrayerBreakdownWeek());
    setStreaks(getDetailedStreaks());
  }, [period]);

  const PRAYER_COLORS = {
    subuh: '#818cf8', dzuhur: '#34d399', ashar: '#60a5fa', maghrib: '#fb923c', isya: '#f472b6',
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem',
        paddingTop: 'max(env(safe-area-inset-top), 1rem)',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Analisis</p>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>Statistik</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="page-content" style={{ paddingBottom: '7rem' }}>

        {/* ── SECTION 1: Overall Score Chart ── */}
        <section className="animate-fade-up" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <span className="section-title">📈 Skor Harian</span>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {([7, 30] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`radio-pill ${period === p ? 'active-jamaah_masjid' : ''}`}
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.7rem' }}
                >
                  {p === 7 ? '7 Hari' : '30 Hari'}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '1rem 0.5rem 0.5rem' }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ibadahGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gymGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="customGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval={period === 30 ? 4 : 0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.7rem', paddingTop: '0.5rem' }} />
                <Area type="monotone" dataKey="ibadah" name="Ibadah" stroke="#22c55e" fill="url(#ibadahGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="gym" name="Gym" stroke="#60a5fa" fill="url(#gymGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="custom" name="Custom" stroke="#fbbf24" fill="url(#customGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── SECTION 2: Prayer Breakdown ── */}
        <section className="animate-fade-up-1" style={{ marginBottom: '1.25rem' }}>
          <div style={{ marginBottom: '0.875rem' }}>
            <span className="section-title">🕌 Kualitas Shalat (7 Hari)</span>
          </div>

          <div className="card" style={{ padding: '1rem 0.5rem 0.5rem' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.5rem' }}>
              Skor: 0=Tidak · 1=S.Rumah · 2=S.Masjid · 3=J.Rumah · 4=J.Masjid
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={prayerData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={8} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<PrayerTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.7rem', paddingTop: '0.5rem' }} />
                <Bar dataKey="subuh"   name="Subuh"   fill={PRAYER_COLORS.subuh}   radius={[3,3,0,0]} />
                <Bar dataKey="dzuhur"  name="Dzuhur"  fill={PRAYER_COLORS.dzuhur}  radius={[3,3,0,0]} />
                <Bar dataKey="ashar"   name="Ashar"   fill={PRAYER_COLORS.ashar}   radius={[3,3,0,0]} />
                <Bar dataKey="maghrib" name="Maghrib" fill={PRAYER_COLORS.maghrib} radius={[3,3,0,0]} />
                <Bar dataKey="isya"    name="Isya"    fill={PRAYER_COLORS.isya}    radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── SECTION 3: Detailed Streaks ── */}
        <section className="animate-fade-up-2">
          <div style={{ marginBottom: '0.875rem' }}>
            <span className="section-title">🔥 Streak Detail</span>
          </div>

          {streaks.every(s => s.current === 0) && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>Mulai streak pertamamu!</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Lengkapi ibadah hari ini untuk membangun kebiasaan.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem', marginBottom: '1rem' }}>
            {streaks.slice(0, 3).map(s => <StreakCard key={s.label} s={s} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
            {streaks.slice(3).map(s => <StreakCard key={s.label} s={s} />)}
          </div>

          {/* Best Streak Summary */}
          {streaks.some(s => s.best > 0) && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>🏆 Rekor Terbaik</p>
              {streaks.filter(s => s.best > 0).sort((a, b) => b.best - a.best).map(s => (
                <div key={s.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem' }}>{s.emoji}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    {s.best} <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-muted)' }}>hari</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
