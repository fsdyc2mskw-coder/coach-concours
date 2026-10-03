// CHANGE_REQUEST_018 — the memory game (PLAN · ORDRE · QUI MANQUE · RÈGLES).
//
// One describe block per item of the change request's own "Tests that must
// pass" list, in its order, plus a first block that holds the generated game
// data to `handoffs/MOCKUP_CR018_assets.md` itself. References:
// `handoffs/rules/memory_modules.md` v3, `handoffs/rules/floor_plan.md` v1,
// `handoffs/MOCKUP_CR018_assets.md`, `handoffs/MOCKUP_CR018.pdf`.
//
// The drags are pointer geometry, which jsdom has no layout for, so the boxes
// and lines are given rectangles here (`mockGeometry`): the PLAN room is laid
// out 366 × 540 px at the origin, as the mockup draws it on a 390 px phone.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import CoachConcoursApp from '../CoachConcoursApp';
import { MissingGame, OrderGame, PlanGame, RulesGame } from '../MemoryGame';
import { planWithMoves, withMove } from '../coach/dayMoves';
import {
  MEMORY_BLOCK_MAX_MIN,
  MEMORY_CARD_MAX,
  MEMORY_CYCLE,
  MEMORY_M4_LINE,
  MEMORY_VIDEO_LINE,
  type MemoryCard
} from '../coach/memoryCycle';
import {
  checkPlan,
  featuredCard,
  nextFreeLine,
  placeTile,
  planBoxCentres,
  returnToTray,
  rulesFeedback,
  scoreMissing,
  scoreOrder,
  scorePlan,
  scoreRules,
  snapBox,
  withMemoryCardScore,
  withMemoryVideo,
  type Placement
} from '../coach/memoryGame';
import {
  DOOR_AND_ATHLETE,
  FLOOR_PLAN,
  GAME_STATIONS,
  MISSING_ROUNDS,
  RULES_PICTURES,
  TRAY_ORDER,
  type StationId
} from '../coach/memoryGameAssets';
import { generatePlan, validateV4PoliceSessions, validateWeek } from '../coach/planner';
import { recipeById } from '../coach/recipes';
import { blockOfKind, isSessionShape, memoryBlockOf, memoryModulesOf } from '../coach/sessionShapes';
import type { ExerciseBlock, SessionRecipe, TrainingWeek } from '../coach/types';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');
const ASSETS = read('handoffs/MOCKUP_CR018_assets.md');
const MODULES = read('handoffs/rules/memory_modules.md');

const weeks = generatePlan();
const WEEK_STARTS: Record<number, string> = {
  3: '2026-09-21', 4: '2026-09-28', 5: '2026-10-05', 6: '2026-10-12', 7: '2026-10-19',
  8: '2026-10-26', 9: '2026-11-02', 10: '2026-11-09', 11: '2026-11-16'
};
const weekIn = (list: readonly TrainingWeek[], n: number): TrainingWeek => list.find((week) => week.startDate === WEEK_STARTS[n])!;
const weekNo = (n: number): TrainingWeek => weekIn(weeks, n);
const policeOf = (week: TrainingWeek) => week.sessions.filter((session) => isSessionShape(session.kind));
const recipeOf = (week: TrainingWeek, kind: string): SessionRecipe | undefined => {
  const session = week.sessions.find((item) => item.kind === kind);
  return session ? recipeById[session.recipeId] : undefined;
};
const memoryBlocks = (recipe: SessionRecipe): ExerciseBlock[] => recipe.blocks.filter((block) => block.kind === 'memory');
const minutesOf = (block: ExerciseBlock): number => Number(block.title.match(/(\d+)\s*min/)![1]);
const hasVideo = (recipe: SessionRecipe): boolean => Boolean(memoryBlockOf(recipe)?.game?.video);
const LABEL_TO_ID: Record<string, StationId> = Object.fromEntries(GAME_STATIONS.map((station) => [station.label, station.id]));
const CARD_BY_WORD: Record<string, MemoryCard> = { PLAN: 'plan', ORDRE: 'order', 'QUI MANQUE': 'missing', RÈGLES: 'rules' };

// ---------- geometry for the drags ----------

const ROOM = { width: 366, height: 540 };
const CENTRES = planBoxCentres(ROOM.width, ROOM.height);
const TRAY_Y = 700;
const LINE_TOP = (line: number) => (line - 1) * 44;

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) } as DOMRect;
}

function mockGeometry() {
  return vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const element = this as HTMLElement;
    if (element.dataset?.box) {
      const centre = CENTRES[element.dataset.box as StationId];
      return rect(centre.x - 31, centre.y - 31, 62, 62);
    }
    if (element.dataset?.line) return rect(0, LINE_TOP(Number(element.dataset.line)), 358, 40);
    if (element.dataset?.tile) return rect(0, TRAY_Y, 54, 58);
    return rect(0, 0, 0, 0);
  });
}

