export function parseAnnouncementTexts(raw?: string | null, fallback?: string): string[] {
  const fallbackTexts = fallback?.trim() ? [fallback.trim()] : [];
  if (!raw?.trim()) return fallbackTexts;

  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        const texts = parsed.map((item) => String(item ?? "").trim()).filter(Boolean);
        return texts.length ? texts : fallbackTexts;
      }
    } catch {
      // Eski tek satır duyuru olarak kullan
    }
  }
  return [trimmed];
}
