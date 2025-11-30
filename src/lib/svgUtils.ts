/**
 * SVGアニメーション用ユーティリティ
 */

/**
 * SVG文字列を解析してストロークアニメーションを追加
 */
export function animateSvgStrokes(svgString: string, size: number = 200): string {
  // DOMParserを使ってSVGを解析
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.querySelector("svg");
  
  if (!svg) return svgString;

  // SVGのサイズを設定
  svg.setAttribute("width", size.toString());
  svg.setAttribute("height", size.toString());
  svg.setAttribute("viewBox", "0 0 109 109");

  // すべてのpathを取得（kvgグループ内のpathのみ）
  const paths = svg.querySelectorAll("path[d]");
  
  let totalDelay = 0;
  const strokeDuration = 0.6; // 各ストロークの描画時間（秒）
  const strokeGap = 0.15; // ストローク間の間隔（秒）

  paths.forEach((path) => {
    const d = path.getAttribute("d");
    if (!d) return;

    // ストロークの長さを推定
    const length = estimatePathLength(d);
    
    // アニメーション用のスタイルを追加
    path.setAttribute("stroke", "#1a1a1a");
    path.setAttribute("stroke-width", "4");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-dasharray", length.toString());
    path.setAttribute("stroke-dashoffset", length.toString());
    path.setAttribute(
      "style",
      `animation: drawStroke ${strokeDuration}s ease-out ${totalDelay}s forwards;`
    );
    
    totalDelay += strokeDuration - strokeGap;
  });

  // 既存のstyle要素を取得または作成
  let styleElement = svg.querySelector("style");
  if (!styleElement) {
    styleElement = doc.createElementNS("http://www.w3.org/2000/svg", "style") as SVGStyleElement;
    svg.insertBefore(styleElement, svg.firstChild);
  }
  
  // アニメーションCSSを追加
  styleElement.textContent = `
    @keyframes drawStroke {
      to {
        stroke-dashoffset: 0;
      }
    }
    text { display: none; }
  `;

  // シリアライズして返す
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svg);
}

/**
 * SVGパスの長さを推定
 * 実際のパス長を計算するには複雑なので、コマンド数に基づいて推定
 */
function estimatePathLength(d: string): number {
  // パスコマンドの数をカウント
  const commands = d.match(/[MLHVCSQTAZ]/gi) || [];
  
  // 座標の数をカウント
  const numbers = d.match(/-?\d+\.?\d*/g) || [];
  
  // コマンド数と座標数から長さを推定
  const baseLength = commands.length * 20 + numbers.length * 5;
  
  return Math.max(baseLength, 150);
}

/**
 * SVGをリセット可能な形式で取得（再生ボタン用）
 */
export function resetSvgAnimation(container: HTMLElement): void {
  const paths = container.querySelectorAll("path");
  paths.forEach((path) => {
    const style = path.getAttribute("style") || "";
    // アニメーションをリセット
    path.setAttribute("style", style.replace(/animation:[^;]+;?/g, ""));
    
    // 強制的にリフローを発生させる
    void (path as HTMLElement).offsetWidth;
    
    // アニメーションを再適用
    path.setAttribute("style", style);
  });
}