function pointer(type: string, target: EventTarget, x: number, y: number) {
  act(() => { target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y })); });
}

/** Presses a tile at `from`, moves the finger, and lets go at `to`. */
function dragTile(tile: Element, from: { x: number; y: number }, to: { x: number; y: number }) {
  pointer('pointerdown', tile, from.x, from.y);
  pointer('pointermove', document, (from.x + to.x) / 2, (from.y + to.y) / 2);
  pointer('pointermove', document, to.x, to.y);
  pointer('pointerup', document, to.x, to.y);
}

const tileIn = (container: HTMLElement, id: StationId) => container.querySelector(`[data-tile="${id}"]`)!;
const trayTiles = (container: HTMLElement, tray: string) => Array.from(container.querySelectorAll(`${tray} [data-tile]`)).map((node) => (node as HTMLElement).dataset.tile);

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// ---------- 0. the game data is the assets file, as it is ----------

function assetSection(n: number): string {
  return ASSETS.match(new RegExp(`^## ${n}\\..*?$([\\s\\S]*?)(?=^## \\d\\.|$(?![\\s\\S]))`, 'm'))![1]!;
}
function assetBlock(text: string): string {
  return text.match(/```\n([\s\S]*?)```/)![1]!;
}

describe('CR-018 — the game data reproduces MOCKUP_CR018_assets.md exactly', () => {
  it('section 1: the 11 stations, official order, labels and pictogram paths', () => {
    const rows = assetBlock(assetSection(1)).split('\n').map((line) => line.match(/^ (s\d+)\s{2,}(.+?)\s{2,}(M.+)$/)).filter(Boolean);
    expect(rows.map((row) => [row![1], row![2], row![3]])).toEqual(GAME_STATIONS.map((station) => [station.id, station.label, station.pictogram]));
    expect(GAME_STATIONS.map((station) => station.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('section 2: the box centres and the door + athlete point', () => {
    const found: Record<string, [number, number]> = {};
    for (const match of assetBlock(assetSection(2)).matchAll(/(s\d+|door \+ athlete)\s+(\.\d+)\s+(\.\d+)/g)) found[match[1]!] = [Number(match[2]), Number(match[3])];
    for (const station of GAME_STATIONS) expect([FLOOR_PLAN[station.id].nx, FLOOR_PLAN[station.id].ny], station.id).toEqual(found[station.id]);
    expect([DOOR_AND_ATHLETE.nx, DOOR_AND_ATHLETE.ny]).toEqual(found['door + athlete']);
  });

  it('section 3: the tray order', () => {
    expect(TRAY_ORDER.join(', ')).toBe(assetSection(3).match(/Tray order \(both PLAN and ORDRE\): (.*?)\.\n/)![1]);
  });

  it('section 4: the 3 rounds, their choices in order and their explanations', () => {
    const block = assetBlock(assetSection(4));
    MISSING_ROUNDS.forEach((round, index) => {
      expect(block).toContain(` ${index + 1}      ${round.missing}  `);
      expect(block).toContain(round.explanation);
    });
    expect(block).toContain('Chariot, Écrous, Mannequin, Banc');
    expect(block).toMatch(/Banc, Corde à sauter, Sac à la corde,\s+Le banc[\s\S]*\n\s+Raquette\n/);
    expect(block).toContain('Obstacle, Espaliers, Slalom, Mannequin');
    expect(MISSING_ROUNDS.map((round) => round.choices.map((id) => GAME_STATIONS.find((station) => station.id === id)!.label))).toEqual([
      ['Chariot', 'Écrous', 'Mannequin', 'Banc'],
      ['Banc', 'Corde à sauter', 'Sac à la corde', 'Raquette'],
      ['Obstacle', 'Espaliers', 'Slalom', 'Mannequin']
    ]);
  });

  it('section 5: the 10 pictures in order, with their answers, explanations and SVGs', () => {
    const section = assetSection(5);
    const rows = assetBlock(section).split('\n').map((line) => line.match(/^ (\d+)\s+(\d+) · (.+?)\s{2,}(faux|correct)\s+(\S.*)$/)).filter(Boolean);
    expect(rows.map((row) => [Number(row![2]), row![3], row![4], row![5]])).toEqual(RULES_PICTURES.map((picture) => [picture.station, picture.label, picture.answer, picture.explanation]));
    const scenes = Array.from(section.matchAll(/### Scene (\d+)\n\n```svg\n([\s\S]*?)\n```/g));
    expect(scenes.map((scene) => scene[2])).toEqual(RULES_PICTURES.map((picture) => picture.svg));
  });
});

// ---------- 1. the cycle ----------

describe('CR-018 — MEMORY_CYCLE reproduces the table cell for cell', () => {
  it('as written in the change request', () => {
    expect(MEMORY_CYCLE).toEqual({
      5: { skill: 'plan', chain: 'order', video: true, m4: false },
      6: { skill: 'missing', chain: 'rules', video: false, m4: false },
      7: { skill: 'plan', chain: 'order', video: true, m4: false },
      8: { skill: 'missing', chain: 'rules', video: false, m4: false },
      9: { skill: 'plan', chain: 'order', video: true, m4: true },
      10: { skill: 'missing', chain: 'rules', video: false, m4: true },
      11: { skill: 'plan', chain: null, video: true, m4: true }
    });
  });

  it('and as memory_modules.md v3 draws it', () => {
    const cycle = MODULES.match(/## The cycle[\s\S]*?```\n([\s\S]*?)```/)![1]!;
    const rows = cycle.split('\n').slice(1).filter((line) => line.trim());
    expect(rows).toHaveLength(7);
    for (const row of rows) {
      const week = Number(row.match(/^ W(\d+)/)![1]);
      const cells = row.replace(/^ W\d+\s+/, '').split(/\s{2,}/);
      const card = (cell: string) => CARD_BY_WORD[cell.replace(/ \(.*\)$/, '')] ?? null;
      expect(card(cells[0]!), `W${week} skill`).toBe(MEMORY_CYCLE[week]!.skill);
      expect(card(cells[1]!), `W${week} chain`).toBe(MEMORY_CYCLE[week]!.chain);
      expect(/video/.test(cells[2] ?? ''), `W${week} video`).toBe(MEMORY_CYCLE[week]!.video);
      expect(/M4/.test(cells[2] ?? ''), `W${week} M4`).toBe(MEMORY_CYCLE[week]!.m4);
    }
  });
});

// ---------- 2. which card in which session ----------

describe('CR-018 — weeks 5-10 carry one memory block per police session with the right card; week 11 PLAN; weeks 3-4 unchanged', () => {
  it('weeks 5 to 10: the skill and the chain session each carry exactly one memory block, the cycle’s card', () => {
    for (let n = 5; n <= 10; n += 1) {
      for (const [kind, card] of [['skill_session', MEMORY_CYCLE[n]!.skill], ['chain_session', MEMORY_CYCLE[n]!.chain]] as const) {
        const recipe = recipeOf(weekNo(n), kind)!;
        expect(memoryBlocks(recipe), `week ${n} ${kind}`).toHaveLength(1);
        expect(memoryBlockOf(recipe)!.game!.card, `week ${n} ${kind}`).toBe(card);
        expect(memoryBlockOf(recipe)!.drills!.map((drill) => [drill.measure, drill.drillId]), `week ${n} ${kind}`).toEqual([['memory_card', `memory:${card}`]]);
      }
    }
  });

  it('week 11: the taper session carries PLAN, and there is no chain session', () => {
    const week = weekNo(11);
    expect(policeOf(week).map((session) => session.kind)).toEqual(['skill_session']);
    const taper = recipeOf(week, 'skill_session')!;
    expect(memoryBlocks(taper)).toHaveLength(1);
    expect(memoryBlockOf(taper)!.game!.card).toBe('plan');
  });

  it('the block reads "Mémoire · <card>" and names the card in one line', () => {
    const skill = recipeOf(weekNo(6), 'skill_session')!;
    const block = blockOfKind(skill, 'memory')!;
    expect(block.title).toBe('Mémoire · QUI MANQUE ? — 4 min');
    expect(block.faire).toBe('QUI MANQUE ? · 10 postes affichés, trouve l’absent.');
    expect(blockOfKind(recipeOf(weekNo(6), 'chain_session')!, 'memory')!.title).toBe('Mémoire · RÈGLES — 4 min');
  });

  it('weeks 3 and 4 are unchanged: their live memory blocks and the week 4 recall check', () => {
    expect(memoryBlocks(recipeOf(weekNo(3), 'skill_session')!).map((block) => block.title)).toEqual(['Mémoire — 6 min']);
    expect(memoryBlocks(recipeOf(weekNo(3), 'chain_session')!).map((block) => block.title)).toEqual(['Mémoire — 4 min']);
    const skill4 = recipeOf(weekNo(4), 'skill_session')!;
    expect(memoryBlocks(skill4).map((block) => block.title)).toEqual(['Mémoire, M1 — 6 min']);
    expect(memoryBlockOf(skill4)!.drills!.map((drill) => drill.measure)).toEqual(['recall_errors']);
    expect(memoryBlocks(recipeOf(weekNo(4), 'chain_session')!).map((block) => block.title)).toEqual(['Mémoire, M1 — 4 min']);
    for (const n of [3, 4]) for (const session of policeOf(weekNo(n))) expect(memoryBlockOf(recipeById[session.recipeId]!)!.game).toBeUndefined();
  });

  it('every generated week still validates, and a wrong card is flagged (R-MM-03)', () => {
    for (let n = 3; n <= 11; n += 1) expect(validateWeek(weekNo(n)), `week ${n}`).toEqual([]);
    const recipe = recipeOf(weekNo(6), 'chain_session')!;
    const original = recipe.blocks;
    try {
      recipe.blocks = original.map((block) => (block.spec?.kind === 'memory' ? { ...block, spec: { ...block.spec, game: { card: 'plan' as const, m4: false } } } : block));
      expect(validateV4PoliceSessions(weekNo(6)).some((error) => error.includes('R-MM-03'))).toBe(true);
    } finally {
      recipe.blocks = original;
    }
  });
});

// ---------- 3. the video line ----------

describe('CR-018 — the video line: first police session of weeks 5, 7, 9, 11 only, also after a day move', () => {
  it('in the first police session of the odd weeks, nowhere else', () => {
    for (let n = 3; n <= 11; n += 1) {
      const week = weekNo(n);
      policeOf(week).forEach((session, index) => {
        const recipe = withMemoryVideo(recipeById[session.recipeId]!, session.id, weeks);
        expect(hasVideo(recipe), `week ${n} ${session.kind}`).toBe([5, 7, 9, 11].includes(n) && index === 0);
      });
    }
  });

  it('follows whichever shape comes first once a session is moved', () => {
    const skill = policeOf(weekNo(5)).find((session) => session.kind === 'skill_session')!;
    const chain = policeOf(weekNo(5)).find((session) => session.kind === 'chain_session')!;
    expect(skill.date < chain.date).toBe(true);
    // The skill session moved to the day after the chain session.
    const moved = planWithMoves({}, withMove([], skill.id, '2026-10-09'));
    const week = weekIn(moved, 5);
    expect(policeOf(week).map((session) => session.kind)).toEqual(['chain_session', 'skill_session']);
    expect(hasVideo(withMemoryVideo(recipeById[chain.recipeId]!, chain.id, moved))).toBe(true);
    expect(hasVideo(withMemoryVideo(recipeById[skill.recipeId]!, skill.id, moved))).toBe(false);
  });

  it('is a reminder only: the words of R-MM-05 and nothing to record', () => {
    expect(MEMORY_VIDEO_LINE).toBe('Regarde la vidéo officielle en entier (3 min 49)');
    const session = policeOf(weekNo(5))[0]!;
    const recipe = withMemoryVideo(recipeById[session.recipeId]!, session.id, weeks);
    expect(memoryBlockOf(recipe)!.drills!.map((drill) => drill.measure)).toEqual(['memory_card']);
    // The shared recipe itself is never written to.
    expect(hasVideo(recipeById[session.recipeId]!)).toBe(false);
  });
});

// ---------- 4. M4 and the length ----------

describe('CR-018 — the M4 line in weeks 9-11 only; the block lasts 4 or 10 min, never above 12', () => {
  it('M4 rides with the card in weeks 9 to 11, and only there', () => {
    for (let n = 5; n <= 11; n += 1) {
      for (const session of policeOf(weekNo(n))) {
        const recipe = recipeById[session.recipeId]!;
        const m4 = n >= 9;
        expect(memoryBlockOf(recipe)!.game!.m4, `week ${n} ${session.kind}`).toBe(m4);
        expect(memoryModulesOf(recipe), `week ${n} ${session.kind}`).toEqual(m4 ? ['M4'] : []);
        expect(minutesOf(blockOfKind(recipe, 'memory')!), `week ${n} ${session.kind}`).toBe(m4 ? 10 : 4);
        expect(minutesOf(blockOfKind(recipe, 'memory')!)).toBeLessThanOrEqual(MEMORY_BLOCK_MAX_MIN);
      }
    }
    expect(MEMORY_M4_LINE).toBe('Visualisation yeux fermés · 6 min · tout le parcours, sans aide');
  });

  it('the session screen shows the card line, then the video line, then M4, and a Jouer button', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-04T12:00:00Z'));
    render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    const card = (await screen.findAllByText('Séance compétence')).map((node) => node.closest('button.card')).find(Boolean) as HTMLButtonElement;
    fireEvent.click(card);
    await screen.findByText('Ton programme');
    const step = Array.from(document.querySelectorAll('.steps li')).find((li) => li.textContent?.includes('Mémoire · PLAN — 10 min'))!;
    expect(Array.from(step.querySelectorAll('.do')).map((node) => node.textContent)).toEqual([
      'PLAN DU PARCOURS · Replace les 11 postes dans la salle.', MEMORY_VIDEO_LINE, MEMORY_M4_LINE
    ]);
    expect(step.querySelector('button.play')!.textContent).toBe('Jouer');
  });
});

// ---------- 5. PLAN ----------

describe('CR-018 — PLAN: snapping, displacement, back to the tray, check colours and score, on the floor plan', () => {
  it('the box centres are the floor plan’s, and a box that would cross the border is shifted inside (s5)', () => {
    const inside = (value: number, size: number) => Math.min(Math.max(value, 31), size - 31);
    for (const station of GAME_STATIONS) {
      const centre = CENTRES[station.id];
      expect(centre.x, station.id).toBeCloseTo(inside(FLOOR_PLAN[station.id].nx * ROOM.width, ROOM.width), 6);
      expect(centre.y, station.id).toBeCloseTo(inside(FLOOR_PLAN[station.id].ny * ROOM.height, ROOM.height), 6);
      // Every box ends up within half a box of its floor-plan point, so the
      // positions stay the canonical ones (R-FP-01).
      expect(Math.hypot(centre.x - FLOOR_PLAN[station.id].nx * ROOM.width, centre.y - FLOOR_PLAN[station.id].ny * ROOM.height), station.id).toBeLessThan(31);
    }
    // s5 is the one the assets file names: 9 px past the right wall, shifted in.
    expect(FLOOR_PLAN.s5.nx * ROOM.width + 31).toBeGreaterThan(ROOM.width);
    expect(CENTRES.s5.x).toBe(ROOM.width - 31);
  });

  it('snaps within about 42 px of a box centre, and not beyond', () => {
    expect(snapBox({ x: CENTRES.s4.x + 42, y: CENTRES.s4.y }, CENTRES)).toBe('s4');
    expect(snapBox({ x: CENTRES.s4.x + 30, y: CENTRES.s4.y + 29 }, CENTRES)).toBe('s4');
    expect(snapBox({ x: CENTRES.s4.x + 43, y: CENTRES.s4.y }, CENTRES)).toBeNull();
  });

  it('placing, displacing and returning, as pure moves', () => {
    let placement: Placement<StationId> = placeTile<StationId>({}, 's4', 's4');
    placement = placeTile(placement, 's2', 's4');
    expect(placement).toEqual({ s4: 's2' });
    placement = placeTile(placement, 's2', 's2');
    expect(placement).toEqual({ s2: 's2' });
    expect(returnToTray(placement, 's2')).toEqual({});
    const all = Object.fromEntries(GAME_STATIONS.map((station) => [station.id, station.id]));
    expect(scorePlan(all)).toBe(11);
    expect(checkPlan({ s1: 's1', s2: 's3' })).toEqual({ s1: true, s2: false });
  });

  it('on screen: drag into a box, displace, drop elsewhere, drag again, then Vérifier', () => {
    mockGeometry();
    const onFinish = vi.fn();
    const { container } = render(createElement(PlanGame, { onBack: () => undefined, onFinish }));
    expect(trayTiles(container, '.tray')).toEqual([...TRAY_ORDER]);
    expect(container.querySelector('.gameBar')!.textContent).toContain('0 / 11 posés');

    // Dropped 28 px from Mannequin's box centre: it snaps in.
    dragTile(tileIn(container, 's4'), { x: 20, y: TRAY_Y + 20 }, { x: CENTRES.s4.x + 20, y: CENTRES.s4.y + 20 });
    expect(container.querySelector('[data-box="s4"] [data-tile="s4"]')).not.toBeNull();
    expect(container.querySelector('.gameBar')!.textContent).toContain('1 / 11 posés');

    // Obstacle dropped on that box: Mannequin goes back to the tray.
    dragTile(tileIn(container, 's2'), { x: 20, y: TRAY_Y + 20 }, CENTRES.s4);
    expect(container.querySelector('[data-box="s4"] [data-tile="s2"]')).not.toBeNull();
    expect(trayTiles(container, '.tray')).toContain('s4');

    // Dropped far from every box: back to the tray.
    dragTile(tileIn(container, 's1'), { x: 20, y: TRAY_Y + 20 }, { x: 180, y: 520 });
    expect(trayTiles(container, '.tray')).toContain('s1');

    // A placed tile can be dragged again: Obstacle to its own box.
    dragTile(tileIn(container, 's2'), CENTRES.s4, CENTRES.s2);
    expect(container.querySelector('[data-box="s2"] [data-tile="s2"]')).not.toBeNull();
    expect(container.querySelector('[data-box="s4"] [data-tile]')).toBeNull();

    // Slalom into Mannequin's box (wrong), Mannequin into its own (right).
    dragTile(tileIn(container, 's1'), { x: 20, y: TRAY_Y + 20 }, CENTRES.s3);
    dragTile(tileIn(container, 's4'), { x: 20, y: TRAY_Y + 20 }, CENTRES.s4);
    fireEvent.click(screen.getByText('Vérifier'));
    expect(container.querySelector('[data-box="s2"]')!.className).toContain('ok');
    expect(container.querySelector('[data-box="s4"]')!.className).toContain('ok');
    expect(container.querySelector('[data-box="s3"]')!.className).toContain('ko');
    expect(container.querySelector('[data-box="s3"] [data-tile="s1"]')!.className).toContain('ko');
    expect(container.querySelector('[data-box="s5"]')!.className).not.toMatch(/\b(ok|ko)\b/);
    expect(container.querySelector('.gameBar')!.textContent).toContain('Score : 2 / 11');
    expect(onFinish).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByText('Recommencer'));
    expect(trayTiles(container, '.tray')).toEqual([...TRAY_ORDER]);
  });
});

// ---------- 6. ORDRE ----------

describe('CR-018 — ORDRE: drag onto a line, tap to the next free line, check colours and score', () => {
  it('pure: next free line and score', () => {
    expect(nextFreeLine({})).toBe(1);
    expect(nextFreeLine({ 1: 's1', 2: 's5' })).toBe(3);
    expect(scoreOrder({ 1: 's1', 2: 's5', 3: 's3' })).toBe(2);
  });

  it('on screen', () => {
    mockGeometry();
    const onFinish = vi.fn();
    const { container } = render(createElement(OrderGame, { onBack: () => undefined, onFinish }));
    expect(container.querySelectorAll('[data-line]')).toHaveLength(11);
    expect(trayTiles(container, '.oTray')).toEqual([...TRAY_ORDER]);

    // Drag Sac à la corde onto line 7.
    dragTile(tileIn(container, 's7'), { x: 20, y: TRAY_Y + 20 }, { x: 100, y: LINE_TOP(7) + 20 });
    expect(container.querySelector('[data-line="7"] [data-tile="s7"]')).not.toBeNull();

    // A quick tap (moved < 6 px): Obstacle to the next free line, 1; then Corde à sauter to 2.
    dragTile(tileIn(container, 's2'), { x: 20, y: TRAY_Y + 20 }, { x: 23, y: TRAY_Y + 22 });
    expect(container.querySelector('[data-line="1"] [data-tile="s2"]')).not.toBeNull();
    dragTile(tileIn(container, 's10'), { x: 20, y: TRAY_Y + 20 }, { x: 20, y: TRAY_Y + 20 });
    expect(container.querySelector('[data-line="2"] [data-tile="s10"]')).not.toBeNull();

    // Slalom dragged onto line 1: Obstacle goes back to the tray.
    dragTile(tileIn(container, 's1'), { x: 20, y: TRAY_Y + 20 }, { x: 100, y: LINE_TOP(1) + 10 });
    expect(container.querySelector('[data-line="1"] [data-tile="s1"]')).not.toBeNull();
    expect(trayTiles(container, '.oTray')).toContain('s2');
    expect(container.querySelector('.gameBar')!.textContent).toContain('3 / 11 placés');

    fireEvent.click(screen.getByText('Vérifier'));
    expect(container.querySelector('[data-line="1"]')!.className).toContain('ok');
    expect(container.querySelector('[data-line="7"]')!.className).toContain('ok');
    expect(container.querySelector('[data-line="2"]')!.className).toContain('ko');
    expect(container.querySelector('[data-line="3"]')!.className).not.toMatch(/\b(ok|ko)\b/);
    expect(container.querySelector('.gameBar')!.textContent).toContain('Score : 2 / 11');
    expect(onFinish).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByText('Vider'));
    expect(trayTiles(container, '.oTray')).toEqual([...TRAY_ORDER]);
  });
});

// ---------- 7. QUI MANQUE ----------

describe('CR-018 — QUI MANQUE: the 3 rounds, choices and explanations exactly as in the assets file; score / 3', () => {
  it('plays the three rounds', () => {
    const onFinish = vi.fn();
    const { container } = render(createElement(MissingGame, { onBack: () => undefined, onFinish }));
    const picks: StationId[] = ['s5', 's9', 's3']; // wrong, right, right
    MISSING_ROUNDS.forEach((round, index) => {
      const missing = GAME_STATIONS.find((station) => station.id === round.missing)!;
      expect(container.querySelector('.gRound')!.textContent).toBe(`Manche ${index + 1} / 3`);
      // 11 places in order, the gap shown as "?".
      const items = Array.from(container.querySelectorAll('.mItem'));
      expect(items.map((item) => item.querySelector('.mn')!.textContent)).toEqual(GAME_STATIONS.map((station) => String(station.number)));
      expect(items.filter((item) => item.classList.contains('gap')).map((item) => item.textContent)).toEqual([`${missing.number}?`]);
      expect(screen.getByText(`Quel poste manque à la place ${missing.number} ?`)).toBeTruthy();
      const choices = Array.from(container.querySelectorAll('.choice'));
      expect(choices.map((choice) => LABEL_TO_ID[choice.textContent!])).toEqual(round.choices);

      fireEvent.click(choices.find((choice) => LABEL_TO_ID[choice.textContent!] === picks[index])!);
      const right = picks[index] === round.missing;
      expect(container.querySelector('.verdict')!.textContent).toBe(right ? 'Juste.' : `Pas tout à fait : c'est ${missing.label}.`);
      expect(container.querySelector('.why')!.textContent).toBe(round.explanation);
      expect(Array.from(container.querySelectorAll('.choice.ok')).map((choice) => choice.textContent)).toEqual([missing.label]);
      expect(container.querySelectorAll('.choice.ko')).toHaveLength(right ? 0 : 1);
      expect(container.querySelector('.mItem.gap')!.textContent).toBe(`${missing.number}${missing.label}`);
      fireEvent.click(screen.getByText(index < 2 ? 'Manche suivante' : 'Voir le score'));
    });
    expect(container.querySelector('.gScore')!.textContent).toBe('2 / 3');
    expect(onFinish).toHaveBeenCalledWith(2);
    expect(scoreMissing(['s6', 's9', 's3'])).toBe(MEMORY_CARD_MAX.missing);
  });
});

// ---------- 8. RÈGLES ----------

describe('CR-018 — RÈGLES: the 10 pictures in order, answers and explanations exactly as in the assets file; score / 10', () => {
  it('plays the ten pictures', () => {
    const onFinish = vi.fn();
    const { container } = render(createElement(RulesGame, { onBack: () => undefined, onFinish }));
    RULES_PICTURES.forEach((picture, index) => {
      expect(container.querySelectorAll('.dots i')).toHaveLength(10);
      expect(container.querySelectorAll('.dots i.on')).toHaveLength(index + 1);
      expect(container.querySelector('.rStation')!.textContent).toBe(`${picture.station}${picture.label}`);
      expect(container.querySelector('.rFrame')!.innerHTML).toBe(picture.svg);
      // Always "Correct": right exactly when the picture is correct.
      fireEvent.click(screen.getByText('Correct'));
      expect(container.querySelector('.rFrame')!.className).toContain(picture.answer === 'correct' ? 'ok' : 'ko');
      expect(container.querySelector('.verdict')!.textContent).toBe(picture.answer === 'correct' ? 'Juste.' : "C'était faux.");
      expect(container.querySelector('.why')!.textContent).toBe(picture.explanation);
      fireEvent.click(screen.getByText(index < 9 ? 'Image suivante' : 'Voir le score'));
    });
    const correct = RULES_PICTURES.filter((picture) => picture.answer === 'correct').length;
    expect(container.querySelector('.gScore')!.textContent).toBe(`${correct} / 10`);
    expect(onFinish).toHaveBeenCalledWith(correct);
    fireEvent.click(screen.getByText('Rejouer'));
    expect(container.querySelector('.rStation')!.textContent).toBe('1Slalom');
  });

  it('the three feedback lines, word for word', () => {
    expect(rulesFeedback('correct', 'correct')).toBe('Juste.');
    expect(rulesFeedback('faux', 'correct')).toBe("C'était correct.");
    expect(rulesFeedback('correct', 'faux')).toBe("C'était faux.");
    expect(scoreRules(RULES_PICTURES.map((picture) => picture.answer))).toBe(10);
  });
});

// ---------- 9. recording ----------

function storedState() {
  const raw = localStorage.getItem('coach-concours-state-v2');
  return raw ? JSON.parse(raw).state : null;
}

describe('CR-018 — a game opened from a session writes memory_card into its draft; from the home it records nothing', () => {
  it('pure: a new draft, or the existing record with its score replaced', () => {
    const fresh = withMemoryCardScore({}, 'a', 'plan', 7, 'T');
    expect(fresh.a).toEqual({ sessionId: 'a', status: 'draft', note: '', completedAt: 'T', drillScores: [{ drillId: 'memory:plan', measure: 'memory_card', value: 7, card: 'plan', max: 11 }] });
    const done = withMemoryCardScore({ a: { sessionId: 'a', status: 'done', effort: 3, note: 'ok', completedAt: 'S', drillScores: [{ drillId: 'x', measure: 'drops', value: 2 }, { drillId: 'memory:plan', measure: 'memory_card', value: 1, card: 'plan', max: 11 }] } }, 'a', 'plan', 9, 'T');
    expect(done.a!.status).toBe('done');
    expect(done.a!.effort).toBe(3);
    expect(done.a!.drillScores).toEqual([{ drillId: 'x', measure: 'drops', value: 2 }, { drillId: 'memory:plan', measure: 'memory_card', value: 9, card: 'plan', max: 11 }]);
  });

  it('from the session: Jouer, Vérifier, and the score is in Retour, still editable', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-07T12:00:00Z'));
    render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    const card = (await screen.findAllByText('Séance compétence')).map((node) => node.closest('button.card')).find(Boolean) as HTMLButtonElement;
    fireEvent.click(card);
    await screen.findByText('Ton programme');
    fireEvent.click(screen.getByRole('button', { name: 'Jouer' }));
    expect(await screen.findByText('Pose chaque poste où il est dans la salle.')).toBeTruthy();
    fireEvent.click(screen.getByText('Vérifier'));
    expect(screen.getByText('Score noté dans le retour de séance.')).toBeTruthy();

    const state = storedState();
    const result = state.results['2026-10-07:skill_session'];
    expect(result.status).toBe('draft');
    expect(result.drillScores).toEqual([{ drillId: 'memory:plan', measure: 'memory_card', value: 0, card: 'plan', max: 11 }]);

    fireEvent.click(screen.getByLabelText('Retour'));
    await screen.findByText('Ton programme');
    fireEvent.click(screen.getByText('Retour'));
    const box = await screen.findByLabelText('PLAN · cases justes sur 11') as HTMLInputElement;
    expect(box.value).toBe('0');
    fireEvent.change(box, { target: { value: '6' } });
    expect(box.value).toBe('6');
  });

  it('from the MÉMOIRE home: free play, nothing written', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-07T12:00:00Z'));
    render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    fireEvent.click(screen.getByLabelText('Mémoire'));
    expect(await screen.findByText('Mémoire du parcours')).toBeTruthy();
    expect(screen.getByText('Semaine 5')).toBeTruthy();
    // The four cards, and not the two later ones.
    expect(Array.from(document.querySelectorAll('.memCard')).map((node) => (node as HTMLElement).dataset.card)).toEqual(['plan', 'order', 'missing', 'rules']);
    expect(screen.queryByText(/SUITE|DÉROULER/)).toBeNull();
    fireEvent.click(document.querySelector('[data-card="plan"]')!);
    fireEvent.click(screen.getByText('Vérifier'));
    expect(screen.queryByText('Score noté dans le retour de séance.')).toBeNull();
    const state = storedState();
    expect(state === null || Object.keys(state.results).length === 0).toBe(true);
    fireEvent.click(screen.getByLabelText('Retour'));
    expect(await screen.findByText('Mémoire du parcours')).toBeTruthy();
  });

  it('the home puts first the next card due this week', () => {
    const week5 = weekNo(5);
    const skill = policeOf(week5).find((session) => session.kind === 'skill_session')!;
    expect(featuredCard(weeks, {}, '2026-10-06')).toBe('plan');
    expect(featuredCard(weeks, withMemoryCardScore({}, skill.id, 'plan', 5), '2026-10-08')).toBe('order');
    expect(featuredCard(weeks, {}, '2026-10-13')).toBe('missing');
    expect(featuredCard(weeks, {}, '2026-09-30')).toBe('plan');
  });
});

// ---------- 10. no explaining, no prediction, no timer ----------

describe('CR-018 — no game text explains the circuit (R-MM-02); nothing predicts a time; no timer anywhere', () => {
  it('the four games ask to place, order, recognise or judge, and show no clock', () => {
    for (const game of [PlanGame, OrderGame, MissingGame, RulesGame]) {
      const { container, unmount } = render(createElement(game, { onBack: () => undefined, onFinish: () => undefined }));
      const text = container.textContent ?? '';
      expect(text).not.toMatch(/expliqu|pourquoi/i);
      expect(text).not.toMatch(/\d+:\d\d|chrono|temps|seconde|prédi/i);
      unmount();
    }
  });

  it('the game screens use no timer of any kind', () => {
    const source = read('src/MemoryGame.tsx');
    expect(source).not.toMatch(/setInterval|setTimeout|requestAnimationFrame|performance\.now|Date\b/);
  });
});
