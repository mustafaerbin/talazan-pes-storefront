export interface CategoryRef {
  id: number;
  isim: string;
  slug?: string | null;
  parent?: CategoryRef | null;
}

export interface CategoryIndex {
  byId: Map<number, CategoryRef>;
  childrenByParent: Map<number, CategoryRef[]>;
  roots: CategoryRef[];
}

export interface CategorySearchHit {
  category: CategoryRef;
  path: CategoryRef[];
  label: string;
}

export function buildCategoryIndex(categories: CategoryRef[]): CategoryIndex {
  const byId = new Map<number, CategoryRef>();
  for (const category of categories) {
    byId.set(category.id, category);
  }

  const childrenByParent = new Map<number, CategoryRef[]>();
  const roots: CategoryRef[] = [];
  for (const category of categories) {
    const parentId = category.parent?.id;
    if (parentId == null || !byId.has(parentId) || parentId === category.id) {
      roots.push(category);
      continue;
    }
    const list = childrenByParent.get(parentId) ?? [];
    list.push(category);
    childrenByParent.set(parentId, list);
  }

  return { byId, childrenByParent, roots };
}

export function childCategories(index: CategoryIndex, parentId: number): CategoryRef[] {
  return index.childrenByParent.get(parentId) ?? [];
}

export function hasChildCategories(index: CategoryIndex, categoryId: number): boolean {
  return childCategories(index, categoryId).length > 0;
}

export function ancestorPath(categoryId: number, index: CategoryIndex): CategoryRef[] {
  const path: CategoryRef[] = [];
  const seen = new Set<number>();
  let current = index.byId.get(categoryId);
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift(current);
    const parentId = current.parent?.id;
    if (parentId == null) break;
    current = index.byId.get(parentId);
  }
  return path;
}

export function ancestorIds(categoryId: number, index: CategoryIndex): number[] {
  return ancestorPath(categoryId, index)
    .slice(0, -1)
    .map((category) => category.id);
}

export function categoryPathLabel(path: CategoryRef[]): string {
  return path.map((category) => category.isim).join(" > ");
}

export function searchCategories(categories: CategoryRef[], query: string, index: CategoryIndex): CategorySearchHit[] {
  const needle = query.trim().toLocaleLowerCase("tr-TR");
  if (!needle) return [];

  const hits: CategorySearchHit[] = [];
  for (const category of categories) {
    if (!category.isim.toLocaleLowerCase("tr-TR").includes(needle)) continue;
    const path = ancestorPath(category.id, index);
    hits.push({ category, path, label: categoryPathLabel(path) });
  }
  return hits;
}

const LISTING_QUERY_KEYS = ["firmaId", "q", "siralama", "stoktaVar", "minFiyat", "maxFiyat", "markaId"] as const;

export function withListingQuery(href: string, search: { get(key: string): string | null }): string {
  const params = new URLSearchParams();
  for (const key of LISTING_QUERY_KEYS) {
    const value = search.get(key);
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${href}?${query}` : href;
}
