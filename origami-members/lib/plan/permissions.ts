/**
 * プラン別の閲覧可否判定
 */
import {
  PLAN_RANK,
  type Plan,
  type Role,
  type TargetPlan,
} from "./constants";

/**
 * 動画/プレイリストが視聴可能かどうか判定
 * - admin / adder は全コンテンツ視聴可
 * - target_plan='all' は全員視聴可
 * - それ以外は ユーザーのプランランク >= target_plan ランク なら視聴可
 */
export function canViewContent({
  userPlan,
  userRole,
  targetPlan,
}: {
  userPlan: Plan;
  userRole: Role;
  targetPlan: TargetPlan;
}): boolean {
  if (userRole === "admin" || userRole === "adder") return true;
  if (targetPlan === "all") return true;
  // free ユーザーは all 以外見れない
  if (userPlan === "free") return false;
  // light/standard/premium のランク比較
  return PLAN_RANK[userPlan] >= PLAN_RANK[targetPlan as Plan];
}
