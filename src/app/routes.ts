export const ROUTES = {
  landing: '/',
  home: '/app',
  login: '/login',
  onboarding: '/onboarding',
  archive: '/archive',
  settings: '/settings',
  recommendationBase: '/recommendations',
  stateNoCall: '/state/no-call',
  stateLoading: '/state/loading',
  stateEmpty: '/state/empty',
  stateError: '/state/error',
} as const;

const staticRoutes = new Set<string>([
  ROUTES.landing,
  ROUTES.home,
  ROUTES.login,
  ROUTES.onboarding,
  ROUTES.archive,
  ROUTES.settings,
  ROUTES.stateNoCall,
  ROUTES.stateLoading,
  ROUTES.stateEmpty,
  ROUTES.stateError,
]);

export function isRecommendationRoute(route: string) {
  return route.startsWith(`${ROUTES.recommendationBase}/`) && route.split('/').length > 2;
}

export function normalizeRoute(route: string) {
  if (staticRoutes.has(route)) {
    return route;
  }

  if (isRecommendationRoute(route)) {
    return route;
  }

  return ROUTES.landing;
}

export function getRouteFromHash(hash: string) {
  const route = hash.replace(/^#/, '').split('?')[0];
  return route ? normalizeRoute(route) : ROUTES.landing;
}
