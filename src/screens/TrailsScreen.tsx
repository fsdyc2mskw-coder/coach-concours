import { useEffect, useMemo, useState } from 'react';
import type { AppRoute } from '../app/router';
import { AppShell } from '../components/AppShell';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  nearbySwissTrails,
  SWISS_TRAIL_CATALOG_META,
  type TrailLengthFilter
} from '../domain/swissTrails';
import { formatDuration } from '../domain/utils';

const LAUSANNE = { latitude: 46.5197, longitude: 6.6323, label: 'Lausanne' };
const PAGE_SIZE = 20;

const lengthOptions: Array<{ value: TrailLengthFilter; label: string }> = [
  { value: 'all', label: 'Toutes les longueurs' },
  { value: 'short', label: 'Moins de 10 km' },
  { value: 'medium', label: '10 à 20 km' },
  { value: 'long', label: '20 à 30 km' },
  { value: 'ultra', label: 'Plus de 30 km' }
];

export function TrailsScreen({ route }: { route: AppRoute }) {
  const [origin, setOrigin] = useState(LAUSANNE);
  const [lengthFilter, setLengthFilter] = useState<TrailLengthFilter>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [locationStatus, setLocationStatus] = useState<'default' | 'loading' | 'located' | 'error'>('default');
  const [locationError, setLocationError] = useState('');
  const trails = useMemo(
    () => nearbySwissTrails(origin.latitude, origin.longitude, lengthFilter),
    [lengthFilter, origin.latitude, origin.longitude]
  );

  useEffect(() => setVisibleCount(PAGE_SIZE), [lengthFilter, origin.latitude, origin.longitude]);

  function locate() {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('La localisation n’est pas disponible sur cet appareil. Le classement reste basé sur Lausanne.');
      return;
    }

    setLocationStatus('loading');
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: 'votre position'
        });
        setLocationStatus('located');
      },
      () => {
        setLocationStatus('error');
        setLocationError('Position non disponible. Le classement reste basé sur Lausanne.');
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
    );
  }

  return (
    <AppShell route={route} featureId="nearby-trails">
      <main className="screen">
        <ScreenHeader
          eyebrow={`${SWISS_TRAIL_CATALOG_META.locatedCount.toLocaleString('fr-CH')} départs vérifiés · ${SWISS_TRAIL_CATALOG_META.count.toLocaleString('fr-CH')} itinéraires`}
          title="Parcours près de moi"
          description="Les départs vérifiés sont classés du plus proche au plus éloigné. Les autres parcours restent accessibles avec une distance inconnue."
        />

        <section className="card stack" data-feature-id="trail-location">
          <div className="section-row">
            <div>
              <p className="eyebrow">Point de départ</p>
              <h2>Depuis {origin.label}</h2>
            </div>
            <button className="button button--primary" type="button" disabled={locationStatus === 'loading'} onClick={locate}>
              {locationStatus === 'loading' ? 'Localisation…' : 'Ma position'}
            </button>
          </div>
          <p className="muted">
            La distance indiquée est à vol d’oiseau jusqu’au départ du parcours. Votre position n’est ni enregistrée ni envoyée.
          </p>
          {locationError ? <p className="error-box" role="alert">{locationError}</p> : null}
        </section>

        <section className="section stack" data-feature-id="trail-catalog">
          <label className="field">
            <span>Longueur du parcours</span>
            <select value={lengthFilter} onChange={(event) => setLengthFilter(event.target.value as TrailLengthFilter)}>
              {lengthOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <div className="section-row">
            <h2>Les plus proches</h2>
            <span className="muted">{trails.length.toLocaleString('fr-CH')} parcours</span>
          </div>

          <div className="trail-list">
            {trails.slice(0, visibleCount).map((trail) => (
              <article className="trail-card" key={trail.id}>
                <div className="section-row">
                  <div>
                    <p className="eyebrow">{trail.place}</p>
                    <h3>{trail.name}</h3>
                  </div>
                  <span className="trail-distance">{formatNearbyDistance(trail.distanceFromOriginKm)}</span>
                </div>
                {trail.description ? <p>{trail.description}</p> : null}
                <p className="trail-card__metrics">
                  {trail.distanceKm} km · {trail.elevationGainM} m D+
                  {trail.elevationLossM !== null ? ` · ${trail.elevationLossM} m D−` : ''}
                </p>
                <p className="muted">
                  Niveau {trail.difficulty} · {trail.durationMin !== null ? formatDuration(trail.durationMin) : 'durée inconnue'} · {trail.season}
                </p>
                {trail.warning ? (
                  <a href={trail.warning.url} target="_blank" rel="noreferrer">⚠ {trail.warning.title}</a>
                ) : null}
                <a className="button button--secondary button--full" href={trail.url} target="_blank" rel="noreferrer">
                  Ouvrir la fiche SuisseMobile
                </a>
              </article>
            ))}
          </div>

          {visibleCount < trails.length ? (
            <button className="button button--secondary button--full" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
              Afficher 20 parcours de plus
            </button>
          ) : null}
          <p className="muted trail-results-count">
            {Math.min(visibleCount, trails.length).toLocaleString('fr-CH')} affichés sur {trails.length.toLocaleString('fr-CH')}
          </p>
        </section>
      </main>
    </AppShell>
  );
}

function formatNearbyDistance(distanceKm: number | null): string {
  if (distanceKm === null) return 'Distance inconnue';
  return distanceKm < 10 ? `${distanceKm.toFixed(1)} km` : `${Math.round(distanceKm)} km`;
}
