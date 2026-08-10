// ─── Prayer Types ───────────────────────────────────────────────────────────

export type PrayerStatus = 'tidak' | 'dirumah' | 'berjamaah' | 'masjid';
export type PrayerTiming = 'awal' | 'tidak_awal';

export interface PrayerEntry {
  status: PrayerStatus;
  timing?: PrayerTiming;
}

export interface WajibPrayers {
  subuh: PrayerEntry;
  dzuhur: PrayerEntry;
  ashar: PrayerEntry;
  maghrib: PrayerEntry;
  isya: PrayerEntry;
}

export interface SunnahPrayers {
  tahajud: boolean;
  dhuha: boolean;
}

export interface CustomIbadahItem {
  id: string;
  name: string;
  type: 'checklist' | 'number';
  done: boolean;
  value?: number;
  unit?: string;
  active: boolean;
}

export interface IbadahRecord {
  wajib: WajibPrayers;
  sunnah: SunnahPrayers;
  custom: CustomIbadahItem[];
}

// ─── Gym Types ───────────────────────────────────────────────────────────────

export interface StepsRecord {
  target: number;
  actual: number;
}

export interface WorkoutItem {
  id: string;
  name: string;
  target: number;
  actual: number;
  unit: string;
  note?: string;
  active: boolean;
}

export interface GymRecord {
  steps: StepsRecord;
  custom: WorkoutItem[];
}

// ─── Custom General Types ────────────────────────────────────────────────────

export interface CustomGeneralItem {
  id: string;
  name: string;
  type: 'checklist' | 'number';
  done: boolean;
  value?: number;
  target?: number;
  unit?: string;
  active: boolean;
}

// ─── Day Record ──────────────────────────────────────────────────────────────

export interface DayRecord {
  date: string; // YYYY-MM-DD
  ibadah: IbadahRecord;
  gym: GymRecord;
  custom_general: CustomGeneralItem[];
}

// ─── Settings Types ──────────────────────────────────────────────────────────

export interface AppSettings {
  stepsTarget: number;
  customIbadahItems: CustomIbadahItem[];
  customWorkoutItems: WorkoutItem[];
  customGeneralItems: CustomGeneralItem[];
  hiddenDefaults: string[];
}

// ─── Score Types ─────────────────────────────────────────────────────────────

export interface CategoryScore {
  label: string;
  score: number;   // 0–100
  achieved: number;
  total: number;
}

export interface DayScore {
  ibadah: CategoryScore;
  gym: CategoryScore;
  custom: CategoryScore;
}

// ─── Streak Types ────────────────────────────────────────────────────────────

export interface StreakInfo {
  label: string;
  days: number;
  category: 'ibadah' | 'gym' | 'custom';
}
