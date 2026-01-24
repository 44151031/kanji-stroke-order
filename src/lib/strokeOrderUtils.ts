/**
 * 書き順判定ユーティリティ
 * KanjiVGのSVGからストローク情報を抽出し、ユーザーの入力と比較する
 */

export interface StrokePoint {
  x: number;
  y: number;
}

export interface StrokeInfo {
  index: number;      // 画数（0始まり）
  startPoint: StrokePoint;
  endPoint: StrokePoint;
}

/**
 * SVGのpath要素のd属性から開始点を抽出
 * @param pathD - SVGのd属性値（例: "M52.77,15.08c1.08,1.08..."）
 * @returns 開始点 { x, y }
 */
export function extractStartPoint(pathD: string): StrokePoint | null {
  // M または m コマンドで開始点を取得
  const moveMatch = pathD.match(/^[Mm]\s*([-\d.]+)[,\s]+([-\d.]+)/);
  if (!moveMatch) return null;

  return {
    x: parseFloat(moveMatch[1]),
    y: parseFloat(moveMatch[2]),
  };
}

/**
 * SVGのpath要素のd属性から終了点を抽出
 * @param pathD - SVGのd属性値
 * @returns 終了点 { x, y }（概算）
 */
export function extractEndPoint(pathD: string): StrokePoint | null {
  // 最後の座標ペアを探す（簡易版：最後の数値ペアを取得）
  const allCoords = pathD.matchAll(/([-\d.]+)[,\s]+([-\d.]+)/g);
  let lastCoord: StrokePoint | null = null;

  for (const match of allCoords) {
    lastCoord = {
      x: parseFloat(match[1]),
      y: parseFloat(match[2]),
    };
  }

  return lastCoord;
}

/**
 * SVGテキストからすべてのストローク情報を抽出
 * @param svgText - SVGファイルの内容
 * @returns ストローク情報の配列（順番通り）
 */
export function extractStrokesFromSvg(svgText: string): StrokeInfo[] {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
  const paths = svgDoc.querySelectorAll("path[d]");

  const strokes: StrokeInfo[] = [];

  paths.forEach((path, index) => {
    const d = path.getAttribute("d");
    if (!d) return;

    const startPoint = extractStartPoint(d);
    const endPoint = extractEndPoint(d);

    if (startPoint && endPoint) {
      strokes.push({
        index,
        startPoint,
        endPoint,
      });
    }
  });

  return strokes;
}

/**
 * 2点間の距離を計算
 */
export function distance(p1: StrokePoint, p2: StrokePoint): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * ユーザーのストロークを正規化（キャンバス座標 → SVG座標）
 * KanjiVGのSVGは109x109のビューボックス
 * @param userStrokes - ユーザーが描いたストロークの配列
 * @param canvasWidth - キャンバスの幅
 * @param canvasHeight - キャンバスの高さ
 * @returns 正規化されたストローク情報
 */
export function normalizeUserStrokes(
  userStrokes: Array<{ points: Array<{ x: number; y: number }> }>,
  canvasWidth: number,
  canvasHeight: number
): StrokeInfo[] {
  const SVG_SIZE = 109; // KanjiVGのビューボックスサイズ

  return userStrokes.map((stroke, index) => {
    const points = stroke.points;
    if (points.length === 0) {
      return {
        index,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 0, y: 0 },
      };
    }

    const startPoint = {
      x: (points[0].x / canvasWidth) * SVG_SIZE,
      y: (points[0].y / canvasHeight) * SVG_SIZE,
    };

    const lastPoint = points[points.length - 1];
    const endPoint = {
      x: (lastPoint.x / canvasWidth) * SVG_SIZE,
      y: (lastPoint.y / canvasHeight) * SVG_SIZE,
    };

    return { index, startPoint, endPoint };
  });
}

// 許容距離（SVG座標系109x109の約27%）
// 書き始めの位置が多少ずれても許容する
const TOLERANCE = 30;

/**
 * ストロークの順序スコアを計算
 * 各ストロークの開始点が許容範囲内なら正解、正解率に応じてスコアを計算
 * @param userStrokes - ユーザーの正規化されたストローク
 * @param correctStrokes - 正解のストローク
 * @returns 0-100のスコア
 */
export function calculateOrderScore(
  userStrokes: StrokeInfo[],
  correctStrokes: StrokeInfo[]
): number {
  if (correctStrokes.length === 0 || userStrokes.length === 0) {
    return 0;
  }

  const maxStrokes = Math.min(userStrokes.length, correctStrokes.length);
  let correctCount = 0;

  for (let i = 0; i < maxStrokes; i++) {
    const userStroke = userStrokes[i];
    const correctStroke = correctStrokes[i];

    // 開始点の距離
    const startDist = distance(userStroke.startPoint, correctStroke.startPoint);

    // 許容範囲内なら正解
    if (startDist <= TOLERANCE) {
      correctCount++;
    }
  }

  // 画数が一致していて全て正解なら100点
  if (userStrokes.length === correctStrokes.length && correctCount === maxStrokes) {
    return 100;
  }

  // 正解率に基づくスコア
  const orderScore = (correctCount / correctStrokes.length) * 100;

  // 画数の過不足によるペナルティ（1画ごとに10点減点）
  const strokeCountDiff = Math.abs(userStrokes.length - correctStrokes.length);
  const countPenalty = strokeCountDiff * 10;

  return Math.round(Math.max(0, Math.min(100, orderScore - countPenalty)));
}

/**
 * 書き順の正誤詳細を取得（デバッグ・フィードバック用）
 */
export function getStrokeOrderFeedback(
  userStrokes: StrokeInfo[],
  correctStrokes: StrokeInfo[]
): Array<{ strokeNum: number; isCorrect: boolean; distance: number }> {
  const feedback: Array<{ strokeNum: number; isCorrect: boolean; distance: number }> = [];

  const maxStrokes = Math.min(userStrokes.length, correctStrokes.length);

  for (let i = 0; i < maxStrokes; i++) {
    const dist = distance(userStrokes[i].startPoint, correctStrokes[i].startPoint);
    feedback.push({
      strokeNum: i + 1,
      isCorrect: dist <= TOLERANCE,
      distance: Math.round(dist),
    });
  }

  return feedback;
}
