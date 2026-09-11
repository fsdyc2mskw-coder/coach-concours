import { useEffect, useState } from 'react';

export type AppRoute =
  | { name: 'dashboard'; path: '/dashboard' }
  | { name: 'plan'; path: '/plan' }
  | { name: 'activities'; path: '/activities' }
  | { name: 'trails'; path: '/trails' }
  | { name: 'settings'; path: '/settings' }
  | { name: 'session'; path: string; workoutId: string }
  | { name: 'onboarding'; path: '/onboarding' };

export function useAppRoute(): AppRoute {
  const [route, setRoute] = useState<AppRoute>(() => parseHash(window.location.hash));

  useEffect(() => {
    const handler = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return route;
}

export function navigate(path: string): void {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (window.location.hash === `#${normalized}`) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.location.hash = normalized;
}

export function sessionPath(workoutId: string): string {
  return `/session/${encodeURIComponent(workoutId)}`;
}

function parseHash(hash: string): AppRoute {
  const raw = hash.replace(/^#/, '') || '/dashboard';
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  const sessionMatch = path.match(/^\/session\/([^/?#]+)$/);
  if (sessionMatch?.[1]) {
    let workoutId: string;
    try {
      workoutId = decodeURIComponent(sessionMatch[1]);
    } catch {
      return { name: 'dashboard', path: '/dashboard' };
    }
    return {
      name: 'session',
      path,
      workoutId
    };
  }
  switch (path) {
    case '/onboarding':
      return { name: 'onboarding', path };
    case '/plan':
      return { name: 'plan', path };
    case '/activities':
      return { name: 'activities', path };
    case '/trails':
      return { name: 'trails', path };
    case '/settings':
      return { name: 'settings', path };
    case '/dashboard':
    default:
      return { name: 'dashboard', path: '/dashboard' };
  }
}
