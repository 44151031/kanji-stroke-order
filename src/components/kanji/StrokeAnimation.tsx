"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface StrokeAnimationProps {
  id: string;
  kanji: string;
  size?: number;
}

interface StrokeData {
  pathData: string;
  length: number;
}

export function StrokeAnimation({ id, kanji, size = 280 }: StrokeAnimationProps) {
  const [svgBase, setSvgBase] = useState<string | null>(null);
  const [strokes, setStrokes] = useState<StrokeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // アニメーション制御
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [strokeProgress, setStrokeProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // SVGを読み込み
  useEffect(() => {
    async function loadSVG() {
      setLoading(true);
      setError(false);
      
      const hexCode = id.startsWith("u") ? id.slice(1).padStart(5, "0") : id;
      
      try {
        const res = await fetch(`/kanjivg/${hexCode}.svg`);
        if (!res.ok) throw new Error("SVG not found");
        
        const text = await res.text();
        const { baseSvg, strokesData } = parseSvgStrokes(text, size);
        setSvgBase(baseSvg);
        setStrokes(strokesData);
        setCurrentStroke(0);
        setStrokeProgress(0);
        setIsPlaying(false);
      } catch (err) {
        console.error("SVG load error:", err);
        setError(true);
        setSvgBase(null);
      } finally {
        setLoading(false);
      }
    }
    
    loadSVG();
  }, [id, size]);

  // アニメーションループ
  useEffect(() => {
    if (!isPlaying || strokes.length === 0) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // 1画あたり800msで描画（speed倍速）
      const strokeDuration = 800 / speed;
      const progressDelta = (delta / strokeDuration) * 100;

      setStrokeProgress((prev) => {
        const next = prev + progressDelta;
        if (next >= 100) {
          // 次の画へ
          if (currentStroke < strokes.length - 1) {
            setCurrentStroke((s) => s + 1);
            return 0;
          } else {
            // 完了
            setIsPlaying(false);
            return 100;
          }
        }
        return next;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentStroke, strokes.length, speed]);

  // 再生/停止
  const togglePlay = useCallback(() => {
    if (currentStroke >= strokes.length - 1 && strokeProgress >= 100) {
      // 終了状態なら最初から
      setCurrentStroke(0);
      setStrokeProgress(0);
    }
    setIsPlaying((p) => !p);
  }, [currentStroke, strokes.length, strokeProgress]);

  // 前の画
  const prevStroke = useCallback(() => {
    setIsPlaying(false);
    setCurrentStroke((s) => Math.max(0, s - 1));
    setStrokeProgress(100);
  }, []);

  // 次の画
  const nextStroke = useCallback(() => {
    setIsPlaying(false);
    if (currentStroke < strokes.length - 1) {
      setCurrentStroke((s) => s + 1);
      setStrokeProgress(0);
    } else {
      setStrokeProgress(100);
    }
  }, [currentStroke, strokes.length]);

  // 最初から再生
  const replay = useCallback(() => {
    setCurrentStroke(0);
    setStrokeProgress(0);
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
  if (error || !svgBase) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-64 bg-secondary/30 rounded-xl">
        <span className="text-8xl font-bold text-foreground/80">{kanji}</span>
        <p className="text-sm text-muted-foreground mt-2">
          書き順SVGを読み込めませんでした
        </p>
      </div>
    );
  }

  // 現在の表示用SVGを生成
  const displaySvg = generateDisplaySvg(svgBase, strokes, currentStroke, strokeProgress, size);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG表示エリア */}
      <div
        className="kanji-stroke bg-white border border-border rounded-xl p-4 relative"
        style={{ width: size + 40, height: size + 40 }}
        dangerouslySetInnerHTML={{ __html: displaySvg }}
      />
      
      {/* 画数表示 */}
      <div className="text-sm text-muted-foreground">
        {currentStroke + 1} / {strokes.length} 画
      </div>

      {/* コントロールボタン */}
      <div className="flex gap-2 items-center">
        <Button
          onClick={prevStroke}
          variant="outline"
          size="sm"
          disabled={currentStroke === 0 && strokeProgress === 0}
          className="px-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Button>
        
        <Button
          onClick={togglePlay}
          variant="default"
          size="sm"
          className="px-4 min-w-[80px]"
        >
          {isPlaying ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              停止
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              再生
            </>
          )}
        </Button>
        
        <Button
          onClick={nextStroke}
          variant="outline"
          size="sm"
          disabled={currentStroke >= strokes.length - 1 && strokeProgress >= 100}
          className="px-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Button>

        <Button
          onClick={replay}
          variant="outline"
          size="sm"
          className="px-3 ml-2"
          title="最初から再生"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </Button>
      </div>

      {/* 速度調整 */}
      <div className="flex items-center gap-3 w-full max-w-[280px]">
        <span className="text-xs text-muted-foreground whitespace-nowrap">🐢 遅い</span>
        <Slider
          value={[speed]}
          onValueChange={(v) => setSpeed(v[0])}
          min={0.5}
          max={2.5}
          step={0.1}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap">速い 🐇</span>
      </div>
      <div className="text-xs text-muted-foreground">
        速度: {speed.toFixed(1)}x
      </div>
    </div>
  );
}

