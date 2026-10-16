# APP_REPORT_020: safe-area header and bottom bar (iPhone)

Tier: MID, Sonnet, effort medium (the session model matches the tier). Branch `cr-020-safe-area-header`.

## What changed
```
 index.html    viewport-fit=cover was already present: no change
 status bar    apple-mobile-web-app-status-bar-style stays black-translucent; the safe-area
               padding below moves the content out of the status bar zone (see "Questions")
 .shell        padding-top  = max(12px, env(safe-area-inset-top)) + 8px  (20px fallback as before)
               padding-left/right = max(16px, env(safe-area-inset-left / right))
               one place: every screen (list header, .snav on session, block, memory game
               screens) lives in this single container, so no screen is fixed one by one
 .actionsBar   bottom = max(26px, inset-bottom + 12px), sides follow the side insets
 .gameBar      bottom = max(14px, inset-bottom + 12px), sides follow the side insets
 .tabbar       bottom = max(18px, inset-bottom + 12px); the old padding-bottom inside its
               fixed 64px height is removed (it squeezed the icons on a phone with a home bar)
 .act          justify-content: center, so icon and label ("Voir le plan" included) are
               centred together in every bottom action button
 back button   .snav .back already 44 x 44 px; with the shell padding it is fully below the inset
 scaling       none (no zoom, transform scale or html font-size)
```
Without a notch or home bar the layout is the same as before (the max() fallbacks equal the old values).

## Tests added
`src/__tests__/cr020.test.ts` (8 tests): viewport-fit=cover; shell uses `max(12px, env(safe-area-inset-top))` and side insets; `.actionsBar`, `.gameBar`, `.tabbar` use `max(` with `env(safe-area-inset-bottom)`; back button 44 x 44; no scaling; `.act` centred.
`typecheck`, `test` (313 passed), `build` pass.

## Screens checked
Checked by stylesheet and unit test only. Not checked in a device simulator or browser device mode, and not on a real iPhone: the coder cannot see one. All screens share `.shell`, `.snav`, `.actionsBar`, `.gameBar`, `.tabbar`, so the change covers Intervalles course (Prévu, Fait, Retour), day and session screens, the memory game, test, baseline and settings. Scrolling: the header scrolls with the page inside the padded shell; it is not sticky, so it never sits under the status bar.

## Athlete's check
Close the app fully and reopen it (the PWA can serve old cached code after a deploy). Then: arrow below the clock opens the previous screen on the first tap; "Voir le plan" centred and clear of the home bar; repeat on one day screen and on the memory game.

## Questions / not done
- Status bar style: black-translucent kept. If the arrow is still in the status bar zone after the check above, the alternative is `default` or `black` (the page then starts below the bar by itself); not decided here.
- Sheets or dialogs with their own header: none found in the code.
- Untracked files in the repo root (`NOTE_no_terminal_git_workarounds.md`, `tsconfig.app.tsbuildinfo`) were left alone.

Commit: see the last line.
Commit hash: 930dc92
