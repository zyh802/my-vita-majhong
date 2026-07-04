/**
 * 星级评价系统
 *
 * 满分 = 牌对数 × 100（即不连击的基础总分）
 * 连击会让实际得分超过满分，更容易拿高星
 *
 * 星级：
 * - 3 星：得分 ≥ 满分的 80%
 * - 2 星：得分 ≥ 满分的 50%
 * - 1 星：< 50%
 */

export interface StarRatingInput {
  score: number;
  pairCount: number;
}

export function calculateStars(input: StarRatingInput): {
  stars: number;
  ratio: number;
} {
  const { score, pairCount } = input;

  const maxScore = pairCount * 100;
  const ratio = maxScore > 0 ? score / maxScore : 0;
  const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;

  return { stars, ratio: Math.round(ratio * 100) / 100 };
}
