import { formatPrice } from "@/lib/utils";

export function isFreeShipping(
  amount: number,
  limit?: number | null,
  standardFee?: number | null,
) {
  if (amount <= 0) return false;
  if (shippingAmount(amount, limit, standardFee) > 0) return false;
  const threshold = limit ?? 0;
  return threshold <= 0 || amount >= threshold;
}

export function shippingAmount(subtotal: number, limit?: number | null, standardFee?: number | null) {
  const fee = standardFee ?? 0;
  const threshold = limit ?? 0;
  if (fee <= 0) return 0;
  if (threshold > 0 && subtotal >= threshold) return 0;
  return fee;
}

export function shippingPolicyText(limit?: number | null, _standardFee?: number | null) {
  const threshold = limit ?? 0;
  if (threshold > 0) {
    const formatted = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(threshold);
    return `${formatted} TL ve üzeri siparişlerde ücretsiz kargo`;
  }
  return "Kargo ücretsiz";
}

export function shippingMessage(subtotal: number, limit?: number | null, _standardFee?: number | null) {
  const threshold = limit ?? 0;
  if (threshold > 0 && subtotal < threshold) {
    return `${formatPrice(threshold - subtotal)} daha ekleyin, kargo bedava`;
  }
  if (threshold > 0) {
    return "Kargonuz ücretsiz";
  }
  return "Kargo ücretsiz";
}
