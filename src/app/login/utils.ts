export function getSafeCallbackUrl(
  value: string | string[] | undefined,
): string {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return "/";
  }

  if (!rawValue.startsWith("/") || rawValue.startsWith("//")) {
    return "/";
  }

  return rawValue;
}
