const DEV_RETURN_TO = ['http://localhost:5173'];

export function getDefaultBuilderUrl(): string {
  return process.env.NEXT_PUBLIC_BUILDER_URL || DEV_RETURN_TO[0];
}

export function isAllowedReturnTo(url: string): boolean {
  try {
    const parsed = new URL(url);
    const allowed = new Set<string>([getDefaultBuilderUrl()]);
    if (process.env.NODE_ENV === 'development') {
      for (const dev of DEV_RETURN_TO) {
        allowed.add(dev);
      }
    }
    for (const candidate of allowed) {
      const allowedParsed = new URL(candidate);
      if (parsed.origin === allowedParsed.origin) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
