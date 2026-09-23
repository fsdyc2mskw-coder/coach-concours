// CHANGE_REQUEST_017 — the one-off baseline of `rules/test_battery.md` v2,
// trained inside the week of 21-27 September 2026 and never re-tested
// (R-TB-01).
//
// The content below is that rule file plus the reshaped week
// (`03_Weekly_plans/WEEK_3_BASELINE_WEEK_2026-09-23.md`), transcribed into
// French, the app's own language. Nothing is invented: the attempt counts
// (3 and 3), the rests (90 s and 3 min), the measurement method, the 6-minute
// frame and the "8-9 km au total" are those two files' own words.
//
// Two things this module deliberately does NOT do:
//
//  - it does not write the baseline blocks into `recipeById`. The week 3
//    trail run uses `trail-maintenance-v1`, the SAME recipe object every
//    other week's weekend run uses, so a block pushed into that recipe would
//    appear in every week and break R-TB-01. The blocks are attached to a
//    session id and injected at read time by `recipeForSession()`.
//
//  - it does not key anything by date. The athlete moves both of these
//    sessions with CR-014 (the skill session to Wednesday 23, the trail run
//    to Sunday 27), and `DayMove` rewrites a session's `date` but never its
//    `id`. Binding to the id is what makes the block, and the numbers stored
//    against it, follow the session when it moves.
import type {
  BaselineBlockSpec,
  ExerciseBlock,
  SessionRecipe,
  SessionResult
} from './types';

/**
 * The stored half of a baseline. `SessionResult` satisfies this structurally,
 * and so does the half-typed object the Retour tab holds while the athlete is
 * still entering her attempts — which is what lets the screen show the same
 * computed "best" she will see once the record is saved, from one definition.
 */
export interface BaselineValues {
  broadJumpCm?: number[];
  sprint20mS?: number[];
  sixMinRunM?: number;
}

// The generator's own ids (`${date}:${kind}`) for the two week 3 sessions the
// baseline sits on. These are the ids as GENERATED, which is what `DayMove`
// and `state.results` are both keyed by — not the days the athlete trains them.
export const BASELINE_SKILL_SESSION_ID = '2026-09-24:skill_session';
export const BASELINE_TRAIL_SESSION_ID = '2026-09-26:trail_maintenance';

export const BASELINE_SESSION_IDS: readonly string[] = [
  BASELINE_SKILL_SESSION_ID,
  BASELINE_TRAIL_SESSION_ID
];

// Section C — shown before the block, every time.
export const BASELINE_CONDITIONS =
  'Mêmes chaussures, même surface, heure semblable, même méthode de chronométrage.';

export function isBaselineSession(sessionId: string): boolean {
  return BASELINE_SESSION_IDS.includes(sessionId);
}

// ---------- the two blocks ----------

// Baseline 1, on the skill session. No duration in the title: neither the
// rule file nor the reshaped week gives the block a length, and a number
// invented here would be shown to the athlete as if it were decided
// (see the question in handoffs/APP_REPORT_017.md).
function skillBaselineBlock(): ExerciseBlock {
  const spec: BaselineBlockSpec = {
    kind: 'baseline',
    tests: ['broad_jump', 'sprint_20m'],
    conditions: BASELINE_CONDITIONS
  };
  return {
    title: 'Référence — saut en longueur et sprint 20 m',
    short: 'référence',
    kind: 'baseline',
    spec,
    faire: 'Saut en longueur sans élan : pieds écartés de la largeur des hanches, orteils derrière une ligne, appel et réception sur les deux pieds, balancement des bras autorisé. Réception tenue : une main au sol ou un pas en arrière, l’essai est à refaire. 3 essais, 90 s de récupération. Puis sprint 20 m : départ debout, pied avant derrière la ligne, tu pars quand tu es prête, et tu finis en courant À TRAVERS le cône. 3 essais, 3 min de récupération.',
    regle: BASELINE_CONDITIONS,
    noter: 'Les 3 essais du saut, en cm, mesurés de la ligne au talon le plus en arrière. Les 3 essais du sprint, en secondes à deux décimales, au chronomètre d’application ou à la vidéo au ralenti. Le meilleur des trois est calculé, jamais saisi.',
    details: 'Une seule fois : il n’y a pas de re-test plus tard.',
    stationMappings: []
  };
}

