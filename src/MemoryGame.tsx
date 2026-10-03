// CHANGE_REQUEST_018 section A — the memory game's five screens, drawn from
// handoffs/MOCKUP_CR018.pdf: the MÉMOIRE home and the four cards PLAN, ORDRE,
// QUI MANQUE and RÈGLES. Every rule of play lives in `coach/memoryGame.ts`;
// this file only turns a finger (or a mouse) into those calls.
//
// No timer, no clock, no sound, no streak, and no animation beyond the drag
// itself. Every game starts fresh: nothing inside a game is saved. Whether a
// finished score is recorded is the caller's decision (`onFinish`), never the
// game's.
import { useEffect, useRef, useState } from 'react';
import { MEMORY_CARD_HOME, MEMORY_CARD_LABEL, MEMORY_CARD_MAX, MEMORY_CARDS, type MemoryCard } from './coach/memoryCycle';
import {
  checkOrder,
  checkPlan,
  nextFreeLine,
  ORDER_LINES,
  placedCount,
  placeTile,
  returnToTray,
  rulesFeedback,
  scoreMissing,
  scoreOrder,
  scorePlan,
  scoreRules,
  slotOf,
  snapBox,
  STATION_BY_ID,
  TAP_MAX_MOVE_PX,
  type Placement
} from './coach/memoryGame';
import { DOOR_AND_ATHLETE, FLOOR_PLAN, GAME_STATIONS, MISSING_ROUNDS, RULES_PICTURES, TRAY_ORDER, type StationId } from './coach/memoryGameAssets';

// ---------- shared pieces ----------

/** A station pictogram: the assets file's one path, stroke only, accent. */
export function Pictogram({ path, size = 24 }: { path: string; size?: number }) {
  return <svg className="picto" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>;
}

function GameHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return <div className="snav"><button className="back" type="button" onClick={onBack} aria-label="Retour">‹</button><h3>{title}</h3></div>;
}

function TileFace({ id }: { id: StationId }) {
  const station = STATION_BY_ID[id];
  return <><Pictogram path={station.pictogram} /><span className="tl">{station.label}</span></>;
}

interface DragState { tile: StationId; x: number; y: number; dx: number; dy: number; width: number; height: number; }

/**
 * Pointer events, so a finger and a mouse both drag. The move and release
 * listeners sit on the document, so a finger that leaves the tile still
 * drives it; the tile follows the finger as a fixed copy while the original
 * stays dimmed in place. `onDrop` gets the release point and how far the
 * pointer travelled, which is how ORDRE tells a tap from a drag.
 */
function useTileDrag(areaRef: { current: HTMLDivElement | null }, enabled: boolean, onDrop: (tile: StationId, point: { x: number; y: number }, moved: number) => void): DragState | null {
  const [drag, setDrag] = useState<DragState | null>(null);
  const dropRef = useRef(onDrop);
  dropRef.current = onDrop;

  useEffect(() => {
    const area = areaRef.current;
    if (!enabled || !area) return;
    let active: { tile: StationId; startX: number; startY: number; moved: number } | null = null;
    const travelled = (event: PointerEvent) => (active ? Math.hypot(event.clientX - active.startX, event.clientY - active.startY) : 0);

    const down = (event: PointerEvent) => {
      const handle = (event.target as HTMLElement | null)?.closest?.('[data-tile]') as HTMLElement | null;
      if (!handle || !area.contains(handle)) return;
      event.preventDefault();
      const tile = handle.dataset.tile as StationId;
      const rect = handle.getBoundingClientRect();
      active = { tile, startX: event.clientX, startY: event.clientY, moved: 0 };
      setDrag({ tile, x: event.clientX, y: event.clientY, dx: event.clientX - rect.left, dy: event.clientY - rect.top, width: rect.width, height: rect.height });
    };
    const move = (event: PointerEvent) => {
      if (!active) return;
      event.preventDefault();
      active.moved = Math.max(active.moved, travelled(event));
      setDrag((current) => current && { ...current, x: event.clientX, y: event.clientY });
    };
    const up = (event: PointerEvent) => {
      if (!active) return;
      const tile = active.tile;
      const moved = Math.max(active.moved, travelled(event));
      active = null;
      setDrag(null);
      dropRef.current(tile, { x: event.clientX, y: event.clientY }, moved);
    };
    const cancel = () => { active = null; setDrag(null); };

    area.addEventListener('pointerdown', down);
    document.addEventListener('pointermove', move, { passive: false });
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', cancel);
    return () => {
      area.removeEventListener('pointerdown', down);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', cancel);
      setDrag(null);
    };
  }, [enabled, areaRef]);

  return drag;
}

