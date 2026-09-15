import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flowStrip, recipeById } from './coach/recipes';
import { generatePlan } from './coach/planner';
import type {
  CoachState,
  ExerciseBlock,
  LandingQuality,
  MovementQuality,
  PlannedSession,
  ResultStatus,
  SessionRecipe,
  SessionResult
} from './coach/types';
import { createDriveBackup, syncCoachState } from './infrastructure/coachDrive';
import { loadCoachState, parseCoachState, saveCoachState } from './infrastructure/coachStorage';
import { requestGoogleSession, revokeGoogleSession, type GoogleSession } from './infrastructure/googleIdentity';

type Tab = 'week' | 'journey' | 'drive';

// CHANGE_REQUEST_010 — the week/session/block drill-down replaces the old
// expand-in-place session card. Each screen is its own full view, matching
// handoffs/MOCKUP_CR010.html's three phone frames.
type Drill =
  | { screen: 'list' }
  | { screen: 'session'; sessionId: string; sessionTab: 'prevu' | 'fait' | 'retour'; focusBlock?: number }
  | { screen: 'block'; sessionId: string; blockIndex: number };

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
const AUTO_SYNC_DEBOUNCE_MS = 4_000;
const DRAFT_SAVE_DEBOUNCE_MS = 500;
// CHANGE_REQUEST_010 section B — weeks-left header. The police test date is
// the state's own `planEndDate`; the trail event date is the fixed race date
// already used elsewhere in the app (`recipes.trailEvent`, R-WS-06).
const TRAIL_EVENT_DATE = '2026-10-11';