/**
 * SVGを解析してストローク情報を抽出
 */
function parseSvgStrokes(svgString: string, size: number): { baseSvg: string; strokesData: StrokeData[] } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.querySelector("svg");
  
  if (!svg) return { baseSvg: svgString, strokesData: [] };

  svg.setAttribute("width", size.toString());
  svg.setAttribute("height", size.toString());
  svg.setAttribute("viewBox", "0 0 109 109");

  const paths = svg.querySelectorAll("path[d]");
  const strokesData: StrokeData[] = [];

  paths.forEach((path) => {
    const d = path.getAttribute("d");
    if (!d) return;
    
    const length = estimatePathLength(d);
    strokesData.push({ pathData: d, length });
    
    // 一旦非表示に
    path.setAttribute("stroke", "transparent");
    path.setAttribute("fill", "none");
  });

  // テキストと番号を非表示
  svg.querySelectorAll("text").forEach((t) => t.remove());
  const strokeNumbers = svg.querySelector('g[id^="kvg:StrokeNumbers"]');
  if (strokeNumbers) strokeNumbers.remove();

  return {
    baseSvg: new XMLSerializer().serializeToString(svg),
    strokesData,
  };
}

/**
 * 現在の状態に基づいてSVGを生成
 */
function generateDisplaySvg(
  baseSvg: string,
  strokes: StrokeData[],
  currentStroke: number,
  progress: number,
  size: number
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(baseSvg, "image/svg+xml");
  const svg = doc.querySelector("svg");
  
  if (!svg) return baseSvg;

  const paths = svg.querySelectorAll("path[d]");
  
  paths.forEach((path, index) => {
    const stroke = strokes[index];
    if (!stroke) return;

    if (index < currentStroke) {
      // 完了した画
      path.setAttribute("stroke", "#1a1a1a");
      path.setAttribute("stroke-width", "4");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
    } else if (index === currentStroke) {
      // 現在描画中の画
      const offset = stroke.length * (1 - progress / 100);
      path.setAttribute("stroke", "#e11d48");
      path.setAttribute("stroke-width", "5");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("stroke-dasharray", stroke.length.toString());
      path.setAttribute("stroke-dashoffset", offset.toString());
    } else {
      // まだの画（薄いガイド）
      path.setAttribute("stroke", "#e5e5e5");
      path.setAttribute("stroke-width", "3");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
    }
  });

  return new XMLSerializer().serializeToString(svg);
}

/**
 * パスの長さを推定
 */
function estimatePathLength(d: string): number {
  const commands = d.match(/[MLHVCSQTAZ]/gi) || [];
  const numbers = d.match(/-?\d+\.?\d*/g) || [];
  
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
        i += 4;
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
  
  return Math.max(length, 100);
}

export default StrokeAnimation;
