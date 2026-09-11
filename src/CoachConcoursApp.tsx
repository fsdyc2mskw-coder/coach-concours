import { useEffect, useState } from 'react';
import { recipeById } from './coach/recipes';
import { generatePlan } from './coach/planner';
import type { CoachState, LandingQuality, MovementQuality, PlannedSession, SessionResult } from './coach/types';
import { createDriveBackup, syncCoachState } from './infrastructure/coachDrive';
import { loadCoachState, parseCoachState, saveCoachState } from './infrastructure/coachStorage';
import { requestGoogleSession, revokeGoogleSession, type GoogleSession } from './infrastructure/googleIdentity';

type Tab = 'week' | 'journey' | 'drive';

export default function CoachConcoursApp() {
  const [state, setState] = useState<CoachState | null>(null);
  const [tab, setTab] = useState<Tab>('week');
  const [weekIndex, setWeekIndex] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [session, setSession] = useState<GoogleSession | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadCoachState().then((loaded) => {
      setState(loaded);
      const today = new Date().toISOString().slice(0, 10);
      setWeekIndex(Math.max(0, loaded.weeks.findIndex((week) => today >= week.startDate && today <= week.endDate)));
    }).catch((error: unknown) => setNotice(error instanceof Error ? error.message : 'Chargement impossible.'));
  }, []);

  const mutate = (change: (current: CoachState) => CoachState, message?: string) => {
    setState((current) => {
      if (!current) return current;
      const changed = change(current);
      const next = { ...changed, revision: current.revision + 1, updatedAt: new Date().toISOString(), drive: { ...changed.drive, status: session ? 'pending' as const : 'local' as const } };
      void saveCoachState(next).catch(() => setNotice('La copie locale n’a pas pu être écrite.'));
      return next;
    });
    if (message) setNotice(message);
  };

  const saveResult = (planned: PlannedSession, result: Omit<SessionResult, 'sessionId' | 'completedAt'>) => {
    mutate((current) => {
      const results = { ...current.results, [planned.id]: { ...result, sessionId: planned.id, completedAt: new Date().toISOString() } };
      return { ...current, results, weeks: generatePlan(results) };
    }, 'Séance enregistrée. La copie Drive sera mise à jour à la prochaine synchronisation.');
  };

  const removeResult = (planned: PlannedSession) => mutate((current) => {
    const results = { ...current.results };
    delete results[planned.id];
    return { ...current, results, weeks: generatePlan(results) };
  }, 'Validation retirée.');

  const reveal = (memoryId: string) => mutate((current) => ({ ...current, memoryReveals: { ...current.memoryReveals, [memoryId]: !current.memoryReveals[memoryId] } }));

  const connectAndSync = async () => {
    if (!state) return;
    setBusy(true); setNotice('');
    try {
      const active = session ?? await requestGoogleSession(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '');
      setSession(active);
      const result = await syncCoachState(active.accessToken, state, active.account.email);
      await saveCoachState(result.state);
      setState(result.state);
      setNotice('État complet synchronisé dans Google Drive.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Synchronisation Drive impossible.'); }
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
    setSession(null); setNotice('Session Google déconnectée. Les données locales restent disponibles.');
  };

  // CHANGE_REQUEST_004 — manual backup independent of Google Drive/OAuth: a JSON
  // download the user keeps herself until Drive sync (CR-005) is switched on.
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

  return <main className="shell">
    <header className="topbar"><div className="brand"><span className="brandMark">C↗</span><span>COACH<br/><b>CONCOURS</b></span></div><span className={`syncDot syncDot--${state.drive.status}`}>{state.drive.status === 'synced' ? 'Drive à jour' : state.drive.status === 'pending' ? 'À synchroniser' : 'Copie locale'}</span></header>
    {tab === 'week' && <WeekView state={state} weekIndex={weekIndex} setWeekIndex={(index) => { setWeekIndex(index); setOpenId(null); }} openId={openId} setOpenId={setOpenId} saveResult={saveResult} removeResult={removeResult} reveal={reveal} />}
    {tab === 'journey' && <JourneyView state={state} />}
    {tab === 'drive' && <DriveView state={state} session={session} busy={busy} sync={connectAndSync} backup={backup} disconnect={disconnect} exportData={exportData} importData={importData} />}
    {notice && <button className="notice" onClick={() => setNotice('')} type="button" aria-label="Fermer le message">{notice}<span>×</span></button>}
    <nav className="bottomNav" aria-label="Navigation principale"><button className={tab === 'week' ? 'active' : ''} onClick={() => setTab('week')}><span>▤</span>Semaine</button><button className={tab === 'journey' ? 'active' : ''} onClick={() => setTab('journey')}><span>↗</span>Parcours</button><button className={tab === 'drive' ? 'active' : ''} onClick={() => setTab('drive')}><span>☁</span>Drive</button></nav>
  </main>;
}

