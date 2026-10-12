"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { ancestorIds, childCategories, type CategoryIndex, type CategoryRef } from "@/lib/category-tree";

export function CategoryTreeList({
  index,
  hrefFor,
  activeId,
  onNavigate,
}: {
  index: CategoryIndex;
  hrefFor: (category: CategoryRef) => string;
  activeId?: number;
  onNavigate?: () => void;
}) {
  const [openIds, setOpenIds] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    if (activeId == null) return;
    const parents = ancestorIds(activeId, index);
    if (parents.length === 0) return;
    setOpenIds((current) => {
      const next = new Set(current);
      for (const id of parents) next.add(id);
      return next;
    });
  }, [activeId, index]);

  const toggle = (id: number) => {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <nav aria-label="Kategoriler">
      {index.roots.map((category) => (
        <CategoryBranch
          key={category.id}
          category={category}
          depth={0}
          index={index}
          activeId={activeId}
          openIds={openIds}
          onToggle={toggle}
          hrefFor={hrefFor}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

function CategoryBranch({
  category,
  depth,
  index,
  activeId,
  openIds,
  onToggle,
  hrefFor,
  onNavigate,
}: {
  category: CategoryRef;
  depth: number;
  index: CategoryIndex;
  activeId?: number;
  openIds: Set<number>;
  onToggle: (id: number) => void;
  hrefFor: (category: CategoryRef) => string;
  onNavigate?: () => void;
}) {
  const children = childCategories(index, category.id);
  const open = openIds.has(category.id);
  const active = activeId === category.id;

  return (
    <div>
      <div className="flex items-center gap-1 rounded-lg pr-1 hover:bg-muted" style={{ paddingLeft: 4 + depth * 12 }}>
        {children.length > 0 ? (
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg"
            aria-expanded={open}
            aria-label={category.isim}
            onClick={() => onToggle(category.id)}
          >
            <ChevronRight className={`size-4 transition-transform ${open ? "rotate-90 text-primary" : ""}`} />
          </button>
        ) : (
          <span className="size-8 shrink-0" />
        )}
        <Link
          href={hrefFor(category)}
          title={category.isim}
          aria-current={active ? "page" : undefined}
          onClick={onNavigate}
          className={`min-w-0 flex-1 truncate py-2 text-sm ${active ? "font-semibold text-primary" : "font-medium text-foreground"}`}
        >
          {category.isim}
        </Link>
      </div>
      {open &&
        children.map((child) => (
          <CategoryBranch
            key={child.id}
            category={child}
            depth={depth + 1}
            index={index}
            activeId={activeId}
            openIds={openIds}
            onToggle={onToggle}
            hrefFor={hrefFor}
            onNavigate={onNavigate}
          />
        ))}
    </div>
  );
}