function FloatingTile({ drag, className }: { drag: DragState | null; className: string }) {
  if (!drag) return null;
  return <div className={`${className} floating`} style={{ left: drag.x - drag.dx, top: drag.y - drag.dy, width: drag.width, height: drag.height }} aria-hidden="true"><TileFace id={drag.tile} /></div>;
}

function centreOf(element: Element): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function contains(element: Element, point: { x: number; y: number }): boolean {
  const rect = element.getBoundingClientRect();
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}

function GameEnd({ score, max, note, onReplay }: { score: number; max: number; note?: string; onReplay: () => void }) {
  return <div className="gEnd">
    <p className="eyebrow">Score</p>
    <p className="gScore"><b>{score}</b> / {max}</p>
    {note && <p className="gNote">{note}</p>}
    <button className="primary" type="button" onClick={onReplay}>Rejouer</button>
  </div>;
}

export interface GameProps {
  onBack: () => void;
  /** Called with the score when a game ends. Recording it is the caller's call. */
  onFinish: (score: number) => void;
  /** A line shown under the score, e.g. that it went into the session's Retour. */
  note?: string;
}

// ---------- 0. MÉMOIRE, the home of the game ----------

const CARD_ICON: Readonly<Record<MemoryCard, string>> = {
  plan: 'M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M9 10h.01M15 10h.01M9 14h6',
  order: 'M10 6h10M10 12h10M10 18h10M4 5l1.5-1v4M3.6 11.2a1.3 1.3 0 0 1 2.3.6c0 .9-2.2 1.6-2.2 2.2h2.3M3.8 16.6h1.6l-.9 1.2a1.1 1.1 0 1 1-.9 1.8',
  missing: 'M3 5h4v4H3zM10 5h4v4h-4zM17 5h4v4h-4zM10.4 14.2a1.6 1.6 0 1 1 2.2 1.5c-.4.2-.6.5-.6 1v.4M12 20h.01',
  rules: 'M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18zM8 12.5l2.6 2.6L16 9.7'
};

function HomeCard({ card, featured, onPlay }: { card: MemoryCard; featured?: boolean; onPlay: (card: MemoryCard) => void }) {
  return <button type="button" className={`memCard${featured ? ' featured' : ''}`} onClick={() => onPlay(card)} data-card={card}>
    <span className="mi"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={CARD_ICON[card]} /></svg></span>
    <span className="mt"><b>{MEMORY_CARD_HOME[card].title}</b><small>{MEMORY_CARD_HOME[card].line}</small></span>
  </button>;
}

/**
 * The four cards: the one due next on top, the three others under JOUER.
 * SUITE and DÉROULER (greyed in the mockup) are not built (CR section A).
 */
export function MemoryHome({ weekNumber, featured, onPlay }: { weekNumber: number | null; featured: MemoryCard; onPlay: (card: MemoryCard) => void }) {
  return <section className="page memHome">
    {weekNumber !== null && <p className="eyebrow">Semaine {weekNumber}</p>}
    <h1>Mémoire du parcours</h1>
    <HomeCard card={featured} featured onPlay={onPlay} />
    <p className="memLabel">Jouer</p>
    {MEMORY_CARDS.filter((card) => card !== featured).map((card) => <HomeCard key={card} card={card} onPlay={onPlay} />)}
    <p className="memFoot">Pas de chrono.</p>
  </section>;
}

