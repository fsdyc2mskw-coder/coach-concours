// CHANGE_REQUEST_015 — vitest.config.ts keeps the test runner off the real
// PWA/service-worker plugin pipeline (see its own comment), so the real
// `virtual:pwa-register/react` module, which only exists inside that
// pipeline, is aliased to this stub for tests (see vitest.config.ts).
//
// `needRefresh` starts false: nothing in the test harness ever registers a
// real service worker, so no test sees the update banner by accident.
// `__triggerNeedRefresh()` flips it to true on every mounted instance, so
// cr015.test.ts can simulate "a new build is waiting" without touching the
// real service-worker API.
import { useEffect, useState } from 'react';

let setters: Array<(value: boolean) => void> = [];
let reloadCount = 0;

export function useRegisterSW() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    setters.push(setNeedRefresh);
    return () => {
      setters = setters.filter((setter) => setter !== setNeedRefresh);
    };
  }, []);

  return {
    needRefresh: [needRefresh, setNeedRefresh] as const,
    offlineReady: [offlineReady, setOfflineReady] as const,
    updateServiceWorker: async (_reloadPage?: boolean) => {
      reloadCount += 1;
    }
  };
}

export function __triggerNeedRefresh(): void {
  for (const setter of setters) setter(true);
}

export function __reloadCallCount(): number {
  return reloadCount;
}

export function __resetPwaMock(): void {
  reloadCount = 0;
  for (const setter of setters) setter(false);
}
