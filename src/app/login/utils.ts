export function getSafeCallbackUrl(
  value: string | string[] | undefined,
): string {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return "/today";
  }

  if (!rawValue.startsWith("/") || rawValue.startsWith("//")) {
    return "/today";
  }

  return rawValue;
}
