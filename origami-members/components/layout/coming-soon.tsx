import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ComingSoon({
  title,
  phase,
  description,
  backHref = "/dashboard",
  backLabel = "ダッシュボードへ戻る",
}: {
  title: string;
  phase: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary-light/20 p-10 text-center">
        <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary uppercase">
          {phase}
        </span>
        <h1 className="mb-3 text-2xl font-extrabold text-foreground">
          {title}
        </h1>
        <p className="mb-8 text-sm leading-7 text-muted-foreground">
          {description}
        </p>
        <Button render={<Link href={backHref} />} variant="outline">
          {backLabel}
        </Button>
      </div>
    </div>
  );
}
