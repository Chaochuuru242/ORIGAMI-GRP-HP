/**
 * 面談料金から運営手数料・講師取り分を計算するユーティリティ
 */

export type FeeBreakdown = {
  price: number;
  platformFee: number;
  teacherPayout: number;
};

export function computeFeeBreakdown({
  price,
  feeRate,
}: {
  price: number;
  /** 0〜1 の少数（例：0.20 = 20%） */
  feeRate: number;
}): FeeBreakdown {
  const platformFee = Math.floor(price * feeRate);
  const teacherPayout = price - platformFee;
  return { price, platformFee, teacherPayout };
}
