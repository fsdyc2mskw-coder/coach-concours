import { useState, type ReactNode } from 'react';
import type { AppRoute } from '../app/router';
import { useApp } from '../app/AppContext';
import { captureAppScreen } from '../infrastructure/screenshot';
import { BottomNav } from './BottomNav';
import { FeedbackSheet } from './FeedbackSheet';

interface AppShellProps {
  route: AppRoute;
  featureId: string;
  children: ReactNode;
  hideNavigation?: boolean;
}

export function AppShell({ route, featureId, children, hideNavigation = false }: AppShellProps) {
  const { state, recordTechnicalError } = useApp();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [captureBusy, setCaptureBusy] = useState(false);
  const [screenshot, setScreenshot] = useState<string | undefined>();
  const [captureError, setCaptureError] = useState<string | undefined>();
  const [featureIds, setFeatureIds] = useState<string[]>([featureId]);

  async function capture() {
    const target = document.getElementById('app-capture-target');
    if (!target) {
      setCaptureError('Zone de capture introuvable.');
      return;
    }
    setCaptureBusy(true);
    setCaptureError(undefined);
    try {
      const result = await captureAppScreen(target);
      setScreenshot(result);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setCaptureError(`Capture impossible : ${message}`);
      recordTechnicalError(`Capture d’écran : ${message}`);
    } finally {
      setCaptureBusy(false);
    }
  }

  async function openFeedback() {
    const target = document.getElementById('app-capture-target');
    const discovered = target
      ? Array.from(target.querySelectorAll<HTMLElement>('[data-feature-id]'))
          .map((element) => element.dataset.featureId)
          .filter((id): id is string => Boolean(id))
      : [];
    setFeatureIds([...new Set([featureId, ...discovered])]);
    setFeedbackOpen(true);
    if (state.settings.screenshotByDefault) {
      await capture();
    }
  }

  return (
    <div className={hideNavigation ? 'app-frame app-frame--without-nav' : 'app-frame'}>
      <div id="app-capture-target" className="app-frame__screen">
        {children}
      </div>
      {!hideNavigation ? <BottomNav route={route} /> : null}
      <button
        className="feedback-fab"
        type="button"
        data-no-capture="true"
        disabled={captureBusy}
        onClick={() => void openFeedback()}
        aria-label="Donner un feedback sur cet écran"
      >
        <span aria-hidden="true">✎</span>
        {captureBusy ? 'Capture…' : 'Feedback'}
      </button>
      <FeedbackSheet
        open={feedbackOpen}
        route={route.path}
        featureId={featureId}
        featureIds={featureIds}
        screenshotDataUrl={screenshot}
        captureError={captureError}
        onRecapture={capture}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  );
}
