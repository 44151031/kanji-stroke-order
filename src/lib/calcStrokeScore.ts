/**
 * 書き順スコア計算ロジック
 * ユーザーが書いたストローク数と正解のストローク数を比較してスコアを算出
 */

/**
 * 書き順スコアを計算
 * @param userStrokeCount - ユーザーが書いたストローク数
 * @param correctStrokeCount - 正解のストローク数
 * @returns 0-100点のスコア
 */
export function calcStrokeScore(
  userStrokeCount: number,
  correctStrokeCount: number
): number {
  if (correctStrokeCount === 0) return 0;

  // ストローク数の比率を計算（少なすぎても多すぎても減点）
  const ratio = Math.min(
    userStrokeCount / correctStrokeCount,
    correctStrokeCount / userStrokeCount
  );

  // 基本スコアは比率に基づく（最大100点）
  let score = ratio * 100;

  // 完全一致の場合は満点（将来的にストローク順序の一致度で調整可能）
  if (userStrokeCount === correctStrokeCount) {
    score = 100;
  }

  // 将来的に以下のようなロジックを追加可能：
  // - ストローク順序の一致度で加点・減点
  // - 形状の類似度（TensorFlow.jsなど）で調整
  // - 書き順の方向性の一致度で調整

  return Math.round(Math.max(0, Math.min(100, score)));
}
