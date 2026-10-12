import assert from "node:assert/strict";
import test from "node:test";
import {
  ancestorIds,
  ancestorPath,
  buildCategoryIndex,
  hasChildCategories,
  searchCategories,
  type CategoryRef,
} from "./category-tree.ts";

function category(id: number, isim: string, parentId?: number): CategoryRef {
  return { id, isim, slug: `k-${id}`, parent: parentId == null ? null : { id: parentId, isim: "" } };
}

test("tek seviyeli kategori yaprak olarak kalır", () => {
  const index = buildCategoryIndex([category(1, "Ayakkabı")]);
  assert.equal(index.roots.length, 1);
  assert.equal(hasChildCategories(index, 1), false);
  assert.deepEqual(ancestorPath(1, index).map((item) => item.isim), ["Ayakkabı"]);
});

test("derin hiyerarşide üst yol korunur", () => {
  const categories = [
    category(1, "Otomotiv"),
    category(2, "Oto Aksesuarları", 1),
    category(3, "Koltuk Ürünleri", 2),
    category(4, "Yastık", 3),
  ];
  const index = buildCategoryIndex(categories);
  assert.deepEqual(ancestorPath(4, index).map((item) => item.isim), [
    "Otomotiv",
    "Oto Aksesuarları",
    "Koltuk Ürünleri",
    "Yastık",
  ]);
  assert.deepEqual(ancestorIds(4, index), [1, 2, 3]);
  assert.equal(hasChildCategories(index, 4), false);
  assert.equal(hasChildCategories(index, 1), true);
});

test("aynı isimli kategoriler farklı üst yollarla ayrılır", () => {
  const categories = [
    category(1, "Otomotiv"),
    category(2, "Ev"),
    category(3, "Koltuk", 1),
    category(4, "Koltuk", 2),
  ];
  const index = buildCategoryIndex(categories);
  const hits = searchCategories(categories, "koltuk", index);
  assert.deepEqual(
    hits.map((hit) => hit.label),
    ["Otomotiv > Koltuk", "Ev > Koltuk"],
  );
});

test("arama alt kategoride üst yolu düşürmez ve boş sorguda sonuç üretmez", () => {
  const categories = [
    category(1, "Otomotiv"),
    category(2, "Oto Aksesuarları", 1),
  ];
  const index = buildCategoryIndex(categories);
  assert.equal(searchCategories(categories, "   ", index).length, 0);
  assert.equal(searchCategories(categories, "aksesuar", index)[0]?.label, "Otomotiv > Oto Aksesuarları");
});

test("yüzlerce alt kategori tek ebeveyne bağlanır", () => {
  const categories = [category(1, "Yedek Parça")];
  for (let id = 2; id <= 301; id += 1) categories.push(category(id, `Parça ${id}`, 1));
  const index = buildCategoryIndex(categories);
  assert.equal(index.childrenByParent.get(1)?.length, 300);
  const hits = searchCategories(categories, "Parça 250", index);
  assert.equal(hits.length, 1);
  assert.equal(hits[0]?.label, "Yedek Parça > Parça 250");
});

test("uzun kategori adı aramada olduğu gibi kalır", () => {
  const name = "Tesla uyumlu Ortopedik Visko Sünger Kamp Yatağı Konforlu ve Hafif";
  const categories = [category(1, "Kamp"), category(2, name, 1)];
  const index = buildCategoryIndex(categories);
  assert.equal(searchCategories(categories, "visko", index)[0]?.category.isim, name);
});
