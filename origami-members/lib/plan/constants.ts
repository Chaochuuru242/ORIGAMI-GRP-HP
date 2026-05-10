/**
 * プラン定数
 * DB の profiles.plan / videos.target_plan / playlists.target_plan に入る値
 * これ以外の値を使うことを禁止
 */

export const PLANS = ["free", "light", "standard", "premium"] as const;
export type Plan = (typeof PLANS)[number];

export const TARGET_PLANS = ["all", "light", "standard", "premium"] as const;
export type TargetPlan = (typeof TARGET_PLANS)[number];

export const PLAN_NAMES: Record<Plan, string> = {
  free: "無料会員",
  light: "ライトプラン",
  standard: "スタンダードプラン",
  premium: "プレミアムプラン",
};

export const PLAN_PRICES_JPY: Record<Plan, number> = {
  free: 0,
  light: 4980,
  standard: 10000,
  premium: 19800,
};

/** プラン階層（数値が高い＝上位プラン） */
export const PLAN_RANK: Record<Plan, number> = {
  free: 0,
  light: 1,
  standard: 2,
  premium: 3,
};

/** ロール定数 */
export const ROLES = ["user", "adder", "teacher", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_NAMES: Record<Role, string> = {
  user: "一般会員",
  adder: "動画追加者",
  teacher: "講師",
  admin: "管理者",
};
