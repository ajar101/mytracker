import { DayRecord, CategoryScore, DayScore, StreakInfo, PrayerStatus } from './types';
import { getAllDays } from './storage';

// ─── Ibadah Score ─────────────────────────────────────────────────────────────

const PRAYER_WEIGHTS: Record<PrayerStatus, number> = {
  tidak: 0,
  sendiri_rumah: 1,
  sendiri_masjid: 2,
  jamaah_rumah: 3,
  jamaah_masjid: 4,
};

export function scoreIbadah(record: DayRecord): CategoryScore {
  const wajib = record.ibadah.wajib;
  const prayers = [wajib.subuh, wajib.dzuhur, wajib.ashar, wajib.maghrib, wajib.isya];

  // Wajib: each prayer max 4 (jamaah_masjid) + 1 bonus awal waktu = 5 per prayer → 25 total
  let achieved = 0;
  const maxPerPrayer = 5;
  const total = prayers.length * maxPerPrayer;

  prayers.forEach(p => {
    achieved += PRAYER_WEIGHTS[p.status];
    if (p.timing === 'awal') achieved += 1;
  });

  // Sunnah: tahajud +3, dhuha +3
  const sunnahMax = 6;
  let sunnahAchieved = 0;
  if (record.ibadah.sunnah.tahajud) sunnahAchieved += 3;
  if (record.ibadah.sunnah.dhuha) sunnahAchieved += 3;

  // Custom ibadah: each done = 2 pts
  const customItems = record.ibadah.custom.filter(c => c.active !== false);
  const customMax = customItems.length * 2;
  let customAchieved = 0;
  customItems.forEach(c => {
    if (c.type === 'number') {
      if (c.value && c.value > 0) customAchieved += 2;
    } else {
      if (c.done) customAchieved += 2;
    }
  });

  const grandTotal = total + sunnahMax + customMax;
  const grandAchieved = achieved + sunnahAchieved + customAchieved;

  return {
    label: 'Ibadah',
    score: grandTotal > 0 ? Math.round((grandAchieved / grandTotal) * 100) : 0,
    achieved: grandAchieved,
    total: grandTotal,
  };
}

// ─── Gym Score ────────────────────────────────────────────────────────────────

export function scoreGym(record: DayRecord): CategoryScore {
  const steps = record.gym.steps;
  const stepsScore = steps.target > 0 ? Math.min(steps.actual / steps.target, 1) : 0;

  const workouts = record.gym.custom.filter(w => w.active !== false);
  const workoutScore =
    workouts.length > 0
      ? workouts.reduce((sum, w) => {
          return sum + (w.target > 0 ? Math.min(w.actual / w.target, 1) : w.actual > 0 ? 1 : 0);
        }, 0) / workouts.length
      : 1;

  const combined = workouts.length > 0 ? (stepsScore + workoutScore) / 2 : stepsScore;
  const score = Math.round(combined * 100);

  return {
    label: 'Gym',
    score,
    achieved: Math.round(combined * 10),
    total: 10,
  };
}

// ─── Custom Score ─────────────────────────────────────────────────────────────

export function scoreCustom(record: DayRecord): CategoryScore {
  const items = record.custom_general.filter(i => i.active !== false);
  if (items.length === 0) return { label: 'Custom', score: 100, achieved: 0, total: 0 };

  let achieved = 0;
  items.forEach(item => {
    if (item.type === 'checklist') {
      if (item.done) achieved += 1;
    } else if (item.type === 'number' && item.target) {
      achieved += Math.min((item.value ?? 0) / item.target, 1);
    } else {
      if (item.done) achieved += 1;
    }
  });

  const score = Math.round((achieved / items.length) * 100);
  return {
    label: 'Custom',
    score,
    achieved: Math.round(achieved),
    total: items.length,
  };
}

// ─── Day Score ────────────────────────────────────────────────────────────────

export function scoreDa(record: DayRecord): DayScore {
  return {
    ibadah: scoreIbadah(record),
    gym: scoreGym(record),
    custom: scoreCustom(record),
  };
}

// ─── Streak Calculation ───────────────────────────────────────────────────────

function isIbadahComplete(record: DayRecord): boolean {
  const wajib = record.ibadah.wajib;
  return [wajib.subuh, wajib.dzuhur, wajib.ashar, wajib.maghrib, wajib.isya].every(
    p => p.status === 'jamaah_rumah' || p.status === 'jamaah_masjid'
  );
}

function isStepsComplete(record: DayRecord): boolean {
  return record.gym.steps.actual >= record.gym.steps.target && record.gym.steps.target > 0;
}

export function calculateStreaks(): StreakInfo[] {
  const allDays = getAllDays().reverse(); // newest first
  const today = new Date().toISOString().split('T')[0];

  function countStreak(checkFn: (r: DayRecord) => boolean): number {
    let streak = 0;
    for (const day of allDays) {
      if (day.date > today) continue;
      if (checkFn(day)) streak++;
      else break;
    }
    return streak;
  }

  const streaks: StreakInfo[] = [];

  const ibadahStreak = countStreak(isIbadahComplete);
  if (ibadahStreak > 0) {
    streaks.push({ label: 'Shalat Berjamaah', days: ibadahStreak, category: 'ibadah' });
  }

  const stepsStreak = countStreak(isStepsComplete);
  if (stepsStreak > 0) {
    streaks.push({ label: 'Steps Tercapai', days: stepsStreak, category: 'gym' });
  }

  return streaks;
}

// ─── Weekly Summary ───────────────────────────────────────────────────────────