// ---------- 1. PLAN ----------

function DoorAndAthlete() {
  // The door and a small athlete figure, bottom left, at the floor plan's
  // "door + athlete" point.
  return <svg className="door" width="64" height="62" viewBox="0 0 64 62" fill="none" stroke="var(--mid)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    style={{ left: `calc(${DOOR_AND_ATHLETE.nx * 100}% - 28px)`, top: `calc(${DOOR_AND_ATHLETE.ny * 100}% - 46px)` }}>
    <path d="M38 22v38" />
    <path d="M4 60c0-14 8-24 20-30" strokeDasharray="3 4" />
    <circle cx="25" cy="8" r="5" />
    <path d="M25 13v14M17 19l8 3 8-3M25 27l-6 9M25 27l6 9" />
  </svg>;
}

export function PlanGame({ onBack, onFinish, note }: GameProps) {
  const [placement, setPlacement] = useState<Placement<StationId>>({});
  const [checked, setChecked] = useState(false);
  const areaRef = useRef<HTMLDivElement | null>(null);
  const drag = useTileDrag(areaRef, !checked, (tile, point) => {
    const centres: Partial<Record<StationId, { x: number; y: number }>> = {};
    areaRef.current?.querySelectorAll<HTMLElement>('[data-box]').forEach((box) => { centres[box.dataset.box as StationId] = centreOf(box); });
    const box = snapBox(point, centres);
    setPlacement((current) => (box ? placeTile(current, tile, box) : returnToTray(current, tile)));
  });
  const verdict = checked ? checkPlan(placement) : {};
  const score = scorePlan(placement);
  const mark = (ok: boolean | undefined) => (ok === undefined ? '' : ok ? ' ok' : ' ko');

  const verify = () => { setChecked(true); onFinish(score); };
  const restart = () => { setPlacement({}); setChecked(false); };

  return <>
    <GameHeader title={MEMORY_CARD_LABEL.plan} onBack={onBack} />
    <p className="gIntro">Pose chaque poste où il est dans la salle.</p>
    <div className="gArea" ref={areaRef}>
      <div className="room" aria-label="Plan de la salle">
        {GAME_STATIONS.map(({ id }) => {
          const tile = placement[id];
          return <div key={id} className={`box${mark(verdict[id])}`} data-box={id}
            style={{ left: `clamp(0px, calc(${FLOOR_PLAN[id].nx * 100}% - 31px), calc(100% - 62px))`, top: `clamp(0px, calc(${FLOOR_PLAN[id].ny * 100}% - 31px), calc(100% - 62px))` }}>
            {tile && <div className={`gTile${mark(verdict[id])}${drag?.tile === tile ? ' lifted' : ''}`} data-tile={tile} aria-label={STATION_BY_ID[tile].label}><TileFace id={tile} /></div>}
          </div>;
        })}
        <DoorAndAthlete />
      </div>
      <p className="entry">▲ Entrée · Moi</p>
      <div className="tray">
        {TRAY_ORDER.map((id) => (slotOf(placement, id) === undefined
          ? <div key={id} className={`gTile${drag?.tile === id ? ' lifted' : ''}`} data-tile={id} aria-label={STATION_BY_ID[id].label}><TileFace id={id} /></div>
          : <div key={id} className="gTile empty" aria-hidden="true" />))}
      </div>
    </div>
    <FloatingTile drag={drag} className="gTile" />
    {checked && note && <p className="gNote">{note}</p>}
    <div className="gameBar">
      <span className="count">{checked ? <>Score : <b>{score}</b> / 11</> : <><b>{placedCount(placement)}</b> / 11 posés</>}</span>
      <button className="gBtn" type="button" onClick={restart}>Recommencer</button>
      <button className="gBtn go" type="button" onClick={verify} disabled={checked}>Vérifier</button>
    </div>
  </>;
}

// ---------- 2. ORDRE ----------

