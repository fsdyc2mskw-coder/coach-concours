import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const API_URL = 'https://opendata.myswitzerland.io/v1/tours';
const outputPath = resolve('src/data/swiss-trails.generated.json');
const geodataCachePath = resolve('.tmp/swiss-trails-geodata-cache.json');

const apiKey = process.env.MYSWITZERLAND_API_KEY || await readLocalApiKey();
if (!apiKey) {
  throw new Error('MYSWITZERLAND_API_KEY manque dans l’environnement ou .env.local.');
}

const geodataOnly = process.argv.includes('--geodata-only');
const cacheOnly = process.argv.includes('--cache-only');
let baseRoutes;

if (geodataOnly) {
  const existing = JSON.parse(await readFile(outputPath, 'utf8'));
  baseRoutes = existing.routes.map((route) => ({
    ...route,
    durationMin: route.durationMin === 0 ? null : route.durationMin
  }));
  console.log(`Reprise géographique : ${baseRoutes.length} itinéraires locaux`);
} else {
  const firstPage = await fetchPage(0);
  console.log('SuisseMobile : première page reçue');
  const totalPages = firstPage.meta?.page?.totalPages;
  if (!Number.isInteger(totalPages) || totalPages < 1) {
    throw new Error('La pagination de l’API Suisse Tourisme est invalide.');
  }

  const pages = [firstPage];
  for (let page = 1; page < totalPages; page += 1) {
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
    pages.push(await fetchPage(page));
    if ((page + 1) % 5 === 0 || page + 1 === totalPages) {
      console.log(`SuisseMobile : ${page + 1}/${totalPages} pages`);
    }
  }

  baseRoutes = pages
    .flatMap((page) => Array.isArray(page.data) ? page.data : [])
    .map(toCatalogRoute)
    .filter((route) => route !== null)
    .filter((route, index, all) => all.findIndex((candidate) => candidate.id === route.id) === index);
}

const geodataCache = await readGeodataCache();
const refreshGeodata = process.argv.includes('--refresh-geodata');
let fetchedGeodata = 0;
const pendingGeodata = cacheOnly ? [] : baseRoutes.filter((route) =>
  refreshGeodata || !isSwissCoordinate(geodataCache[route.id])
);

for (let index = 0; index < pendingGeodata.length; index += 1) {
  const route = pendingGeodata[index];
  const coordinate = await fetchStartCoordinate(route.id);
  if (coordinate) {
    geodataCache[route.id] = coordinate;
  }
  fetchedGeodata += 1;

  if ((index + 1) % 25 === 0 || index + 1 === pendingGeodata.length) {
    await writeGeodataCache(geodataCache);
    console.log(`Géodonnées : ${index + 1}/${pendingGeodata.length} téléchargements restants`);
  }
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 900));
}

const routes = baseRoutes
  .map(({ geodataUrl: _geodataUrl, ...route }) => {
    const coordinate = geodataCache[route.id];
    return {
      ...route,
      latitude: coordinate?.[1] ?? null,
      longitude: coordinate?.[0] ?? null,
      coordinatesSource: coordinate ? 'geodata' : 'unavailable'
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

if (routes.length < 500) {
  throw new Error(`Synchronisation incomplète : seulement ${routes.length} itinéraires valides.`);
}

const locatedCount = routes.filter((route) => route.coordinatesSource === 'geodata').length;
const minimumLocatedRatio = cacheOnly ? 0.5 : 0.9;
if (locatedCount < routes.length * minimumLocatedRatio) {
  throw new Error(`Géodonnées incomplètes : seulement ${locatedCount}/${routes.length} départs valides.`);
}

const catalog = {
  generatedAt: new Date().toISOString(),
  source: 'SuisseMobile via Switzerland Tourism OpenData',
  license: 'CC BY-SA 4.0',
  count: routes.length,
  locatedCount,
  routes
};

await mkdir(resolve('src/data'), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
console.log(`Catalogue écrit : ${routes.length} itinéraires, ${locatedCount} départs géolocalisés (${fetchedGeodata} téléchargés).`);

async function readLocalApiKey() {
  try {
    const contents = await readFile(resolve('.env.local'), 'utf8');
    const line = contents.split(/\r?\n/).find((entry) => entry.startsWith('MYSWITZERLAND_API_KEY='));
    return line?.slice('MYSWITZERLAND_API_KEY='.length).trim();
  } catch {
    return undefined;
  }
}

async function fetchPage(page) {
  const url = new URL(API_URL);
  url.searchParams.set('lang', 'fr');
  url.searchParams.append('facet.filter', 'origin:schweiz-mobil');
  url.searchParams.append('facet.filter', 'routestypes:hike');
  url.searchParams.set('hitsPerPage', '50');
  url.searchParams.set('expand', 'true');
  url.searchParams.set('striphtml', 'true');
  url.searchParams.set('page', String(page));

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    let response;
    try {
      response = await fetch(url, {
        headers: { 'x-api-key': apiKey },
        signal: AbortSignal.timeout(20_000)
      });
    } catch (cause) {
      if (attempt === 6) throw cause;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 2_000));
      continue;
    }
    if (response.ok) {
      return response.json();
    }
    if (attempt === 6 || (response.status < 500 && response.status !== 429)) {
      throw new Error(`API Suisse Tourisme : HTTP ${response.status} à la page ${page}.`);
    }
    const retryAfterSec = Number(response.headers.get('retry-after'));
    const delayMs = Number.isFinite(retryAfterSec) && retryAfterSec > 0
      ? retryAfterSec * 1_000
      : response.status === 429 ? 65_000 : attempt * 2_000;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, delayMs));
  }

  throw new Error(`Impossible de charger la page ${page}.`);
}