export function getWeeklySummary() {
  const allDays = getAllDays();
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);

  const weekStr = weekAgo.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const weekDays = allDays.filter(d => d.date >= weekStr && d.date <= todayStr);

  const stepsAchieved = weekDays.filter(d => isStepsComplete(d)).length;
  const ibadahJamaah = weekDays.reduce((sum, d) => {
    const wajib = d.ibadah.wajib;
    return (
      sum +
      [wajib.subuh, wajib.dzuhur, wajib.ashar, wajib.maghrib, wajib.isya].filter(
        p => p.status === 'jamaah_rumah' || p.status === 'jamaah_masjid'
      ).length
    );
  }, 0);

  return {
    stepsAchieved,
    totalDays: 7,
    ibadahJamaah,
    totalPrayers: weekDays.length * 5,
  };
}

// ─── Statistics: Daily Scores Chart Data ──────────────────────────────────────

export interface DailyChartPoint {
  date: string;
  label: string;
  ibadah: number;
  gym: number;
  custom: number;
  overall: number;
}

const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function getDailyChartData(days = 7): DailyChartPoint[] {
  const allDays = getAllDays();
  const result: DailyChartPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = `${DAY_SHORT[d.getDay()]} ${d.getDate()}`;
    const record = allDays.find(r => r.date === dateStr);
    if (record) {
      const s = { ibadah: scoreIbadah(record), gym: scoreGym(record), custom: scoreCustom(record) };
      const overall = Math.round((s.ibadah.score + s.gym.score + s.custom.score) / 3);
      result.push({ date: dateStr, label: dayLabel, ibadah: s.ibadah.score, gym: s.gym.score, custom: s.custom.score, overall });
    } else {
      result.push({ date: dateStr, label: dayLabel, ibadah: 0, gym: 0, custom: 0, overall: 0 });
    }
  }
  return result;
}

// ─── Statistics: Prayer Breakdown Per Week ────────────────────────────────────

export interface PrayerBreakdownDay {
  label: string;
  subuh: number;
  dzuhur: number;
  ashar: number;
  maghrib: number;
  isya: number;
}

export function getPrayerBreakdownWeek(): PrayerBreakdownDay[] {
  const allDays = getAllDays();
  const result: PrayerBreakdownDay[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = `${DAY_SHORT[d.getDay()]} ${d.getDate()}`;
    const record = allDays.find(r => r.date === dateStr);
    if (record) {
      const w = record.ibadah.wajib;
      const ws = (p: { status: PrayerStatus }) => PRAYER_WEIGHTS[p.status];
      result.push({ label, subuh: ws(w.subuh), dzuhur: ws(w.dzuhur), ashar: ws(w.ashar), maghrib: ws(w.maghrib), isya: ws(w.isya) });
    } else {
      result.push({ label, subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 });
    }
  }
  return result;
}

// ─── Statistics: Detailed Streaks ────────────────────────────────────────────

export interface DetailedStreak {
  label: string;
  category: 'ibadah' | 'gym' | 'custom';
  current: number;
  best: number;
  emoji: string;
  colorVar: string;
}

function calcBestStreak(days: DayRecord[], checkFn: (r: DayRecord) => boolean): number {
  let best = 0, current = 0;
  for (const day of days) {
    if (checkFn(day)) { current++; best = Math.max(best, current); }
    else current = 0;
  }
  return best;
}

export function getDetailedStreaks(): DetailedStreak[] {
  const allDays = getAllDays();
  const allDaysRev = [...allDays].reverse();
  const today = new Date().toISOString().split('T')[0];

  function currentStreak(checkFn: (r: DayRecord) => boolean): number {
    let streak = 0;
    for (const day of allDaysRev) {
      if (day.date > today) continue;
      if (checkFn(day)) streak++;
      else break;
    }
    return streak;
  }

  const checks: { label: string; category: DetailedStreak['category']; emoji: string; colorVar: string; fn: (r: DayRecord) => boolean }[] = [
    {
      label: 'Shalat Berjamaah', category: 'ibadah', emoji: '🕌', colorVar: 'var(--primary)',
      fn: r => ['subuh','dzuhur','ashar','maghrib','isya'].every(k => {
        const p = r.ibadah.wajib[k as keyof typeof r.ibadah.wajib];
        return p.status === 'jamaah_rumah' || p.status === 'jamaah_masjid';
      }),
    },
    {
      label: 'Shalat 5 Waktu', category: 'ibadah', emoji: '🤲', colorVar: 'var(--accent-blue)',
      fn: r => ['subuh','dzuhur','ashar','maghrib','isya'].every(k => {
        const p = r.ibadah.wajib[k as keyof typeof r.ibadah.wajib];
        return p.status !== 'tidak';
      }),
    },
    { label: 'Tahajud', category: 'ibadah', emoji: '🌙', colorVar: 'var(--accent-gold)',   fn: r => r.ibadah.sunnah.tahajud },
    { label: 'Dhuha',   category: 'ibadah', emoji: '🌅', colorVar: 'var(--accent-rose)',   fn: r => r.ibadah.sunnah.dhuha   },
    { label: 'Target Steps', category: 'gym', emoji: '👣', colorVar: 'var(--accent-blue)',
      fn: r => r.gym.steps.actual >= r.gym.steps.target && r.gym.steps.target > 0 },
  ];

  return checks.map(c => ({
    label: c.label, category: c.category, emoji: c.emoji, colorVar: c.colorVar,
    current: currentStreak(c.fn),
    best: calcBestStreak(allDays, c.fn),
  }));
}
