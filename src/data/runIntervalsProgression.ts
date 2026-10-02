// CHANGE_REQUEST_013 v3 — `02_Training_brain/rules/run_intervals_progression.md`
// v4 (2 October 2026): from week 5 the paces are re-anchored on the ONE
// baseline (6-min run, 2 October: VMA 12.2 km/h), the main sets are new,
// weeks 7 and 8 run on a hotel treadmill (the km/h is shown, `treadmill` is
// set by the planner from SEASON_PLAN), week 9 is the hill sprints and has
// no row here, and there is no re-test anywhere. Weeks 2 to 4 are past and
// keep their rows (week 4 stays 4 × 4 min at 6:00, decision 3).
// CHANGE_REQUEST_011 — Tuesday run_intervals progression table. One row per
// week; the generator reads the row for the week and never invents a set
// (R-WS-20).
// CHANGE_REQUEST_013 v2 section F — the trail race is on SUNDAY 11 October.
export interface RunIntervalsGroup {
    reps: number;
    minutes: number;
    paceSec: number;
    jogSec: number;
}

export interface RunIntervalsRow {
    week: number;
    reps: number;
    minutes: number;
    paceSec: number;
    jogSec: number;
    purpose: string;
    /** Weeks 7 and 8 (travel): the row is run on a treadmill, incline 1 %. */
    treadmill?: boolean;
    /** A second group in the same main set (none in v4). */
  second?: RunIntervalsGroup;
}

export const runIntervalsProgression: RunIntervalsRow[] = [
  { week: 2, reps: 4, minutes: 3, paceSec: 360, jogSec: 180, purpose: 'base, apprendre l’allure I' },
  { week: 3, reps: 5, minutes: 3, paceSec: 360, jogSec: 150, purpose: 'volume' },
  { week: 4, reps: 4, minutes: 4, paceSec: 360, jogSec: 180, purpose: 'répétitions plus longues' },
  { week: 5, reps: 3, minutes: 4, paceSec: 325, jogSec: 180, purpose: 'semaine de course, dimanche 11 oct.' },
  { week: 6, reps: 5, minutes: 4, paceSec: 325, jogSec: 180, purpose: 'volume en hausse après la course' },
  { week: 7, reps: 6, minutes: 2, paceSec: 305, jogSec: 120, purpose: 'vitesse' },
  { week: 8, reps: 3, minutes: 5, paceSec: 320, jogSec: 180, purpose: 'endurance' },
  { week: 10, reps: 4, minutes: 3, paceSec: 315, jogSec: 120, purpose: 'semaine allégée, affûter' },
  { week: 11, reps: 4, minutes: 1, paceSec: 300, jogSec: 120, purpose: 'affûtage : concours vendredi 20 nov.' }
  ];

// R-WS-23 — pace zones from the ONE baseline (2 October 2026, VMA 12.2 km/h),
// in seconds per kilometre. Reviewed only in Cowork, never automatically.
export const runIntervalsZones = {
    R: { minSec: 295, maxSec: 305 },
    I: { minSec: 315, maxSec: 330 },
    T: { minSec: 345, maxSec: 355 },
    E: { minSec: 420, maxSec: null as number | null }
};

export const runIntervalsBaselines = {
    vmaKmh: 12.2,
    sixMinRunM: 1385
};

/** The treadmill speed of a pace, in km/h to one decimal (run_intervals_progression.md v4). */
export function treadmillKmh(paceSec: number): number {
    return Math.round(36000 / paceSec) / 10;
}

export type NextRowOutcome = 'repeat' | 'advance' | 'advanceFaster';

// R-WS-22 — repeat rule. `recordedRepPacesSec` is one entry per rep actually
// run, in seconds per kilometre (from the Retour form's "Rép 1 … Rép n"
// fields). Two or more reps more than 15 s/km slower than the row's target
// → repeat; every rep more than 10 s/km faster → advance with the pace 10
// s/km faster; otherwise the table advances as scheduled.
export function nextRow(row: RunIntervalsRow, recordedRepPacesSec: number[]): NextRowOutcome {
    if (recordedRepPacesSec.length === 0) return 'advance';
    const slowerCount = recordedRepPacesSec.filter((paceSec) => paceSec - row.paceSec > 15).length;
    if (slowerCount >= 2) return 'repeat';
    const allFaster = recordedRepPacesSec.every((paceSec) => row.paceSec - paceSec > 10);
    if (allFaster) return 'advanceFaster';
    return 'advance';
}
