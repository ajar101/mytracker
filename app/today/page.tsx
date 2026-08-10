'use client';
import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { getDay, saveDay, todayStr, formatDate } from '@/lib/storage';
import type { DayRecord, PrayerStatus, PrayerTiming, CustomIbadahItem, WorkoutItem, CustomGeneralItem } from '@/lib/types';

// ─── Prayer Name Map ──────────────────────────────────────────────────────────
const PRAYER_NAMES: Record<string, string> = {
  subuh: 'Subuh', dzuhur: 'Dzuhur', ashar: 'Ashar', maghrib: 'Maghrib', isya: 'Isya',
};
const PRAYER_KEYS = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] as const;
const PRAYER_STATUSES: { value: PrayerStatus; label: string }[] = [
  { value: 'tidak',          label: 'Tidak' },
  { value: 'sendiri_rumah',  label: 'Sendiri Di Rumah' },
  { value: 'sendiri_masjid', label: 'Sendiri Di Masjid' },
  { value: 'jamaah_rumah',   label: 'Berjamaah Di Rumah' },
  { value: 'jamaah_masjid',  label: 'Berjamaah di Masjid' },
];

// ─── Toggle Component ──────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div className={`toggle-track ${on ? 'on' : ''}`} onClick={onToggle}>
      <div className="toggle-thumb" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TodayPage() {
  const today = todayStr();
  const [record, setRecord] = useState<DayRecord | null>(null);
  const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);

  useEffect(() => {
    setRecord(getDay(today));
  }, [today]);

  const save = useCallback((updated: DayRecord) => {
    setRecord(updated);
    saveDay(updated);
  }, []);

  if (!record) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Memuat...</div>
    </div>
  );

  // ─── Prayer Handlers ──────────────────────────────────────────────────────
  const setPrayerStatus = (key: typeof PRAYER_KEYS[number], status: PrayerStatus) => {
    const updated: DayRecord = {
      ...record,
      ibadah: {
        ...record.ibadah,
        wajib: {
          ...record.ibadah.wajib,
          [key]: { ...record.ibadah.wajib[key], status },
        },
      },
    };
    save(updated);
  };

  const setPrayerTiming = (key: typeof PRAYER_KEYS[number], timing: PrayerTiming) => {
    const updated: DayRecord = {
      ...record,
      ibadah: {
        ...record.ibadah,
        wajib: {
          ...record.ibadah.wajib,
          [key]: { ...record.ibadah.wajib[key], timing },
        },
      },
    };
    save(updated);
  };

  const setSunnah = (key: 'tahajud' | 'dhuha', val: boolean) => {
    save({ ...record, ibadah: { ...record.ibadah, sunnah: { ...record.ibadah.sunnah, [key]: val } } });
  };

  const setCustomIbadah = (id: string, done: boolean, value?: number) => {
    save({
      ...record,
      ibadah: {
        ...record.ibadah,
        custom: record.ibadah.custom.map(c => c.id === id ? { ...c, done, value } : c),
      },
    });
  };

  // ─── Gym Handlers ─────────────────────────────────────────────────────────
  const setSteps = (actual: number) => {
    save({ ...record, gym: { ...record.gym, steps: { ...record.gym.steps, actual } } });
  };

  const setWorkout = (id: string, actual: number, note?: string) => {
    save({
      ...record,
      gym: {
        ...record.gym,
        custom: record.gym.custom.map(w => w.id === id ? { ...w, actual, note: note ?? w.note } : w),
      },
    });
  };

  // ─── Custom Handlers ──────────────────────────────────────────────────────
  const setCustomGeneral = (id: string, done: boolean, value?: number) => {
    save({
      ...record,
      custom_general: record.custom_general.map(c => c.id === id ? { ...c, done, value } : c),
    });
  };


  const stepsPercent = record.gym.steps.target > 0
    ? Math.min((record.gym.steps.actual / record.gym.steps.target) * 100, 100)
    : 0;

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
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Input Harian</p>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{formatDate(today)}</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="page-content">

        {/* ── IBADAH SECTION ── */}
        <section className="animate-fade-up" style={{ marginBottom: '1rem' }}>
          <div className="section-header">
            <span className="section-title">🕌 Ibadah</span>
          </div>

          {/* Shalat Wajib */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.875rem' }}>Shalat Wajib</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {PRAYER_KEYS.map(key => {
                const entry = record.ibadah.wajib[key];
                const isExpanded = expandedPrayer === key;
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <button
                        onClick={() => setExpandedPrayer(isExpanded ? null : key)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.375rem',
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        }}
                      >
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                          {PRAYER_NAMES[key]}
                        </span>
                        {isExpanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                      </button>
                      <div
                        className={`radio-pill active-${entry.status}`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {PRAYER_STATUSES.find(s => s.value === entry.status)?.label}
                        {entry.timing === 'awal' && ' ⭐'}
                      </div>
                    </div>

                    {/* Status pills */}
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      {PRAYER_STATUSES.map(s => (
                        <button
                          key={s.value}
                          className={`radio-pill ${entry.status === s.value ? `active-${s.value}` : ''}`}
                          onClick={() => setPrayerStatus(key, s.value)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    {/* Awal waktu toggle (expanded) */}
                    {isExpanded && entry.status !== 'tidak' && (
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          marginTop: '0.625rem', padding: '0.625rem',
                          background: 'var(--surface-2)', borderRadius: '0.625rem',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>⭐ Awal Waktu</span>
                        <Toggle
                          on={entry.timing === 'awal'}
                          onToggle={() => setPrayerTiming(key, entry.timing === 'awal' ? 'tidak_awal' : 'awal')}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shalat Sunnah */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.875rem' }}>Shalat Sunnah</p>
            {(['tahajud', 'dhuha'] as const).map(key => (
              <div
                key={key}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.625rem 0',
                  borderBottom: key === 'tahajud' ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem' }}>{key === 'tahajud' ? '🌙' : '🌅'}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', textTransform: 'capitalize' }}>{key}</span>
                </div>
                <Toggle on={record.ibadah.sunnah[key]} onToggle={() => setSunnah(key, !record.ibadah.sunnah[key])} />
              </div>
            ))}
          </div>

          {/* Custom Ibadah */}
          {record.ibadah.custom.length > 0 && (
            <div className="card">
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.875rem' }}>Ibadah Lainnya</p>
              {record.ibadah.custom.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0',
                    borderBottom: i < record.ibadah.custom.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Toggle on={item.done} onToggle={() => setCustomIbadah(item.id, !item.done)} />
                    <span style={{ fontSize: '0.875rem', color: item.done ? 'var(--text-muted)' : 'var(--text)', textDecoration: item.done ? 'line-through' : 'none' }}>
                      {item.name}
                    </span>
                  </div>
                  {item.type === 'number' && (
                    <input
                      type="number"
                      className="input-field"
                      style={{ width: '5rem', textAlign: 'center' }}
                      placeholder="0"
                      value={item.value ?? ''}
                      onChange={e => setCustomIbadah(item.id, item.done, Number(e.target.value))}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── GYM SECTION ── */}
        <section className="animate-fade-up-1" style={{ marginBottom: '1rem' }}>
          <div className="section-header">
            <span className="section-title">💪 Gym & Workout</span>
          </div>

          {/* Steps */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>👣</span>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>Steps</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: {record.gym.steps.target.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: stepsPercent >= 100 ? 'var(--primary)' : 'var(--text)' }}>
                  {record.gym.steps.actual.toLocaleString('id-ID')}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{Math.round(stepsPercent)}%</p>
              </div>
            </div>
            <div className="progress-bar-track" style={{ marginBottom: '0.875rem' }}>
              <div className="progress-bar-fill" style={{ width: `${stepsPercent}%`, background: stepsPercent >= 100 ? 'linear-gradient(90deg, var(--primary), #86efac)' : undefined }} />
            </div>
            <input
              type="number"
              className="input-field"
              placeholder="Masukkan jumlah langkah hari ini..."
              value={record.gym.steps.actual || ''}
              onChange={e => setSteps(Number(e.target.value))}
            />
          </div>

          {/* Custom Workouts */}
          {record.gym.custom.length > 0 && (
            <div className="card">
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.875rem' }}>Latihan</p>
              {record.gym.custom.map((w, i) => {
                const pct = w.target > 0 ? Math.min((w.actual / w.target) * 100, 100) : 0;
                return (
                  <div
                    key={w.id}
                    style={{
                      padding: '0.75rem 0',
                      borderBottom: i < record.gym.custom.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{w.name}</p>
                      <p style={{ fontSize: '0.8rem', color: pct >= 100 ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {w.actual}/{w.target} {w.unit}
                      </p>
                    </div>
                    <div className="progress-bar-track" style={{ marginBottom: '0.5rem' }}>
                      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent-blue), #93c5fd)' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number"
                        className="input-field"
                        placeholder={`Realisasi (${w.unit})`}
                        value={w.actual || ''}
                        onChange={e => setWorkout(w.id, Number(e.target.value), w.note)}
                        style={{ flex: 1 }}
                      />
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Catatan..."
                        value={w.note || ''}
                        onChange={e => setWorkout(w.id, w.actual, e.target.value)}
                        style={{ flex: 2 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── CUSTOM SECTION ── */}
        <section className="animate-fade-up-2">
          <div className="section-header">
            <span className="section-title">✨ Custom</span>
          </div>

          {record.custom_general.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📝</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Belum ada item custom. Tambahkan di halaman Settings.</p>
            </div>
          ) : (
            <div className="card">
              {record.custom_general.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0',
                    borderBottom: i < record.custom_general.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Toggle on={item.done} onToggle={() => setCustomGeneral(item.id, !item.done)} />
                    <div>
                      <p style={{ fontSize: '0.875rem', color: item.done ? 'var(--text-muted)' : 'var(--text)', textDecoration: item.done ? 'line-through' : 'none', fontWeight: 500 }}>
                        {item.name}
                      </p>
                      {item.target && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: {item.target} {item.unit}</p>}
                    </div>
                  </div>
                  {item.type === 'number' && (
                    <input
                      type="number"
                      className="input-field"
                      style={{ width: '5rem', textAlign: 'center' }}
                      placeholder="0"
                      value={item.value ?? ''}
                      onChange={e => setCustomGeneral(item.id, item.done, Number(e.target.value))}
                    />
                  )}
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
