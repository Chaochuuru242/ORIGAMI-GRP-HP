"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export function CategoryFilter({
  categories,
  onChange,
  activeId,
}: {
  categories: Category[];
  onChange: (id: string | null) => void;
  activeId: string | null;
}) {
  return (
    <div className="-mx-1 mb-8 flex gap-2 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition",
          activeId === null
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary"
        )}
      >
        すべて
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition",
            activeId === c.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary"
          )}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

/** Stand-alone helper for managing filter state */
export function useCategoryFilter() {
  const [activeId, setActiveId] = useState<string | null>(null);
  return { activeId, setActiveId };
}