function WeekView({ state, weekIndex, setWeekIndex, openId, setOpenId, saveResult, removeResult, reveal }: { state: CoachState; weekIndex: number; setWeekIndex: (index: number) => void; openId: string | null; setOpenId: (id: string | null) => void; saveResult: (session: PlannedSession, result: Omit<SessionResult, 'sessionId' | 'completedAt'>) => void; removeResult: (session: PlannedSession) => void; reveal: (id: string) => void }) {
  const week = state.weeks[weekIndex]!;
  const completed = week.sessions.filter((session) => state.results[session.id]?.status === 'done').length;
  const days = daysOfWeek(week.startDate, week.endDate);
  return <><section className="hero"><p className="eyebrow">TON PLAN, {state.athleteName.toUpperCase()}</p><h1>La qualité<br/><em>avant la vitesse.</em></h1><p>Technique police, explosivité et récupération dans une seule boucle.</p></section>
    <section className="weekCard"><div className="weekNav"><button disabled={weekIndex === 0} onClick={() => setWeekIndex(weekIndex - 1)} aria-label="Semaine précédente">‹</button><div><p className="eyebrow">SEMAINE {String(weekIndex + 1).padStart(2, '0')} · {phaseLabel(week.phase)}</p><h2>{formatRange(week.startDate, week.endDate)}</h2></div><button disabled={weekIndex === state.weeks.length - 1} onClick={() => setWeekIndex(weekIndex + 1)} aria-label="Semaine suivante">›</button></div><div className="progressLine"><span>{completed} / {week.sessions.length} terminées</span><span>{Math.round((completed / week.sessions.length) * 100)} %</span></div><div className="track"><i style={{ width: `${(completed / week.sessions.length) * 100}%` }} /></div></section>
    <div className="sectionTitle"><h2>Cette semaine</h2><span>{week.sessions.length} séances · {days.length - week.sessions.length} repos</span></div><p className="caption">Le lundi est coaché. Les autres créneaux sont proposés et restent modifiables plus tard.</p>
    <section className="schedule">{days.map((date) => { const planned = week.sessions.find((item) => item.date === date); if (!planned) return <RestRow key={date} date={date} />; const recipe = recipeById[planned.recipeId]!; const result = state.results[planned.id]; return <article className={`sessionCard ${openId === planned.id ? 'open' : ''} ${result?.status === 'done' ? 'done' : ''}`} key={planned.id}><button className="sessionHead" onClick={() => setOpenId(openId === planned.id ? null : planned.id)} aria-expanded={openId === planned.id}><DateBadge date={date}/><div className="sessionMeta"><span className="badge">{result?.status === 'done' ? '✓ Terminée' : planned.status === 'coached' ? 'Cours encadré' : planned.status === 'fixed_event' ? 'Date fixe' : 'Proposée'}</span><h3>{recipe.title}</h3><p>{recipe.durationMin ? `${Math.round(recipe.durationMin * planned.volumeFactor)} min` : 'Selon le cours ou l’événement'}</p></div><span className="expand">{openId === planned.id ? '−' : '+'}</span></button>{openId === planned.id && <SessionDetails planned={planned} result={result} revealed={!!recipe.memory && !!state.memoryReveals[recipe.memory.id]} reveal={reveal} save={saveResult} remove={removeResult} />}</article>; })}</section></>;
}