async function fetchStartCoordinate(id) {
  const url = `${API_URL}/${encodeURIComponent(id)}/geodata`;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    let response;
    try {
      response = await fetch(url, {
        headers: { 'x-api-key': apiKey },
        signal: AbortSignal.timeout(20_000)
      });
    } catch (cause) {
      if (attempt === 6) throw cause;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 2_000));
      continue;
    }
    if (response.ok) {
      const geodata = await response.json();
      return firstSwissCoordinate(geodata?.features);
    }
    if (response.status === 404) {
      return null;
    }
    if (attempt === 6 || (response.status < 500 && response.status !== 429)) {
      throw new Error(`API Suisse Tourisme : HTTP ${response.status} pour les géodonnées ${id}.`);
    }
    const retryAfterSec = Number(response.headers.get('retry-after'));
    const delayMs = Number.isFinite(retryAfterSec) && retryAfterSec > 0
      ? retryAfterSec * 1_000
      : response.status === 429 ? 65_000 : attempt * 2_000;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, delayMs));
  }
  return null;
}

async function readGeodataCache() {
  try {
    return JSON.parse(await readFile(geodataCachePath, 'utf8'));
  } catch {
    return {};
  }
}

async function writeGeodataCache(cache) {
  await mkdir(resolve('.tmp'), { recursive: true });
  await writeFile(geodataCachePath, JSON.stringify(cache), 'utf8');
}

function firstSwissCoordinate(value) {
  if (!Array.isArray(value)) return null;
  if (value.length >= 2 && value.every((item, index) => index > 1 || typeof item === 'number')) {
    const coordinate = [Number(value[0]), Number(value[1])];
    return isSwissCoordinate(coordinate) ? coordinate : null;
  }
  for (const item of value) {
    const coordinate = firstSwissCoordinate(item?.geometry?.coordinates ?? item);
    if (coordinate) return coordinate;
  }
  return null;
}

function isSwissCoordinate(value) {
  return Array.isArray(value) && value.length >= 2 &&
    Number.isFinite(value[0]) && Number.isFinite(value[1]) &&
    value[0] >= 5.8 && value[0] <= 10.7 && value[1] >= 45.7 && value[1] <= 47.9;
}

function toCatalogRoute(item) {
  const distanceKm = finiteNumber(item.specs?.distance);
  const elevationGainM = finiteNumber(item.specs?.ascent);
  const officialUrl = item.switzerlandMobility?.url || item.url;

  if (!item.identifier || !item.name || distanceKm <= 0 || elevationGainM < 0 || !officialUrl) {
    return null;
  }

  const itinerary = Array.isArray(item.itinerary)
    ? item.itinerary.map((place) => cleanText(place?.name)).filter(Boolean)
    : [];
  const place = itinerary.length > 1 && itinerary[0] !== itinerary.at(-1)
    ? `${itinerary[0]} – ${itinerary.at(-1)}`
    : itinerary[0] || 'Suisse';
  const warning = item.switzerlandMobility?.warnings;

  return {
    id: item.identifier,
    name: cleanText(item.name),
    place,
    geodataUrl: item.switzerlandMobility?.geodata,
    distanceKm,
    elevationGainM,
    elevationLossM: optionalNumber(item.specs?.descent),
    durationMin: optionalNumber(item.specs?.duration),
    difficulty: mapDifficulty(
      item.switzerlandMobility?.requirements?.technical,
      item.switzerlandMobility?.requirements?.endurance
    ),
    season: cleanText(item.specs?.season) || 'Selon les conditions',
    description: truncate(cleanText(item.abstract), 280),
    url: officialUrl,
    warning: warning?.url ? {
      title: cleanText(warning.title) || 'Information sur l’itinéraire',
      url: warning.url
    } : undefined
  };
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function optionalNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function cleanText(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) return value;
  const shortened = value.slice(0, maxLength - 1);
  const lastSpace = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, lastSpace > maxLength * 0.7 ? lastSpace : undefined)}…`;
}

function mapDifficulty(technical, endurance) {
  const levels = { easy: 1, medium: 2, difficult: 3 };
  const level = Math.max(levels[technical] || 1, levels[endurance] || 1);
  return level === 3 ? 'difficile' : level === 2 ? 'moyen' : 'facile';
}
