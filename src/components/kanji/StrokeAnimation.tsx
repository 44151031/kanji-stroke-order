"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface StrokeAnimationProps {
  id: string;
  kanji: string;
  size?: number;
}

export function StrokeAnimation({ id, kanji, size = 280 }: StrokeAnimationProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [key, setKey] = useState(0);

  // SVGを読み込み
  useEffect(() => {
    async function loadSVG() {
      setLoading(true);
      setError(false);
      
      // uXXXX形式のIDから5桁の16進数を取得
      const hexCode = id.startsWith("u") ? id.slice(1).padStart(5, "0") : id;
      
      try {
        // KanjiVG形式のパスを試行
        const res = await fetch(`/kanjivg/${hexCode}.svg`);
        if (!res.ok) throw new Error("SVG not found");
        
        const text = await res.text();
        const animatedSvg = processSvgForAnimation(text, size);
        setSvg(animatedSvg);
      } catch (err) {
        console.error("SVG load error:", err);
        setError(true);
        setSvg(null);
      } finally {
        setLoading(false);
      }
    }
    
    loadSVG();
  }, [id, size]);

  // アニメーション再生
  const replay = useCallback(() => {
    setKey((prev) => prev + 1);
    setIsPlaying(true);
  }, []);

  // ローディング
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-2 text-muted-foreground">書き順を読み込み中...</span>
      </div>
    );
  }

  // エラー（フォールバック表示）
  if (error || !svg) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-64 bg-secondary/30 rounded-xl">
        <span className="text-8xl font-bold text-foreground/80">{kanji}</span>
        <p className="text-sm text-muted-foreground mt-2">
          書き順SVGを読み込めませんでした
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG表示エリア */}
      <div
        key={key}
        className="kanji-stroke bg-white border border-border rounded-xl p-4"
        style={{ width: size + 40, height: size + 40 }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      
      {/* コントロールボタン */}
      <div className="flex gap-2">
        <Button
          onClick={replay}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          再生
        </Button>
      </div>
    </div>
  );
}

/**
 * SVGにアニメーションスタイルを適用
 */
function processSvgForAnimation(svgString: string, size: number): string {
  // DOMParserでSVGを解析
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.querySelector("svg");
  
  if (!svg) return svgString;

  // サイズとviewBoxを設定
  svg.setAttribute("width", size.toString());
  svg.setAttribute("height", size.toString());
  svg.setAttribute("viewBox", "0 0 109 109");

  // パス要素を取得してアニメーション適用
  const paths = svg.querySelectorAll("path[d]");
  let totalDelay = 0;
  const strokeDuration = 0.6;
  const strokeGap = 0.15;

  paths.forEach((path) => {
    const d = path.getAttribute("d");
    if (!d) return;

    const length = estimatePathLength(d);

    // ストロークスタイルを設定
    path.setAttribute("stroke", "#1a1a1a");
    path.setAttribute("stroke-width", "4");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");

    // アニメーション用のdash設定
    path.setAttribute("stroke-dasharray", length.toString());
    path.setAttribute("stroke-dashoffset", length.toString());

    // アニメーションスタイル
    path.setAttribute(
      "style",
      `animation: drawStroke ${strokeDuration}s ease-out ${totalDelay}s forwards;`
    );

    totalDelay += strokeDuration - strokeGap;
  });

  // styleタグを追加
  let styleElement = svg.querySelector("style") as SVGStyleElement | null;
  if (!styleElement) {
    const newStyle = doc.createElementNS("http://www.w3.org/2000/svg", "style") as SVGStyleElement;
    if (svg.firstChild) {
      svg.insertBefore(newStyle, svg.firstChild);
    } else {
      svg.appendChild(newStyle);
    }
    styleElement = newStyle;
  }

  styleElement.textContent = `
    @keyframes drawStroke {
      to {
        stroke-dashoffset: 0;
      }
    }
    text { display: none; }
    g[id^="kvg:StrokeNumbers"] { display: none; }
  `;

  return new XMLSerializer().serializeToString(svg);
}

/**
 * パスの長さを推定
 */
function estimatePathLength(d: string): number {
  // 簡易的な長さ推定（コマンド数 × 係数）
  const commands = d.match(/[MLHVCSQTAZ]/gi) || [];
  const numbers = d.match(/-?\d+\.?\d*/g) || [];
  
  // より正確な推定
  let length = 0;
  let lastX = 0, lastY = 0;
  
  const numArr = numbers.map(Number);
  let i = 0;
  
  for (const cmd of commands) {
    switch (cmd.toUpperCase()) {
      case 'M':
        lastX = numArr[i++] || 0;
        lastY = numArr[i++] || 0;
        break;
      case 'L':
        const lx = numArr[i++] || 0;
        const ly = numArr[i++] || 0;
        length += Math.sqrt((lx - lastX) ** 2 + (ly - lastY) ** 2);
        lastX = lx;
        lastY = ly;
        break;
      case 'C':
        i += 4; // 制御点をスキップ
        const cx = numArr[i++] || 0;
        const cy = numArr[i++] || 0;
        length += Math.sqrt((cx - lastX) ** 2 + (cy - lastY) ** 2) * 1.5;
        lastX = cx;
        lastY = cy;
        break;
      case 'S':
      case 'Q':
        i += 2;
        const sx = numArr[i++] || 0;
        const sy = numArr[i++] || 0;
        length += Math.sqrt((sx - lastX) ** 2 + (sy - lastY) ** 2) * 1.3;
        lastX = sx;
        lastY = sy;
        break;
      default:
        break;
    }
  }
  
  // 最低値を設定
  return Math.max(length, 100);
}

export default StrokeAnimation;