export function OrderGame({ onBack, onFinish, note }: GameProps) {
  const [placement, setPlacement] = useState<Placement<number>>({});
  const [checked, setChecked] = useState(false);
  const areaRef = useRef<HTMLDivElement | null>(null);
  const drag = useTileDrag(areaRef, !checked, (tile, point, moved) => {
    setPlacement((current) => {
      const from = slotOf(current, tile);
      // A quick tap (moved < 6 px) puts a tray tile on the next free line.
      if (moved < TAP_MAX_MOVE_PX) {
        if (from !== undefined) return current;
        const line = nextFreeLine(current);
        return line === null ? current : placeTile(current, tile, line);
      }
      const target = Array.from(areaRef.current?.querySelectorAll<HTMLElement>('[data-line]') ?? []).find((line) => contains(line, point));
      return target ? placeTile(current, tile, Number(target.dataset.line)) : returnToTray(current, tile);
    });
  });
  const verdict = checked ? checkOrder(placement) : {};
  const score = scoreOrder(placement);
  const mark = (ok: boolean | undefined) => (ok === undefined ? '' : ok ? ' ok' : ' ko');

  const verify = () => { setChecked(true); onFinish(score); };
  const empty = () => { setPlacement({}); setChecked(false); };

  return <>
    <GameHeader title={MEMORY_CARD_LABEL.order} onBack={onBack} />
    <p className="gIntro">Glisse chaque poste à sa place, de 1 à 11.</p>
    <div className="gArea" ref={areaRef}>
      <ol className="lines">
        {ORDER_LINES.map((line) => {
          const tile = placement[line];
          return <li key={line} className={`oLine${mark(verdict[line])}`} data-line={line}>
            <span className="ln">{line}</span>
            {tile && <div className={`oTile${mark(verdict[line])}${drag?.tile === tile ? ' lifted' : ''}`} data-tile={tile} aria-label={STATION_BY_ID[tile].label}><TileFace id={tile} /></div>}
          </li>;
        })}
      </ol>
      <div className="oTray">
        {TRAY_ORDER.map((id) => (slotOf(placement, id) === undefined
          ? <div key={id} className={`oTile${drag?.tile === id ? ' lifted' : ''}`} data-tile={id} aria-label={STATION_BY_ID[id].label}><TileFace id={id} /></div>
          : <div key={id} className="oTile empty" aria-hidden="true" />))}
      </div>
    </div>
    <FloatingTile drag={drag} className="oTile" />
    {checked && note && <p className="gNote">{note}</p>}
    <div className="gameBar">
      <span className="count">{checked ? <>Score : <b>{score}</b> / 11</> : <><b>{placedCount(placement)}</b> / 11 placés</>}</span>
      <button className="gBtn" type="button" onClick={empty}>Vider</button>
      <button className="gBtn go" type="button" onClick={verify} disabled={checked}>Vérifier</button>
    </div>
  </>;
}

// ---------- 3. QUI MANQUE ----------

