"use client";

import { useMemo, useState } from "react";
import { TeacherCard, type TeacherCardProps } from "@/components/teacher/teacher-card";
import { cn } from "@/lib/utils";

export function TeachersClient({
  teachers,
  allSpecialties,
}: {
  teachers: TeacherCardProps[];
  allSpecialties: string[];
}) {
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeSpecialty) return teachers;
    return teachers.filter((t) => t.specialties.includes(activeSpecialty));
  }, [teachers, activeSpecialty]);

  return (
    <>
      {allSpecialties.length > 0 && (
        <div className="-mx-1 mb-8 flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setActiveSpecialty(null)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition",
              activeSpecialty === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary"
            )}
          >
            すべて
          </button>
          {allSpecialties.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setActiveSpecialty(s)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition",
                activeSpecialty === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center text-sm text-muted-foreground">
          {activeSpecialty
            ? `「${activeSpecialty}」を担当する講師がまだいません`
            : "公開中の講師はまだ登録されていません"}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TeacherCard key={t.id} {...t} />
          ))}
        </div>
      )}
    </>
  );
}
