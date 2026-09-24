// CHANGE_REQUEST_013 v2 section F — the trail race is on SUNDAY 11 October.
// CHANGE_REQUEST_011 — Tuesday run_intervals progression table, verbatim from
// `02_Training_brain/rules/run_intervals_progression.md` v1 (15 September
// 2026). One row per week 2 to 11; the generator reads the row for the week
// number and never invents a set (R-WS-20). Week 8 carries `retest: true`
// (the 1 km re-test that resets the zones, R-WS-23). Week 9 alone has a
// second group ("2 × 6 min @ 5:45, jog 4 min, then 4 × 1 min @ 5:20") — its
// `second.jogSec` is not given by the source table (only the jog between the
// two groups is); the value here is a documented approximation, flagged in
// `handoffs/APP_REPORT_011.md`, not a sporting decision made silently.
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
    retest?: boolean;
    /** Only week 9: the second group of its compound main set. */
  second?: RunIntervalsGroup;
}

export const runIntervalsProgression: RunIntervalsRow[] = [
  { week: 2, reps: 4, minutes: 3, paceSec: 360, jogSec: 180, purpose: 'base, apprendre l’allure I' },
  { week: 3, reps: 5, minutes: 3, paceSec: 360, jogSec: 150, purpose: 'volume' },
  { week: 4, reps: 4, minutes: 4, paceSec: 360, jogSec: 180, purpose: 'répétitions plus longues' },
  { week: 5, reps: 3, minutes: 2, paceSec: 350, jogSec: 120, purpose: 'léger : trail le dimanche 11 oct.' },
  { week: 6, reps: 4, minutes: 4, paceSec: 350, jogSec: 180, purpose: 'palier d’allure' },
  { week: 7, reps: 6, minutes: 2, paceSec: 330, jogSec: 120, purpose: 'vitesse de jambes' },
  { week: 8, reps: 3, minutes: 5, paceSec: 355, jogSec: 180, purpose: 'endurance, nouvelle référence', retest: true },
  {
        week: 9, reps: 2, minutes: 6, paceSec: 345, jogSec: 240, purpose: 'répétition générale du concours',
        second: { reps: 4, minutes: 1, paceSec: 320, jogSec: 60 }
  },
  { week: 10, reps: 5, minutes: 3, paceSec: 340, jogSec: 90, purpose: 'récupération courte, pic' },
  { week: 11, reps: 4, minutes: 1, paceSec: 330, jogSec: 120, purpose: 'affûtage : concours vendredi 20 nov.' }
  ];

// R-WS-23 — pace zones from the recorded baselines, in seconds per kilometre.
// Reset by the Week 8 re-test (not automated here: the reset itself is a
// sporting decision made from a recorded result, left to a future CR/rule
// update, per `handoffs/00_COCKPIT.md` §7 precedent for adaptation notes).
export const runIntervalsZones = {
    R: { minSec: 320, maxSec: 330 },
    I: { minSec: 350, maxSec: 360 },
    T: { minSec: 395, maxSec: 405 },
    E: { minSec: 450, maxSec: null as number | null }
};

export const runIntervalsBaselines = {
    oneKmSec: 330,
    best6minMeters: 1000,
    retestWeek: 8
};

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