// Baseline 2, on the week 3 trail run. `trail-maintenance-v1` has no warm-up
// of its own, so the 15-min frame the rule file puts around the test is
// carried inside this block rather than added to a recipe every other week
// shares (see APP_REPORT_017.md).
function trailBaselineBlock(): ExerciseBlock {
  const spec: BaselineBlockSpec = {
    kind: 'baseline',
    tests: ['six_min_run'],
    conditions: BASELINE_CONDITIONS
  };
  return {
    title: 'Référence — 6 minutes',
    short: 'référence',
    kind: 'baseline',
    spec,
    faire: '15 min facile, puis 3 × 20 s de lignes droites. Puis LE TEST : 6 minutes, le plus loin possible, à plat, à allure régulière. Puis 5 min de trot facile, puis course facile, environ 8-9 km au total.',
    regle: BASELINE_CONDITIONS,
    noter: 'La distance des 6 minutes, en mètres, lue sur la montre. La VMA est calculée à partir d’elle, jamais saisie.',
    details: 'Une seule fois : il n’y a pas de re-test plus tard.',
    stationMappings: []
  };
}

/**
 * The baseline block a session carries, or `null` for every other session in
 * every week (R-TB-01).
 */
export function baselineBlockFor(sessionId: string): ExerciseBlock | null {
  if (sessionId === BASELINE_SKILL_SESSION_ID) return skillBaselineBlock();
  if (sessionId === BASELINE_TRAIL_SESSION_ID) return trailBaselineBlock();
  return null;
}

/**
 * The recipe as the athlete reads it for THIS session: the shared recipe with
 * the baseline block inserted right after the warm-up (section A).
 *
 * `warmup` is not an `ExerciseBlock` in this codebase — it is its own string
 * on `SessionRecipe`, rendered before `blocks` — so "right after the warm-up"
 * is index 0 of `blocks`, both for the skill session (before its memory
 * block, as the reshaped week draws it) and for the trail run (which has no
 * warm-up at all).
 *
 * The returned object is a copy: the shared recipe in `recipeById` is never
 * mutated, so no other week's session gains a block.
 */
export function withBaselineBlock(recipe: SessionRecipe, sessionId: string): SessionRecipe {
  const block = baselineBlockFor(sessionId);
  if (!block) return recipe;
  return { ...recipe, blocks: [block, ...recipe.blocks] };
}

/** The baseline block of an already-built recipe, for the screens. */
export function baselineBlockOf(recipe: SessionRecipe): ExerciseBlock | null {
  return recipe.blocks.find((block) => block.kind === 'baseline') ?? null;
}

export function baselineTestsOf(recipe: SessionRecipe): BaselineBlockSpec['tests'] {
  const block = baselineBlockOf(recipe);
  return block?.spec?.kind === 'baseline' ? block.spec.tests : [];
}

// ---------- computed, never typed (R-TB-02, R-TB-03) ----------

function finite(values: number[] | undefined): number[] {
  return (values ?? []).filter((value) => Number.isFinite(value));
}

/** Best broad jump = the longest of the attempts, in cm. */
export function bestBroadJumpCm(result: BaselineValues | undefined): number | undefined {
  const attempts = finite(result?.broadJumpCm);
  return attempts.length ? Math.max(...attempts) : undefined;
}

/** Best 20 m sprint = the FASTEST of the attempts, so the smallest number. */
export function bestSprint20mS(result: BaselineValues | undefined): number | undefined {
  const attempts = finite(result?.sprint20mS);
  return attempts.length ? Math.min(...attempts) : undefined;
}

/** R-TB-03 — VMA in km/h from the 6-minute distance, never typed. */
export function vmaKmh(result: BaselineValues | undefined): number | undefined {
  const metres = result?.sixMinRunM;
  return metres !== undefined && Number.isFinite(metres) ? metres / 100 : undefined;
}

// ---------- the Référence card (section C) ----------

export interface BaselineReference {
  bestBroadJumpCm?: number;
  bestSprint20mS?: number;
  sixMinRunM?: number;
  vmaKmh?: number;
}

/**
 * Everything the "Référence" card shows, read across the two baseline
 * sessions. Recorded values only: a test that was not done simply has no
 * entry, and there is no target, no arrow and no comparison anywhere in this
 * shape to render one from (R-TB-04).
 */
export function baselineReference(results: Record<string, SessionResult>): BaselineReference {
  const skill = results[BASELINE_SKILL_SESSION_ID];
  const trail = results[BASELINE_TRAIL_SESSION_ID];
  const jump = bestBroadJumpCm(skill);
  const sprint = bestSprint20mS(skill);
  const metres = trail?.sixMinRunM;
  const vma = vmaKmh(trail);
  return {
    ...(jump !== undefined ? { bestBroadJumpCm: jump } : {}),
    ...(sprint !== undefined ? { bestSprint20mS: sprint } : {}),
    ...(metres !== undefined ? { sixMinRunM: metres } : {}),
    ...(vma !== undefined ? { vmaKmh: vma } : {})
  };
}

export function hasBaselineReference(reference: BaselineReference): boolean {
  return Object.keys(reference).length > 0;
}