export default function CoachConcoursApp() {
  const [state, setState] = useState<CoachState | null>(null);
  const [tab, setTabState] = useState<Tab>('week');
  const [weekIndex, setWeekIndex] = useState(0);
  const [drill, setDrill] = useState<Drill>({ screen: 'list' });
  const [session, setSession] = useState<GoogleSession | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const sessionRef = useRef<GoogleSession | null>(null);
  const autoSyncTimer = useRef<number | null>(null);
  sessionRef.current = session;

  const setTab = (next: Tab) => { setTabState(next); setDrill({ screen: 'list' }); };

  const runSync = useCallback(async (active: GoogleSession, current: CoachState) => {
    const result = await syncCoachState(active.accessToken, current, active.account.email);
    await saveCoachState(result.state);
    setState(result.state);
    return result.state;
  }, []);

  const scheduleAutoSync = useCallback(() => {
    if (!sessionRef.current) return;
    if (autoSyncTimer.current !== null) window.clearTimeout(autoSyncTimer.current);
    autoSyncTimer.current = window.setTimeout(() => {
      autoSyncTimer.current = null;
      const active = sessionRef.current;
      setState((current) => {
        if (active && current) {
          void runSync(active, current).catch((error: unknown) => {
            setState((latest) => latest && ({ ...latest, drive: { ...latest.drive, status: 'error', message: error instanceof Error ? error.message : 'Synchronisation Drive impossible.' } }));
          });
        }
        return current;
      });
    }, AUTO_SYNC_DEBOUNCE_MS);
  }, [runSync]);

  useEffect(() => {
    loadCoachState().then(async (loaded) => {
      setState(loaded);
      const today = new Date().toISOString().slice(0, 10);
      setWeekIndex(Math.max(0, loaded.weeks.findIndex((week) => today >= week.startDate && today <= week.endDate)));
      if (loaded.drive.wasConnected && GOOGLE_CLIENT_ID) {
        try {
          const active = await requestGoogleSession(GOOGLE_CLIENT_ID, { silent: true });
          setSession(active);
          await runSync(active, loaded);
        } catch {
          // No live Google session to resume silently: the athlete reconnects
          // manually from the Drive tab. Local data stays fully usable.
        }
      }
    }).catch((error: unknown) => setNotice(error instanceof Error ? error.message : 'Chargement impossible.'));
  }, [runSync]);

  useEffect(() => {
    const onOnline = () => {
      const active = sessionRef.current;
      setState((current) => {
        if (active && current && current.drive.status === 'pending') {
          void runSync(active, current).catch(() => undefined);
        }
        return current;
      });
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [runSync]);

  const mutate = (change: (current: CoachState) => CoachState, message?: string) => {
    setState((current) => {
      if (!current) return current;
      const changed = change(current);
      const next = { ...changed, revision: current.revision + 1, updatedAt: new Date().toISOString(), drive: { ...changed.drive, status: session ? 'pending' as const : 'local' as const } };
      void saveCoachState(next).catch(() => setNotice('La copie locale n’a pas pu être écrite.'));
      return next;
    });
    if (message) setNotice(message);
    scheduleAutoSync();
  };

  const persistResult = (planned: PlannedSession, result: Omit<SessionResult, 'sessionId' | 'completedAt'>, message?: string) => {
    mutate((current) => {
      const results = { ...current.results, [planned.id]: { ...result, sessionId: planned.id, completedAt: new Date().toISOString() } };
      return { ...current, results, weeks: generatePlan(results) };
    }, message);
  };

  const saveResult = (planned: PlannedSession, result: Omit<SessionResult, 'sessionId' | 'completedAt'>) =>
    persistResult(planned, result, 'Séance enregistrée. La copie Drive sera mise à jour à la prochaine synchronisation.');

  // CHANGE_REQUEST_010 section D — every keystroke in the Retour tab writes
  // through the same path as a validated save (so Drive sync picks it up),
  // silently: no notice banner for a draft.
  const saveDraft = (planned: PlannedSession, result: Omit<SessionResult, 'sessionId' | 'completedAt'>) => persistResult(planned, result);

  const removeResult = (planned: PlannedSession) => mutate((current) => {
    const results = { ...current.results };
    delete results[planned.id];
    return { ...current, results, weeks: generatePlan(results) };
  }, 'Validation retirée.');

  const connectAndSync = async () => {
    if (!state) return;
    setBusy(true); setNotice('');
    try {
      const active = session ?? await requestGoogleSession(GOOGLE_CLIENT_ID);
      setSession(active);
      await runSync(active, state);
      setNotice('État complet synchronisé dans Google Drive.');
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Synchronisation Drive impossible.';
      setNotice(detail);
      setState((current) => current && ({ ...current, drive: { ...current.drive, status: 'error', message: detail } }));
    }
    finally { setBusy(false); }
  };

  const backup = async () => {
    if (!state || !session) return;
    setBusy(true);
    try { await createDriveBackup(session.accessToken, state); setNotice('Sauvegarde horodatée créée dans Drive.'); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Sauvegarde impossible.'); }
    finally { setBusy(false); }
  };

  const disconnect = async () => {
    if (session) await revokeGoogleSession(session);
    setSession(null);
    if (state) {
      const next: CoachState = { ...state, drive: { ...state.drive, status: 'local', wasConnected: false, message: undefined } };
      setState(next);
      await saveCoachState(next);
    }
    setNotice('Session Google déconnectée. Les données locales restent disponibles.');
  };

  const exportData = () => {
    if (!state) return;
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `coach-concours-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice('Export JSON téléchargé.');
  };

  const importData = async (file: File) => {
    try {
      const parsed = parseCoachState(JSON.parse(await file.text()));
      await saveCoachState(parsed);
      setState(parsed);
      setNotice('Import réussi. Les données locales ont été remplacées.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Fichier d'import invalide.");
    }
  };

  if (!state) return <main className="shell loading"><p>Chargement du plan…</p>{notice && <p role="alert">{notice}</p>}</main>;

  const openSession = (planned: PlannedSession) => setDrill({ screen: 'session', sessionId: planned.id, sessionTab: 'prevu' });
  const found = drill.screen !== 'list' ? findPlanned(state, drill.sessionId) : null;

  return <main className="shell">
    {drill.screen === 'list' && <header className="topbar"><div className="brand"><span className="brandMark">C↗</span><span>COACH<br /><b>CONCOURS</b></span></div><span className={`syncDot syncDot--${state.drive.status}`}>{state.drive.status === 'synced' ? 'Drive à jour' : state.drive.status === 'pending' ? 'À synchroniser' : 'Copie locale'}</span></header>}

    {tab === 'week' && drill.screen === 'list' && <WeekScreen state={state} weekIndex={weekIndex} setWeekIndex={setWeekIndex} openSession={openSession} />}
    {tab === 'week' && drill.screen === 'session' && found && <SessionScreen state={state} planned={found} sessionTab={drill.sessionTab} focusBlock={drill.focusBlock}
      setTab={(sessionTab) => setDrill({ screen: 'session', sessionId: found.id, sessionTab })}
      openBlock={(blockIndex) => setDrill({ screen: 'block', sessionId: found.id, blockIndex })}
      back={() => setDrill({ screen: 'list' })}
      save={saveResult} saveDraft={saveDraft} remove={removeResult} />}
    {tab === 'week' && drill.screen === 'block' && found && <BlockScreen planned={found} blockIndex={drill.blockIndex}
      back={() => setDrill({ screen: 'session', sessionId: found.id, sessionTab: 'prevu' })}
      openRetour={() => setDrill({ screen: 'session', sessionId: found.id, sessionTab: 'retour', focusBlock: drill.blockIndex })} />}

    {tab === 'journey' && drill.screen === 'list' && <JourneyView state={state} />}
    {tab === 'drive' && drill.screen === 'list' && <DriveView state={state} session={session} busy={busy} sync={connectAndSync} backup={backup} disconnect={disconnect} exportData={exportData} importData={importData} />}

    {notice && <button className="notice" onClick={() => setNotice('')} type="button" aria-label="Fermer le message">{notice}<span>×</span></button>}
    {drill.screen === 'list' && <nav className="tabbar" aria-label="Navigation principale"><button className={tab === 'week' ? 'on' : ''} onClick={() => setTab('week')} aria-label="Semaine">▤</button><button className={tab === 'journey' ? 'on' : ''} onClick={() => setTab('journey')} aria-label="Parcours">↗</button><button className={tab === 'drive' ? 'on' : ''} onClick={() => setTab('drive')} aria-label="Drive">☁</button></nav>}
  </main>;
}

function findPlanned(state: CoachState, sessionId: string): PlannedSession | null {
  for (const week of state.weeks) {
    const found = week.sessions.find((item) => item.id === sessionId);
    if (found) return found;
  }
  return null;
}

// ---------- kind / load helpers, shared by the week card, the session chips
// and the block screen (CHANGE_REQUEST_010) ----------

const KIND_ICON: Record<PlannedSession['kind'], string> = {
  crossfit_class: '🏋',
  police_technique: '🎯',
  police_strength_transitions: '⚡',
  police_integration: '🧩',
  police_mock_test: '🚨',
  police_event: '🚔',
  trail_maintenance: '🏃',
  trail_event: '🏃',
  running_intervals_exception: '🏃'
};
function kindIcon(kind: PlannedSession['kind']): string { return KIND_ICON[kind]; }

const LOAD_BARS: Record<PlannedSession['load'], { count: number; color: string }> = {
  low: { count: 1, color: 'var(--low)' },
  moderate: { count: 2, color: 'var(--mid)' },
  hard: { count: 3, color: 'var(--high)' },
  event: { count: 3, color: 'var(--high)' }
};
function loadBars(load: PlannedSession['load']): { count: number; color: string } { return LOAD_BARS[load]; }

const INTENSITY_WORD: Record<PlannedSession['load'], string> = {
  low: 'Intensité faible',
  moderate: 'Intensité modérée',
  hard: 'Intensité forte',
  event: 'Jour J'
};
function intensityWord(load: PlannedSession['load']): string { return INTENSITY_WORD[load]; }

function mmss(min: number): string { return `${String(Math.max(0, Math.round(min))).padStart(2, '0')}:00`; }

// The mockup's week-card subtitle carries a short curated hint ("postes 8 à
// 11", "selon le cours") that is not itself a field in the data model. This
// derives an equivalent hint from what the recipe already has (its stations,
// or a fixed phrase for crossfit/trail), rather than inventing new copy —
// see the APP_REPORT for this substitution.
function sessionHint(recipe: SessionRecipe): string {
  if (recipe.kind === 'crossfit_class') return 'selon le cours';
  if (recipe.kind === 'trail_maintenance' || recipe.kind === 'trail_event') return 'course facile';
  const stations = Array.from(new Set(recipe.blocks.flatMap((block) => block.stationMappings))).sort((a, b) => a - b);
  if (stations.length >= 2 && stations[stations.length - 1]! - stations[0]! === stations.length - 1) return `postes ${stations[0]} à ${stations[stations.length - 1]}`;
  if (stations.length) return `postes ${stations.join(', ')}`;
  if (recipe.blocks.length) return `${recipe.blocks.length} bloc${recipe.blocks.length > 1 ? 's' : ''}`;
  return '';
}

function weeksUntil(fromISO: string, targetISO: string): number {
  const diffDays = Math.round((Date.parse(`${targetISO}T12:00:00Z`) - Date.parse(`${fromISO}T12:00:00Z`)) / 86_400_000);
  return Math.max(0, Math.ceil(diffDays / 7));
}

// ---------- B. Week screen ----------

function WeekScreen({ state, weekIndex, setWeekIndex, openSession }: { state: CoachState; weekIndex: number; setWeekIndex: (index: number) => void; openSession: (planned: PlannedSession) => void }) {
  const week = state.weeks[weekIndex]!;
  const completed = week.sessions.filter((planned) => state.results[planned.id]?.status === 'done').length;
  const days = daysOfWeek(week.startDate, week.endDate);
  const today = new Date().toISOString().slice(0, 10);
  const principal = week.sessions.find((planned) => planned.kind.startsWith('police_')) ?? week.sessions[0];
  const headline = principal ? recipeById[principal.recipeId]!.title : phaseLabel(week.phase);
  const weeksToTrail = weeksUntil(week.startDate, TRAIL_EVENT_DATE);
  const weeksToPolice = weeksUntil(week.startDate, state.planEndDate);

  return <>
    <section className="heroHead">
      <div className="kicker">{phaseLabel(week.phase)} · semaine {weekIndex + 1} / {state.weeks.length}</div>
      <h2>{headline}</h2>
      <p>{weeksToTrail} semaine{weeksToTrail > 1 ? 's' : ''} avant le trail · {weeksToPolice} avant le test police</p>
    </section>
    <div className="wtabs">
      <button disabled={weekIndex === 0} onClick={() => setWeekIndex(weekIndex - 1)}>{weekIndex > 0 ? formatRange(state.weeks[weekIndex - 1]!.startDate, state.weeks[weekIndex - 1]!.endDate) : '—'}</button>
      <button className="on" disabled>Cette semaine</button>
      <button disabled={weekIndex === state.weeks.length - 1} onClick={() => setWeekIndex(weekIndex + 1)}>{weekIndex < state.weeks.length - 1 ? formatRange(state.weeks[weekIndex + 1]!.startDate, state.weeks[weekIndex + 1]!.endDate) : '—'}</button>
    </div>
    <div className="prog"><b>Séances {completed}/{week.sessions.length}</b><span>{formatRange(week.startDate, week.endDate)}</span></div>
    <div className="track"><i style={{ width: `${week.sessions.length ? (completed / week.sessions.length) * 100 : 0}%` }} /></div>

    {days.map((date) => {
      const planned = week.sessions.find((item) => item.date === date);
      const dayLabel = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'][new Date(`${date}T12:00:00Z`).getUTCDay()];
      const isToday = date === today;
      if (!planned) return <div key={date}><div className={`day${isToday ? ' today' : ''}`}>{isToday ? "Aujourd'hui" : `${dayLabel} ${new Date(`${date}T12:00:00Z`).getUTCDate()}`}</div><div className="rest">Repos</div></div>;
      const recipe = recipeById[planned.recipeId]!;
      const result = state.results[planned.id];
      const bars = loadBars(planned.load);
      const durationLabel = recipe.durationMin ? mmss(recipe.durationMin * planned.volumeFactor) : recipe.kind === 'crossfit_class' ? '' : '—';
      const hint = sessionHint(recipe);
      const cardClass = ['card', isToday ? 'today' : '', result?.status === 'done' ? 'done' : '', result?.status === 'draft' ? 'draft' : ''].filter(Boolean).join(' ');
      return <div key={date}>
        <div className={`day${isToday ? ' today' : ''}`}>{isToday ? "Aujourd'hui" : `${dayLabel} ${new Date(`${date}T12:00:00Z`).getUTCDate()}`}</div>
        <button className={cardClass} type="button" onClick={() => openSession(planned)}>
          <span className="tile">{kindIcon(planned.kind)}</span>
          <span className="vbars">{[0, 1, 2].map((index) => <i key={index} style={index < bars.count ? { background: bars.color } : undefined} />)}</span>
          <span className="txt"><b>{recipe.title}</b><small>{[durationLabel, hint].filter(Boolean).join(' · ')}</small></span>
          <span className="more">···</span>
        </button>
      </div>;
    })}
  </>;
}

// ---------- C/D/F. Session screen ----------

function SessionScreen({ state, planned, sessionTab, focusBlock, setTab, openBlock, back, save, saveDraft, remove }: {
  state: CoachState;
  planned: PlannedSession;
  sessionTab: 'prevu' | 'fait' | 'retour';
  focusBlock?: number;
  setTab: (tab: 'prevu' | 'fait' | 'retour') => void;
  openBlock: (blockIndex: number) => void;
  back: () => void;
  save: (planned: PlannedSession, result: Omit<SessionResult, 'sessionId' | 'completedAt'>) => void;
  saveDraft: (planned: PlannedSession, result: Omit<SessionResult, 'sessionId' | 'completedAt'>) => void;
  remove: (planned: PlannedSession) => void;
}) {
  const recipe = recipeById[planned.recipeId]!;
  const result = state.results[planned.id];
  return <>
    <div className="snav"><button className="back" type="button" onClick={back} aria-label="Retour">‹</button><h3>{recipe.title}</h3></div>
    <div className="seg" role="tablist">
      <button className={sessionTab === 'prevu' ? 'on' : ''} onClick={() => setTab('prevu')} type="button">Prévu</button>
      <button className={sessionTab === 'fait' ? 'on' : ''} onClick={() => setTab('fait')} type="button">Fait</button>
      <button className={sessionTab === 'retour' ? 'on' : ''} onClick={() => setTab('retour')} type="button">Retour</button>
    </div>

    {sessionTab === 'prevu' && <PrevuTab planned={planned} recipe={recipe} openBlock={openBlock} openRetour={() => setTab('retour')} />}
    {sessionTab === 'fait' && <FaitTab result={result} openRetour={() => setTab('retour')} openPrevu={() => setTab('prevu')} />}
    {sessionTab === 'retour' && <RetourTab planned={planned} recipe={recipe} saved={result} focusBlock={focusBlock} save={save} saveDraft={saveDraft} remove={remove} backToPrevu={() => setTab('prevu')} onValidated={() => setTab('fait')} />}
  </>;
}

interface StepItem { label: string; minutes: number | null; doText: string; rulePill?: string; blockIndex?: number; }

function sessionSteps(recipe: SessionRecipe): StepItem[] {
  const nodes = flowStrip(recipe);
  let blockCursor = 0;
  return nodes.map((node, index) => {
    const isWarmup = index === 0 && Boolean(recipe.warmup);
    const isCooldown = index === nodes.length - 1 && Boolean(recipe.cooldown);
    if (isWarmup) return { label: 'Échauffement', minutes: node.minutes, doText: recipe.warmup ?? '' };
    if (isCooldown) return { label: 'Retour au calme', minutes: node.minutes, doText: recipe.cooldown ?? '' };
    const block = recipe.blocks[blockCursor]!;
    const blockIndex = blockCursor;
    blockCursor += 1;
    return { label: block.title, minutes: node.minutes, doText: block.faire, rulePill: block.regle ? shortRule(block.regle) : undefined, blockIndex };
  });
}

function shortRule(regle: string): string {
  const stripped = regle.replace(/^Règle officielle \(([^)]+)\)\s*:\s*/i, 'RÈGLE $1 · ');
  return stripped.length > 72 ? `${stripped.slice(0, 69)}…` : stripped;
}

function PrevuTab({ planned, recipe, openBlock, openRetour }: { planned: PlannedSession; recipe: SessionRecipe; openBlock: (blockIndex: number) => void; openRetour: () => void }) {
  const durationLabel = recipe.durationMin ? mmss(recipe.durationMin * planned.volumeFactor) : null;
  const steps = sessionSteps(recipe);
  return <>
    <div className="panel">
      <div className="ph"><h4>Ton programme</h4></div>
      <div className="chips">
        {durationLabel && <span className="chip">⏱ {durationLabel}</span>}
        <span className="chip">⚡ {intensityWord(planned.load)}</span>
        {recipe.blocks.length > 0 && <span className="chip">▤ {recipe.blocks.length} bloc{recipe.blocks.length > 1 ? 's' : ''}</span>}
      </div>
      {steps.length > 0 && <div className="hr" />}
      <ol className="steps">
        {steps.map((step, index) => {
          const clickable = step.blockIndex !== undefined;
          return <li key={`${step.label}-${index}`} className={clickable ? '' : 'static'} onClick={clickable ? () => openBlock(step.blockIndex!) : undefined}>
            <span className="n">{index + 1}.</span>
            <span>{step.label}</span>
            <span className="m">{step.minutes !== null ? `${step.minutes} min` : ''}</span>
            {clickable ? <span className="chev">›</span> : <span />}
            <span className="do">{step.doText}</span>
            {step.rulePill && <span className="r"><span className="pill rule">{step.rulePill}</span></span>}
          </li>;
        })}
      </ol>
    </div>
    <div className="actionsBar">
      <button className="act" type="button" onClick={openRetour}><i>✎</i><span>Retour de séance</span></button>
      <button className="act primary" type="button" onClick={openRetour}><i>✓</i><span>Séance faite</span></button>
    </div>
  </>;
}

const KIND_LABELS: Record<string, string> = {
  movementQuality: 'Qualité du mouvement',
  boxHesitation: 'Hésitation à la box',
  overlapTags: 'Chevauchements signalés'
};

const FIELD_LABELS: Record<string, string> = {
  memoryErrors: 'Erreurs de mémoire',
  ballFumbles: 'Balles échappées',
  obstacleHesitations: "Hésitations à l'obstacle",
  racketDropsR1: 'Chutes raquette — Tour 1',
  racketDropsR2: 'Chutes raquette — Tour 2',
  racketDropsR3: 'Chutes raquette — Tour 3',
  amrapRounds: 'Tours AMRAP',
  landingQuality: 'Réceptions',
  distanceKm: 'Distance',
  elevationGainM: 'Dénivelé D+',
  durationMin: 'Durée',
  intervalDistance1M: 'Distance intervalle 1',
  intervalDistance2M: 'Distance intervalle 2'
};

const MOVEMENT_QUALITY_LABEL: Record<MovementQuality, string> = { crisp: 'Propre', mixed: 'Variable', degraded: 'Dégradée' };
const LANDING_QUALITY_LABEL: Record<LandingQuality, string> = { clean: 'Propres', mixed: 'Mixtes', sloppy: 'Sales' };
const STATUS_LABEL: Record<ResultStatus, string> = { done: 'Terminée', partial: 'Partielle', skipped: 'Passée', draft: 'Brouillon' };

function formatFieldValue(key: string, value: unknown): string {
  if (key === 'movementQuality') return MOVEMENT_QUALITY_LABEL[value as MovementQuality];
  if (key === 'landingQuality') return LANDING_QUALITY_LABEL[value as LandingQuality];
  if (key === 'boxHesitation') return value ? 'Oui' : 'Non';
  if (key === 'overlapTags') return (value as string[]).join(', ') || '—';
  if (key === 'distanceKm') return `${value} km`;
  if (key === 'elevationGainM' || key.endsWith('M')) return `${value} m`;
  if (key === 'durationMin') return `${value} min`;
  return String(value);
}

function FaitTab({ result, openRetour, openPrevu }: { result?: SessionResult; openRetour: () => void; openPrevu: () => void }) {
  if (!result) return <>
    <p className="kvEmpty">Rien d'enregistré.</p>
    <div className="actionsBar">
      <button className="act" type="button" onClick={openRetour}><i>✎</i><span>Modifier</span></button>
      <button className="act primary" type="button" onClick={openPrevu}><i>↴</i><span>Voir le plan</span></button>
    </div>
  </>;
  const shownKeys = Object.keys(FIELD_LABELS).filter((key) => (result as unknown as Record<string, unknown>)[key] !== undefined);
  const kindKeys = Object.keys(KIND_LABELS).filter((key) => (result as unknown as Record<string, unknown>)[key] !== undefined);
  return <>
    <div className="kv">
      <div><span>Statut</span><b style={{ color: 'var(--accent)' }}>{STATUS_LABEL[result.status]}</b></div>
      {result.effort !== undefined && <div><span>Effort ressenti</span><b>{result.effort} / 5</b></div>}
      {kindKeys.map((key) => <div key={key}><span>{KIND_LABELS[key]}</span><b>{formatFieldValue(key, (result as unknown as Record<string, unknown>)[key])}</b></div>)}
      {shownKeys.map((key) => <div key={key}><span>{FIELD_LABELS[key]}</span><b>{formatFieldValue(key, (result as unknown as Record<string, unknown>)[key])}</b></div>)}
      <div><span>Enregistrée</span><b>{formatDateTime(result.completedAt)}</b></div>
    </div>
    <p className="syncNote">Synchronisé avec Drive · révision suit l'état de l'app.</p>
    <div className="actionsBar">
      <button className="act" type="button" onClick={openRetour}><i>✎</i><span>Modifier</span></button>
      <button className="act primary" type="button" onClick={openPrevu}><i>↴</i><span>Voir le plan</span></button>
    </div>
  </>;
}

// ---------- D. Retour tab ----------

function numberToText(value: number | undefined): string { return value === undefined ? '' : String(value); }
function textToNumber<Key extends string>(key: Key, value: string): Partial<Record<Key, number>> { if (value.trim() === '') return {}; const parsed = Number(value); return Number.isFinite(parsed) ? { [key]: parsed } as Partial<Record<Key, number>> : {}; }

function RetourTab({ planned, recipe, saved, focusBlock, save, saveDraft, remove, backToPrevu, onValidated }: {
  planned: PlannedSession;
  recipe: SessionRecipe;
  saved?: SessionResult;
  focusBlock?: number;
  save: (planned: PlannedSession, result: Omit<SessionResult, 'sessionId' | 'completedAt'>) => void;
  saveDraft: (planned: PlannedSession, result: Omit<SessionResult, 'sessionId' | 'completedAt'>) => void;
  remove: (planned: PlannedSession) => void;
  backToPrevu: () => void;
  onValidated: () => void;
}) {
  const [effort, setEffort] = useState(saved?.effort ?? 0);
  const [status, setStatus] = useState<'done' | 'partial' | 'skipped'>(saved && saved.status !== 'draft' ? saved.status : 'done');
  const [statusTouched, setStatusTouched] = useState(Boolean(saved && saved.status !== 'draft'));
  const [note, setNote] = useState(saved?.note ?? '');
  const [quality, setQuality] = useState<MovementQuality | ''>(saved?.movementQuality ?? '');
  const [hesitation, setHesitation] = useState(saved?.boxHesitation ?? false);
  const [tags, setTags] = useState<NonNullable<SessionResult['overlapTags']>>(saved?.overlapTags ?? []);
  const [memoryErrors, setMemoryErrors] = useState(numberToText(saved?.memoryErrors));
  const [ballFumbles, setBallFumbles] = useState(numberToText(saved?.ballFumbles));
  const [obstacleHesitations, setObstacleHesitations] = useState(numberToText(saved?.obstacleHesitations));
  const [racketDropsR1, setRacketDropsR1] = useState(numberToText(saved?.racketDropsR1));
  const [racketDropsR2, setRacketDropsR2] = useState(numberToText(saved?.racketDropsR2));
  const [racketDropsR3, setRacketDropsR3] = useState(numberToText(saved?.racketDropsR3));
  const [amrapRounds, setAmrapRounds] = useState(numberToText(saved?.amrapRounds));
  const [landingQuality, setLandingQuality] = useState<LandingQuality | ''>(saved?.landingQuality ?? '');
  const [distanceKm, setDistanceKm] = useState(numberToText(saved?.distanceKm));
  const [elevationGainM, setElevationGainM] = useState(numberToText(saved?.elevationGainM));
  const [durationMin, setDurationMin] = useState(numberToText(saved?.durationMin));
  const [intervalDistance1M, setIntervalDistance1M] = useState(numberToText(saved?.intervalDistance1M));
  const [intervalDistance2M, setIntervalDistance2M] = useState(numberToText(saved?.intervalDistance2M));
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);

  const isCrossfit = planned.kind === 'crossfit_class';
  const isRoom = planned.kind === 'police_integration';
  const isStrength = planned.kind === 'police_strength_transitions';
  const isWeek1Friday = planned.recipeId === 'week1-fri-2026-09-11-v3';
  const isWeek1Saturday = planned.recipeId === 'week1-sat-2026-09-12-trail';
  const isWeek1Tuesday = planned.recipeId === 'week1-tue-2026-09-08-as-trained';

  function buildFields(effectiveStatus: ResultStatus): Omit<SessionResult, 'sessionId' | 'completedAt'> {
    return {
      status: effectiveStatus,
      ...(effort ? { effort: effort as 1 | 2 | 3 | 4 | 5 } : {}),
      note,
      ...(quality ? { movementQuality: quality } : {}),
      ...(isRoom ? { boxHesitation: hesitation } : {}),
      ...(isCrossfit ? { overlapTags: tags } : {}),
      ...(isWeek1Friday ? {
        ...textToNumber('memoryErrors', memoryErrors),
        ...textToNumber('ballFumbles', ballFumbles),
        ...textToNumber('obstacleHesitations', obstacleHesitations),
        ...textToNumber('racketDropsR1', racketDropsR1),
        ...textToNumber('racketDropsR2', racketDropsR2),
        ...textToNumber('racketDropsR3', racketDropsR3),
        ...textToNumber('amrapRounds', amrapRounds),
        ...(landingQuality ? { landingQuality } : {})
      } : {}),
      ...(isWeek1Saturday ? {
        ...textToNumber('distanceKm', distanceKm),
        ...textToNumber('elevationGainM', elevationGainM),
        ...textToNumber('durationMin', durationMin)
      } : {}),
      ...(isWeek1Tuesday ? {
        ...textToNumber('intervalDistance1M', intervalDistance1M),
        ...textToNumber('intervalDistance2M', intervalDistance2M)
      } : {})
    };
  }

  // CHANGE_REQUEST_010 section D — autosave: every field writes to the state
  // on change (debounced), so leaving the tab or closing the app never loses
  // a value. Until the athlete picks a status (or presses "Valider la
  // séance"), the record is written with status `draft`.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveDraft(planned, buildFields(statusTouched ? status : 'draft'));
      setDraftSavedAt(new Date());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, DRAFT_SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effort, status, statusTouched, note, quality, hesitation, tags, memoryErrors, ballFumbles, obstacleHesitations, racketDropsR1, racketDropsR2, racketDropsR3, amrapRounds, landingQuality, distanceKm, elevationGainM, durationMin, intervalDistance1M, intervalDistance2M]);

  const groupRefs = useRef<Record<number, HTMLDivElement | null>>({});
  useEffect(() => {
    if (focusBlock === undefined) return;
    const target = groupRefs.current[focusBlock];
    target?.scrollIntoView?.({ block: 'center' });
  }, [focusBlock]);

  function submit() {
    setStatusTouched(true);
    if (!effort) return;
    save(planned, buildFields(status));
    onValidated();
  }

  const blockGroups = recipe.blocks.map((block, index) => ({ block, index, fields: blockFields(recipe.id, index) })).filter((group) => group.fields.length > 0);

  return <>
    <div className="save"><span className="dot" /><span>{draftSavedAt ? `Brouillon enregistré · ${draftSavedAt.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })} · tu peux revenir à tout moment` : 'Brouillon enregistré automatiquement · tu peux revenir à tout moment'}</span></div>

    {blockGroups.map(({ block, index, fields }) => <div className="grp" key={block.title} ref={(node) => { groupRefs.current[index] = node; }}>
      <div className="gh"><span className="gn">{index + 1}</span>{block.title}</div>
      {fields.includes('memoryErrors') && <NumberField label="Erreurs de mémoire / postes oubliés ou inversés" value={memoryErrors} onChange={setMemoryErrors} step={1} />}
      {fields.includes('ballFumbles') && <NumberField label="Balles échappées" value={ballFumbles} onChange={setBallFumbles} step={1} />}
      {fields.includes('obstacleHesitations') && <NumberField label="Hésitations à l'obstacle" value={obstacleHesitations} onChange={setObstacleHesitations} step={1} />}
      {fields.includes('racketTrio') && <div className="trio">
        <NumberField label="Tour 1" value={racketDropsR1} onChange={setRacketDropsR1} step={1} placeholder="chutes" />
        <NumberField label="Tour 2" value={racketDropsR2} onChange={setRacketDropsR2} step={1} placeholder="chutes" />
        <NumberField label="Tour 3" value={racketDropsR3} onChange={setRacketDropsR3} step={1} placeholder="chutes" />
      </div>}
      {fields.includes('amrapRounds') && <NumberField label="Tours complets (+ partiel, ex. 4,5)" value={amrapRounds} onChange={setAmrapRounds} step={0.5} placeholder="4,5" />}
      {fields.includes('landingQuality') && <>
        <div className="lab">Réceptions</div>
        <div className="qrow small">{(['clean', 'mixed', 'sloppy'] as const).map((value) => <button type="button" key={value} className={landingQuality === value ? 'on' : ''} onClick={() => setLandingQuality(value)}>{LANDING_QUALITY_LABEL[value].toLowerCase()}</button>)}</div>
      </>}
      {fields.includes('distanceKm') && <NumberField label="Distance" value={distanceKm} onChange={setDistanceKm} step={0.1} unit="km" />}
      {fields.includes('elevationGainM') && <NumberField label="Dénivelé D+" value={elevationGainM} onChange={setElevationGainM} step={1} unit="m" />}
      {fields.includes('durationMin') && <NumberField label="Durée" value={durationMin} onChange={setDurationMin} step={1} unit="min" />}
      {fields.includes('intervalDistance1M') && <NumberField label="Distance intervalle 1" value={intervalDistance1M} onChange={setIntervalDistance1M} step={1} unit="m" />}
      {fields.includes('intervalDistance2M') && <NumberField label="Distance intervalle 2" value={intervalDistance2M} onChange={setIntervalDistance2M} step={1} unit="m" />}
    </div>)}

    <div className="grp">
      <div className="gh">Toute la séance</div>
      {(isRoom || isStrength) && <>
        <div className="lab">Qualité du mouvement</div>
        <div className="qrow small">{(['crisp', 'mixed', 'degraded'] as const).map((value) => <button type="button" key={value} className={quality === value ? 'on' : ''} onClick={() => setQuality(value)}>{MOVEMENT_QUALITY_LABEL[value].toLowerCase()}</button>)}</div>
      </>}
      {isRoom && <label className="field"><span>Hésitation ou manque de confiance à la box</span><div className="qrow small"><button type="button" className={hesitation ? 'on' : ''} onClick={() => setHesitation(true)}>oui</button><button type="button" className={!hesitation ? 'on' : ''} onClick={() => setHesitation(false)}>non</button></div></label>}
      {isCrossfit && <>
        <div className="lab">Chevauchements à signaler</div>
        <div className="qrow small">{(['grip', 'jumping', 'heavy_legs', 'hard_conditioning'] as const).map((tag) => <button type="button" key={tag} className={tags.includes(tag) ? 'on' : ''} onClick={() => setTags(tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag])}>{tag === 'grip' ? 'grip' : tag === 'jumping' ? 'sauts' : tag === 'heavy_legs' ? 'jambes lourdes' : 'conditioning dur'}</button>)}</div>
      </>}
      <div className="lab">Statut</div>
      <div className="qrow small">{(['done', 'partial', 'skipped'] as const).map((value) => <button type="button" key={value} className={statusTouched && status === value ? 'on' : ''} onClick={() => { setStatus(value); setStatusTouched(true); }}>{STATUS_LABEL[value]}</button>)}</div>
      <div className="lab">Effort ressenti</div>
      <div className="eff">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} aria-pressed={effort === value} className={effort === value ? 'on' : ''} onClick={() => setEffort(value)}>{value}</button>)}</div>
      <label className="field"><span>Note</span><textarea rows={3} maxLength={1500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="facultatif" /></label>
    </div>

    <div className="actionsBar">
      <button className="act" type="button" onClick={backToPrevu}><i>‹</i><span>Plan</span></button>
      <button className="act primary" type="button" onClick={submit} disabled={!effort}><i>✓</i><span>Valider la séance</span></button>
    </div>
    {saved && saved.status !== 'draft' && <button className="textButton" type="button" onClick={() => remove(planned)}>Retirer cette validation</button>}
  </>;
}

// CHANGE_REQUEST_010 section D — which fields a block groups in Retour. Only
// the one session whose record fields are named against a specific block in
// the change request (Week 1 Friday — recipe id below) gets a per-block
// mapping; every other session's kind-based fields (movementQuality,
// boxHesitation, overlapTags) are not named against a block anywhere in the
// CR or the mockup, so they stay in the final "Toute la séance" group — see
// the APP_REPORT question on this point.
//
// Gating on `recipeId` (not just `blockIndex`) matters: without it, every
// other session's blocks 0-3 would wrongly inherit Friday's field names by
// index alone (caught live on fsdyc2mskw-coder.github.io/coach-concours/
// after the CR-010 merge — see APP_REPORT_010.md's fix note).
const WEEK1_FRIDAY_RECIPE_ID = 'week1-fri-2026-09-11-v3';
const WEEK1_FRIDAY_BLOCK_FIELDS: Record<number, string[]> = {
  // block order: 0 mémoire, 1 poste 2, 2 raquette référence, 3 AMRAP,
  // 4 poste 8 (no group — explicitly named in the CR).
  0: ['memoryErrors'],
  1: ['ballFumbles', 'obstacleHesitations'],
  2: ['racketTrio'],
  3: ['amrapRounds', 'landingQuality']
};

function blockFields(recipeId: string, blockIndex: number): string[] {
  if (recipeId !== WEEK1_FRIDAY_RECIPE_ID) return [];
  return WEEK1_FRIDAY_BLOCK_FIELDS[blockIndex] ?? [];
}

function NumberField({ label, value, onChange, step, unit, placeholder }: { label: string; value: string; onChange: (value: string) => void; step: number; unit?: string; placeholder?: string }) {
  return <label className="field">
    <span>{label}</span>
    <input
      type="number"
      min={0}
      step={step}
      inputMode={step < 1 ? 'decimal' : 'numeric'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder ?? unit ?? 'facultatif'}
    />
  </label>;
}

// ---------- E. Block screen ----------

function blockPictogram(block: ExerciseBlock): string {
  if (/corde/i.test(block.title)) return '🪢';
  if (/échelle/i.test(block.title)) return '🪜';
  if (/raquette/i.test(block.title)) return '🎾';
  if (/box|obstacle|poste 2/i.test(block.title)) return '📦';
  if (/course|footing|intervalle/i.test(block.title)) return '🏃';
  if (/couleur|poste 8/i.test(block.title)) return '🎨';
  if (block.hiit) return '⚡';
  return '🔷';
}

const HIIT_FORMAT_LABEL: Record<string, string> = { amrap: 'max de tours', emom: 'EMOM', intervals: 'intervalles', for_time: 'for time', chipper: 'chipper' };

function BlockScreen({ planned, blockIndex, back, openRetour }: { planned: PlannedSession; blockIndex: number; back: () => void; openRetour: () => void }) {
  const recipe = recipeById[planned.recipeId]!;
  const block = recipe.blocks[blockIndex]!;
  const minutes = block.title.match(/(\d+)\s*min/)?.[1];
  const fields = blockFields(recipe.id, blockIndex);
  const toRecord = useMemo(() => {
    const items: string[] = [];
    if (fields.includes('memoryErrors')) items.push('Erreurs de mémoire / postes oubliés ou inversés');
    if (fields.includes('ballFumbles')) items.push('Balles échappées');
    if (fields.includes('obstacleHesitations')) items.push("Hésitations à l'obstacle");
    if (fields.includes('racketTrio')) items.push('Chutes raquette — Tour 1 · 2 · 3');
    if (fields.includes('amrapRounds')) items.push('Tours complets + partiel');
    if (fields.includes('landingQuality')) items.push('Réceptions — propres · mixtes · sales');
    return items;
  }, [fields]);

  return <>
    <div className="snav"><button className="back" type="button" onClick={back} aria-label="Retour">‹</button><h3>{block.title}</h3></div>
    <div className="sum">
      <h4>Résumé</h4>
      <div className="chips" style={{ margin: 0 }}>
        {minutes && <span className="chip">⏱ {minutes.padStart(2, '0')}:00</span>}
        {block.hiit && <span className="chip">↻ {HIIT_FORMAT_LABEL[block.hiit.format]}</span>}
        {block.hiit && <span className="chip">⚡ HIIT</span>}
      </div>
    </div>
    <div className="circ">
      <h5>{block.stationMappings.length ? 'Circuit' : 'Exercice'}</h5>
      {block.details && <div className="meta">{block.details}</div>}
      <div className="ex">
        <span className="th">{blockPictogram(block)}</span>
        <span className="t"><b>{block.title.replace(/\s*—\s*\d+\s*min$/, '')}</b><small>{block.faire}</small></span>
      </div>
      {block.regle && <div className="ex rule"><span className="pill rule">{shortRule(block.regle)}</span></div>}
    </div>
    {toRecord.length > 0 && <>
      <h5 className="h5" style={{ marginTop: 22 }}>À enregistrer dans Retour de séance</h5>
      <div className="kv">{toRecord.map((item) => <div key={item}><span>{item}</span></div>)}</div>
    </>}
    <div className="actionsBar">
      <button className="act" type="button" onClick={back}><i>‹</i><span>Séance</span></button>
      <button className="act primary" type="button" onClick={openRetour}><i>✎</i><span>Retour de séance</span></button>
    </div>
  </>;
}

// ---------- Journey / Drive (CHANGE_REQUEST_010 section G — theme only, content unchanged) ----------

function JourneyView({ state }: { state: CoachState }) { const total = Object.values(state.results).filter((result) => result.status === 'done').length; return <section className="page"><p className="eyebrow">JUSQU’AU 20 NOVEMBRE</p><h1>Ton parcours</h1><p className="lead">{total} séances terminées. Les semaines futures se recalculent à partir de tes retours sans ajouter de sixième jour.</p><div className="timeline">{state.weeks.map((week, index) => { const done = week.sessions.filter((session) => state.results[session.id]?.status === 'done').length; return <div className="timelineRow" key={week.id}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{phaseLabel(week.phase)}</b><p>{formatRange(week.startDate, week.endDate)}</p></div><strong>{done}/{week.sessions.length}</strong></div>; })}</div></section>; }

function DriveView({ state, session, busy, sync, backup, disconnect, exportData, importData }: { state: CoachState; session: GoogleSession | null; busy: boolean; sync: () => void; backup: () => void; disconnect: () => void; exportData: () => void; importData: (file: File) => void }) {
  const clientConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const pendingCount = state.drive.lastSyncRevision !== undefined ? Math.max(0, state.revision - state.drive.lastSyncRevision) : (state.drive.status === 'local' ? 0 : state.revision);
  return <section className="page"><p className="eyebrow">DONNÉES PERSONNELLES</p><h1>Google Drive</h1><p className="lead">Drive conserve l’état durable de Coach Concours. IndexedDB garde une copie locale pour ouvrir l’app hors connexion et mettre les changements en attente.</p><div className="driveCard"><div className="cloud">☁</div><h2>{state.drive.accountEmail ? maskEmail(state.drive.accountEmail) : 'Drive non connecté'}</h2><p>{state.drive.lastSyncAt ? `Dernière synchronisation : ${formatDateTime(state.drive.lastSyncAt)}` : 'Aucune synchronisation de données effectuée.'}</p><p>Modifications en attente : {pendingCount}</p>{state.drive.status === 'error' && state.drive.message ? <p className="fieldError">{state.drive.message}</p> : null}{!clientConfigured ? <p className="fieldError">Connexion Drive pas encore configurée (VITE_GOOGLE_CLIENT_ID absent de ce build).</p> : null}<button className="primary" disabled={busy || !clientConfigured} onClick={sync}>{busy ? 'Synchronisation…' : session ? 'Synchroniser maintenant' : 'Connecter et synchroniser'}</button>{session && <><button className="secondary" disabled={busy} onClick={backup}>Créer une sauvegarde horodatée</button><button className="textButton" onClick={disconnect}>Déconnecter</button></>}</div><div className="driveCard"><h2>Sauvegarde manuelle</h2><p>Tant que Drive n’est pas connecté, exporte régulièrement tes données en JSON. Elles restent sur ce téléphone jusqu’à l’activation de Drive.</p><button className="secondary" type="button" onClick={exportData}>Exporter les données (JSON)</button><label className="secondary" style={{ display: 'inline-block', cursor: 'pointer', textAlign: 'center' }}>Importer un export JSON<input type="file" accept="application/json" style={{ display: 'none' }} onChange={(event) => { const file = event.target.files?.[0]; if (file) importData(file); event.target.value = ''; }} /></label></div><div className="infoCard"><h3>Ce qui est conservé</h3><ul><li>plan et versions des recettes ;</li><li>séances, effort, qualité et notes ;</li><li>état de progression et adaptations.</li></ul><p>L’ancien stockage Trail Coach n’est ni effacé ni modifié. {state.migration.legacyTrailDbDetected ? 'Une copie de son enveloppe a été détectée et archivée dans ce nouvel état.' : 'Aucune ancienne base n’a été détectée dans ce navigateur.'}</p><p>Une fois connectée, la synchronisation se fait seule à l’ouverture de l’app, après chaque séance enregistrée et dès que la connexion revient.</p></div></section>;
}

function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.split('@');
  const domainParts = domain.split('.');
  return `${local.slice(0, 1)}•••@${domainParts[0]?.slice(0, 1) ?? ''}•••`;
}

function daysOfWeek(start: string, end: string) { const days: string[] = []; for (let time = Date.parse(`${start}T12:00:00Z`); time <= Date.parse(`${end}T12:00:00Z`); time += 86_400_000) days.push(new Date(time).toISOString().slice(0, 10)); return days; }
function formatRange(start: string, end: string) { const a = new Date(`${start}T12:00:00Z`); const b = new Date(`${end}T12:00:00Z`); return `${a.getUTCDate()} ${a.toLocaleDateString('fr-CH', { month: 'short', timeZone: 'UTC' })} – ${b.getUTCDate()} ${b.toLocaleDateString('fr-CH', { month: 'short', year: 'numeric', timeZone: 'UTC' })}`.replace(/\./g, ''); }
function phaseLabel(phase: CoachState['weeks'][number]['phase']) { return ({ learn: 'Apprendre', combine: 'Combiner', trail_event: 'Semaine trail', reset: 'Récupérer', integrate: 'Intégrer', peak: 'Pic spécifique', taper: 'Alléger' } as const)[phase]; }
function formatDateTime(value: string) { return new Date(value).toLocaleString('fr-CH', { dateStyle: 'medium', timeStyle: 'short' }); }
