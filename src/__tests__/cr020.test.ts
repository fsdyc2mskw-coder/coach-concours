// CHANGE_REQUEST_020: safe-area header and bottom bar (iPhone).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8');
const css = read('src/coach.css');
const rule = (selector: string) => {
  const match = css.match(new RegExp(`^${selector.replace(/[.]/g, '\\.')} \\{[^}]*\\}`, 'm'));
  expect(match, `rule ${selector}`).not.toBeNull();
  return match![0];
};

describe('CR-020 safe areas', () => {
  it('the viewport covers the whole screen', () => {
    expect(read('index.html')).toContain('viewport-fit=cover');
  });

  it('the shared page container keeps the header below the status bar, with a max() fallback', () => {
    const shell = rule('.shell');
    expect(shell).toMatch(/max\(12px, env\(safe-area-inset-top\)\)/);
    expect(shell).toMatch(/max\(16px, env\(safe-area-inset-left\)\)/);
    expect(shell).toMatch(/max\(16px, env\(safe-area-inset-right\)\)/);
  });

  it.each(['.actionsBar', '.gameBar', '.tabbar'])('%s sits above the home bar, with a max() fallback', (selector) => {
    expect(rule(selector)).toMatch(/max\([^;]*env\(safe-area-inset-bottom\)/);
  });

  it('the back button is at least 44 by 44 px', () => {
    const back = rule('.snav .back');
    expect(back).toMatch(/width: 44px/);
    expect(back).toMatch(/height: 44px/);
  });

  it('the page is never scaled', () => {
    expect(css).not.toMatch(/\bzoom\s*:/);
    expect(rule('.shell')).not.toMatch(/scale\(/);
  });

  it('the bottom action buttons centre their icon and label', () => {
    const act = rule('.act');
    expect(act).toMatch(/display: flex/);
    expect(act).toMatch(/align-items: center/);
    expect(act).toMatch(/justify-content: center/);
  });
});
