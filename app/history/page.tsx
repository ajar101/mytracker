'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { getDay, getAllDays } from '@/lib/storage';
import { scoreIbadah, scoreGym, scoreCustom } from '@/lib/scoring';
import type { DayRecord, PrayerStatus } from '@/lib/types';

const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];
const DAY_LABELS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

const PRAYER_LABEL: Record<PrayerStatus, string> = {
  tidak: 'Tidak', dirumah: 'Di Rumah', berjamaah: 'Berjamaah', masjid: 'Masjid',
};
const PRAYER_COLOR: Record<PrayerStatus, string> = {
  tidak: 'var(--accent-rose)', dirumah: 'var(--accent-gold)',
  berjamaah: 'var(--accent-blue)', masjid: 'var(--primary)',
};

function padZero(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function dateStr(y: number, m: number, d: number) { return `${y}-${padZero(m + 1)}-${padZero(d)}`; }

export default function HistoryPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [allDates, setAllDates] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<DayRecord | null>(null);

  useEffect(() => {
    const days = getAllDays();
    setAllDates(new Set(days.map(d => d.date)));
  }, []);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = now.toISOString().split('T')[0];

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const openDay = (day: number) => {
    const ds = dateStr(year, month, day);
    if (allDates.has(ds)) {
      setSelected(getDay(ds));
    } else {
      setSelected(getDay(ds));
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '1rem',
          paddingTop: 'max(env(safe-area-inset-top), 1rem)',
        }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Riwayat</p>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>History</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="page-content">

        {/* Month Nav */}
        <div
          className="card animate-fade-up"
          style={{ marginBottom: '1rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <button
              onClick={prevMonth}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '0.625rem', border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <ChevronLeft size={16} />
            </button>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
              {MONTH_NAMES[month]} {year}
            </p>
            <button
              onClick={nextMonth}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '0.625rem', border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.25rem 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const ds = dateStr(year, month, day);
              const hasData = allDates.has(ds);
              const isToday = ds === todayStr;
              const isFuture = ds > todayStr;

              return (
                <button
                  key={ds}
                  onClick={() => !isFuture && openDay(day)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '0.375rem 0.25rem',
                    borderRadius: '0.625rem',
                    border: isToday ? '1.5px solid var(--primary)' : '1px solid transparent',
                    background: isToday ? 'var(--primary-glow)' : 'transparent',
                    cursor: isFuture ? 'default' : 'pointer',
                    opacity: isFuture ? 0.3 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: isToday ? 800 : 500,
                    color: isToday ? 'var(--primary)' : 'var(--text)',
                    marginBottom: '0.25rem',
                  }}>
                    {day}
                  </span>
                  {/* Dots indicator */}
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {hasData && (
                      <>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--primary)' }} />
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-gold)' }} />
                      </>
                    )}
                    {!hasData && <div style={{ width: 4, height: 4 }} />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border)' }}>
            {[
              { color: 'var(--primary)', label: 'Ibadah' },
              { color: 'var(--accent-blue)', label: 'Gym' },
              { color: 'var(--accent-gold)', label: 'Custom' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent days */}
        <div className="animate-fade-up-1">
          <p className="section-title" style={{ marginBottom: '0.75rem' }}>Hari Terakhir</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {getAllDays().slice(-7).reverse().map(d => {
              const ib = scoreIbadah(d);
              const gym = scoreGym(d);
              const custom = scoreCustom(d);
              const dayName = new Date(d.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
              return (
                <button
                  key={d.date}
                  onClick={() => setSelected(d)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.875rem', background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '0.875rem', cursor: 'pointer', transition: 'all 0.15s ease',
                    width: '100%', textAlign: 'left',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{dayName}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.date}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {[
                      { score: ib.score, color: 'var(--primary)' },
                      { score: gym.score, color: 'var(--accent-blue)' },
                      { score: custom.score, color: 'var(--accent-gold)' },
                    ].map((s, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          width: 36, height: 36, borderRadius: '50%',
                          border: `2px solid ${s.color}`,
                          justifyContent: 'center',
                          background: `${s.color}22`,
                        }}
                      >
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: s.color }}>{s.score}%</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Day Detail Drawer ── */}
      {selected && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              width: '100%', maxWidth: 480,
              background: 'var(--surface)',
              borderRadius: '1.25rem 1.25rem 0 0',
              borderTop: '1px solid var(--border)',
              padding: '1.25rem',
              paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)',
              maxHeight: '80dvh', overflowY: 'auto',
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Detail Hari</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
                  {new Date(selected.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Shalat Wajib */}
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Shalat Wajib
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {(['subuh','dzuhur','ashar','maghrib','isya'] as const).map(k => {
                const e = selected.ibadah.wajib[k];
                return (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem', background: 'var(--surface-2)', borderRadius: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{k}</span>
                    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                      {e.timing === 'awal' && <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>⭐ Awal</span>}
                      <span className={`badge ${e.status === 'masjid' ? 'badge-green' : e.status === 'berjamaah' ? 'badge-blue' : e.status === 'dirumah' ? 'badge-gold' : 'badge-rose'}`}>
                        {PRAYER_LABEL[e.status]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Steps */}
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Gym
            </p>
            <div style={{ padding: '0.75rem', background: 'var(--surface-2)', borderRadius: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>👣 Steps</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>
                  {selected.gym.steps.actual.toLocaleString('id-ID')} / {selected.gym.steps.target.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${Math.min((selected.gym.steps.actual / selected.gym.steps.target) * 100, 100)}%`, background: 'linear-gradient(90deg, var(--accent-blue), #93c5fd)' }} />
              </div>
              {selected.gym.custom.map(w => (
                <div key={w.id} style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>💪 {w.name}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                    {w.actual}/{w.target} {w.unit}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom General */}
            {selected.custom_general.length > 0 && (
              <>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Custom
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {selected.custom_general.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem', background: 'var(--surface-2)', borderRadius: '0.75rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{c.name}</span>
                      <span className={`badge ${c.done ? 'badge-green' : 'badge-rose'}`}>{c.done ? '✓ Done' : '✗'}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