function SessionDetails({ planned, result, revealed, reveal, save, remove }: { planned: PlannedSession; result?: SessionResult; revealed: boolean; reveal: (id: string) => void; save: (session: PlannedSession, result: Omit<SessionResult, 'sessionId' | 'completedAt'>) => void; remove: (session: PlannedSession) => void }) {
  const recipe = recipeById[planned.recipeId]!;
  return <div className="sessionDetails"><p className="purpose">{recipe.purpose}</p>{planned.adaptationNote && <p className="adaptation"><b>Adaptation :</b> {planned.adaptationNote}</p>}<div className="equipment"><b>À prévoir</b><p>{recipe.equipment.join(' · ')}</p></div>{recipe.blocks.some((block) => block.approximation) && <p className="approx">Ces exercices développent les qualités du circuit. Ils restent des approximations sans équivalence avec un parcours officiel vérifié.</p>}{recipe.warmup && <ContentBlock title="Échauffement" text={recipe.warmup} />}{recipe.blocks.map((block) => <ContentBlock key={block.title} title={block.title} text={block.prescription} suffix={block.stationMappings.length ? `Postes ${block.stationMappings.join(', ')}` : undefined} />)}{recipe.memory && <div className="memory"><p className="eyebrow">LE CIRCUIT EN TÊTE</p><h4>{recipe.memory.prompt}</h4><p>Réponds de mémoire, puis vérifie.</p><button type="button" onClick={() => reveal(recipe.memory!.id)}>{revealed ? 'Masquer la réponse' : 'Voir la réponse'}<span>↗</span></button>{revealed && <p className="answer">{recipe.memory.answer}</p>}</div>}{recipe.cooldown && <ContentBlock title="Retour au calme" text={recipe.cooldown} />}<FeedbackForm planned={planned} saved={result} save={save} remove={remove} /></div>;
}

