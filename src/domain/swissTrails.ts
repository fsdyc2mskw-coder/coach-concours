import catalog from '../data/swiss-trails.generated.json';
import type { TrailRegion } from './types';

type Difficulty = 'facile' | 'moyen' | 'difficile';

interface CatalogRoute {
  id: string;
  name: string;
  place: string;
  latitude: number | null;
  longitude: number | null;
  coordinatesSource: 'geodata' | 'unavailable';
  distanceKm: number;
  elevationGainM: number;
  elevationLossM: number | null;
  durationMin: number | null;
  difficulty: Difficulty;
  season: string;
  description: string;
  url: string;
  warning?: { title: string; url: string };
}

export interface SwissTrailSuggestion extends CatalogRoute {
  kind: 'official-route';
  sourceLabel: 'SuisseMobile';
}

export interface NearbySwissTrail extends SwissTrailSuggestion {
  distanceFromOriginKm: number | null;
}

export type TrailLengthFilter = 'all' | 'short' | 'medium' | 'long' | 'ultra';

export const SWISS_TRAIL_CATALOG_META = {
  count: catalog.count,
  locatedCount: catalog.locatedCount,
  generatedAt: catalog.generatedAt,
  source: catalog.source,
  license: catalog.license
};

export const TRAIL_REGION_OPTIONS: Array<{ value: TrailRegion; label: string }> = [
  { value: 'lausanne', label: 'Lausanne et environs' },
  { value: 'romandie', label: 'Suisse romande' },
  { value: 'valais', label: 'Valais' },
  { value: 'oberland', label: 'Berne et Oberland' },
  { value: 'central', label: 'Suisse centrale' },
  { value: 'east', label: 'Suisse orientale' },
  { value: 'ticino', label: 'Tessin' },
  { value: 'all', label: 'Toute la Suisse' }
];

// Le format est produit et contrôlé par scripts/sync-swiss-trails.mjs.
const routes = catalog.routes as CatalogRoute[];

export function suggestSwissTrails(
  distanceKm: number,
  elevationGainM: number,
  region: TrailRegion,
  limit = 3
): SwissTrailSuggestion[] {
  return routes
    .filter((route) => isInRegion(route, region))
    .sort((a, b) => score(a, distanceKm, elevationGainM, region) -
      score(b, distanceKm, elevationGainM, region))
    .slice(0, limit)
    .map((route) => ({ ...route, kind: 'official-route', sourceLabel: 'SuisseMobile' }));
}

export function nearbySwissTrails(
  latitude: number,
  longitude: number,
  lengthFilter: TrailLengthFilter = 'all'
): NearbySwissTrail[] {
  return routes
    .filter((route) => matchesLength(route.distanceKm, lengthFilter))
    .map((route) => ({
      ...route,
      kind: 'official-route' as const,
      sourceLabel: 'SuisseMobile' as const,
      distanceFromOriginKm: route.latitude !== null && route.longitude !== null
        ? haversineKm(latitude, longitude, route.latitude, route.longitude)
        : null
    }))
    .sort((a, b) => compareNullableDistance(a.distanceFromOriginKm, b.distanceFromOriginKm) ||
      a.distanceKm - b.distanceKm);
}

export function trailRegionLabel(region: TrailRegion): string {
  return TRAIL_REGION_OPTIONS.find((option) => option.value === region)?.label ?? 'Toute la Suisse';
}

function score(
  route: CatalogRoute,
  targetDistanceKm: number,
  targetElevationGainM: number,
  region: TrailRegion
): number {
  const distanceDelta = Math.abs(route.distanceKm - targetDistanceKm) / Math.max(5, targetDistanceKm);
  const elevationDelta = Math.abs(route.elevationGainM - targetElevationGainM) /
    Math.max(200, targetElevationGainM);
  const proximity = region === 'lausanne' && route.latitude !== null && route.longitude !== null
    ? haversineKm(route.latitude, route.longitude, 46.5197, 6.6323) / 400
    : 0;
  return distanceDelta + elevationDelta + proximity;
}

function isInRegion(route: CatalogRoute, region: TrailRegion): boolean {
  const { latitude: lat, longitude: lon } = route;
  if (region === 'all') return true;
  if (lat === null || lon === null) return false;
  switch (region) {
    case 'lausanne':
      return haversineKm(lat, lon, 46.5197, 6.6323) <= 80;
    case 'romandie':
      return lat >= 45.75 && lon >= 5.85 && lon <= 7.75;
    case 'valais':
      return lat >= 45.75 && lat <= 46.55 && lon >= 6.75 && lon <= 8.65;
    case 'oberland':
      return lat >= 46.25 && lat <= 47.05 && lon >= 7.1 && lon <= 8.45;
    case 'central':
      return lat >= 46.65 && lat <= 47.35 && lon >= 7.8 && lon <= 9;
    case 'east':
      return lat >= 46.65 && lon >= 8.55;
    case 'ticino':
      return lat < 46.75 && lon >= 8.35 && lon <= 9.25;
  }
}

function compareNullableDistance(a: number | null, b: number | null): number {
  if (a === null) return b === null ? 0 : 1;
  if (b === null) return -1;
  return a - b;
}

function haversineKm(latA: number, lonA: number, latB: number, lonB: number): number {
  const radians = Math.PI / 180;
  const latDelta = (latB - latA) * radians;
  const lonDelta = (lonB - lonA) * radians;
  const value = Math.sin(latDelta / 2) ** 2 +
    Math.cos(latA * radians) * Math.cos(latB * radians) * Math.sin(lonDelta / 2) ** 2;
  return 6_371 * 2 * Math.asin(Math.sqrt(value));
}

function matchesLength(distanceKm: number, filter: TrailLengthFilter): boolean {
  switch (filter) {
    case 'short':
      return distanceKm < 10;
    case 'medium':
      return distanceKm >= 10 && distanceKm < 20;
    case 'long':
      return distanceKm >= 20 && distanceKm <= 30;
    case 'ultra':
      return distanceKm > 30;
    case 'all':
      return true;
  }
}
