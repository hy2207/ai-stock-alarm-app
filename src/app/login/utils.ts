export function getSafeReturnTo(returnTo: string | string[] | undefined) {
  const rawReturnTo = Array.isArray(returnTo) ? returnTo[0] : returnTo;

  if (!rawReturnTo) {
    return "/";
  }

  if (!rawReturnTo.startsWith("/") || rawReturnTo.startsWith("//")) {
    return "/";
  }

  return rawReturnTo;
}