function FeedbackForm({ planned, saved, save, remove }: { planned: PlannedSession; saved?: SessionResult; save: (session: PlannedSession, result: Omit<SessionResult, 'sessionId' | 'completedAt'>) => void; remove: (session: PlannedSession) => void }) {
  const [effort, setEffort] = useState(saved?.effort ?? 0); const [status, setStatus] = useState<SessionResult['status']>(saved?.status ?? 'done'); const [note, setNote] = useState(saved?.note ?? ''); const [quality, setQuality] = useState<MovementQuality | ''>(saved?.movementQuality ?? ''); const [hesitation, setHesitation] = useState(saved?.boxHesitation ?? false); const [tags, setTags] = useState<NonNullable<SessionResult['overlapTags']>>(saved?.overlapTags ?? []);
  // CHANGE_REQUEST_003 record fields, Week 1 v3 only (Friday 11 Sep / Saturday 12 Sep).
  const [memoryErrors, setMemoryErrors] = useState(numberToText(saved?.memoryErrors)); const [ballFumbles, setBallFumbles] = useState(numberToText(saved?.ballFumbles)); const [racketDropsR1, setRacketDropsR1] = useState(numberToText(saved?.racketDropsR1)); const [racketDropsR2, setRacketDropsR2] = useState(numberToText(saved?.racketDropsR2)); const [racketDropsR3, setRacketDropsR3] = useState(numberToText(saved?.racketDropsR3)); const [amrapRounds, setAmrapRounds] = useState(numberToText(saved?.amrapRounds)); const [landingQuality, setLandingQuality] = useState<LandingQuality | ''>(saved?.landingQuality ?? '');
  const [distanceKm, setDistanceKm] = useState(numberToText(saved?.distanceKm)); const [elevationGainM, setElevationGainM] = useState(numberToText(saved?.elevationGainM)); const [durationMin, setDurationMin] = useState(numberToText(saved?.durationMin));
  const isCrossfit = planned.kind === 'crossfit_class'; const isRoom = planned.kind === 'room_explosive_intervals';
  const isWeek1Friday = planned.recipeId === 'week1-fri-2026-09-11-v3'; const isWeek1Saturday = planned.recipeId === 'week1-sat-2026-09-12-trail';
  return <form className="feedback" onSubmit={(event) => { event.preventDefault(); if (!effort) return; save(planned, { status, effort: effort as 1|2|3|4|5, note, ...(quality ? { movementQuality: quality } : {}), ...(isRoom ? { boxHesitation: hesitation } : {}), ...(isCrossfit ? { overlapTags: tags } : {}), ...(isWeek1Friday ? { ...textToNumber('memoryErrors', memoryErrors), ...textToNumber('ballFumbles', ballFumbles), ...textToNumber('racketDropsR1', racketDropsR1), ...textToNumber('racketDropsR2', racketDropsR2), ...textToNumber('racketDropsR3', racketDropsR3), ...textToNumber('amrapRounds', amrapRounds), ...(landingQuality ? { landingQuality } : {}) } : {}), ...(isWeek1Saturday ? { ...textToNumber('distanceKm', distanceKm), ...textToNumber('elevationGainM', elevationGainM), ...textToNumber('durationMin', durationMin) } : {}) }); }}><h4>{saved ? 'Ton retour' : 'Après la séance'}</h4><div className="segmented">{(['done','partial','skipped'] as const).map((value) => <button type="button" className={status === value ? 'selected' : ''} onClick={() => setStatus(value)} key={value}>{value === 'done' ? 'Terminée' : value === 'partial' ? 'Partielle' : 'Passée'}</button>)}</div><label>Effort ressenti <small>1 très facile · 5 très difficile</small></label><div className="ratings">{[1,2,3,4,5].map((value) => <button type="button" aria-pressed={effort === value} className={effort === value ? 'selected' : ''} onClick={() => setEffort(value)} key={value}>{value}</button>)}</div>{(isRoom || planned.kind === 'outdoor_explosive_intervals') && <><label>Qualité du mouvement</label><div className="segmented">{(['crisp','mixed','degraded'] as const).map((value) => <button type="button" className={quality === value ? 'selected' : ''} onClick={() => setQuality(value)} key={value}>{value === 'crisp' ? 'Propre' : value === 'mixed' ? 'Variable' : 'Dégradée'}</button>)}</div></>}{isRoom && <label className="check"><input type="checkbox" checked={hesitation} onChange={(event) => setHesitation(event.target.checked)}/> Hésitation ou manque de confiance à la box</label>}{isCrossfit && <div className="tags"><label>Chevauchements à signaler</label>{(['grip','jumping','heavy_legs','hard_conditioning'] as const).map((tag) => <button type="button" key={tag} className={tags.includes(tag) ? 'selected' : ''} onClick={() => setTags(tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag])}>{tag === 'grip' ? 'Grip' : tag === 'jumping' ? 'Sauts' : tag === 'heavy_legs' ? 'Jambes lourdes' : 'Conditioning dur'}</button>)}</div>}{isWeek1Friday && <div className="week1Fields"><label>Erreurs de mémoire <small>facultatif</small><input type="number" min={0} step={1} inputMode="numeric" value={memoryErrors} onChange={(event) => setMemoryErrors(event.target.value)} /></label><label>Balles échappées <small>facultatif</small><input type="number" min={0} step={1} inputMode="numeric" value={ballFumbles} onChange={(event) => setBallFumbles(event.target.value)} /></label><label>Chutes raquette R1 <small>facultatif</small><input type="number" min={0} step={1} inputMode="numeric" value={racketDropsR1} onChange={(event) => setRacketDropsR1(event.target.value)} /></label><label>Chutes raquette R2 <small>facultatif</small><input type="number" min={0} step={1} inputMode="numeric" value={racketDropsR2} onChange={(event) => setRacketDropsR2(event.target.value)} /></label><label>Chutes raquette R3 <small>facultatif</small><input type="number" min={0} step={1} inputMode="numeric" value={racketDropsR3} onChange={(event) => setRacketDropsR3(event.target.value)} /></label><label>Tours AMRAP <small>facultatif, ex. 4.5</small><input type="number" min={0} step={0.5} inputMode="decimal" value={amrapRounds} onChange={(event) => setAmrapRounds(event.target.value)} /></label><label>Qualité de réception <small>facultatif</small><div className="segmented">{(['clean','mixed','sloppy'] as const).map((value) => <button type="button" className={landingQuality === value ? 'selected' : ''} onClick={() => setLandingQuality(value)} key={value}>{value === 'clean' ? 'Propre' : value === 'mixed' ? 'Variable' : 'Bâclée'}</button>)}</div></label></div>}{isWeek1Saturday && <div className="week1Fields"><label>Distance (km) <small>facultatif</small><input type="number" min={0} step={0.1} inputMode="decimal" value={distanceKm} onChange={(event) => setDistanceKm(event.target.value)} /></label><label>Dénivelé D+ (m) <small>facultatif</small><input type="number" min={0} step={1} inputMode="numeric" value={elevationGainM} onChange={(event) => setElevationGainM(event.target.value)} /></label><label>Durée (min) <small>facultatif</small><input type="number" min={0} step={1} inputMode="numeric" value={durationMin} onChange={(event) => setDurationMin(event.target.value)} /></label></div>}<label>Note <small>facultative</small><textarea rows={3} maxLength={1500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Sensations, appuis, hésitation…" /></label><button className="primary" disabled={!effort} type="submit">{saved ? 'Enregistrer les changements' : '✓ Enregistrer la séance'}</button>{saved && <button className="textButton" type="button" onClick={() => remove(planned)}>Retirer cette validation</button>}</form>;
}

