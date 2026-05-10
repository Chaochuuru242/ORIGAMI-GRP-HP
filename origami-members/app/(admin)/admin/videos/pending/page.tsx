import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { approveVideoAction, rejectVideoAction } from "./actions";

export const metadata = { title: "動画承認 | Admin" };

const PLAN_LABELS: Record<string, string> = {
  all: "全プラン共通",
  light: "ライト以上",
  standard: "スタンダード以上",
  premium: "プレミアム専用",
};

export default async function AdminVideosPendingPage() {
  const supabase = await createClient();
  const { data: rawVideos } = await supabase
    .from("videos")
    .select(
      "id, title, description, video_url, target_plan, category_id, created_at, created_by, categories(name)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const videos = rawVideos ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">✅ 動画承認待ち一覧</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          adder が申請した動画を承認 / 却下します
        </p>
      </header>

      {videos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center text-sm text-muted-foreground">
          現在、承認待ちの動画はありません。
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((v) => {
            const cat = (v.categories as { name?: string } | null)?.name;
            return (
              <div
                key={v.id as string}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span>
                    申請日:{" "}
                    {new Date(v.created_at as string).toLocaleDateString("ja-JP")}
                  </span>
                  <Badge variant="outline">
                    {PLAN_LABELS[(v.target_plan as string) ?? "all"]}
                  </Badge>
                  {cat && <Badge variant="outline">{cat}</Badge>}
                </div>
                <h3 className="text-base font-extrabold">
                  {v.title as string}
                </h3>
                {v.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {v.description as string}
                  </p>
                )}
                <Link
                  href={v.video_url as string}
                  target="_blank"
                  className="mt-3 inline-block text-xs text-primary underline"
                >
                  ↗ {v.video_url as string}
                </Link>
                <div className="mt-4 flex justify-end gap-2">
                  <form action={rejectVideoAction}>
                    <input type="hidden" name="id" value={v.id as string} />
                    <Button type="submit" size="sm" variant="destructive">
                      ❌ 却下（DB削除）
                    </Button>
                  </form>
                  <form action={approveVideoAction}>
                    <input type="hidden" name="id" value={v.id as string} />
                    <Button type="submit" size="sm">
                      ⭕ 承認・公開
                    </Button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
