import {
  DayRecord,
  AppSettings,
  IbadahRecord,
  GymRecord,
  CustomGeneralItem,
  CustomIbadahItem,
  WorkoutItem,
} from './types';

// ─── Keys ────────────────────────────────────────────────────────────────────

const DAY_PREFIX = 'mytracker_day_';
const SETTINGS_KEY = 'mytracker_settings';

// ─── Default Structures ──────────────────────────────────────────────────────

export function defaultIbadah(customItems: CustomIbadahItem[] = []): IbadahRecord {
  return {
    wajib: {
      subuh:   { status: 'tidak' },
      dzuhur:  { status: 'tidak' },
      ashar:   { status: 'tidak' },
      maghrib: { status: 'tidak' },
      isya:    { status: 'tidak' },
    },
    sunnah: { tahajud: false, dhuha: false },
    custom: customItems.map(item => ({ ...item, done: false, value: undefined })),
  };
}

export function defaultGym(customWorkouts: WorkoutItem[] = [], stepsTarget = 10000): GymRecord {
  return {
    steps: { target: stepsTarget, actual: 0 },
    custom: customWorkouts.map(w => ({ ...w, actual: 0 })),
  };
}

export function defaultCustomGeneral(items: CustomGeneralItem[] = []): CustomGeneralItem[] {
  return items.map(i => ({ ...i, done: false, value: undefined }));
}

// ─── Settings ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  stepsTarget: 10000,
  customIbadahItems: [],
  customWorkoutItems: [],
  customGeneralItems: [],
  hiddenDefaults: [],
};

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ─── Day Records ─────────────────────────────────────────────────────────────

export function getDay(date: string): DayRecord {
  if (typeof window === 'undefined') return createEmptyDay(date);
  try {
    const raw = localStorage.getItem(`${DAY_PREFIX}${date}`);
    if (raw) {
      const record = JSON.parse(raw) as DayRecord;
      // Sinkronisasi khusus untuk hari ini jika ada perubahan di settings
      if (date === todayStr()) {
        const settings = getSettings();
        let changed = false;
        
        if (record.gym.steps.target !== settings.stepsTarget) {
          record.gym.steps.target = settings.stepsTarget;
          changed = true;
        }

        // Sinkronisasi item custom (tambah yang baru aktif, hapus yang tidak aktif, pertahankan progress)
        const activeIbadah = settings.customIbadahItems.filter(i => i.active);
        const newIbadah = activeIbadah.map(ai => {
          const existing = record.ibadah.custom.find(c => c.id === ai.id);
          return existing ? { ...ai, done: existing.done, value: existing.value } : { ...ai, done: false, value: undefined };
        });
        if (JSON.stringify(record.ibadah.custom) !== JSON.stringify(newIbadah)) {
          record.ibadah.custom = newIbadah;
          changed = true;
        }

        const activeWorkout = settings.customWorkoutItems.filter(i => i.active);
        const newWorkout = activeWorkout.map(aw => {
          const existing = record.gym.custom.find(c => c.id === aw.id);
          return existing ? { ...aw, actual: existing.actual } : { ...aw, actual: 0 };
        });
        if (JSON.stringify(record.gym.custom) !== JSON.stringify(newWorkout)) {
          record.gym.custom = newWorkout;
          changed = true;
        }

        const activeGeneral = settings.customGeneralItems.filter(i => i.active);
        const newGeneral = activeGeneral.map(ag => {
          const existing = record.custom_general.find(c => c.id === ag.id);
          return existing ? { ...ag, done: existing.done, value: existing.value } : { ...ag, done: false, value: undefined };
        });
        if (JSON.stringify(record.custom_general) !== JSON.stringify(newGeneral)) {
          record.custom_general = newGeneral;
          changed = true;
        }

        if (changed) saveDay(record);
      }
      return record;
    }
    return createEmptyDay(date);
  } catch {
    return createEmptyDay(date);
  }
}

export function saveDay(record: DayRecord): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${DAY_PREFIX}${record.date}`, JSON.stringify(record));
}

export function createEmptyDay(date: string): DayRecord {
  const settings = getSettings();
  return {
    date,
    ibadah: defaultIbadah(settings.customIbadahItems.filter(i => i.active)),
    gym: defaultGym(settings.customWorkoutItems.filter(i => i.active), settings.stepsTarget),
    custom_general: defaultCustomGeneral(settings.customGeneralItems.filter(i => i.active)),
  };
}

export function getAllDays(): DayRecord[] {
  if (typeof window === 'undefined') return [];
  const days: DayRecord[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(DAY_PREFIX)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) days.push(JSON.parse(raw));
      } catch { /* skip */ }
    }
  }
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

export function getDaysInRange(startDate: string, endDate: string): DayRecord[] {
  return getAllDays().filter(d => d.date >= startDate && d.date <= endDate);
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