function numberToText(value: number | undefined): string { return value === undefined ? '' : String(value); }
function textToNumber<Key extends string>(key: Key, value: string): Partial<Record<Key, number>> { if (value.trim() === '') return {}; const parsed = Number(value); return Number.isFinite(parsed) ? { [key]: parsed } as Partial<Record<Key, number>> : {}; }

function JourneyView({ state }: { state: CoachState }) { const total = Object.values(state.results).filter((result) => result.status === 'done').length; return <section className="page"><p className="eyebrow">JUSQU’AU 20 NOVEMBRE</p><h1>Ton parcours</h1><p className="lead">{total} séances terminées. Les semaines futures se recalculent à partir de tes retours sans ajouter de sixième jour.</p><div className="timeline">{state.weeks.map((week,index) => { const done = week.sessions.filter((session) => state.results[session.id]?.status === 'done').length; return <div className="timelineRow" key={week.id}><span>{String(index + 1).padStart(2,'0')}</span><div><b>{phaseLabel(week.phase)}</b><p>{formatRange(week.startDate, week.endDate)}</p></div><strong>{done}/{week.sessions.length}</strong></div>; })}</div></section>; }

function DriveView({ state, session, busy, sync, backup, disconnect, exportData, importData }: { state: CoachState; session: GoogleSession | null; busy: boolean; sync: () => void; backup: () => void; disconnect: () => void; exportData: () => void; importData: (file: File) => void }) { return <section className="page"><p className="eyebrow">DONNÉES PERSONNELLES</p><h1>Google Drive</h1><p className="lead">Drive conserve l’état durable de Coach Concours. IndexedDB garde une copie locale pour ouvrir l’app hors connexion et mettre les changements en attente.</p><div className="driveCard"><div className="cloud">☁</div><h2>{state.drive.accountEmail ?? 'Drive non connecté'}</h2><p>{state.drive.lastSyncAt ? `Dernière synchronisation : ${formatDateTime(state.drive.lastSyncAt)}` : 'Aucune synchronisation de données effectuée.'}</p><button className="primary" disabled={busy} onClick={sync}>{busy ? 'Synchronisation…' : session ? 'Synchroniser maintenant' : 'Connecter et synchroniser'}</button>{session && <><button className="secondary" disabled={busy} onClick={backup}>Créer une sauvegarde horodatée</button><button className="textButton" onClick={disconnect}>Déconnecter cette session</button></>}</div><div className="driveCard"><h2>Sauvegarde manuelle</h2><p>Tant que Drive n’est pas connecté, exporte régulièrement tes données en JSON. Elles restent sur ce téléphone jusqu’à l’activation de Drive.</p><button className="secondary" type="button" onClick={exportData}>Exporter les données (JSON)</button><label className="secondary" style={{ display: 'inline-block', cursor: 'pointer', textAlign: 'center' }}>Importer un export JSON<input type="file" accept="application/json" style={{ display: 'none' }} onChange={(event) => { const file = event.target.files?.[0]; if (file) importData(file); event.target.value = ''; }} /></label></div><div className="infoCard"><h3>Ce qui est conservé</h3><ul><li>plan et versions des recettes ;</li><li>séances, effort, qualité et notes ;</li><li>état de progression et adaptations.</li></ul><p>L’ancien stockage Trail Coach n’est ni effacé ni modifié. {state.migration.legacyTrailDbDetected ? 'Une copie de son enveloppe a été détectée et archivée dans ce nouvel état.' : 'Aucune ancienne base n’a été détectée dans ce navigateur.'}</p><p><b>Limite connue :</b> les données vivent sur cet appareil seul tant que la synchronisation Drive (CR-005) n’est pas activée.</p></div></section>; }

