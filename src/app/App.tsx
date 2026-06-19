import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPageV2 } from './pages/LoginPageV2';
import { LandingPageV2 } from './pages/LandingPageV2';
import { OnboardingPageV2 } from './pages/OnboardingPageV2';
import { HomePageV2 } from './pages/HomePageV2';
import { RecommendationDetailPageV2 } from './pages/RecommendationDetailPageV2';
import { ArchivePageV2 } from './pages/ArchivePageV2';
import { SettingsPageV2 } from './pages/SettingsPageV2';
import { StatePageV2 } from './pages/StatePageV2';
import { DebugPanelV2 } from './components/DebugPanelV2';
import { Toaster } from './components/ui/sonner';
import { ROUTES, getRouteFromHash, isRecommendationRoute, normalizeRoute } from './routes';

/**
 * @component AppContent
 * @description
 * [Developer] Handles client-side routing based on window.location.hash. 
 * Renders the appropriate page component corresponding to the current route.
 * Redirects unauthenticated users to the login page.
 * 
 * [AI Agent] This is the core router of the prototype. When adding a new page,
 * 1. Define the route in `routes.ts`.
 * 2. Add the corresponding `if` block here to render the new page component.
 * 3. Make sure to pass `onNavigate={handleNavigate}` to the page.
 */
function AppContent() {
  const { isLoggedIn, addDebugEvent } = useApp();
  const [currentRoute, setCurrentRoute] = useState(() =>
    typeof window === 'undefined' ? ROUTES.landing : getRouteFromHash(window.location.hash)
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!window.location.hash) {
      window.history.replaceState(null, '', `#${currentRoute}`);
    }

    const handleHashChange = () => {
      setCurrentRoute(getRouteFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
    const cameFromPush =
      url.searchParams.get('from') === 'push' ||
      url.searchParams.get('utm_source') === 'onesignal' ||
      hashParams.get('from') === 'push' ||
      hashParams.get('utm_source') === 'onesignal';

    if (!cameFromPush) {
      return;
    }

    const route = getRouteFromHash(window.location.hash);
    addDebugEvent('push_open', { route });
    addDebugEvent(route === ROUTES.landing ? 'deeplink_fail' : 'deeplink_success', {
      route,
    });
  }, [addDebugEvent]);

  useEffect(() => {
    if (!isLoggedIn && currentRoute !== ROUTES.login && currentRoute !== ROUTES.landing) {
      setCurrentRoute(ROUTES.login);
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#${ROUTES.login}`);
      }
    }
  }, [isLoggedIn, currentRoute]);

  const syncRoute = (route: string, replace = false) => {
    const normalizedRoute = normalizeRoute(route);
    setCurrentRoute(normalizedRoute);

    if (typeof window === 'undefined') {
      return;
    }

    const nextHash = `#${normalizedRoute}`;
    if (window.location.hash === nextHash) {
      return;
    }

    if (replace) {
      window.history.replaceState(null, '', nextHash);
      return;
    }

    window.location.hash = normalizedRoute;
  };

  const handleNavigate = (route: string) => {
    syncRoute(route);
  };

  if (currentRoute === ROUTES.landing) {
    return <LandingPageV2 onNavigate={handleNavigate} />;
  }

  if (!isLoggedIn && currentRoute === ROUTES.login) {
    return <LoginPageV2 onNavigate={handleNavigate} />;
  }

  if (currentRoute === ROUTES.onboarding) {
    return <OnboardingPageV2 onNavigate={handleNavigate} />;
  }

  if (currentRoute === ROUTES.home) {
    return <HomePageV2 onNavigate={handleNavigate} />;
  }

  if (isRecommendationRoute(currentRoute)) {
    const recId = currentRoute.split(`${ROUTES.recommendationBase}/`)[1] ?? null;
    if (recId) {
      return <RecommendationDetailPageV2 recId={recId} onNavigate={handleNavigate} />;
    }
  }

  if (currentRoute === ROUTES.archive) {
    return <ArchivePageV2 onNavigate={handleNavigate} />;
  }

  if (currentRoute === ROUTES.settings) {
    return <SettingsPageV2 onNavigate={handleNavigate} />;
  }

  if (currentRoute === ROUTES.stateNoCall) {
    return <StatePageV2 type="no-call" onNavigate={handleNavigate} />;
  }

  if (currentRoute === ROUTES.stateLoading) {
    return <StatePageV2 type="loading" onNavigate={handleNavigate} />;
  }

  if (currentRoute === ROUTES.stateEmpty) {
    return <StatePageV2 type="empty" onNavigate={handleNavigate} />;
  }

  if (currentRoute === ROUTES.stateError) {
    return <StatePageV2 type="error" onNavigate={handleNavigate} />;
  }

  return <HomePageV2 onNavigate={handleNavigate} />;
}

/**
 * @component App
 * @description
 * [Developer] The root component of the application. Wraps the router (AppContent)
 * with the global state provider (AppProvider) and global UI elements (Toaster, DebugPanel).
 * 
 * [AI Agent] Do not modify this unless adding global providers (e.g., QueryClientProvider)
 * or application-wide overlay components.
 */
export default function App() {
  return (
    <AppProvider>
      <div className="size-full">
        <AppContent />
        <DebugPanelV2 />
        <Toaster />
      </div>
    </AppProvider>
  );
}
