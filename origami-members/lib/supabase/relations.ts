/**
 * Supabase の `.select("a, foo(b)")` で取得する 1対1 リレーションは、
 * 型推論上は配列として推論されるが、実行時はオブジェクトが返ってくる
 * （または null）。型エラー回避用の小さなヘルパー。
 */
export function pickOne<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return (rel[0] as T | undefined) ?? null;
  return rel;
}