function ContentBlock({ title, text, suffix }: { title: string; text: string; suffix?: string }) { return <div className="contentBlock"><h4>{title}</h4>{suffix && <span>{suffix}</span>}<p>{text}</p></div>; }
function RestRow({ date }: { date: string }) { return <div className="restRow"><DateBadge date={date}/><div><b>Repos</b><p>Récupération et sommeil</p></div><span>☾</span></div>; }
function DateBadge({ date }: { date: string }) { const parsed = new Date(`${date}T12:00:00Z`); return <div className="dateBadge"><span>{['DIM','LUN','MAR','MER','JEU','VEN','SAM'][parsed.getUTCDay()]}</span><b>{parsed.getUTCDate()}</b></div>; }
function daysOfWeek(start: string, end: string) { const days: string[] = []; for (let time = Date.parse(`${start}T12:00:00Z`); time <= Date.parse(`${end}T12:00:00Z`); time += 86_400_000) days.push(new Date(time).toISOString().slice(0,10)); return days; }
function formatRange(start: string, end: string) { const a = new Date(`${start}T12:00:00Z`); const b = new Date(`${end}T12:00:00Z`); return `${a.getUTCDate()} ${a.toLocaleDateString('fr-CH',{month:'short',timeZone:'UTC'})} – ${b.getUTCDate()} ${b.toLocaleDateString('fr-CH',{month:'short',year:'numeric',timeZone:'UTC'})}`.replace(/\./g,''); }
function phaseLabel(phase: CoachState['weeks'][number]['phase']) { return ({learn:'Apprendre',combine:'Combiner',trail_event:'Semaine trail',reset:'Récupérer',integrate:'Intégrer',peak:'Pic spécifique',taper:'Alléger'} as const)[phase]; }
function formatDateTime(value: string) { return new Date(value).toLocaleString('fr-CH',{dateStyle:'medium',timeStyle:'short'}); }
