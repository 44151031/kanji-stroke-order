/**
 * 書き順スコア計算ロジック
 * ユーザーが書いたストロークと正解のストロークを比較してスコアを算出
 */

import {
  StrokeInfo,
  calculateOrderScore,
  getStrokeOrderFeedback,
} from "./strokeOrderUtils";

/**
 * 書き順スコアを計算（画数のみ - 後方互換性のため残す）
 * @param userStrokeCount - ユーザーが書いたストローク数
 * @param correctStrokeCount - 正解のストローク数
 * @returns 0-100点のスコア
 * @deprecated calcStrokeScoreWithOrder を使用してください
 */
export function calcStrokeScore(
  userStrokeCount: number,
  correctStrokeCount: number
): number {
  if (correctStrokeCount === 0) return 0;

  // 画数が一致していれば100点
  if (userStrokeCount === correctStrokeCount) {
    return 100;
  }

  // ストローク数の比率を計算（少なすぎても多すぎても減点）
  const ratio = Math.min(
    userStrokeCount / correctStrokeCount,
    correctStrokeCount / userStrokeCount
  );

  return Math.round(ratio * 100);
}

/**
 * 書き順スコアを計算（順序チェック付き）
 * 画数と順序が両方正しければ100点
 * @param userStrokes - ユーザーの正規化されたストローク情報
 * @param correctStrokes - 正解のストローク情報
 * @returns スコア結果オブジェクト
 */
export function calcStrokeScoreWithOrder(
  userStrokes: StrokeInfo[],
  correctStrokes: StrokeInfo[]
): {
  score: number;
  strokeCountScore: number;
  orderScore: number;
  feedback: Array<{ strokeNum: number; isCorrect: boolean; distance: number }>;
} {
  if (correctStrokes.length === 0) {
    return {
      score: 0,
      strokeCountScore: 0,
      orderScore: 0,
      feedback: [],
    };
  }

  // 画数スコア
  const strokeCountScore = calcStrokeScore(userStrokes.length, correctStrokes.length);

  // 順序スコア
  const orderScore = calculateOrderScore(userStrokes, correctStrokes);

  // フィードバック
  const feedback = getStrokeOrderFeedback(userStrokes, correctStrokes);

  // 全て正解なら100点
  const allCorrect = feedback.every((f) => f.isCorrect);
  const strokeCountMatch = userStrokes.length === correctStrokes.length;

  if (allCorrect && strokeCountMatch) {
    return {
      score: 100,
      strokeCountScore: 100,
      orderScore: 100,
      feedback,
    };
  }

  // 総合スコア（画数30% + 順序70%）
  // 書き順テストなので順序の比重を高くする
  const totalScore = Math.round(strokeCountScore * 0.3 + orderScore * 0.7);

  return {
    score: totalScore,
    strokeCountScore,
    orderScore,
    feedback,
  };
}
