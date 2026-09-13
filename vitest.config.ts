import { defineConfig } from 'vitest/config';

// CHANGE_REQUEST_008 — first real test suite. Kept as a standalone config
// (rather than a `test` block bolted onto vite.config.ts) so the test runner
// never depends on the PWA/service-worker plugin pipeline used for the app
// build. jsdom gives the persistence tests `localStorage`/`window` without
// providing IndexedDB (jsdom does not implement it), which matches how the
// storage layer already degrades to its localStorage fallback.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts']
  }
});
