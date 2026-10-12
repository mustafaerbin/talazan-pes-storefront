export function toWhatsAppDigits(raw?: string | null): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `90${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("5")) digits = `90${digits}`;
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

export function buildWhatsAppHref(phone?: string | null, message?: string): string | null {
  const digits = toWhatsAppDigits(phone);
  if (!digits) return null;
  const url = new URL(`https://wa.me/${digits}`);
  const text = message?.trim();
  if (text) url.searchParams.set("text", text);
  return url.toString();
}
