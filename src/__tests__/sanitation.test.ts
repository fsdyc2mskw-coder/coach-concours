// CHANGE_REQUEST_008 — Sanitation test.
//
// This file does NOT touch or re-implement the `no-personal-names` CI step
// (that script/step stays exactly as CR-006 left it). It only:
//  1. confirms that step still exists in .github/workflows/deploy.yml and
//     still runs before validate/typecheck/test/build, by reading the
//     workflow file as text (no execution of the guard itself);
//  2. adds one unit test that the athlete display name defaults to a
//     neutral placeholder rather than a real name.
//
// The default actually used by the running app (CoachConcoursApp.tsx →
// src/infrastructure/coachStorage.ts's createInitialState) is `athleteName:
// 'Athlète'`. src/app/seed.ts also has a default profile
// (`displayName: 'Max'`) but that belongs to src/domain/types.ts's generic
// AppState, which is not wired into the app (main.tsx renders only
// CoachConcoursApp, backed by CoachState) — see APP_REPORT_008.md.
import { describe, expect, it } from 'vitest';
import { createInitialState } from '../infrastructure/coachStorage';

// Read as raw text via Vite's import.meta.glob (no Node `fs`/`path` types are
// configured for src/, so this stays inside the same bundler-resolution
// world the rest of src/ already uses — see src/domain/swissTrails.ts and
// src/infrastructure/driveSync.ts for other non-`.ts` imports).
const workflowFiles = import.meta.glob('../../.github/workflows/deploy.yml', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;
const workflowPath = Object.keys(workflowFiles)[0];

describe('no-personal-names CI guard stays wired in first', () => {
  it('exists in the deploy workflow and runs before validate/typecheck/test/build', () => {
    expect(workflowPath).toBeDefined();
    const workflow = workflowFiles[workflowPath!]!;
    const guardIndex = workflow.indexOf('no-personal-names');
    const validateIndex = workflow.indexOf('Validate schemas');
    const typecheckIndex = workflow.indexOf('Type check');
    const testIndex = workflow.indexOf('name: Test');
    const buildIndex = workflow.indexOf('name: Build');

    expect(guardIndex).toBeGreaterThan(-1);
    expect(guardIndex).toBeLessThan(validateIndex);
    expect(guardIndex).toBeLessThan(typecheckIndex);
    expect(guardIndex).toBeLessThan(testIndex);
    expect(guardIndex).toBeLessThan(buildIndex);
  });
});

describe('athlete display name default', () => {
  it('defaults to the neutral placeholder "Athlète", not a real name', () => {
    const state = createInitialState();
    expect(state.athleteName).toBe('Athlète');
  });
});
