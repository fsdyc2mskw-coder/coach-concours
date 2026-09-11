import { useEffect } from 'react';
import { ErrorBoundary } from './app/ErrorBoundary';
import { useApp } from './app/AppContext';
import { navigate, useAppRoute, type AppRoute } from './app/router';
import { ActivitiesScreen } from './screens/ActivitiesScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { PlanScreen } from './screens/PlanScreen';
import { SessionScreen } from './screens/SessionScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TrailsScreen } from './screens/TrailsScreen';

const onboardingRoute: AppRoute = { name: 'onboarding', path: '/onboarding' };

export default function App() {
  const route = useAppRoute();
  const { state, ready, loadError, recordTechnicalError } = useApp();

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (!state.profile || !state.goal || !state.plan) {
      if (route.name !== 'onboarding') {
        navigate('/onboarding');
      }
      return;
    }
    if (route.name === 'onboarding') {
      navigate('/dashboard');
    }
  }, [ready, route.name, state.goal, state.plan, state.profile]);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      recordTechnicalError(`${event.message}${event.filename ? ` — ${event.filename}:${event.lineno}` : ''}`);
    };
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = event.reason instanceof Error ? event.reason.stack || event.reason.message : String(event.reason);
      recordTechnicalError(`Promesse rejetée : ${reason}`);
    };
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, [recordTechnicalError]);

  if (!ready) {
    return (
      <main className="loading-screen">
        <img src="./icons/icon-192.png" alt="" />
        <p>Chargement du plan…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="fatal-error">
        <div className="fatal-error__card">
          <p className="eyebrow">Données locales protégées</p>
          <h1>Le plan n’a pas pu être chargé.</h1>
          <p>Rien n’a été écrasé. Recharge l’application avant toute nouvelle saisie.</p>
          <button className="button button--primary" onClick={() => window.location.reload()} type="button">
            Recharger l’application
          </button>
        </div>
      </main>
    );
  }

  const needsOnboarding = !state.profile || !state.goal || !state.plan;

  return (
    <ErrorBoundary onError={recordTechnicalError}>
      {needsOnboarding ? <OnboardingScreen route={onboardingRoute} /> : renderRoute(route)}
    </ErrorBoundary>
  );
}

function renderRoute(route: AppRoute) {
  switch (route.name) {
    case 'plan':
      return <PlanScreen route={route} />;
    case 'activities':
      return <ActivitiesScreen route={route} />;
    case 'trails':
      return <TrailsScreen route={route} />;
    case 'settings':
      return <SettingsScreen route={route} />;
    case 'session':
      return <SessionScreen route={route} workoutId={route.workoutId} />;
    case 'onboarding':
      return <DashboardScreen route={{ name: 'dashboard', path: '/dashboard' }} />;
    case 'dashboard':
    default:
      return <DashboardScreen route={route} />;
  }
}
