import type { FirmaUrunDto } from "@/types/api";

export interface VariantAttr {
  key: string;
  label: string;
  value: string;
}

export interface VariantGroup {
  key: string;
  label: string;
  values: string[];
}

function normalizeKey(label: string): string {
  return label.trim().toLocaleLowerCase("tr-TR");
}

export function parseVariantAttrs(product: FirmaUrunDto): VariantAttr[] {
  const attrs: VariantAttr[] = [];
  const add = (label?: string | null, value?: string | null) => {
    const trimmedLabel = label?.trim();
    const trimmedValue = value?.trim();
    if (!trimmedLabel || !trimmedValue) return;
    const key = normalizeKey(trimmedLabel);
    if (attrs.some((attr) => attr.key === key)) return;
    attrs.push({ key, label: trimmedLabel, value: trimmedValue });
  };

  for (const item of product.varyantOzellikleri ?? []) {
    add(item.ozellikIsim, item.degerIsim);
  }
  return attrs;
}

export function attrMap(product: FirmaUrunDto): Record<string, string> {
  return Object.fromEntries(parseVariantAttrs(product).map((attr) => [attr.key, attr.value]));
}

export function buildVariantGroups(variants: FirmaUrunDto[]): VariantGroup[] {
  const groups = new Map<string, VariantGroup>();
  for (const variant of variants) {
    for (const attr of parseVariantAttrs(variant)) {
      const existing = groups.get(attr.key);
      if (!existing) {
        groups.set(attr.key, { key: attr.key, label: attr.label, values: [attr.value] });
        continue;
      }
      if (!existing.values.includes(attr.value)) {
        existing.values.push(attr.value);
      }
      if (!existing.label && attr.label) {
        existing.label = attr.label;
      }
    }
  }
  const result = [...groups.values()];
  if (result.length === 0 && variants.length > 1) {
    return [
      {
        key: "id",
        label: "Varyant",
        values: variants.map((variant) => String(variant.id)),
      },
    ];
  }
  return result;
}

export function findVariantForSelection(
  variants: FirmaUrunDto[],
  selected: Record<string, string>,
  changedKey: string,
  changedValue: string,
): FirmaUrunDto | undefined {
  if (changedKey === "id") {
    return variants.find((variant) => String(variant.id) === changedValue);
  }
  const next = { ...selected, [changedKey]: changedValue };
  const exact = variants.find((variant) => {
    const attrs = attrMap(variant);
    return Object.entries(next).every(([key, value]) => !value || attrs[key] === value);
  });
  if (exact) return exact;
  return variants.find((variant) => attrMap(variant)[changedKey] === changedValue);
}
