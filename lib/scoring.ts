import { DayRecord, CategoryScore, DayScore, StreakInfo, PrayerStatus } from './types';
import { getAllDays } from './storage';

// ─── Ibadah Score ─────────────────────────────────────────────────────────────

const PRAYER_WEIGHTS: Record<PrayerStatus, number> = {
  tidak: 0,
  dirumah: 1,
  berjamaah: 2,
  masjid: 3,
};

export function scoreIbadah(record: DayRecord): CategoryScore {
  const wajib = record.ibadah.wajib;
  const prayers = [wajib.subuh, wajib.dzuhur, wajib.ashar, wajib.maghrib, wajib.isya];

  // Wajib: each prayer max 3 (masjid) + 1 bonus awal waktu = 4 per prayer → 20 total
  let achieved = 0;
  const maxPerPrayer = 4;
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
  const customAchieved = customItems.filter(c => c.done).length * 2;

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
    p => p.status === 'berjamaah' || p.status === 'masjid'
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
        p => p.status === 'berjamaah' || p.status === 'masjid'
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
