import { useState, type FormEvent } from 'react';
import { useApp } from '../app/AppContext';
import type { AppRoute } from '../app/router';
import { navigate } from '../app/router';
import { AppShell } from '../components/AppShell';
import { GoogleDriveSetupGuide } from '../components/GoogleDriveSetupGuide';
import { addDays, startOfWeekMonday, todayKey } from '../domain/utils';

export function OnboardingScreen({ route }: { route: AppRoute }) {
  const {
    state,
    googleSession,
    driveBusy,
    initializeProfile,
    loadDemo,
    connectGoogle
  } = useApp();
  const [goalKind, setGoalKind] = useState<'race' | 'progression'>('race');
  const [displayName, setDisplayName] = useState('Max');
  const [goalName, setGoalName] = useState('Trail court objectif');
  const today = todayKey();
  const latestTargetDate = addDays(startOfWeekMonday(today), 24 * 7 - 1);
  const [targetDate, setTargetDate] = useState(addDays(today, 70));
  const [distanceKm, setDistanceKm] = useState('20');
  const [elevationGainM, setElevationGainM] = useState('1000');
  const [weeklyDistanceKm, setWeeklyDistanceKm] = useState('20');
  const [easyPace, setEasyPace] = useState('6:30');
  const [error, setError] = useState<string | null>(null);
  const googleClientConfigured = Boolean(
    state.settings.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID
  );

  async function signIn() {
    setError(null);
    try {
      await connectGoogle();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (state.settings.requireGoogleAuth && !googleSession) {
      setError('Connecter le compte Google avant de créer le plan.');
      return;
    }
    const distance = Number(distanceKm);
    const elevation = Number(elevationGainM);
    const weekly = Number(weeklyDistanceKm);
    const pace = parsePace(easyPace);
    if (
      goalKind === 'race' &&
      (!targetDate ||
        targetDate < today ||
        targetDate > latestTargetDate ||
        !Number.isFinite(distance) ||
        distance < 5 ||
        distance > 30 ||
        !Number.isFinite(elevation) ||
        elevation < 0 ||
        elevation > 5_000)
    ) {
      setError('Pour une course, indiquer une date dans les 24 prochaines semaines, une distance entre 5 et 30 km et un dénivelé positif valide.');
      return;
    }
    if (!Number.isFinite(weekly) || weekly < 5 || weekly > 100 || pace === null) {
      setError('Les valeurs provisoires de volume et d’allure ne sont pas valides.');
      return;
    }
    try {
      initializeProfile({
        displayName,
        goalKind,
        goalName,
        ...(goalKind === 'race'
          ? { targetDate, distanceKm: distance, elevationGainM: elevation }
          : {}),
        weeklyRunningDistanceKm: weekly,
        easyPaceSecPerKm: pace
      });
      navigate('/dashboard');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  function demo() {
    loadDemo();
    navigate('/dashboard');
  }

  return (
    <AppShell route={route} featureId="onboarding" hideNavigation>
      <main className="screen onboarding-screen">
        <div className="brand-lockup">
          <img src="./icons/icon-192.png" alt="" aria-hidden="true" />
          <div>
            <p className="eyebrow">Trail Coach</p>
            <h1>Créer le premier plan</h1>
          </div>
        </div>

        <p className="lead">
          Application personnelle pour préparer un trail court ou progresser en trail. Le plan reste local et peut être synchronisé vers Google Drive.
        </p>

        <section className="card card--accent">
          <div className="section-row">
            <div>
              <h2>Sauvegarde Google Drive</h2>
              <p>Choisis le compte qui doit conserver la sauvegarde, par exemple celui de ta sœur.</p>
            </div>
            <span className={googleSession ? 'status-badge status-badge--ok' : 'status-badge'}>
              {googleSession ? 'Connecté' : state.settings.requireGoogleAuth ? 'Requis' : 'Recommandé'}
            </span>
          </div>
          {!googleClientConfigured ? <GoogleDriveSetupGuide /> : null}
          {!googleSession && googleClientConfigured ? (
            <button className="button button--primary button--full" type="button" disabled={driveBusy} onClick={() => void signIn()}>
              {driveBusy ? 'Connexion…' : 'Connecter Google Drive'}
            </button>
          ) : googleSession ? (
            <p className="account-line">{googleSession.account.email}</p>
          ) : null}
        </section>

        <form className="stack" onSubmit={submit} noValidate>
          <section className="card">
            <h2>Profil</h2>
            <label className="field">
              <span>Nom affiché</span>
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" />
            </label>
          </section>

          <section className="card">
            <h2>Objectif principal</h2>
            <div className="segmented" role="group" aria-label="Type d’objectif">
              <button
                type="button"
                className={goalKind === 'race' ? 'is-active' : ''}
                onClick={() => setGoalKind('race')}
              >
                Course
              </button>
              <button
                type="button"
                className={goalKind === 'progression' ? 'is-active' : ''}
                onClick={() => setGoalKind('progression')}
              >
                Progression générale
              </button>
            </div>
            <label className="field">
              <span>Nom de l’objectif</span>
              <input value={goalName} onChange={(event) => setGoalName(event.target.value)} />
            </label>
            {goalKind === 'race' ? (
              <div className="form-grid">
                <label className="field field--full">
                  <span>Date</span>
                  <input type="date" min={today} max={latestTargetDate} value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
                </label>
                <label className="field">
                  <span>Distance, km</span>
                  <input type="number" min="5" max="30" step="0.1" inputMode="decimal" value={distanceKm} onChange={(event) => setDistanceKm(event.target.value)} />
                </label>
                <label className="field">
                  <span>Dénivelé positif, m</span>
                  <input type="number" min="0" max="5000" step="10" inputMode="numeric" value={elevationGainM} onChange={(event) => setElevationGainM(event.target.value)} />
                </label>
              </div>
            ) : null}
          </section>

          <section className="card">
            <h2>Base provisoire</h2>
            <p className="muted">Ces deux valeurs permettent de générer un plan avant la première synchronisation Garmin. Elles seront recalibrées avec l’historique.</p>
            <div className="form-grid">
              <label className="field">
                <span>Volume actuel, km/semaine</span>
                <input type="number" min="5" max="100" step="1" inputMode="decimal" value={weeklyDistanceKm} onChange={(event) => setWeeklyDistanceKm(event.target.value)} />
              </label>
              <label className="field">
                <span>Allure facile, min/km</span>
                <input inputMode="numeric" value={easyPace} onChange={(event) => setEasyPace(event.target.value)} placeholder="6:30" />
              </label>
            </div>
          </section>

          {error ? <p className="field-error" role="alert">{error}</p> : null}
          <button className="button button--primary button--full button--large" type="submit">
            Générer le plan
          </button>
          {!state.settings.requireGoogleAuth ? (
            <button className="button button--ghost button--full" type="button" onClick={demo}>
              Charger une démonstration complète
            </button>
          ) : null}
        </form>
      </main>
    </AppShell>
  );
}

function parsePace(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):([0-5]\d)$/);
  if (!match) {
    return null;
  }
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const total = minutes * 60 + seconds;
  return total >= 180 && total <= 900 ? total : null;
}