export function MissingGame({ onBack, onFinish, note }: GameProps) {
  const [round, setRound] = useState(0);
  const [answers, setAnswers] = useState<StationId[]>([]);
  const [done, setDone] = useState(false);
  const current = MISSING_ROUNDS[round]!;
  const picked = answers[round];
  const missingNumber = STATION_BY_ID[current.missing].number;

  const pick = (id: StationId) => { if (picked === undefined) setAnswers((list) => [...list, id]); };
  const next = () => {
    if (round + 1 < MISSING_ROUNDS.length) { setRound(round + 1); return; }
    setDone(true);
    onFinish(scoreMissing(answers));
  };
  const replay = () => { setRound(0); setAnswers([]); setDone(false); };

  if (done) return <><GameHeader title={MEMORY_CARD_LABEL.missing} onBack={onBack} /><GameEnd score={scoreMissing(answers)} max={MEMORY_CARD_MAX.missing} note={note} onReplay={replay} /></>;

  return <>
    <GameHeader title={MEMORY_CARD_LABEL.missing} onBack={onBack} />
    <p className="gRound">Manche {round + 1} / {MISSING_ROUNDS.length}</p>
    <div className="mList">
      {GAME_STATIONS.map((station) => {
        const gap = station.id === current.missing;
        return <div key={station.id} className={`mItem${gap ? ' gap' : ''}${gap && picked !== undefined ? ' revealed' : ''}`}>
          <span className="mn">{station.number}</span>
          <span className="ml">{gap && picked === undefined ? '?' : station.label}</span>
        </div>;
      })}
    </div>
    <h2 className="gQuestion">Quel poste manque à la place {missingNumber} ?</h2>
    <div className="choices">
      {current.choices.map((id) => {
        const state = picked === undefined ? '' : id === current.missing ? ' ok' : id === picked ? ' ko' : '';
        return <button key={id} type="button" className={`choice${state}`} onClick={() => pick(id)} disabled={picked !== undefined}>{STATION_BY_ID[id].label}</button>;
      })}
    </div>
    {picked !== undefined && <div className="gFeedback">
      <p className="verdict">{picked === current.missing ? 'Juste.' : `Pas tout à fait : c'est ${STATION_BY_ID[current.missing].label}.`}</p>
      <p className="why">{current.explanation}</p>
      <button className="primary" type="button" onClick={next}>{round + 1 < MISSING_ROUNDS.length ? 'Manche suivante' : 'Voir le score'}</button>
    </div>}
  </>;
}

// ---------- 4. RÈGLES ----------

export function RulesGame({ onBack, onFinish, note }: GameProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<('correct' | 'faux')[]>([]);
  const [done, setDone] = useState(false);
  const picture = RULES_PICTURES[index]!;
  const answer = answers[index];

  const say = (value: 'correct' | 'faux') => { if (answer === undefined) setAnswers((list) => [...list, value]); };
  const next = () => {
    if (index + 1 < RULES_PICTURES.length) { setIndex(index + 1); return; }
    setDone(true);
    onFinish(scoreRules(answers));
  };
  const replay = () => { setIndex(0); setAnswers([]); setDone(false); };

  if (done) return <><GameHeader title={MEMORY_CARD_LABEL.rules} onBack={onBack} /><GameEnd score={scoreRules(answers)} max={MEMORY_CARD_MAX.rules} note={note} onReplay={replay} /></>;

  const right = answer !== undefined && answer === picture.answer;
  return <>
    <GameHeader title={MEMORY_CARD_LABEL.rules} onBack={onBack} />
    <div className="dots" aria-label={`Image ${index + 1} sur ${RULES_PICTURES.length}`}>
      {RULES_PICTURES.map((_, dot) => <i key={dot} className={dot <= index ? 'on' : ''} />)}
    </div>
    <p className="rStation"><span className="rn">{picture.station}</span>{picture.label}</p>
    {/* The picture is a fixed SVG copied from the assets file, as it is. */}
    <div className={`rFrame${answer === undefined ? '' : right ? ' ok' : ' ko'}`} dangerouslySetInnerHTML={{ __html: picture.svg }} />
    {answer === undefined
      ? <div className="rAnswers">
        <button type="button" className="rBtn yes" onClick={() => say('correct')}><span>✓</span>Correct</button>
        <button type="button" className="rBtn no" onClick={() => say('faux')}><span>✗</span>Faux</button>
      </div>
      : <div className="gFeedback">
        <p className="verdict">{rulesFeedback(answer, picture.answer)}</p>
        <p className="why">{picture.explanation}</p>
        <button className="primary" type="button" onClick={next}>{index + 1 < RULES_PICTURES.length ? 'Image suivante' : 'Voir le score'}</button>
      </div>}
  </>;
}

// ---------- one entry point ----------

export function MemoryGameScreen({ card, ...props }: GameProps & { card: MemoryCard }) {
  if (card === 'plan') return <PlanGame {...props} />;
  if (card === 'order') return <OrderGame {...props} />;
  if (card === 'missing') return <MissingGame {...props} />;
  return <RulesGame {...props} />;
}
